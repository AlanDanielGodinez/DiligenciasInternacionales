/**
 * Matriz de permisos por área/rol (lado servidor).
 *
 * Un empleado pertenece a uno o más GRUPOS, derivados de `empleados.rol` y `empleados.area`.
 * Los alias reproducen los del menú del frontend (Components/Sidebar.js) y la regla de
 * QuickBooks (middlewares/quickbooksAuth.js) para que backend y UI coincidan.
 *
 * IMPORTANTE (decisión de negocio pendiente): los grupos permitidos por permiso son una
 * propuesta inicial basada en el plan de 8 semanas ("protocolo solo para Protocolo/Admin y
 * pagos solo para Pagos/Admin") y en el menú actual. Ajustar aquí, en un solo lugar.
 */

const GROUPS = Object.freeze({
  ADMIN: 'ADMIN',
  INFORMES: 'INFORMES',
  FINANZAS: 'FINANZAS',
  INDIVIDUALES: 'INDIVIDUALES',
  AMA: 'AMA',
  PROTOCOLO: 'PROTOCOLO',
  DS: 'DS',
  LEGALES: 'LEGALES',
  NEGADOS: 'NEGADOS',
  LOGISTICA: 'LOGISTICA',
  PERFILES: 'PERFILES',
});

const normalizeText = (value) => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();

// Orden importa: la primera coincidencia por texto gana para cada valor.
const GROUP_ALIASES = [
  [GROUPS.ADMIN, ['admin', 'administrador', 'administracion', 'auditoria', 'direccion', 'configuracion']],
  [GROUPS.FINANZAS, ['finanzas', 'pagos', 'contabilidad', 'coordinador de finanzas', 'auxiliar de finanzas']],
  [GROUPS.INFORMES, ['informes', 'coordinador de informes', 'auxiliar de informes']],
  [GROUPS.PROTOCOLO, ['protocolo']],
  [GROUPS.LEGALES, ['legales', 'legal', 'asesoria legal']],
  [GROUPS.NEGADOS, ['negados']],
  [GROUPS.INDIVIDUALES, ['individuales', 'multinacionales', 'servicios multinacionales']],
  [GROUPS.AMA, ['ama', 'ama grupos']],
  [GROUPS.LOGISTICA, ['vuelos', 'viajes', 'logistica', 'dilitours', 'turismo']],
  [GROUPS.PERFILES, ['perfiles']],
  [GROUPS.DS, ['ds']],
];

// Claves de catalogo_areas que corresponden a cada grupo (para acceso por expediente).
const GROUP_AREA_KEYS = Object.freeze({
  ADMIN: ['ADMIN'],
  INFORMES: ['INFORMES'],
  FINANZAS: ['PAGOS', 'CONTABILIDAD'],
  INDIVIDUALES: ['INDIVIDUALES'],
  AMA: ['AMA'],
  PROTOCOLO: ['PROTOCOLO'],
  DS: ['DS'],
  LEGALES: ['LEGALES'],
  NEGADOS: ['NEGADOS'],
  LOGISTICA: ['LOGISTICA', 'VUELOS'],
  PERFILES: ['PERFILES'],
});

function groupFor(value) {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  // Coincidencia exacta primero, luego por palabra completa.
  for (const [group, aliases] of GROUP_ALIASES) {
    if (aliases.some((alias) => normalized === alias)) return group;
  }
  const words = ` ${normalized} `;
  for (const [group, aliases] of GROUP_ALIASES) {
    if (aliases.some((alias) => words.includes(` ${alias} `))) return group;
  }
  return null;
}

/** Grupos del usuario a partir de rol, roles[] y área. Sin coincidencias => [] (mínimo privilegio). */
function resolveGroups(user = {}) {
  const candidates = [user.rol, user.role, user.area, ...(Array.isArray(user.roles) ? user.roles : [])];
  const groups = new Set();
  for (const candidate of candidates) {
    const group = groupFor(candidate);
    if (group) groups.add(group);
  }
  return [...groups];
}

const { ADMIN, FINANZAS, INDIVIDUALES, AMA, PROTOCOLO, DS, LEGALES, NEGADOS, LOGISTICA } = GROUPS;

/** Permiso => grupos autorizados. ADMIN siempre está incluido. */
const PERMISSIONS = Object.freeze({
  // Pagos / Finanzas
  'pagos.bandeja': [ADMIN, FINANZAS],
  'pagos.validar': [ADMIN, FINANZAS],
  'metodosPago.administrar': [ADMIN, FINANZAS],
  // AMA
  'ama.protocolo': [ADMIN, PROTOCOLO],
  'ama.operacion': [ADMIN, AMA, PROTOCOLO, DS],
  'ama.grupos.editar': [ADMIN, AMA, PROTOCOLO],
  'ama.calendario.editar': [ADMIN, AMA, PROTOCOLO],
  // Individuales / DS
  'individual.operacion': [ADMIN, INDIVIDUALES, DS],
  // Legales y Negados
  'legales.editar': [ADMIN, LEGALES],
  'negados.editar': [ADMIN, NEGADOS, LEGALES, INDIVIDUALES, AMA],
  // Logística / Viajes
  'logistica.editar': [ADMIN, LOGISTICA],
  // Sistema
  'sistema.diagnostico': [ADMIN],
  'documentos.listarTodos': [ADMIN],
  // Lectura de documentos de cualquier expediente (además de responsable / área actual)
  'documentos.leerCualquierExpediente': [ADMIN],
  // Comprobantes de pago: Finanzas los valida aunque el expediente esté en otra área
  'documentos.leerComprobantesPago': [ADMIN, FINANZAS],
});

function hasPermission(user, permission) {
  const allowed = PERMISSIONS[permission];
  if (!allowed) throw new Error(`Permiso desconocido: ${permission}`);
  const groups = user?.grupos || resolveGroups(user);
  return groups.includes(ADMIN) || groups.some((group) => allowed.includes(group));
}

function areaKeysFor(user) {
  const groups = user?.grupos || resolveGroups(user);
  return [...new Set(groups.flatMap((group) => GROUP_AREA_KEYS[group] || []))];
}

module.exports = {
  GROUPS,
  PERMISSIONS,
  GROUP_AREA_KEYS,
  normalizeText,
  groupFor,
  resolveGroups,
  hasPermission,
  areaKeysFor,
};
