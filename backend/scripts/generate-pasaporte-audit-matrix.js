// Documentation generator only. It does not connect to a database.
const fs = require('fs');
const path = require('path');
const { rows, summary, meaningful } = require('../.tmp/extract-pasaporte-rules');
const { FIELD_DEFINITIONS } = require('../src/templates/perfilPasaporteV2.template');

const legacySources = ['seed-perfil-pasaporte-mexico.js','seed-perfil-pasaporte-guatemala.js']
  .map(file => fs.readFileSync(path.join(__dirname,file),'utf8')).join('\n');
const legacyKeys = new Set([...legacySources.matchAll(/name:\s*'([^']+)'/g)].map(match => match[1]));
const aliases = {
  domicilio_calle_numero: 'calle_numero', telefono_adicional: 'telefono_adicional_emergencia',
  notas_pasporte: 'observaciones', preferencia_cita_oficina_consulado: 'preferencia_cita_oficina',
  ocupacion: 'ocupacion_actual', dpi_ocupacion_registrada: 'ocupacion_registrada',
};
const represented = new Set(FIELD_DEFINITIONS.map(field => field.source_column));
const cleanRule = value => meaningful(value) ? value.replace(/^"|"$/g,'').replace(/\\"/g,'"') : '—';
const escape = value => String(value ?? '—').replace(/\|/g,'\\|').replace(/\r?\n/g,' ');

const lines = [
  '# Pasaporte — matriz AppSheet 2026-09-22','',
  'Fuente: `docs/appsheet/Application Documentation Visas inv.pdf`, esquema `PERFIL PASAPORTES_Schema`. Los bloques partidos entre páginas se reconstruyeron antes de contar o interpretar reglas.','',
  `Conteo: ${summary.total} columnas; ${summary.physical} físicas; ${summary.virtual} virtuales; ${summary.show} Show_If; ${summary.required} Required_If; ${summary.valid} Valid_If; ${summary.editable} Editable_If; ${summary.reset} Reset_If; ${summary.suggested} Suggested Values; ${summary.refs} Ref; ${summary.lists} listas virtuales; 0 repetibles.`, '',
  '| AppSheet | Display name | Tipo | Sección | Show_If | Required_If | Valid_If | Editable_If | Reset_If | Virtual | Ref | Clave React actual | Estado |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|---|',
];
const sectionFor = number => number <= 3 ? 'Técnico' : number <= 16 ? 'Información personal' : number <= 24 ? 'Domicilio' : number <= 30 ? 'Acta e INE' : number <= 45 ? 'Pasaporte' : number <= 49 ? 'Cita' : number <= 53 ? 'Ocupación' : number <= 63 ? 'Padres' : number <= 70 ? 'Cónyuge' : number <= 77 ? 'Contacto EUA' : number === 78 ? 'Notas' : 'Virtual / navegación';
for (const row of rows) {
  const current = legacyKeys.has(row.name) ? row.name : aliases[row.name] && legacyKeys.has(aliases[row.name]) ? aliases[row.name] : '—';
  let status;
  if (row.virtual) status = 'VIRTUAL_NO_CAPTURA';
  else if (row.number === 5) status = 'REQUIERE_DECISIÓN';
  else if (row.number === 3) status = 'RELACIONAL';
  else if (row.number <= 2) status = 'REQUIERE_DECISIÓN';
  else if (!represented.has(row.name)) status = 'FALTA';
  else if (current === '—' || current !== row.name) status = 'DIFERENTE';
  else status = 'COINCIDE';
  lines.push(`| ${escape(row.name)} | ${escape(row.display || '—')} | ${escape(row.type)} | ${sectionFor(row.number)} | ${escape(cleanRule(row.show))} | ${escape(cleanRule(row.required))} | ${escape(cleanRule(row.valid))} | ${escape(cleanRule(row.editable))} | ${escape(cleanRule(row.reset))} | ${row.virtual ? 'Sí' : 'No'} | ${escape(row.ref || '—')} | ${escape(current)} | ${status} |`);
}
lines.push('', 'V2 contabiliza las columnas 4–78: representa 74 como captura y clasifica `contrasena` como información operativa de acceso, fuera del perfil. Las columnas 1–3 son técnicas/canónicas y las 11 virtuales se clasifican sin convertirse en inputs.', '');
fs.writeFileSync(path.join(__dirname,'../../docs/perfiles/pasaporte-appsheet-matriz-2026-09-22.md'),lines.join('\n'));
