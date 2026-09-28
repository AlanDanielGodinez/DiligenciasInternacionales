import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCreditCard,
  FaEdit,
  FaFileAlt,
  FaFolderOpen,
  FaHistory,
  FaPlus,
  FaRedo,
  FaUser,
} from 'react-icons/fa';
import {
  createSolicitudForCliente,
  getClienteFicha,
  getSolicitudById,
  getTiposTramite,
  moverSolicitudArea,
  updateCliente,
} from '../../services/clientes.service';
import SatisfactionSurveyCard from '../../Components/Surveys/SatisfactionSurveyCard';

const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';
const getValue = (value) => (hasValue(value) ? value : 'N/A');
const todayInput = () => new Date().toISOString().slice(0, 10);

const formatDate = (value) => {
  if (!hasValue(value)) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-MX');
};

const buildName = (cliente = {}) =>
  [cliente.nombre, cliente.apellido_paterno, cliente.apellido_materno]
    .filter(hasValue)
    .join(' ') || 'N/A';

const cleanPayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
  );

const getApiMessage = (error, fallback) =>
  error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || fallback;

const findTipoById = (tipos = [], idTipo) =>
  tipos.find((tipo) => String(tipo.id_tipo_tramite) === String(idTipo));

const isPasaporte = (tipo = {}) =>
  `${tipo.nombre_tramite || ''} ${tipo.clave || ''}`.toLowerCase().includes('pasaporte');

const emptySolicitudForm = {
  id_tipo_tramite: '',
  id_tipo_tramite_adicional: '',
  canal_contacto: '',
  observaciones: '',
};

const ClienteFichaPage = () => {
  const { idCliente } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const actionHandledRef = useRef(false);
  const [ficha, setFicha] = useState(null);
  const [tiposTramite, setTiposTramite] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [modal, setModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [solicitudForm, setSolicitudForm] = useState(emptySolicitudForm);
  const [saving, setSaving] = useState(false);

  const cliente = ficha?.cliente || {};
  const contacto = ficha?.contacto || null;
  const solicitudes = ficha?.solicitudes || [];
  const historial = ficha?.historial || [];

  const selectedTipo = useMemo(
    () => findTipoById(tiposTramite, solicitudForm.id_tipo_tramite),
    [solicitudForm.id_tipo_tramite, tiposTramite]
  );
  const showTramiteAdicional = Boolean(selectedTipo && isPasaporte(selectedTipo));

  const loadFicha = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await getClienteFicha(idCliente);
      setFicha(data);
    } catch (error) {
      setMessage(getApiMessage(error, 'No se pudo cargar la ficha del aplicante.'));
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogos = async () => {
    try {
      const tipos = await getTiposTramite();
      setTiposTramite(tipos);
    } catch (error) {
      setMessage(getApiMessage(error, 'No se pudieron cargar los tipos de tramite.'));
    }
  };

  useEffect(() => {
    loadFicha();
    loadCatalogos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCliente]);

  useEffect(() => {
    const action = new URLSearchParams(location.search).get('accion');
    if (action !== 'nuevo-tramite' || actionHandledRef.current) return;
    actionHandledRef.current = true;
    setSolicitudForm(emptySolicitudForm);
    setModal('solicitud');
  }, [location.search]);

  const openEdit = () => {
    setEditForm({
      nombre: cliente.nombre || '',
      apellido_paterno: cliente.apellido_paterno || '',
      apellido_materno: cliente.apellido_materno || '',
      telefono: cliente.telefono || '',
      correo: cliente.correo || '',
      fecha_nacimiento: cliente.fecha_nacimiento ? String(cliente.fecha_nacimiento).slice(0, 10) : '',
      estado: cliente.estado || '',
      ciudad: cliente.ciudad || '',
      direccion: cliente.direccion || '',
      notas_generales: cliente.notas_generales || '',
      activo: cliente.activo === false ? 'false' : 'true',
    });
    setModal('edit');
  };

  const openSolicitud = () => {
    setSolicitudForm(emptySolicitudForm);
    setModal('solicitud');
  };

  const closeModal = () => {
    setModal(null);
    setSaving(false);
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateCliente(idCliente, cleanPayload({
        ...editForm,
        activo: editForm.activo === 'true',
      }));
      setMessage('Aplicante actualizado correctamente.');
      await loadFicha();
      closeModal();
    } catch (error) {
      setMessage(getApiMessage(error, 'No se pudo actualizar el aplicante.'));
    } finally {
      setSaving(false);
    }
  };

  const buildSolicitudPayloads = () => {
    const base = {
      id_tipo_tramite: Number(solicitudForm.id_tipo_tramite),
      id_empleado_responsable: null,
      estado_actual: 102,
      fecha_inicio: todayInput(),
      origen_registro: 'aplicante_ficha',
      canal_contacto: solicitudForm.canal_contacto,
      observaciones: solicitudForm.observaciones || 'Solicitud creada desde ficha de aplicante',
    };

    const payloads = [base];
    if (showTramiteAdicional && hasValue(solicitudForm.id_tipo_tramite_adicional)) {
      payloads.push({
        ...base,
        id_tipo_tramite: Number(solicitudForm.id_tipo_tramite_adicional),
        observaciones: `${base.observaciones} | Tramite adicional`,
      });
    }
    return payloads;
  };

  const saveSolicitud = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const created = [];
      for (const payload of buildSolicitudPayloads()) {
        const solicitud = await createSolicitudForCliente(idCliente, cleanPayload(payload));
        if (!solicitud?.id_solicitud) throw new Error('El backend no devolvio id_solicitud.');

        await moverSolicitudArea(solicitud.id_solicitud, {
          area_destino: 'PAGOS',
          descripcion: 'Solicitud creada desde ficha de aplicante y enviada a Finanzas para pago inicial',
          id_empleado_responsable: null,
          origen: 'enviado_a_finanzas',
        });

        const detail = await getSolicitudById(solicitud.id_solicitud);
        created.push(detail || solicitud);
      }

      setMessage(`${created.length} solicitud(es) creada(s) para este aplicante.`);
      await loadFicha();
      closeModal();
      if (created[0]?.id_solicitud) {
        navigate(`/empleado/solicitudes-nuevo?id_solicitud=${created[0].id_solicitud}`);
      }
    } catch (error) {
      setMessage(getApiMessage(error, 'No se pudo crear la solicitud.'));
    } finally {
      setSaving(false);
    }
  };

  const renderAvance = (avance) => {
    if (!avance) return <span className="aplicantes-muted">Sin avance</span>;
    const perfil = Number(avance.perfil_porcentaje || 0);
    const documentos = `${avance.documentos_obligatorios_subidos || 0}/${avance.documentos_obligatorios_total || 0}`;
    return (
      <div className="aplicantes-avance">
        <span>Perfil {perfil}%</span>
        <div><i style={{ width: `${Math.min(100, perfil)}%` }} /></div>
        <small>Docs {documentos} · PDF {avance.pdf_generado ? 'generado' : 'pendiente'}</small>
      </div>
    );
  };

  const renderEditModal = () => (
    <form className="admin-modal admin-modal--wide" onSubmit={saveEdit}>
      <div className="admin-modal-header">
        <div><span className="admin-modal-kicker">Ficha de aplicante</span><h2 className="admin-modal-title">Editar datos del aplicante</h2></div>
        <button className="admin-modal-close" type="button" onClick={closeModal} aria-label="Cerrar">&times;</button>
      </div>
      <div className="admin-modal-body aplicantes-form-grid">
        {[
          ['nombre', 'Nombre'],
          ['apellido_paterno', 'Apellido paterno'],
          ['apellido_materno', 'Apellido materno'],
          ['telefono', 'Telefono'],
          ['correo', 'Correo'],
          ['estado', 'Estado'],
          ['ciudad', 'Ciudad'],
          ['direccion', 'Direccion'],
        ].map(([field, label]) => (
          <label key={field}>{label}
            <input
              value={editForm[field] || ''}
              onChange={(event) => setEditForm((current) => ({ ...current, [field]: event.target.value }))}
              required={field === 'nombre'}
            />
          </label>
        ))}
        <label>Fecha nacimiento
          <input type="date" value={editForm.fecha_nacimiento || ''} onChange={(event) => setEditForm((current) => ({ ...current, fecha_nacimiento: event.target.value }))} />
        </label>
        <label>Activo
          <select value={editForm.activo || 'true'} onChange={(event) => setEditForm((current) => ({ ...current, activo: event.target.value }))}>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </label>
        <label className="aplicantes-span-2">Notas generales
          <textarea value={editForm.notas_generales || ''} onChange={(event) => setEditForm((current) => ({ ...current, notas_generales: event.target.value }))} />
        </label>
      </div>
      <div className="admin-modal-footer"><button className="admin-button admin-button-secondary" type="button" onClick={closeModal}>Cancelar</button><button type="submit" className="admin-button admin-button-primary aplicantes-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button></div>
    </form>
  );

  const renderSolicitudModal = () => {
    const extraTipos = tiposTramite.filter((tipo) => String(tipo.id_tipo_tramite) !== String(solicitudForm.id_tipo_tramite));
    return (
      <form className="admin-modal" onSubmit={saveSolicitud}>
        <div className="admin-modal-header">
          <div><span className="admin-modal-kicker">Ficha de aplicante</span><h2 className="admin-modal-title">Agregar nuevo trámite</h2></div>
          <button className="admin-modal-close" type="button" onClick={closeModal} aria-label="Cerrar">&times;</button>
        </div>
        <label>Tipo de tramite
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
              {extraTipos.map((tipo) => (
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
        <label>Observaciones
          <textarea value={solicitudForm.observaciones} onChange={(event) => setSolicitudForm((current) => ({ ...current, observaciones: event.target.value }))} />
        </label>
        <p className="aplicantes-hint">El nuevo tramite se enviara a Finanzas/Pagos para pago inicial.</p>
        <div className="admin-modal-footer"><button className="admin-button admin-button-secondary" type="button" onClick={closeModal}>Cancelar</button><button type="submit" className="admin-button admin-button-primary aplicantes-primary" disabled={saving}>{saving ? 'Creando...' : 'Crear tramite'}</button></div>
      </form>
    );
  };

  if (loading && !ficha) {
    return <main className="aplicantes-page"><div className="aplicantes-empty">Cargando ficha del aplicante...</div></main>;
  }

  return (
    <main className="aplicantes-page aplicantes-ficha">
      <header className="aplicantes-hero">
        <div>
          <span><FaUser /> Ficha de aplicante</span>
          <h1>{buildName(cliente)}</h1>
          <p>Folio aplicante #{getValue(cliente.id_cliente)} · {cliente.activo === false ? 'Inactivo' : 'Activo'}</p>
        </div>
        <div className="aplicantes-actions">
          <button type="button" onClick={() => navigate('/empleado/clientes')}><FaArrowLeft /> Volver</button>
          <button type="button" onClick={loadFicha}><FaRedo /> Actualizar</button>
          <button type="button" onClick={openEdit}><FaEdit /> Editar</button>
          <button type="button" onClick={openSolicitud}><FaPlus /> Nuevo tramite</button>
        </div>
      </header>

      {message && <div className="aplicantes-message">{message}</div>}

      <section className="aplicantes-ficha-grid">
        <article className="aplicantes-card">
          <h2>Datos del aplicante</h2>
          <div className="aplicantes-detail-grid">
            <div><span>Telefono</span><strong>{getValue(cliente.telefono)}</strong></div>
            <div><span>Correo</span><strong>{getValue(cliente.correo)}</strong></div>
            <div><span>Pais</span><strong>{getValue(cliente.pais_nombre)}</strong></div>
            <div><span>Estado / Ciudad</span><strong>{getValue([cliente.estado, cliente.ciudad].filter(hasValue).join(', '))}</strong></div>
            <div><span>Fecha nacimiento</span><strong>{formatDate(cliente.fecha_nacimiento)}</strong></div>
            <div><span>Notas</span><strong>{getValue(cliente.notas_generales)}</strong></div>
          </div>
        </article>

        <article className="aplicantes-card">
          <h2>Contacto relacionado</h2>
          {contacto ? (
            <div className="aplicantes-detail-grid">
              <div><span>Folio contacto</span><strong>#{contacto.id_contacto}</strong></div>
              <div><span>Nombre</span><strong>{getValue(contacto.nombre)}</strong></div>
              <div><span>Telefono</span><strong>{getValue(contacto.telefono)}</strong></div>
              <div><span>Correo</span><strong>{getValue(contacto.correo)}</strong></div>
            </div>
          ) : (
            <div className="aplicantes-empty">Este aplicante no tiene contacto vinculado.</div>
          )}
        </article>
      </section>

      <section className="aplicantes-card">
        <div className="aplicantes-card-header">
          <h2>Solicitudes / tramites</h2>
          <button type="button" onClick={openSolicitud}><FaPlus /> Agregar tramite</button>
        </div>
        {solicitudes.length === 0 ? (
          <div className="aplicantes-empty">Este aplicante todavia no tiene solicitudes.</div>
        ) : (
          <div className="aplicantes-solicitudes-grid">
            {solicitudes.map((solicitud) => (
              <article key={solicitud.id_solicitud} className="aplicantes-solicitud-card">
                <div className="aplicantes-solicitud-head">
                  <div>
                    <span>Folio solicitud #{solicitud.id_solicitud}</span>
                    <h3>{getValue(solicitud.tipo_tramite)}</h3>
                  </div>
                  <strong>{getValue(solicitud.estado_nombre || solicitud.estado_actual)}</strong>
                </div>
                <div className="aplicantes-detail-grid">
                  <div><span>Area</span><strong>{getValue(solicitud.area_actual)}</strong></div>
                  <div><span>Responsable</span><strong>{getValue(solicitud.responsable)}</strong></div>
                  <div><span>Fecha inicio</span><strong>{formatDate(solicitud.fecha_inicio)}</strong></div>
                  <div><span>Ultimo movimiento</span><strong>{formatDate(solicitud.fecha_ultimo_movimiento)}</strong></div>
                  <div><span>Proximo contacto</span><strong>{formatDate(solicitud.fecha_proximo_contacto)}</strong></div>
                  <div><span>Canal</span><strong>{getValue(solicitud.canal_contacto)}</strong></div>
                </div>
                {renderAvance(solicitud.avance)}
                <div className="aplicantes-solicitud-actions">
                  <button type="button" onClick={() => navigate(`/empleado/solicitudes-nuevo?id_solicitud=${solicitud.id_solicitud}`)}><FaFileAlt /> Abrir expediente</button>
                  <button type="button" onClick={() => navigate('/empleado/pagos-pendientes')}><FaCreditCard /> Ver pagos</button>
                  <button type="button" onClick={() => navigate(`/empleado/solicitudes-nuevo?id_solicitud=${solicitud.id_solicitud}`)}><FaFolderOpen /> Ver documentos</button>
                  <button type="button" onClick={() => navigate(`/empleado/solicitudes-nuevo?id_solicitud=${solicitud.id_solicitud}`)}><FaHistory /> Ver historial</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="aplicantes-card">
        <h2>Historial del aplicante</h2>
        {historial.length === 0 ? (
          <div className="aplicantes-empty">Sin historial asociado a sus solicitudes.</div>
        ) : (
          <div className="aplicantes-history">
            {historial.map((item) => (
              <article key={item.id_seguimiento}>
                <span>{formatDate(item.creado_en || item.fecha_seguimiento)}</span>
                <strong>{getValue(item.descripcion)}</strong>
                <small>Solicitud #{item.id_solicitud} · {getValue(item.tipo_tramite)} · {getValue(item.origen)} · Estado nuevo: {getValue(item.estado_nuevo)}</small>
              </article>
            ))}
          </div>
        )}
      </section>

      <SatisfactionSurveyCard idCliente={Number(idCliente)} />

      {modal && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          {modal === 'edit' && renderEditModal()}
          {modal === 'solicitud' && renderSolicitudModal()}
        </div>
      )}
    </main>
  );
};

export default ClienteFichaPage;
