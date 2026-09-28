import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBook, FaLink, FaRedo, FaSearch, FaUnlink } from 'react-icons/fa';
import {
  connectQuickBooks,
  disconnectQuickBooks,
  getPendingQuickBooksContacts,
  getQuickBooksStatus,
  syncContactToQuickBooks,
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
  const [contacts, setContacts] = useState([]);
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

  const loadContacts = async (nextPage = page, nextFilter = filter) => {
    const data = await getPendingQuickBooksContacts({
      status: nextFilter || undefined,
      limit: PAGE_SIZE,
      offset: (nextPage - 1) * PAGE_SIZE,
    });
    setContacts(data.contactos);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const status = await getQuickBooksStatus();
      setConnection(status);
      setApiAvailable(true);
      setSessionInvalid(false);
      if (status.configured) await loadContacts();
      else setContacts([]);
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
  const filteredContacts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es-MX');
    if (!term) return contacts;
    return contacts.filter((contact) =>
      String(contact.id_contacto).includes(term)
      || String(contact.nombre || '').toLocaleLowerCase('es-MX').includes(term)
    );
  }, [contacts, search]);

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
    if (!window.confirm('¿Deseas desconectar QuickBooks? Los contactos guardados no se eliminarán.')) return;
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

  const handleRetry = async (idContacto) => {
    setBusy(`contact-${idContacto}`);
    try {
      const result = await syncContactToQuickBooks(idContacto);
      setMessage(result.status === 'synced'
        ? `El contacto #${idContacto} se sincronizó correctamente.`
        : `El contacto #${idContacto} permanece pendiente de sincronización.`);
      await Promise.all([loadConnection(), loadContacts()]);
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
    try { await loadContacts(1, value); }
    catch (error) { setMessage(getErrorMessage(error, 'No fue posible aplicar el filtro.')); }
    finally { setLoading(false); }
  };

  const changePage = async (nextPage) => {
    setPage(nextPage);
    setLoading(true);
    try { await loadContacts(nextPage, filter); }
    catch (error) { setMessage(getErrorMessage(error, 'No fue posible cambiar de página.')); }
    finally { setLoading(false); }
  };

  return (
    <main className="config-min qb-admin">
      <header className="config-min__header">
        <div>
          <span className="config-min__eyebrow"><FaBook /> Configuración · Integraciones</span>
          <h1>QuickBooks Online</h1>
          <p>Administra la conexión y revisa contactos pendientes de sincronización.</p>
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
            <thead><tr><th>Contacto</th><th>Estado</th><th>Intentos</th><th>Última sincronización</th><th>Error</th><th>Acciones</th></tr></thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact.id_contacto}>
                  <td><strong>{contact.nombre || 'Sin nombre'}</strong><small>Folio #{contact.id_contacto}</small></td>
                  <td><span className={`config-min__badge qb-status--${contact.sync_status}`}>{statusLabels[contact.sync_status] || contact.sync_status}</span></td>
                  <td>{contact.attempts || 0}</td>
                  <td>{formatDate(contact.synced_at)}</td>
                  <td title={contact.last_error || ''}>{summarizeError(contact.last_error)}</td>
                  <td><div className="qb-admin__row-actions">
                    {contact.sync_status !== 'synced' && <button type="button" onClick={() => handleRetry(contact.id_contacto)} disabled={busy === `contact-${contact.id_contacto}`}><FaRedo /> Reintentar</button>}
                    <button type="button" onClick={() => navigate(`/empleado/contactos?contacto=${contact.id_contacto}`)}>Abrir contacto</button>
                  </div></td>
                </tr>
              ))}
              {filteredContacts.length === 0 && <tr><td colSpan="6" className="config-min__empty">No hay contactos para mostrar.</td></tr>}
            </tbody>
          </table>
        )}
      </section>

      <div className="qb-admin__pagination">
        <button type="button" onClick={() => changePage(page - 1)} disabled={page === 1 || loading}>Anterior</button>
        <span>Página {page}</span>
        <button type="button" onClick={() => changePage(page + 1)} disabled={contacts.length < PAGE_SIZE || loading}>Siguiente</button>
      </div>
    </main>
  );
};

export default QuickBooksIntegracionPage;
