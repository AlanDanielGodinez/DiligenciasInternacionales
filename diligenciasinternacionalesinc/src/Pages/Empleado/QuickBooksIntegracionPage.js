import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBook, FaLink, FaRedo, FaSearch, FaUnlink } from 'react-icons/fa';
import {
  connectQuickBooks,
  disconnectQuickBooks,
  getQuickBooksClients,
  getQuickBooksStatus,
  syncClientToQuickBooks,
} from '../../services/quickbooks.service';
import '../../Styles/QuickBooksIntegracion.css';
import { clearAuthSession, inspectStoredSession } from '../../utils/authSession';

const PAGE_SIZE = 20;
const statusLabels = {
  pending: 'Pendiente',
  syncing: 'Sincronizando',
  synced: 'Sincronizado',
  error: 'Error',
  requires_reconnection: 'Requiere reconexión',
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message || error?.response?.data?.message || fallback;

const formatDate = (value) => {
  if (!value) return 'Sin registro';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Sin registro' : date.toLocaleString('es-MX');
};

const summarizeError = (value) => {
  const text = String(value || '').trim();
  if (!text) return '—';
  return text.length > 100 ? `${text.slice(0, 97)}...` : text;
};

export const getConnectionPresentation = (status) => {
  if (!status?.configured) return { key: 'not-configured', label: 'No configurado' };
  if (status.connected) return { key: 'connected', label: 'Conectado' };
  if (/reconex/i.test(status.message || '')) return { key: 'reconnect', label: 'Requiere reconexión' };
  if (/error/i.test(status.message || '')) return { key: 'error', label: 'Error' };
  return { key: 'disconnected', label: 'Desconectado' };
};

const QuickBooksIntegracionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [connection, setConnection] = useState(null);
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [apiAvailable, setApiAvailable] = useState(true);
  const [sessionInvalid, setSessionInvalid] = useState(!inspectStoredSession().structurallyValid);

  const loadConnection = async () => {
    const data = await getQuickBooksStatus();
    setConnection(data);
  };

  const loadClients = async (nextPage = page, nextFilter = filter) => {
    const data = await getQuickBooksClients({
      status: nextFilter || undefined,
      limit: PAGE_SIZE,
      offset: (nextPage - 1) * PAGE_SIZE,
    });
    setClients(data.clientes);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const status = await getQuickBooksStatus();
      setConnection(status);
      setApiAvailable(true);
      setSessionInvalid(false);
      if (status.configured) await loadClients();
      else setClients([]);
    } catch (error) {
      const statusCode = error?.response?.status;
      const authCode = error?.response?.data?.error?.code;
      setSessionInvalid(statusCode === 401);
      setApiAvailable(false);
      const authMessage = authCode === 'TOKEN_EXPIRED'
        ? 'Tu sesión expiró. Inicia sesión nuevamente.'
        : 'Tu sesión no es válida. Inicia sesión nuevamente.';
      setConnection({
        configured: true,
        connected: false,
        environment: 'sandbox',
        status: 'unavailable',
        message: statusCode === 401
          ? authMessage
          : statusCode === 403
            ? 'Tu usuario no tiene permiso para administrar QuickBooks.'
            : 'El backend no está disponible en el puerto 5000.',
      });
      setMessage(getErrorMessage(error, 'No fue posible consultar la integración.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const result = params.get('quickbooks');
    const reason = params.get('reason');
    if (result) {
      const reasonMessages = {
        oauth_cancelled: 'La autorización fue cancelada. Puedes intentarlo nuevamente cuando estés listo.',
        invalid_state: 'La sesión de autorización expiró o ya fue utilizada. Inicia una nueva conexión.',
        invalid_callback: 'Intuit devolvió una respuesta incompleta. Intenta conectar nuevamente.',
        token_exchange_failed: 'La autorización no pudo completarse. Intenta conectar nuevamente.',
        redirect_uri_mismatch_or_invalid_code: 'La configuración de OAuth necesita revisión.',
        connection_persist_failed: 'QuickBooks respondió, pero no fue posible guardar la conexión.',
        oauth_callback_failed: 'No fue posible completar la conexión con QuickBooks.',
      };
      const messages = {
        connected: '✓ QuickBooks se conectó correctamente.',
        error: reasonMessages[reason] || 'No fue posible completar la conexión con QuickBooks.',
        reconnect_required: 'QuickBooks requiere una nueva autorización.',
      };
      setMessage(messages[result] || 'Se recibió una respuesta de QuickBooks.');
      navigate(location.pathname, { replace: true });
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const presentation = getConnectionPresentation(connection);
  const filteredClients = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es-MX');
    if (!term) return clients;
    return clients.filter((client) =>
      String(client.id_cliente).includes(term)
      || String(client.nombre || '').toLocaleLowerCase('es-MX').includes(term)
    );
  }, [clients, search]);

  const handleConnect = async () => {
    if (process.env.NODE_ENV === 'development') console.info('[QB-FRONTEND] connect-click');
    setBusy('connect');
    setMessage('');
    try {
      if (process.env.NODE_ENV === 'development') console.info('[QB-FRONTEND] requesting-authorization-url');
      const url = await connectQuickBooks();
      if (process.env.NODE_ENV === 'development') console.info('[QB-FRONTEND] authorization-url-received');
      if (!url) throw new Error('El backend no devolvió la URL de autorización.');
      window.location.assign(url);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No fue posible iniciar la conexión con QuickBooks.'));
      setBusy('');
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('¿Deseas desconectar QuickBooks? Los clientes guardados no se eliminarán.')) return;
    setBusy('disconnect');
    try {
      await disconnectQuickBooks();
      setMessage('QuickBooks fue desconectado.');
      await loadConnection();
    } catch (error) {
      setMessage(getErrorMessage(error, 'No fue posible desconectar QuickBooks.'));
    } finally {
      setBusy('');
    }
  };

  const restartLogin = () => {
    clearAuthSession();
    navigate('/login');
  };

  const handleRetry = async (idCliente) => {
    setBusy(`client-${idCliente}`);
    try {
      const result = await syncClientToQuickBooks(idCliente);
      setMessage(result.status === 'synced'
        ? `El cliente #${idCliente} se sincronizó correctamente.`
        : `El cliente #${idCliente} permanece pendiente de sincronización.`);
      await Promise.all([loadConnection(), loadClients()]);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No fue posible reintentar la sincronización.'));
    } finally {
      setBusy('');
    }
  };

  const changeFilter = async (event) => {
    const value = event.target.value;
    setFilter(value);
    setPage(1);
    setLoading(true);
    try { await loadClients(1, value); }
    catch (error) { setMessage(getErrorMessage(error, 'No fue posible aplicar el filtro.')); }
    finally { setLoading(false); }
  };

  const changePage = async (nextPage) => {
    setPage(nextPage);
    setLoading(true);
    try { await loadClients(nextPage, filter); }
    catch (error) { setMessage(getErrorMessage(error, 'No fue posible cambiar de página.')); }
    finally { setLoading(false); }
  };

  return (
    <main className="config-min qb-admin">
      <header className="config-min__header">
        <div>
          <span className="config-min__eyebrow"><FaBook /> Configuración · Integraciones</span>
          <h1>QuickBooks Online</h1>
          <p>Administra la conexión y revisa clientes pendientes de sincronización.</p>
        </div>
        <button type="button" onClick={refresh} disabled={loading}><FaRedo /> Actualizar</button>
      </header>

      {message && <div className="config-min__message" role="status">{message}</div>}

      <section className="qb-admin__connection">
        <div>
          <span className={`qb-admin__connection-status is-${presentation.key}`}>{presentation.label}</span>
          <strong>{connection?.environment === 'production' ? 'Producción' : 'Sandbox'}</strong>
          <small>{connection?.message || 'Conecta una empresa de QuickBooks Sandbox para habilitar la sincronización.'}</small>
          {connection?.last_connection_at && <small>Última conexión: {formatDate(connection.last_connection_at)}</small>}
        </div>
        <div className="qb-admin__connection-actions">
          {(!connection?.connected || presentation.key === 'reconnect') && (
            <button type="button" onClick={handleConnect} disabled={busy === 'connect' || !connection?.configured || !apiAvailable || sessionInvalid}>
              <FaLink /> {presentation.key === 'reconnect' ? 'Reconectar' : 'Conectar con QuickBooks'}
            </button>
          )}
          {sessionInvalid && <button type="button" onClick={restartLogin}>Volver a iniciar sesiÃ³n</button>}
          {connection?.connected && (
            <button type="button" className="is-danger" onClick={handleDisconnect} disabled={busy === 'disconnect'}>
              <FaUnlink /> Desconectar
            </button>
          )}
        </div>
      </section>

      <section className="qb-admin__tools">
        <div className="config-min__search"><FaSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por folio o nombre" /></div>
        <select value={filter} onChange={changeFilter} aria-label="Filtrar estado">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="error">Error</option>
          <option value="requiere_reconexion">Requiere reconexión</option>
          <option value="sincronizado">Sincronizado</option>
        </select>
      </section>

      <section className="config-min__table-wrap">
        {loading ? <div className="config-min__empty">Cargando integración...</div> : (
          <table className="config-min__table">
            <thead><tr><th>Cliente</th><th>Customer.Id</th><th>Estado</th><th>Intentos</th><th>Último intento</th><th>Error</th><th>Acciones</th></tr></thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id_cliente}>
                  <td><strong>{client.nombre || 'Sin nombre'}</strong><small>Cliente #{client.id_cliente}</small></td>
                  <td>{client.quickbooks_customer_id || '—'}</td>
                  <td><span className={`config-min__badge qb-status--${client.sync_status}`}>{statusLabels[client.sync_status] || client.sync_status}</span></td>
                  <td>{client.attempts || 0}</td>
                  <td>{formatDate(client.last_attempt_at)}</td>
                  <td title={client.last_error || ''}>{summarizeError(client.last_error)}</td>
                  <td><div className="qb-admin__row-actions">
                    <button type="button" onClick={() => handleRetry(client.id_cliente)} disabled={busy === `client-${client.id_cliente}`}><FaRedo /> {client.sync_status === 'synced' ? 'Sincronizar' : 'Reintentar'}</button>
                    {client.id_contacto && <button type="button" onClick={() => navigate(`/empleado/contactos?contacto=${client.id_contacto}`)}>Abrir cliente</button>}
                  </div></td>
                </tr>
              ))}
              {filteredClients.length === 0 && <tr><td colSpan="7" className="config-min__empty">No hay clientes para mostrar.</td></tr>}
            </tbody>
          </table>
        )}
      </section>

      <div className="qb-admin__pagination">
        <button type="button" onClick={() => changePage(page - 1)} disabled={page === 1 || loading}>Anterior</button>
        <span>Página {page}</span>
        <button type="button" onClick={() => changePage(page + 1)} disabled={clients.length < PAGE_SIZE || loading}>Siguiente</button>
      </div>
    </main>
  );
};

export default QuickBooksIntegracionPage;
