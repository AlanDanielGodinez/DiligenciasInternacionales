import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createCotizacionSolicitud,
  createItinerarioSolicitud,
  getCotizacionesViaje,
  getItinerariosViaje,
  updateCotizacionViaje,
  updateItinerarioViaje,
} from '../../services/viajes.service';
import '../../Styles/ViajesOperacionPage.css';
import { ManagementHeader, ManagementPage, ManagementTableFrame, ManagementToolbar } from '../../Components/Management/ManagementUI';

const SERVICIOS = ['vuelo', 'hotel', 'transporte', 'paquete', 'tour', 'otro'];
const ESTADOS_COTIZACION = ['pendiente', 'enviada', 'aceptada', 'rechazada', 'cancelada'];
const ESTADOS_ITINERARIO = ['pendiente', 'confirmado', 'enviado', 'cancelado'];

const emptyCotizacion = {
  id_solicitud: '',
  tipo_servicio: 'vuelo',
  descripcion: '',
  proveedor: '',
  monto_estimado: '',
  moneda: 'MXN',
  estado_cotizacion: 'pendiente',
  observaciones: '',
};

const emptyItinerario = {
  id_solicitud: '',
  fecha_salida: '',
  fecha_regreso: '',
  origen: '',
  destino: '',
  aerolinea: '',
  numero_vuelo: '',
  hotel: '',
  direccion_hotel: '',
  transporte_incluido: false,
  detalles: '',
  estado_itinerario: 'pendiente',
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('es-MX');
};

const formatMoney = (value, currency = 'MXN') => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'N/A';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency || 'MXN' }).format(amount);
};

const normalizeError = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const ViajesOperacionPage = ({ initialTab = 'cotizaciones' }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [itinerarios, setItinerarios] = useState([]);
  const [filters, setFilters] = useState({ q: '', estado: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cotizacionForm, setCotizacionForm] = useState(null);
  const [itinerarioForm, setItinerarioForm] = useState(null);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        q: filters.q || undefined,
        estado_cotizacion: activeTab === 'cotizaciones' ? filters.estado || undefined : undefined,
        estado_itinerario: activeTab === 'itinerarios' ? filters.estado || undefined : undefined,
      };
      const [cotizacionesData, itinerariosData] = await Promise.all([
        getCotizacionesViaje(params),
        getItinerariosViaje(params),
      ]);
      setCotizaciones(cotizacionesData);
      setItinerarios(itinerariosData);
    } catch (requestError) {
      setError(normalizeError(requestError, 'No fue posible cargar Viajes.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const estados = useMemo(
    () => (activeTab === 'cotizaciones' ? ESTADOS_COTIZACION : ESTADOS_ITINERARIO),
    [activeTab]
  );

  const abrirCotizacionNueva = () => {
    setCotizacionForm({ mode: 'create', values: emptyCotizacion });
    setError('');
    setMessage('');
  };

  const abrirCotizacionEditar = (cotizacion) => {
    setCotizacionForm({
      mode: 'edit',
      id: cotizacion.id_cotizacion,
      values: {
        id_solicitud: cotizacion.id_solicitud || '',
        tipo_servicio: cotizacion.tipo_servicio || 'vuelo',
        descripcion: cotizacion.descripcion || '',
        proveedor: cotizacion.proveedor || '',
        monto_estimado: cotizacion.monto_estimado || '',
        moneda: cotizacion.moneda || 'MXN',
        estado_cotizacion: cotizacion.estado_cotizacion || 'pendiente',
        observaciones: cotizacion.observaciones || '',
      },
    });
    setError('');
    setMessage('');
  };

  const abrirItinerarioNuevo = () => {
    setItinerarioForm({ mode: 'create', values: emptyItinerario });
    setError('');
    setMessage('');
  };

  const abrirItinerarioEditar = (itinerario) => {
    setItinerarioForm({
      mode: 'edit',
      id: itinerario.id_itinerario,
      values: {
        id_solicitud: itinerario.id_solicitud || '',
        fecha_salida: itinerario.fecha_salida ? itinerario.fecha_salida.slice(0, 10) : '',
        fecha_regreso: itinerario.fecha_regreso ? itinerario.fecha_regreso.slice(0, 10) : '',
        origen: itinerario.origen || '',
        destino: itinerario.destino || '',
        aerolinea: itinerario.aerolinea || '',
        numero_vuelo: itinerario.numero_vuelo || '',
        hotel: itinerario.hotel || '',
        direccion_hotel: itinerario.direccion_hotel || '',
        transporte_incluido: Boolean(itinerario.transporte_incluido),
        detalles: itinerario.detalles || '',
        estado_itinerario: itinerario.estado_itinerario || 'pendiente',
      },
    });
    setError('');
    setMessage('');
  };

  const guardarCotizacion = async (event) => {
    event.preventDefault();
    const values = cotizacionForm.values;
    if (!values.id_solicitud) {
      setError('El folio de solicitud es obligatorio.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (cotizacionForm.mode === 'edit') {
        await updateCotizacionViaje(cotizacionForm.id, values);
        setMessage('Cotización actualizada.');
      } else {
        await createCotizacionSolicitud(values.id_solicitud, values);
        setMessage('Cotización creada.');
      }
      setCotizacionForm(null);
      await cargarDatos();
    } catch (requestError) {
      setError(normalizeError(requestError, 'No fue posible guardar la cotización.'));
    } finally {
      setSaving(false);
    }
  };

  const guardarItinerario = async (event) => {
    event.preventDefault();
    const values = itinerarioForm.values;
    if (!values.id_solicitud) {
      setError('El folio de solicitud es obligatorio.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (itinerarioForm.mode === 'edit') {
        await updateItinerarioViaje(itinerarioForm.id, values);
        setMessage('Itinerario actualizado.');
      } else {
        await createItinerarioSolicitud(values.id_solicitud, values);
        setMessage('Itinerario creado.');
      }
      setItinerarioForm(null);
      await cargarDatos();
    } catch (requestError) {
      setError(normalizeError(requestError, 'No fue posible guardar el itinerario.'));
    } finally {
      setSaving(false);
    }
  };

  const setCotizacionValue = (key, value) => {
    setCotizacionForm((current) => ({
      ...current,
      values: { ...current.values, [key]: value },
    }));
  };

  const setItinerarioValue = (key, value) => {
    setItinerarioForm((current) => ({
      ...current,
      values: { ...current.values, [key]: value },
    }));
  };

  return (
    <ManagementPage className="viajes-op">
      <ManagementHeader className="viajes-op__header">
        <div>
          <p>Viajes / Operación</p>
          <h1>Cotizaciones e itinerarios</h1>
          <span>Servicios básicos vinculados a solicitudes del expediente.</span>
        </div>
        <div className="viajes-op__header-actions">
          <button type="button" onClick={abrirCotizacionNueva}>Nueva cotización</button>
          <button type="button" onClick={abrirItinerarioNuevo}>Nuevo itinerario</button>
          <button type="button" onClick={cargarDatos}>Actualizar</button>
        </div>
      </ManagementHeader>

      <section className="viajes-op__tabs">
        <button type="button" className={activeTab === 'cotizaciones' ? 'is-active' : ''} onClick={() => setActiveTab('cotizaciones')}>
          Cotizaciones
        </button>
        <button type="button" className={activeTab === 'itinerarios' ? 'is-active' : ''} onClick={() => setActiveTab('itinerarios')}>
          Itinerarios
        </button>
      </section>

      <ManagementToolbar as="section" className="viajes-op__filters">
        <input
          type="search"
          placeholder="Buscar por folio, aplicante, contacto o trámite"
          value={filters.q}
          onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
        />
        <select
          value={filters.estado}
          onChange={(event) => setFilters((current) => ({ ...current, estado: event.target.value }))}
        >
          <option value="">Todos los estados</option>
          {estados.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
        </select>
        <button type="button" onClick={cargarDatos}>Filtrar</button>
      </ManagementToolbar>

      {message && <div className="viajes-op__alert viajes-op__alert--success">{message}</div>}
      {error && <div className="viajes-op__alert viajes-op__alert--error">{error}</div>}

      {activeTab === 'cotizaciones' ? (
        <ManagementTableFrame as="section" className="viajes-op__table-card">
          {loading ? <div className="viajes-op__empty">Cargando cotizaciones...</div> : cotizaciones.length === 0 ? (
            <div className="viajes-op__empty">No hay cotizaciones registradas.</div>
          ) : (
            <table className="viajes-op__table">
              <thead>
                <tr>
                  <th>Solicitud</th>
                  <th>Aplicante</th>
                  <th>Servicio</th>
                  <th>Proveedor</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Actualizado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cotizaciones.map((cotizacion) => (
                  <tr
                    key={cotizacion.id_cotizacion}
                    className="admin-clickable-row"
                    onClick={() => navigate(`/empleado/solicitudes-nuevo?id_solicitud=${cotizacion.id_solicitud}`)}
                  >
                    <td><strong>#{cotizacion.id_solicitud}</strong><small>{cotizacion.tipo_tramite || ''}</small></td>
                    <td>{cotizacion.aplicante || 'N/A'}</td>
                    <td>{cotizacion.tipo_servicio}</td>
                    <td>{cotizacion.proveedor || 'N/A'}</td>
                    <td>{formatMoney(cotizacion.monto_estimado, cotizacion.moneda)}</td>
                    <td><span className="viajes-op__chip">{cotizacion.estado_cotizacion}</span></td>
                    <td>{formatDate(cotizacion.actualizado_en)}</td>
                    <td>
                      <div className="viajes-op__actions" onClick={(event) => event.stopPropagation()}>
                        <button type="button" onClick={() => abrirCotizacionEditar(cotizacion)}>Editar</button>
                        <button type="button" onClick={() => navigate(`/empleado/solicitudes-nuevo?id_solicitud=${cotizacion.id_solicitud}`)}>Expediente</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ManagementTableFrame>
      ) : (
        <ManagementTableFrame as="section" className="viajes-op__table-card">
          {loading ? <div className="viajes-op__empty">Cargando itinerarios...</div> : itinerarios.length === 0 ? (
            <div className="viajes-op__empty">No hay itinerarios registrados.</div>
          ) : (
            <table className="viajes-op__table">
              <thead>
                <tr>
                  <th>Solicitud</th>
                  <th>Aplicante</th>
                  <th>Ruta</th>
                  <th>Fechas</th>
                  <th>Vuelo / hotel</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {itinerarios.map((itinerario) => (
                  <tr
                    key={itinerario.id_itinerario}
                    className="admin-clickable-row"
                    onClick={() => navigate(`/empleado/solicitudes-nuevo?id_solicitud=${itinerario.id_solicitud}`)}
                  >
                    <td><strong>#{itinerario.id_solicitud}</strong><small>{itinerario.tipo_tramite || ''}</small></td>
                    <td>{itinerario.aplicante || 'N/A'}</td>
                    <td>{[itinerario.origen, itinerario.destino].filter(Boolean).join(' -> ') || 'N/A'}</td>
                    <td>
                      <span>Salida: {formatDate(itinerario.fecha_salida)}</span>
                      <small>Regreso: {formatDate(itinerario.fecha_regreso)}</small>
                    </td>
                    <td>
                      <span>{itinerario.aerolinea || 'Sin aerolínea'} {itinerario.numero_vuelo || ''}</span>
                      <small>{itinerario.hotel || 'Sin hotel'}</small>
                    </td>
                    <td><span className="viajes-op__chip">{itinerario.estado_itinerario}</span></td>
                    <td>
                      <div className="viajes-op__actions" onClick={(event) => event.stopPropagation()}>
                        <button type="button" onClick={() => abrirItinerarioEditar(itinerario)}>Editar</button>
                        <button type="button" onClick={() => navigate(`/empleado/solicitudes-nuevo?id_solicitud=${itinerario.id_solicitud}`)}>Expediente</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ManagementTableFrame>
      )}

      {cotizacionForm && (
        <div className="admin-modal-overlay" role="presentation">
          <form className="admin-modal" onSubmit={guardarCotizacion}>
            <header className="admin-modal-header">
              <div><span className="admin-modal-kicker">Viajes / cotizaciones</span><h2 className="admin-modal-title">{cotizacionForm.mode === 'edit' ? 'Editar cotización' : 'Nueva cotización'}</h2></div>
              <button className="admin-modal-close" type="button" onClick={() => setCotizacionForm(null)} aria-label="Cerrar">&times;</button>
            </header>
            <div className="admin-modal-body viajes-op__form-grid">
              <label>Folio solicitud *<input value={cotizacionForm.values.id_solicitud} disabled={cotizacionForm.mode === 'edit'} onChange={(e) => setCotizacionValue('id_solicitud', e.target.value)} required /></label>
              <label>Tipo servicio<select value={cotizacionForm.values.tipo_servicio} onChange={(e) => setCotizacionValue('tipo_servicio', e.target.value)}>{SERVICIOS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label>Proveedor<input value={cotizacionForm.values.proveedor} onChange={(e) => setCotizacionValue('proveedor', e.target.value)} /></label>
              <label>Monto estimado<input type="number" min="0" step="0.01" value={cotizacionForm.values.monto_estimado} onChange={(e) => setCotizacionValue('monto_estimado', e.target.value)} /></label>
              <label>Moneda<input value={cotizacionForm.values.moneda} onChange={(e) => setCotizacionValue('moneda', e.target.value)} /></label>
              <label>Estado<select value={cotizacionForm.values.estado_cotizacion} onChange={(e) => setCotizacionValue('estado_cotizacion', e.target.value)}>{ESTADOS_COTIZACION.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label className="viajes-op__wide">Descripción<textarea rows="3" value={cotizacionForm.values.descripcion} onChange={(e) => setCotizacionValue('descripcion', e.target.value)} /></label>
              <label className="viajes-op__wide">Observaciones<textarea rows="3" value={cotizacionForm.values.observaciones} onChange={(e) => setCotizacionValue('observaciones', e.target.value)} /></label>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-button admin-button-secondary" type="button" onClick={() => setCotizacionForm(null)}>Cancelar</button>
              <button className="admin-button admin-button-primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </form>
        </div>
      )}

      {itinerarioForm && (
        <div className="admin-modal-overlay" role="presentation">
          <form className="admin-modal admin-modal--wide" onSubmit={guardarItinerario}>
            <header className="admin-modal-header">
              <div><span className="admin-modal-kicker">Viajes / itinerarios</span><h2 className="admin-modal-title">{itinerarioForm.mode === 'edit' ? 'Editar itinerario' : 'Nuevo itinerario'}</h2></div>
              <button className="admin-modal-close" type="button" onClick={() => setItinerarioForm(null)} aria-label="Cerrar">&times;</button>
            </header>
            <div className="admin-modal-body viajes-op__form-grid">
              <label>Folio solicitud *<input value={itinerarioForm.values.id_solicitud} disabled={itinerarioForm.mode === 'edit'} onChange={(e) => setItinerarioValue('id_solicitud', e.target.value)} required /></label>
              <label>Origen<input value={itinerarioForm.values.origen} onChange={(e) => setItinerarioValue('origen', e.target.value)} /></label>
              <label>Destino<input value={itinerarioForm.values.destino} onChange={(e) => setItinerarioValue('destino', e.target.value)} /></label>
              <label>Fecha salida<input type="date" value={itinerarioForm.values.fecha_salida} onChange={(e) => setItinerarioValue('fecha_salida', e.target.value)} /></label>
              <label>Fecha regreso<input type="date" value={itinerarioForm.values.fecha_regreso} onChange={(e) => setItinerarioValue('fecha_regreso', e.target.value)} /></label>
              <label>Aerolínea<input value={itinerarioForm.values.aerolinea} onChange={(e) => setItinerarioValue('aerolinea', e.target.value)} /></label>
              <label>Número vuelo<input value={itinerarioForm.values.numero_vuelo} onChange={(e) => setItinerarioValue('numero_vuelo', e.target.value)} /></label>
              <label>Hotel<input value={itinerarioForm.values.hotel} onChange={(e) => setItinerarioValue('hotel', e.target.value)} /></label>
              <label>Estado<select value={itinerarioForm.values.estado_itinerario} onChange={(e) => setItinerarioValue('estado_itinerario', e.target.value)}>{ESTADOS_ITINERARIO.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label className="viajes-op__checkbox"><input type="checkbox" checked={itinerarioForm.values.transporte_incluido} onChange={(e) => setItinerarioValue('transporte_incluido', e.target.checked)} /> Transporte incluido</label>
              <label className="viajes-op__wide">Dirección hotel<textarea rows="2" value={itinerarioForm.values.direccion_hotel} onChange={(e) => setItinerarioValue('direccion_hotel', e.target.value)} /></label>
              <label className="viajes-op__wide">Detalles<textarea rows="3" value={itinerarioForm.values.detalles} onChange={(e) => setItinerarioValue('detalles', e.target.value)} /></label>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-button admin-button-secondary" type="button" onClick={() => setItinerarioForm(null)}>Cancelar</button>
              <button className="admin-button admin-button-primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </form>
        </div>
      )}
    </ManagementPage>
  );
};

export default ViajesOperacionPage;
