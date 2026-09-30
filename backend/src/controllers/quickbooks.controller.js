const repository = require('../repositories/quickbooks.repository');
const authService = require('../services/quickbooksAuth.service');
const quickbooksService = require('../services/quickbooks.service');
const { writeQuickBooksAudit } = require('../services/quickbooksAudit.service');

const maskRealm = (value) => {
  const realm = String(value || '');
  if (realm.length <= 6) return realm ? '***' : null;
  return `${realm.slice(0, 3)}***${realm.slice(-3)}`;
};

exports.getStatus = async (req, res, next) => {
  try {
    const configured = authService.isConfigured();
    const connection = configured ? await repository.getLatestConnection() : null;
    res.json({
      configured,
      connected: connection?.status === 'connected',
      environment: connection?.environment || process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox',
      realm_id: maskRealm(connection?.realm_id),
      status: connection?.status || 'disconnected',
      last_connection_at: connection?.updated_at || null,
      message: !configured ? 'QuickBooks no está configurado'
        : connection?.status === 'connected' ? 'QuickBooks está conectado'
          : connection?.status === 'requires_reconnection' ? 'QuickBooks requiere reconexión'
            : 'QuickBooks no está conectado',
    });
  } catch (error) { next(error); }
};

exports.connect = async (req, res, next) => {
  try {
    const authorizationUrl = await authService.createAuthorizationUrl();
    if (String(req.query.format || '').toLowerCase() === 'json') return res.json({ authorization_url: authorizationUrl });
    return res.redirect(authorizationUrl);
  } catch (error) { return next(error); }
};

exports.callback = async (req, res) => {
  const callbackMeta = {
    callback_kind: process.env.NODE_ENV === 'test' ? 'SIMULATED_CALLBACK' : 'REAL_INTUIT_CALLBACK',
    callback_received: true,
    has_code: Boolean(req.query.code),
    has_realm_id: Boolean(req.query.realmId),
    has_state: Boolean(req.query.state),
    has_error: Boolean(req.query.error),
    state_found_in_db: req.query.state
      ? await repository.hasOAuthState(req.query.state).catch(() => false)
      : false,
    timestamp: new Date().toISOString(),
  };
  console.info('[quickbooks-oauth-callback]', callbackMeta);
  try { writeQuickBooksAudit({ event: 'callback_received', ...callbackMeta }); }
  catch (_) { console.error('[quickbooks-audit-write-failed]', { timestamp: new Date().toISOString() }); }
  try {
    if (req.query.error) {
      const error = new Error('QuickBooks authorization was cancelled');
      error.oauthCategory = 'oauth_cancelled';
      throw error;
    }
    await authService.handleCallback({
      code: req.query.code, realmId: req.query.realmId, state: req.query.state,
    });
    return res.redirect(authService.getFrontendResultUrl('connected'));
  } catch (error) {
    const reason = error.oauthCategory || 'oauth_callback_failed';
    console.error('[quickbooks-oauth]', {
      reason,
      missing_parameters: error.missingParameters || [],
      status: Number(error.status) || null,
      oauth_code: error.oauthCode || null,
      timestamp: new Date().toISOString(),
    });
    try { return res.redirect(authService.getFrontendResultUrl('error', reason)); }
    catch (_) { return res.status(400).json({ error: { message: 'No fue posible completar la conexion con QuickBooks' } }); }
  }
};

exports.disconnect = async (req, res, next) => {
  try {
    await repository.disconnectAll();
    res.json({ connected: false, message: 'QuickBooks fue desconectado localmente' });
  } catch (error) { next(error); }
};

exports.syncClient = async (req, res, next) => {
  try {
    const idCliente = Number(req.params.idCliente);
    if (!Number.isInteger(idCliente) || idCliente <= 0) return res.status(400).json({ error: { message: 'idCliente inválido' } });
    return res.json({ quickbooks: await quickbooksService.syncClientToQuickBooks(idCliente) });
  } catch (error) { return next(error); }
};

exports.getClientStatus = async (req, res, next) => {
  try {
    const link = await repository.getClientLink(req.params.idCliente);
    if (!link) return res.json({ status: 'pending', customer_id: null, attempts: 0, synced_at: null, last_error: null });
    return res.json({
      status: link.sync_status,
      customer_id: link.quickbooks_customer_id,
      attempts: link.attempts,
      synced_at: link.synced_at,
      last_error: link.last_error,
    });
  } catch (error) { return next(error); }
};

exports.listClients = async (req, res, next) => {
  try {
    const statusMap = {
      pendiente: 'pending', error: 'error', requiere_reconexion: 'requires_reconnection',
      sincronizado: 'synced', pending: 'pending', requires_reconnection: 'requires_reconnection', synced: 'synced',
    };
    const requested = req.query.status || req.query.estado || '';
    const status = requested ? statusMap[String(requested).toLowerCase()] : null;
    if (requested && !status) return res.status(400).json({ error: { message: 'Filtro de estado inválido' } });
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const clients = await repository.listClients({ status, limit, offset });
    return res.json({ clientes: clients, limit, offset });
  } catch (error) { return next(error); }
};
