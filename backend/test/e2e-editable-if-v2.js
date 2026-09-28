const { pool } = require('../src/config/db');

const base = 'http://127.0.0.1:5000/api';
const idSolicitud = 8043;
const idPerfil = 6;

async function http(method, path, body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data;
  try { data = await response.json(); } catch { data = null; }
  return { status: response.status, data };
}

(async () => {
  const initial = (await http('GET', `/solicitudes/${idSolicitud}/perfil`)).data;
  if (Number(initial?.id_perfil) !== idPerfil || Number(initial?.estructura_json?.schema_version) !== 2) {
    throw new Error('El perfil DEMO V2 esperado no está disponible.');
  }
  const payload = (answers, repeaters = initial.repeaters) => ({
    estado: 'borrador', respuestas_json: answers, repeaters,
    motivo_cambio: 'Validación backend editable_if', actualizado_por: 1,
  });

  const setAUnlocked = await http('PATCH', `/perfiles/${idPerfil}`, payload({
    ...initial.respuestas_json, viajo_eeuu: true, referencia_bloqueada: 'A',
  }));
  if (setAUnlocked.status !== 200) throw new Error(`No se pudo preparar A desbloqueado: ${JSON.stringify(setAUnlocked.data)}`);

  const prepared = (await http('GET', `/solicitudes/${idSolicitud}/perfil`)).data;
  const lockKeepingA = await http('PATCH', `/perfiles/${idPerfil}`, payload({
    ...prepared.respuestas_json, viajo_eeuu: false, referencia_bloqueada: 'A',
  }, prepared.repeaters));
  if (lockKeepingA.status !== 200) throw new Error(`Guardar sin cambiar el valor bloqueado falló: ${JSON.stringify(lockKeepingA.data)}`);

  const locked = (await http('GET', `/solicitudes/${idSolicitud}/perfil`)).data;
  const before = (await pool.query(
    `SELECT version_actual,respuestas_json->>'referencia_bloqueada' value,
            (SELECT COUNT(*)::int FROM perfiles_solicitud_versiones WHERE id_perfil=$1) versions
       FROM perfiles_solicitud WHERE id_perfil=$1`, [idPerfil]
  )).rows[0];

  const hostile = await http('PATCH', `/perfiles/${idPerfil}`, payload({
    ...locked.respuestas_json, referencia_bloqueada: 'B',
  }, locked.repeaters));
  const afterRejected = (await pool.query(
    `SELECT version_actual,respuestas_json->>'referencia_bloqueada' value,
            (SELECT COUNT(*)::int FROM perfiles_solicitud_versiones WHERE id_perfil=$1) versions
       FROM perfiles_solicitud WHERE id_perfil=$1`, [idPerfil]
  )).rows[0];

  const unlocked = await http('PATCH', `/perfiles/${idPerfil}`, payload({
    ...locked.respuestas_json, viajo_eeuu: true, referencia_bloqueada: 'B',
  }, locked.repeaters));
  const afterAllowed = (await pool.query(
    `SELECT version_actual,respuestas_json->>'referencia_bloqueada' value,
            (SELECT COUNT(*)::int FROM perfiles_solicitud_versiones WHERE id_perfil=$1) versions
       FROM perfiles_solicitud WHERE id_perfil=$1`, [idPerfil]
  )).rows[0];

  const result = {
    same_locked_value: { http: lockKeepingA.status, value: before.value },
    hostile_change: {
      http: hostile.status,
      errors: hostile.data?.error?.details?.errors,
      version_before: before.version_actual,
      version_after: afterRejected.version_actual,
      versions_before: before.versions,
      versions_after: afterRejected.versions,
      persisted_value: afterRejected.value,
    },
    unlocked_change: { http: unlocked.status, persisted_value: afterAllowed.value, version: afterAllowed.version_actual },
  };
  const pass = lockKeepingA.status === 200 && before.value === 'A' &&
    hostile.status === 400 && hostile.data?.error?.details?.errors?.some((error) => error.path === 'referencia_bloqueada' && error.code === 'not_editable') &&
    afterRejected.value === 'A' && afterRejected.version_actual === before.version_actual && afterRejected.versions === before.versions &&
    unlocked.status === 200 && afterAllowed.value === 'B' && Number(afterAllowed.version_actual) === Number(before.version_actual) + 1;
  console.log(JSON.stringify({ pass, id_solicitud: idSolicitud, id_perfil: idPerfil, result }, null, 2));
  await pool.end();
  if (!pass) process.exit(1);
})().catch(async (error) => {
  console.error(error);
  try { await pool.end(); } catch {}
  process.exit(1);
});
