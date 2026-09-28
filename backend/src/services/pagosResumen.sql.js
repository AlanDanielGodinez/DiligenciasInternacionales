// Same criterion for Finanzas and AMA: latest registered payment, not a paid balance.
const ULTIMO_PAGO_ORDER = 'p.creado_en DESC NULLS LAST, p.id_pago DESC';
module.exports = { ULTIMO_PAGO_ORDER };
