'use strict';

const fs = require('fs');
const path = require('path');

// db.js logs connection metadata when loaded. Suppress only that import-time log so
// this audit never emits connection details; the existing pool is still reused.
const originalLog = console.log;
let pool;
try {
  console.log = () => {};
  ({ pool } = require('../src/config/db'));
} finally {
  console.log = originalLog;
}

const AUTH_NAME = /(usuario|user|auth|credencial)/i;
const CREDENTIAL_NAME = /(password|password_hash|contrase(?:n|ñ)a|credential|credencial)/i;
const EMAIL_NAME = /^(correo|correo_?empleado|email|e_?mail)$/i;
const ROLE_NAME = /^(rol|role|id_?rol)$/i;
const ACTIVE_NAME = /^(activo|active|is_?active|estatus|estado)$/i;
const ID_NAME = /^(id_?empleado|idempleado)$/i;
const USER_ID_NAME = /^(user_?id|id_?user|usuario_?id|id_?usuario)$/i;

function quoteIdent(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function relationName(item) {
  return `${quoteIdent(item.schema)}.${quoteIdent(item.table_name)}`;
}

function normalize(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findColumn(columns, matcher) {
  return columns.find((column) => matcher.test(column.column_name))?.column_name || null;
}

function output(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function discoverRelations(client) {
  const result = await client.query(`
    SELECT n.nspname AS schema,
           c.relname AS table_name,
           CASE c.relkind
             WHEN 'r' THEN 'TABLE'
             WHEN 'p' THEN 'PARTITIONED TABLE'
             WHEN 'v' THEN 'VIEW'
             WHEN 'm' THEN 'MATERIALIZED VIEW'
             WHEN 'f' THEN 'FOREIGN TABLE'
           END AS table_type
      FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind IN ('r', 'p', 'v', 'm', 'f')
       AND n.nspname NOT IN ('pg_catalog', 'information_schema')
       AND n.nspname !~ '^pg_toast'
       AND (
         (n.nspname = 'public' AND c.relname IN ('empleado', 'empleados'))
         OR c.relname ~* '(usuario|user|auth|credencial)'
       )
     ORDER BY n.nspname, c.relname
  `);
  return result.rows;
}

async function loadColumns(client, relation) {
  const result = await client.query(`
    SELECT a.attname AS column_name,
           pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
           CASE WHEN a.attnotnull THEN 'NO' ELSE 'YES' END AS is_nullable
      FROM pg_catalog.pg_attribute a
      JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = $1 AND c.relname = $2
       AND a.attnum > 0 AND NOT a.attisdropped
     ORDER BY a.attnum
  `, [relation.schema, relation.table_name]);
  return result.rows;
}

async function loadConstraints(client, relation) {
  const result = await client.query(`
    SELECT con.conname AS constraint_name,
           CASE con.contype WHEN 'p' THEN 'PRIMARY KEY'
             WHEN 'f' THEN 'FOREIGN KEY' WHEN 'u' THEN 'UNIQUE' END AS constraint_type,
           pg_catalog.pg_get_constraintdef(con.oid, true) AS definition
      FROM pg_catalog.pg_constraint con
      JOIN pg_catalog.pg_class c ON c.oid = con.conrelid
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = $1 AND c.relname = $2 AND con.contype IN ('p', 'f', 'u')
     ORDER BY constraint_type, constraint_name
  `, [relation.schema, relation.table_name]);
  return result.rows;
}

async function credentialSummary(client, relation, passwordColumn) {
  if (!passwordColumn) return null;
  const sql = `
    SELECT COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE ${quoteIdent(passwordColumn)} IS NULL)::int AS null,
           COUNT(*) FILTER (WHERE ${quoteIdent(passwordColumn)} IS NOT NULL
             AND btrim(${quoteIdent(passwordColumn)}::text) = '')::int AS empty,
           COUNT(*) FILTER (WHERE ${quoteIdent(passwordColumn)}::text
             ~ '^\\$2[aby]\\$[0-9]{2}\\$[./A-Za-z0-9]{53}$')::int AS bcrypt,
           COUNT(*) FILTER (WHERE ${quoteIdent(passwordColumn)} IS NOT NULL
             AND btrim(${quoteIdent(passwordColumn)}::text) <> ''
             AND ${quoteIdent(passwordColumn)}::text
               !~ '^\\$2[aby]\\$[0-9]{2}\\$[./A-Za-z0-9]{53}$')::int AS other
      FROM ${relationName(relation)}
  `;
  const summary = (await client.query(sql)).rows[0];
  return {
    total: Number(summary.total),
    bcrypt: Number(summary.bcrypt),
    null: Number(summary.null),
    empty: Number(summary.empty),
    other: Number(summary.other)
  };
}

async function activeSummary(client, relation, activeColumn) {
  const total = Number((await client.query(
    `SELECT COUNT(*)::int AS count FROM ${relationName(relation)}`
  )).rows[0].count);
  if (!activeColumn) return { total, active: null, inactive: null, active_column: null };

  const col = `${quoteIdent(activeColumn)}::text`;
  const sql = `
    SELECT COUNT(*) FILTER (WHERE lower(btrim(${col})) IN
             ('true','t','1','yes','y','si','sí','activo','active','enabled'))::int AS active,
           COUNT(*) FILTER (WHERE ${quoteIdent(activeColumn)} IS NULL OR
             lower(btrim(${col})) NOT IN
             ('true','t','1','yes','y','si','sí','activo','active','enabled'))::int AS inactive
      FROM ${relationName(relation)}
  `;
  const row = (await client.query(sql)).rows[0];
  return { total, active: Number(row.active), inactive: Number(row.inactive), active_column: activeColumn };
}

async function foreignKeysBetween(client, left, right) {
  const result = await client.query(`
    SELECT ns.nspname AS source_schema, src.relname AS source_table,
           sa.attname AS source_column, nt.nspname AS target_schema,
           tgt.relname AS target_table, ta.attname AS target_column,
           con.conname AS constraint_name
      FROM pg_catalog.pg_constraint con
      JOIN pg_catalog.pg_class src ON src.oid = con.conrelid
      JOIN pg_catalog.pg_namespace ns ON ns.oid = src.relnamespace
      JOIN pg_catalog.pg_class tgt ON tgt.oid = con.confrelid
      JOIN pg_catalog.pg_namespace nt ON nt.oid = tgt.relnamespace
      JOIN LATERAL unnest(con.conkey) WITH ORDINALITY sk(attnum, ord) ON true
      JOIN LATERAL unnest(con.confkey) WITH ORDINALITY tk(attnum, ord) ON tk.ord = sk.ord
      JOIN pg_catalog.pg_attribute sa ON sa.attrelid = src.oid AND sa.attnum = sk.attnum
      JOIN pg_catalog.pg_attribute ta ON ta.attrelid = tgt.oid AND ta.attnum = tk.attnum
     WHERE con.contype = 'f'
       AND ((ns.nspname = $1 AND src.relname = $2 AND nt.nspname = $3 AND tgt.relname = $4)
         OR (ns.nspname = $3 AND src.relname = $4 AND nt.nspname = $1 AND tgt.relname = $2))
     ORDER BY constraint_name, sk.ord
  `, [left.schema, left.table_name, right.schema, right.table_name]);
  return result.rows;
}

async function countMatches(client, left, right, leftColumn, rightColumn) {
  if (!leftColumn || !rightColumn) return null;
  const result = await client.query(`
    SELECT COUNT(*)::int AS count
      FROM ${relationName(left)} l
     WHERE l.${quoteIdent(leftColumn)} IS NOT NULL
       AND EXISTS (SELECT 1 FROM ${relationName(right)} r
                    WHERE r.${quoteIdent(rightColumn)} = l.${quoteIdent(leftColumn)})
  `);
  return Number(result.rows[0].count);
}

async function countForeignKeyMatches(client, left, right, fkRows) {
  if (!fkRows.length) return null;
  const groups = new Map();
  for (const row of fkRows) {
    if (!groups.has(row.constraint_name)) groups.set(row.constraint_name, []);
    groups.get(row.constraint_name).push(row);
  }
  const counts = [];
  for (const rows of groups.values()) {
    const sourceIsLeft = rows[0].source_schema === left.schema
      && rows[0].source_table === left.table_name;
    const pairs = rows.map((row) => ({
      left: sourceIsLeft ? row.source_column : row.target_column,
      right: sourceIsLeft ? row.target_column : row.source_column
    }));
    const nonNull = pairs.map((pair) => `l.${quoteIdent(pair.left)} IS NOT NULL`).join(' AND ');
    const equality = pairs.map((pair) =>
      `r.${quoteIdent(pair.right)} = l.${quoteIdent(pair.left)}`).join(' AND ');
    const result = await client.query(`
      SELECT COUNT(*)::int AS count
        FROM ${relationName(left)} l
       WHERE ${nonNull}
         AND EXISTS (SELECT 1 FROM ${relationName(right)} r WHERE ${equality})
    `);
    counts.push(Number(result.rows[0].count));
  }
  return Math.max(...counts);
}

async function relationshipAudit(client, empleado, empleados) {
  if (!empleado || !empleados) {
    return { empleado_to_empleados: 'FAIL', reason: 'ONE_OR_BOTH_RELATIONS_NOT_FOUND' };
  }
  const [leftCount, rightCount, fks] = await Promise.all([
    activeSummary(client, empleado.relation, null),
    activeSummary(client, empleados.relation, null),
    foreignKeysBetween(client, empleado.relation, empleados.relation)
  ]);
  const leftColumns = empleado.columns;
  const rightColumns = empleados.columns;
  const leftId = findColumn(leftColumns, ID_NAME);
  const rightId = findColumn(rightColumns, ID_NAME);
  const leftEmail = findColumn(leftColumns, EMAIL_NAME);
  const rightEmail = findColumn(rightColumns, EMAIL_NAME);
  const leftUser = findColumn(leftColumns, USER_ID_NAME);
  const rightUser = findColumn(rightColumns, USER_ID_NAME);

  const matchedByFk = await countForeignKeyMatches(
    client, empleado.relation, empleados.relation, fks
  );
  const matchedById = await countMatches(client, empleado.relation, empleados.relation, leftId, rightId);
  const matchedByEmail = await countMatches(client, empleado.relation, empleados.relation, leftEmail, rightEmail);
  const matchedByUserId = await countMatches(client, empleado.relation, empleados.relation, leftUser, rightUser);
  const candidates = [matchedByFk, matchedById, matchedByEmail, matchedByUserId].filter(Number.isInteger);
  const matched = candidates.length ? Math.max(...candidates) : 0;
  const unmatched = Math.max(0, leftCount.total - matched);
  return {
    empleado_to_empleados: matched === leftCount.total && leftCount.total > 0 ? 'PASS'
      : matched > 0 ? 'PARTIAL' : 'FAIL',
    empleado_total: leftCount.total,
    empleados_total: rightCount.total,
    direct_fk: fks.length ? fks : [],
    matched_by_fk: matchedByFk,
    matched_by_id: matchedById,
    matched_by_email: matchedByEmail,
    matched_by_user_id: matchedByUserId,
    matched,
    unmatched
  };
}

function staticCodeAudit() {
  const indexPath = path.resolve(__dirname, '..', 'index.js');
  if (!fs.existsSync(indexPath)) return { found: false };
  const source = fs.readFileSync(indexPath, 'utf8');
  const hashRounds = [...source.matchAll(/bcrypt\.hash\s*\([^,]+,\s*(\d+)/g)]
    .map((match) => Number(match[1]));
  const tables = new Set();
  for (const match of source.matchAll(/\b(?:FROM|JOIN|INSERT\s+INTO|UPDATE)\s+([a-z_][a-z0-9_]*)/gi)) {
    if (/empleado|usuario|user|auth|credencial/i.test(match[1])) tables.add(match[1].toLowerCase());
  }
  const passwordFields = new Set(
    [...source.matchAll(/\b(password(?:_hash)?|contrasena|contraseña)\b/gi)]
      .map((match) => match[1].toLowerCase())
  );
  return {
    found: true,
    tables_used: [...tables].sort(),
    password_fields: [...passwordFields].sort(),
    bcrypt_library: /require\s*\(\s*['"]bcrypt['"]\s*\)/.test(source) ? 'bcrypt' : null,
    bcrypt_compare: /bcrypt\.compare\s*\(/.test(source) ? 'YES' : 'NO',
    bcrypt_hash: /bcrypt\.hash\s*\(/.test(source) ? 'YES' : 'NO',
    salt_rounds: [...new Set(hashRounds)].sort((a, b) => a - b),
    user_creation_flow: /INSERT\s+INTO\s+empleado/i.test(source) ? 'YES' : 'NO',
    password_change_flow: /UPDATE\s+empleado[\s\S]{0,500}?password/i.test(source) ? 'YES' : 'NO',
    temporary_password_flow: /tempPassword|contrase(?:n|ñ)a temporal|temporary password/i.test(source) ? 'YES' : 'NO'
  };
}

function chooseStrategy(source, current, relationship) {
  // Deterministic definitions: A=reuse historical hashes with complete mapping;
  // B=migrate reusable historical hashes with a partial mapping; C=use complete
  // bcrypt credentials already present in current; D=force credential reset.
  if (source?.bcrypt_usable === 'YES' && relationship.empleado_to_empleados === 'PASS') return 'A';
  if (source?.bcrypt_usable === 'YES' && relationship.empleado_to_empleados === 'PARTIAL') return 'B';
  if (current?.bcrypt_usable === 'YES') return 'C';
  if ((source?.credential_summary || current?.credential_summary)
      && source?.bcrypt_usable !== 'YES' && current?.bcrypt_usable !== 'YES') return 'D';
  return 'UNDETERMINED';
}

async function main() {
  const report = {
    title: 'AUTH DATA MODEL AUDIT',
    postgresql: 'FAIL',
    read_only: true,
    tables: [],
    historical_credential_source: null,
    coverage: null,
    relationship: null,
    historical_code: staticCodeAudit(),
    recommended_strategy: 'UNDETERMINED',
    strategy_definitions: {
      A: 'Reuse historical bcrypt hashes; complete record mapping.',
      B: 'Migrate reusable historical bcrypt hashes; partial mapping requires remediation.',
      C: 'Use bcrypt credentials already present in the current relation.',
      D: 'No complete reusable bcrypt coverage; require a controlled password reset.'
    }
  };
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN READ ONLY');
    const relations = await discoverRelations(client);
    const detailed = [];
    for (const relation of relations) {
      const columns = await loadColumns(client, relation);
      const constraints = await loadConstraints(client, relation);
      const passwordColumn = findColumn(columns, CREDENTIAL_NAME);
      const activeColumn = findColumn(columns, ACTIVE_NAME);
      const credentials = await credentialSummary(client, relation, passwordColumn);
      const counts = await activeSummary(client, relation, activeColumn);
      detailed.push({
        relation,
        columns,
        constraints,
        relevant_columns: columns.filter((column) =>
          [ID_NAME, EMAIL_NAME, ROLE_NAME, ACTIVE_NAME, USER_ID_NAME, CREDENTIAL_NAME]
            .some((matcher) => matcher.test(column.column_name))),
        credential_column: passwordColumn,
        credential_summary: credentials,
        bcrypt_usable: credentials && credentials.total > 0
          && credentials.bcrypt === credentials.total ? 'YES' : 'NO',
        employee_counts: counts
      });
    }
    report.postgresql = 'PASS';
    report.tables = detailed.map(({ relation, columns, constraints, relevant_columns: relevantColumns }) => ({
      ...relation,
      // For the two employee relations, deliberately limit column metadata to the
      // identity/auth fields requested by the audit. Other auth-related relations
      // retain their complete column metadata.
      columns: relation.schema === 'public' && ['empleado', 'empleados'].includes(relation.table_name)
        ? relevantColumns : columns,
      constraints
    }));
    for (const required of ['empleado', 'empleados']) {
      if (!relations.some((item) => item.schema === 'public' && item.table_name === required)) {
        report.tables.push({ schema: 'public', table_name: required, table_type: 'NOT_FOUND' });
      }
    }
    const historical = detailed.find((item) => item.relation.schema === 'public'
      && item.relation.table_name === 'empleado');
    const current = detailed.find((item) => item.relation.schema === 'public'
      && item.relation.table_name === 'empleados');
    report.historical_credential_source = historical ? {
      table: 'public.empleado',
      password_column: historical.credential_column,
      hash_format: historical.credential_summary
        ? (historical.credential_summary.other ? 'MIXED_OR_OTHER'
          : historical.credential_summary.bcrypt ? 'BCRYPT' : 'NONE') : 'NO_CREDENTIAL_COLUMN',
      bcrypt_usable: historical.bcrypt_usable,
      credential_summary: historical.credential_summary
    } : null;
    const coverageSource = historical || current;
    report.coverage = coverageSource ? {
      table: `${coverageSource.relation.schema}.${coverageSource.relation.table_name}`,
      total: coverageSource.employee_counts.total,
      active: coverageSource.employee_counts.active,
      inactive: coverageSource.employee_counts.inactive,
      bcrypt: coverageSource.credential_summary?.bcrypt ?? null,
      without_credentials: coverageSource.credential_summary
        ? coverageSource.credential_summary.null + coverageSource.credential_summary.empty : null,
      unknown_format: coverageSource.credential_summary?.other ?? null
    } : null;
    report.relation_details = detailed.map((item) => ({
      schema: item.relation.schema,
      table_name: item.relation.table_name,
      table_type: item.relation.table_type,
      relevant_columns: item.relevant_columns,
      credential_summary: item.credential_summary,
      bcrypt_usable: item.bcrypt_usable,
      employee_counts: item.employee_counts
    }));
    report.relationship = await relationshipAudit(client, historical, current);
    report.recommended_strategy = chooseStrategy(
      report.historical_credential_source,
      current ? { credential_summary: current.credential_summary, bcrypt_usable: current.bcrypt_usable } : null,
      report.relationship
    );
    await client.query('ROLLBACK');
  } catch (error) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) { /* preserve original failure */ }
    }
    report.postgresql = 'FAIL';
    report.error = { code: error.code || 'AUDIT_FAILED', message: 'Audit failed; no secrets were printed.' };
    process.exitCode = 1;
  } finally {
    if (client) client.release();
    await pool.end();
  }
  output(report);
}

main();
