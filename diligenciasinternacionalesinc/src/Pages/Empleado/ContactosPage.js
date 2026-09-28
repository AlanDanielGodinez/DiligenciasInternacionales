import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaAddressBook,
  FaEdit,
  FaEye,
  FaHistory,
  FaPlus,
  FaRedo,
  FaSearch,
  FaTimes,
  FaUserPlus,
} from 'react-icons/fa';
import {
  createAplicanteForContacto,
  createContacto,
  createSolicitudForCliente,
  getContactoAplicantes,
  getContactos,
  getPaises,
  getSolicitudById,
  getTiposTramite,
  moverSolicitudArea,
  updateContacto,
} from '../../services/contactos.service';
import {
  getContactQuickBooksStatus,
  syncContactToQuickBooks,
} from '../../services/quickbooks.service';
import '../../Styles/ContactosPage.css';

const todayInput = () => new Date().toISOString().slice(0, 10);

const emptyContactoForm = {
  nombre: '',
  telefono: '',
  telefono_emergencia: '',
  correo: '',
  fecha_ingreso: todayInput(),
};

const emptyAplicanteForm = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  telefono: '',
  correo: '',
  fecha_nacimiento: '',
  id_pais: '1',
  estado: '',
  ciudad: '',
  direccion: '',
  notas_generales: '',
};

const emptySolicitudForm = {
  id_cliente: '',
  id_tipo_tramite: '',
  id_tipo_tramite_adicional: '',
  canal_contacto: '',
  observaciones: '',
};

const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';
const getValue = (value) => (hasValue(value) ? value : 'N/A');

const formatDate = (value) => {
  if (!hasValue(value)) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-MX');
};

const buildAplicanteName = (aplicante = {}) =>
  [aplicante.nombre, aplicante.apellido_paterno, aplicante.apellido_materno]
    .filter(hasValue)
    .join(' ') || 'N/A';

const findTipoById = (tipos = [], idTipo) =>
  tipos.find((tipo) => String(tipo.id_tipo_tramite) === String(idTipo));

const isPasaporte = (tipo = {}) =>
  `${tipo.nombre_tramite || ''} ${tipo.clave || ''}`.toLowerCase().includes('pasaporte');

const cleanPayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
  );

const getApiMessage = (error, fallback) =>
  error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || fallback;

const ContactosPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [contactos, setContactos] = useState([]);
  const [tiposTramite, setTiposTramite] = useState([]);
  const [paises, setPaises] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedContacto, setSelectedContacto] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [contactoForm, setContactoForm] = useState(emptyContactoForm);
  const [aplicanteForm, setAplicanteForm] = useState(emptyAplicanteForm);
  const [solicitudForm, setSolicitudForm] = useState(emptySolicitudForm);
  const [saving, setSaving] = useState(false);
  const [quickbooksStatus, setQuickbooksStatus] = useState(null);
  const [quickbooksBusy, setQuickbooksBusy] = useState(false);

  const selectedTipoPrincipal = useMemo(
    () => findTipoById(tiposTramite, solicitudForm.id_tipo_tramite),
    [solicitudForm.id_tipo_tramite, tiposTramite]
  );
  const showTramiteAdicional = Boolean(selectedTipoPrincipal && isPasaporte(selectedTipoPrincipal));

  const loadContactos = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await getContactos({
        q: search.trim() || undefined,
        limit: 100,
        offset: 0,
      });
      setContactos(data);
    } catch (error) {
      setMessage(getApiMessage(error, 'No se pudieron cargar los contactos.'));
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogos = async () => {
    try {
      const [tipos, paisesData] = await Promise.all([getTiposTramite(), getPaises()]);
      setTiposTramite(tipos);
      setPaises(paisesData);
    } catch (error) {
      setMessage(getApiMessage(error, 'No se pudieron cargar los catalogos.'));
    }
  };

  const loadDetalle = async (contacto) => {
    if (!contacto?.id_contacto) return;
    setSelectedContacto(contacto);
    setDetalleLoading(true);
    setMessage('');
    try {
      const data = await getContactoAplicantes(contacto.id_contacto);
      setDetalle(data);
      try {
        setQuickbooksStatus(await getContactQuickBooksStatus(contacto.id_contacto));
      } catch (_) {
        setQuickbooksStatus(null);
      }
      setModal('detalle');
    } catch (error) {
      setMessage(getApiMessage(error, 'No se pudo cargar el contacto.'));
    } finally {
      setDetalleLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([loadContactos(), loadCatalogos()]);
      const idContacto = Number(searchParams.get('contacto'));
      if (Number.isInteger(idContacto) && idContacto > 0) {
        await loadDetalle({ id_contacto: idContacto });
        setSearchParams({}, { replace: true });
      }
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retryQuickBooks = async (idContacto) => {
    setQuickbooksBusy(true);
    try {
      const result = await syncContactToQuickBooks(idContacto);
      setMessage(result.status === 'synced'
        ? 'Contacto sincronizado con QuickBooks.'
        : 'El contacto se guardó; la sincronización con QuickBooks permanece pendiente.');
      setQuickbooksStatus(await getContactQuickBooksStatus(idContacto));
    } catch (error) {
      setMessage(getApiMessage(error, 'No fue posible reintentar la sincronización con QuickBooks.'));
    } finally {
      setQuickbooksBusy(false);
    }
  };

  const openNewContacto = () => {
    setContactoForm({ ...emptyContactoForm, fecha_ingreso: todayInput() });
    setSelectedContacto(null);
    setModal('contacto');
  };

  const openEditContacto = (contacto) => {
    setSelectedContacto(contacto);
    setContactoForm({
      nombre: contacto.nombre || '',
      telefono: contacto.telefono || '',
      telefono_emergencia: contacto.telefono_emergencia || '',
      correo: contacto.correo || '',
      fecha_ingreso: contacto.fecha_ingreso ? String(contacto.fecha_ingreso).slice(0, 10) : todayInput(),
    });
    setModal('contacto');
  };

  const openAplicante = (contacto) => {
    setSelectedContacto(contacto);
    setAplicanteForm({ ...emptyAplicanteForm });
    setModal('aplicante');
  };

  const openSolicitud = (contacto, aplicante = null) => {
    setSelectedContacto(contacto);
    setSolicitudForm({
      ...emptySolicitudForm,
      id_cliente: aplicante?.id_cliente ? String(aplicante.id_cliente) : '',
    });
    setModal('solicitud');
  };

  const closeModal = () => {
    setModal(null);
    setSaving(false);
  };

  const saveContacto = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (selectedContacto?.id_contacto) {
        const updated = await updateContacto(selectedContacto.id_contacto, cleanPayload(contactoForm));
        setSelectedContacto(updated);
        setMessage('Contacto actualizado correctamente.');
      } else {
        const created = await createContacto(cleanPayload(contactoForm));
        setSelectedContacto(created);
        setMessage('Contacto creado correctamente.');
      }
      await loadContactos();
      closeModal();
    } catch (error) {
      setMessage(getApiMessage(error, 'No se pudo guardar el contacto.'));
    } finally {
      setSaving(false);
    }
  };

  const saveAplicante = async (event) => {
    event.preventDefault();
    if (!selectedContacto?.id_contacto) return;
    setSaving(true);
    setMessage('');
    try {
      await createAplicanteForContacto(selectedContacto.id_contacto, cleanPayload({
        ...aplicanteForm,
        id_pais: Number(aplicanteForm.id_pais || 1),
      }));
      setMessage('Aplicante agregado correctamente.');
      await loadContactos();
      await loadDetalle(selectedContacto);
      closeModal();
    } catch (error) {
      setMessage(getApiMessage(error, 'No se pudo agregar el aplicante.'));
    } finally {
      setSaving(false);
    }
  };

  const buildSolicitudPayloads = () => {
    const payloads = [{
      id_tipo_tramite: Number(solicitudForm.id_tipo_tramite),
      id_empleado_responsable: null,
      estado_actual: 102,
      fecha_inicio: todayInput(),
      canal_contacto: solicitudForm.canal_contacto,
      origen_registro: 'informes_contactos',
      observaciones: solicitudForm.observaciones || 'Solicitud creada desde Informes / Contactos',
    }];

    if (showTramiteAdicional && hasValue(solicitudForm.id_tipo_tramite_adicional)) {
      payloads.push({
        ...payloads[0],
        id_tipo_tramite: Number(solicitudForm.id_tipo_tramite_adicional),
        observaciones: `${payloads[0].observaciones} | Tramite adicional`,
      });
    }

    return payloads;
  };

  const saveSolicitud = async (event) => {
    event.preventDefault();
    const idCliente = Number(solicitudForm.id_cliente);
    if (!idCliente) {
      setMessage('Selecciona un aplicante para crear la solicitud.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const solicitudesCreadas = [];
      for (const [index, payload] of buildSolicitudPayloads().entries()) {
        const solicitud = await createSolicitudForCliente(idCliente, cleanPayload({
          ...payload,
          id_solicitud_origen: index > 0 ? solicitudesCreadas[0]?.id_solicitud : null,
        }));
        const idSolicitud = solicitud?.id_solicitud;
        if (!idSolicitud) throw new Error('El backend no devolvio id_solicitud.');

        await moverSolicitudArea(idSolicitud, {
          area_destino: 'PAGOS',
          descripcion: 'Solicitud creada desde Informes y enviada a Finanzas para pago inicial',
          id_empleado_responsable: null,
          origen: 'enviado_a_finanzas',
        });

        const detail = await getSolicitudById(idSolicitud);
        solicitudesCreadas.push(detail || solicitud);
      }

      const firstSolicitud = solicitudesCreadas[0];
      setMessage(`${solicitudesCreadas.length} solicitud(es) creada(s) y enviada(s) a Finanzas.`);
      await loadContactos();
      if (selectedContacto?.id_contacto) await loadDetalle(selectedContacto);
      closeModal();
      if (firstSolicitud?.id_solicitud) {
        navigate(`/empleado/solicitudes-nuevo?id_solicitud=${firstSolicitud.id_solicitud}`);
      }
    } catch (error) {
      setMessage(getApiMessage(error, 'No se pudo crear la solicitud.'));
    } finally {
      setSaving(false);
    }
  };

  const renderDetalle = () => {
    const contacto = detalle?.contacto || selectedContacto || {};
    const aplicantes = detalle?.aplicantes || [];
    const historial = detalle?.historial || [];

    return (
      <div className="admin-modal admin-modal--wide">
        <div className="admin-modal-header">
          <div>
            <span className="admin-modal-kicker">Contacto #{getValue(contacto.id_contacto)}</span>
            <h2 className="admin-modal-title">{getValue(contacto.nombre)}</h2>
            <p className="admin-modal-subtitle">Ficha general del contacto y sus expedientes asociados.</p>
          </div>
          <button className="admin-modal-close" type="button" onClick={closeModal} title="Cerrar"><FaTimes /></button>
        </div>

        {detalleLoading ? (
          <div className="admin-modal-body contactos-crm-empty">Cargando contacto...</div>
        ) : (
          <div className="admin-modal-body">
            <section className="admin-modal-section">
              <h3 className="admin-modal-section-title">Datos generales</h3>
              <div className="admin-detail-grid">
                <div className="admin-detail-item"><span className="admin-detail-label">Teléfono</span><strong className="admin-detail-value">{getValue(contacto.telefono)}</strong></div>
                <div className="admin-detail-item"><span className="admin-detail-label">Emergencia</span><strong className="admin-detail-value">{getValue(contacto.telefono_emergencia)}</strong></div>
                <div className="admin-detail-item"><span className="admin-detail-label">Correo</span><strong className="admin-detail-value">{getValue(contacto.correo)}</strong></div>
                <div className="admin-detail-item"><span className="admin-detail-label">Fecha de ingreso</span><strong className="admin-detail-value">{formatDate(contacto.fecha_ingreso)}</strong></div>
              </div>
            </section>

            <div className="contactos-crm-detail-actions">
              <button type="button" onClick={() => openAplicante(contacto)}><FaUserPlus /> Agregar aplicante</button>
              <button type="button" onClick={() => openSolicitud(contacto)}><FaPlus /> Crear solicitud/tramite</button>
              {quickbooksStatus && (
                <span className={`contactos-crm-qb-status is-${quickbooksStatus.status}`}>
                  QuickBooks: {{
                    synced: 'Sincronizado',
                    pending: 'Pendiente',
                    syncing: 'Pendiente',
                    error: 'Error',
                    requires_reconnection: 'Requiere reconexión',
                  }[quickbooksStatus.status] || 'Pendiente'}
                </span>
              )}
              {quickbooksStatus && quickbooksStatus.status !== 'synced' && (
                <button type="button" onClick={() => retryQuickBooks(contacto.id_contacto)} disabled={quickbooksBusy}>
                  <FaRedo /> {quickbooksBusy ? 'Sincronizando...' : 'Reintentar sincronización'}
                </button>
              )}
            </div>

            <section className="admin-modal-section contactos-crm-section">
              <h3 className="admin-modal-section-title">Aplicantes asociados</h3>
              {aplicantes.length === 0 ? (
                <div className="contactos-crm-empty">Este contacto todavia no tiene aplicantes.</div>
              ) : (
                <div className="contactos-crm-applicants">
                  {aplicantes.map((aplicante) => (
                    <article key={aplicante.id_cliente} className="contactos-crm-applicant">
                      <div>
                        <strong>{buildAplicanteName(aplicante)}</strong>
                        <span>Folio aplicante #{aplicante.id_cliente} · {getValue(aplicante.pais_nombre)}</span>
                      </div>
                      <button type="button" onClick={() => openSolicitud(contacto, aplicante)}>
                        Crear solicitud
                      </button>
                      <div className="contactos-crm-solicitudes">
                        {(aplicante.solicitudes || []).length === 0 ? (
                          <small>Sin solicitudes registradas.</small>
                        ) : (
                          aplicante.solicitudes.map((solicitud) => (
                            <button
                              type="button"
                              key={solicitud.id_solicitud}
                              onClick={() => navigate(`/empleado/solicitudes-nuevo?id_solicitud=${solicitud.id_solicitud}`)}
                            >
                              #{solicitud.id_solicitud} · {getValue(solicitud.tipo_tramite)} · {getValue(solicitud.estado_actual_valor)}
                            </button>
                          ))
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="admin-modal-section contactos-crm-section">
              <h3 className="admin-modal-section-title">Historial / último movimiento</h3>
              {historial.length === 0 ? (
                <div className="contactos-crm-empty">Sin historial asociado a solicitudes.</div>
              ) : (
                <div className="contactos-crm-history">
                  {historial.map((item) => (
                    <article key={item.id_seguimiento}>
                      <span>{formatDate(item.creado_en || item.fecha_seguimiento)}</span>
                      <strong>{getValue(item.descripcion)}</strong>
                      <small>
                        Solicitud #{item.id_solicitud} · {getValue(item.tipo_tramite)} · {getValue(item.origen)}
                      </small>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
        <div className="admin-modal-footer">
          <button className="admin-button admin-button-secondary" type="button" onClick={closeModal}>Cerrar</button>
        </div>
      </div>
    );
  };

  const renderContactoForm = () => (
    <form className="admin-modal contactos-crm-modal" onSubmit={saveContacto}>
      <div className="admin-modal-header contactos-crm-modal__header">
        <h2 className="admin-modal-title">{selectedContacto?.id_contacto ? 'Editar contacto' : 'Nuevo contacto'}</h2>
        <button className="admin-modal-close" type="button" onClick={closeModal} title="Cerrar"><FaTimes /></button>
      </div>
      <div className="admin-modal-body">
        <div className="contactos-crm-form-grid">
          <label>Nombre<input value={contactoForm.nombre} onChange={(event) => setContactoForm((current) => ({ ...current, nombre: event.target.value }))} required /></label>
          <label>Teléfono<input value={contactoForm.telefono} onChange={(event) => setContactoForm((current) => ({ ...current, telefono: event.target.value }))} /></label>
          <label>Teléfono emergencia<input value={contactoForm.telefono_emergencia} onChange={(event) => setContactoForm((current) => ({ ...current, telefono_emergencia: event.target.value }))} /></label>
          <label>Correo<input type="email" value={contactoForm.correo} onChange={(event) => setContactoForm((current) => ({ ...current, correo: event.target.value }))} /></label>
          <label>Fecha ingreso<input type="date" value={contactoForm.fecha_ingreso} onChange={(event) => setContactoForm((current) => ({ ...current, fecha_ingreso: event.target.value }))} /></label>
        </div>
        <p className="contactos-crm-hint">Debe capturarse al menos teléfono o correo.</p>
      </div>
      <div className="admin-modal-footer">
        <button className="admin-button admin-button-secondary" type="button" onClick={closeModal}>Cancelar</button>
        <button type="submit" className="admin-button admin-button-primary contactos-crm-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar contacto'}</button>
      </div>
    </form>
  );

  const renderAplicanteForm = () => (
    <form className="admin-modal admin-modal--wide contactos-crm-modal contactos-crm-modal--wide" onSubmit={saveAplicante}>
      <div className="admin-modal-header contactos-crm-modal__header">
        <div>
          <span className="admin-modal-kicker">Contacto #{getValue(selectedContacto?.id_contacto)}</span>
          <h2 className="admin-modal-title">Agregar aplicante</h2>
        </div>
        <button className="admin-modal-close" type="button" onClick={closeModal} title="Cerrar"><FaTimes /></button>
      </div>
      <div className="admin-modal-body"><div className="contactos-crm-form-grid">
        <label>Nombre<input value={aplicanteForm.nombre} onChange={(event) => setAplicanteForm((current) => ({ ...current, nombre: event.target.value }))} required /></label>
        <label>Apellido paterno<input value={aplicanteForm.apellido_paterno} onChange={(event) => setAplicanteForm((current) => ({ ...current, apellido_paterno: event.target.value }))} /></label>
        <label>Apellido materno<input value={aplicanteForm.apellido_materno} onChange={(event) => setAplicanteForm((current) => ({ ...current, apellido_materno: event.target.value }))} /></label>
        <label>Telefono<input value={aplicanteForm.telefono} onChange={(event) => setAplicanteForm((current) => ({ ...current, telefono: event.target.value }))} /></label>
        <label>Correo<input type="email" value={aplicanteForm.correo} onChange={(event) => setAplicanteForm((current) => ({ ...current, correo: event.target.value }))} /></label>
        <label>Fecha nacimiento<input type="date" value={aplicanteForm.fecha_nacimiento} onChange={(event) => setAplicanteForm((current) => ({ ...current, fecha_nacimiento: event.target.value }))} /></label>
        <label>Pais<select value={aplicanteForm.id_pais} onChange={(event) => setAplicanteForm((current) => ({ ...current, id_pais: event.target.value }))}>{paises.map((pais) => <option key={pais.id_pais} value={pais.id_pais}>{pais.nombre_pais || pais.nombre}</option>)}</select></label>
        <label>Estado<input value={aplicanteForm.estado} onChange={(event) => setAplicanteForm((current) => ({ ...current, estado: event.target.value }))} /></label>
        <label>Ciudad<input value={aplicanteForm.ciudad} onChange={(event) => setAplicanteForm((current) => ({ ...current, ciudad: event.target.value }))} /></label>
        <label className="contactos-crm-span-2">Direccion<input value={aplicanteForm.direccion} onChange={(event) => setAplicanteForm((current) => ({ ...current, direccion: event.target.value }))} /></label>
        <label className="contactos-crm-span-2">Notas generales<textarea value={aplicanteForm.notas_generales} onChange={(event) => setAplicanteForm((current) => ({ ...current, notas_generales: event.target.value }))} /></label>
      </div></div>
      <div className="admin-modal-footer">
        <button className="admin-button admin-button-secondary" type="button" onClick={closeModal}>Cancelar</button>
        <button type="submit" className="admin-button admin-button-primary contactos-crm-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar aplicante'}</button>
      </div>
    </form>
  );

  const renderSolicitudForm = () => {
    const aplicantes = detalle?.aplicantes || [];
    const filteredAdditionalTipos = tiposTramite.filter((tipo) => String(tipo.id_tipo_tramite) !== String(solicitudForm.id_tipo_tramite));

    return (
      <form className="admin-modal contactos-crm-modal" onSubmit={saveSolicitud}>
        <div className="admin-modal-header contactos-crm-modal__header">
          <h2 className="admin-modal-title">Crear solicitud/trámite</h2>
          <button className="admin-modal-close" type="button" onClick={closeModal} title="Cerrar"><FaTimes /></button>
        </div>
        <div className="admin-modal-body">
        <label>Aplicante
          <select value={solicitudForm.id_cliente} onChange={(event) => setSolicitudForm((current) => ({ ...current, id_cliente: event.target.value }))} required>
            <option value="">Seleccionar aplicante</option>
            {aplicantes.map((aplicante) => (
              <option key={aplicante.id_cliente} value={aplicante.id_cliente}>{buildAplicanteName(aplicante)}</option>
            ))}
          </select>
        </label>
        <label>Tipo de tramite principal
          <select value={solicitudForm.id_tipo_tramite} onChange={(event) => setSolicitudForm((current) => ({ ...current, id_tipo_tramite: event.target.value, id_tipo_tramite_adicional: '' }))} required>
            <option value="">Seleccionar tramite</option>
            {tiposTramite.map((tipo) => (
              <option key={tipo.id_tipo_tramite} value={tipo.id_tipo_tramite}>{tipo.nombre_tramite}</option>
            ))}
          </select>
        </label>
        {showTramiteAdicional && (
          <label>Tramite adicional
            <select value={solicitudForm.id_tipo_tramite_adicional} onChange={(event) => setSolicitudForm((current) => ({ ...current, id_tipo_tramite_adicional: event.target.value }))}>
              <option value="">Sin tramite adicional</option>
              {filteredAdditionalTipos.map((tipo) => (
                <option key={tipo.id_tipo_tramite} value={tipo.id_tipo_tramite}>{tipo.nombre_tramite}</option>
              ))}
            </select>
          </label>
        )}
        <label>Canal de contacto
          <select value={solicitudForm.canal_contacto} onChange={(event) => setSolicitudForm((current) => ({ ...current, canal_contacto: event.target.value }))} required>
            <option value="">Seleccionar canal</option>
            <option value="Walle">Walle</option>
            <option value="Eva">Eva</option>
            <option value="Banny">Banny</option>
          </select>
        </label>
        <label>Observaciones<textarea value={solicitudForm.observaciones} onChange={(event) => setSolicitudForm((current) => ({ ...current, observaciones: event.target.value }))} /></label>
        <p className="contactos-crm-hint">La solicitud se enviara a Finanzas/Pagos para pago inicial.</p>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-button admin-button-secondary" type="button" onClick={closeModal}>Cancelar</button>
          <button type="submit" className="admin-button admin-button-primary contactos-crm-primary" disabled={saving}>{saving ? 'Creando...' : 'Crear solicitud'}</button>
        </div>
      </form>
    );
  };

  return (
    <main className="contactos-crm">
      <header className="contactos-crm-hero">
        <div>
          <span><FaAddressBook /> Informes</span>
          <h1>Informes / Contactos</h1>
          <p>Busca contactos existentes, agrega aplicantes y crea tramites sin duplicar el expediente.</p>
        </div>
        <div className="contactos-crm-actions">
          <button type="button" onClick={openNewContacto}><FaPlus /> Nuevo contacto</button>
          <button type="button" onClick={loadContactos}><FaRedo /> Actualizar</button>
        </div>
      </header>

      <section className="contactos-crm-search">
        <FaSearch />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') loadContactos(); }}
          placeholder="Buscar por nombre, telefono o correo"
        />
        <button type="button" onClick={loadContactos}>Buscar</button>
      </section>

      {message && <div className="contactos-crm-message">{message}</div>}

      <section className="contactos-crm-table-wrap">
        {loading ? (
          <div className="contactos-crm-empty">Cargando contactos...</div>
        ) : contactos.length === 0 ? (
          <div className="contactos-crm-empty">No hay contactos para mostrar.</div>
        ) : (
          <table className="contactos-crm-table">
            <thead>
              <tr>
                <th>Contacto</th>
                <th>Telefono</th>
                <th>Correo</th>
                <th>Ingreso</th>
                <th>Aplicantes</th>
                <th>Solicitudes</th>
                <th>Ultimo movimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {contactos.map((contacto) => (
                <tr key={contacto.id_contacto} className="admin-clickable-row" onClick={() => loadDetalle(contacto)}>
                  <td><strong>{getValue(contacto.nombre)}</strong><small>#{contacto.id_contacto}</small></td>
                  <td>{getValue(contacto.telefono)}</td>
                  <td>{getValue(contacto.correo)}</td>
                  <td>{formatDate(contacto.fecha_ingreso)}</td>
                  <td>{contacto.cantidad_aplicantes || 0}</td>
                  <td>{contacto.cantidad_solicitudes || 0}</td>
                  <td><span>{formatDate(contacto.ultimo_movimiento)}</span><small>{getValue(contacto.ultimo_seguimiento)}</small></td>
                  <td>
                    <div className="contactos-crm-row-actions">
                      <button className="admin-action-button" type="button" title="Ver contacto" onClick={(event) => { event.stopPropagation(); loadDetalle(contacto); }}><FaEye /></button>
                      <button className="admin-action-button" type="button" title="Editar contacto" onClick={(event) => { event.stopPropagation(); openEditContacto(contacto); }}><FaEdit /></button>
                      <button className="admin-action-button" type="button" title="Agregar aplicante" onClick={(event) => { event.stopPropagation(); openAplicante(contacto); }}><FaUserPlus /></button>
                      <button className="admin-action-button" type="button" title="Crear solicitud" onClick={async (event) => { event.stopPropagation(); await loadDetalle(contacto); openSolicitud(contacto); }}><FaPlus /></button>
                      <button type="button" title="Ver historial" onClick={(event) => { event.stopPropagation(); loadDetalle(contacto); }}><FaHistory /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {modal && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          {modal === 'detalle' && renderDetalle()}
          {modal === 'contacto' && renderContactoForm()}
          {modal === 'aplicante' && renderAplicanteForm()}
          {modal === 'solicitud' && renderSolicitudForm()}
        </div>
      )}
    </main>
  );
};

export default ContactosPage;
