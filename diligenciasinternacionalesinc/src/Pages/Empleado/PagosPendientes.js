import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  descargarDocumento,
  enviarSolicitudPostPago,
  getDestinoPostPago,
  getEmpleadosActivos,
  getPagosSolicitud,
  getSolicitudesPendientesPago,
  rechazarPago,
  registrarPagoSolicitud,
  validarPago,
} from '../../services/finanzas.service';
import { getMetodosPago } from '../../services/metodosPago.service';
import { ManagementHeader, ManagementPage, ManagementTableFrame, ManagementToolbar } from '../../Components/Management/ManagementUI';

const emptyPaymentForm = {
  monto: '',
  moneda: 'MXN',
  concepto: 'Pago inicial',
  metodo_pago: '',
  referencia: '',
  fecha_pago: '',
  observaciones: '',
  comprobante: null,
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
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency || 'MXN',
  }).format(amount);
};

const getFileNameFromDisposition = (disposition, fallback) => {
  const match = String(disposition || '').match(/filename="?([^"]+)"?/i);
  return match?.[1] || fallback;
};

const getNombreAplicante = (solicitud) =>
  solicitud.aplicante ||
  [
    solicitud.cliente_nombre,
    solicitud.cliente_apellido_paterno,
    solicitud.cliente_apellido_materno,
  ].filter(Boolean).join(' ') ||
  'N/A';

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const PagosPendientes = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [registroSolicitud, setRegistroSolicitud] = useState(null);
  const [pagosSolicitud, setPagosSolicitud] = useState(null);
  const [pagosDetalle, setPagosDetalle] = useState([]);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [metodosPago, setMetodosPago] = useState([]);
  const [metodosPagoError, setMetodosPagoError] = useState('');
  const [empleados, setEmpleados] = useState([]);
  const [destinoEnvio, setDestinoEnvio] = useState(null);
  const [validacionPendiente, setValidacionPendiente] = useState(null);
  const [rechazoPendiente, setRechazoPendiente] = useState(null);
  const [rechazoObservaciones, setRechazoObservaciones] = useState('');
  const [envioForm, setEnvioForm] = useState({
    id_empleado_responsable: '',
    observaciones: 'Asignación posterior a validación de pago',
  });

  const cargarSolicitudes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSolicitudesPendientesPago();
      setSolicitudes(data);
    } catch (requestError) {
      setError('No fue posible cargar las solicitudes pendientes de pago.');
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  useEffect(() => {
    const cargarMetodosPago = async () => {
      try {
        const data = await getMetodosPago();
        setMetodosPago(data.filter((metodo) => metodo.activo !== false));
        setMetodosPagoError('');
      } catch (requestError) {
        setMetodosPago([]);
        setMetodosPagoError('No se pudo cargar el catálogo de métodos. Puedes capturar el método manualmente.');
      }
    };

    cargarMetodosPago();
  }, []);

  const solicitudesFiltradas = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    if (!query) return solicitudes;

    return solicitudes.filter((solicitud) => {
      const text = [
        solicitud.id_solicitud,
        getNombreAplicante(solicitud),
        solicitud.contacto_nombre,
        solicitud.tipo_tramite,
        solicitud.estado_actual_valor,
        solicitud.canal_contacto,
      ].join(' ').toLowerCase();
      return text.includes(query);
    });
  }, [busqueda, solicitudes]);

  const abrirRegistroPago = (solicitud) => {
    setRegistroSolicitud(solicitud);
    setPaymentForm(emptyPaymentForm);
    setMessage('');
    setError('');
  };

  const cerrarRegistroPago = () => {
    setRegistroSolicitud(null);
    setPaymentForm(emptyPaymentForm);
  };

  const abrirPagos = async (solicitud) => {
    setPagosSolicitud(solicitud);
    setPagosDetalle([]);
    setError('');
    try {
      const pagos = await getPagosSolicitud(solicitud.id_solicitud);
      setPagosDetalle(pagos);
    } catch (requestError) {
      setError('No fue posible cargar los pagos de la solicitud.');
    }
  };

  const cargarEmpleados = async () => {
    if (empleados.length > 0) return empleados;
    const data = await getEmpleadosActivos();
    setEmpleados(data);
    return data;
  };

  const guardarPago = async (event) => {
    event.preventDefault();
    if (!registroSolicitud) return;

    setSaving(true);
    setError('');
    setMessage('');
    try {
      await registrarPagoSolicitud(registroSolicitud.id_solicitud, paymentForm);
      setMessage('Pago registrado correctamente.');
      cerrarRegistroPago();
      await cargarSolicitudes();
    } catch (requestError) {
      setError(requestError?.response?.data?.error?.message || 'No fue posible registrar el pago.');
    } finally {
      setSaving(false);
    }
  };

  const validarPagoSeleccionado = (pago, solicitudContext = pagosSolicitud) => {
    if (!pago?.id_pago) return;
    setValidacionPendiente({ pago, solicitudContext });
  };

  const confirmarValidacionPago = async () => {
    const { pago, solicitudContext } = validacionPendiente || {};
    if (!pago?.id_pago) return;

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const result = await validarPago(pago.id_pago, {
        descripcion: 'Finanzas validó el pago inicial',
      });
      setMessage('Pago validado correctamente.');
      setValidacionPendiente(null);
      setPagosSolicitud(null);
      if (result?.destino_sugerido) {
        await cargarEmpleados();
        setDestinoEnvio({
          solicitud: solicitudContext,
          destino: result.destino_sugerido,
        });
        setEnvioForm({
          id_empleado_responsable: '',
          observaciones: 'Asignación posterior a validación de pago',
        });
      }
      await cargarSolicitudes();
    } catch (requestError) {
      setError(requestError?.response?.data?.error?.message || 'No fue posible validar el pago.');
    } finally {
      setSaving(false);
    }
  };

  const abrirDestinoPostPago = async (solicitud) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const [destino] = await Promise.all([
        getDestinoPostPago(solicitud.id_solicitud),
        cargarEmpleados(),
      ]);
      setDestinoEnvio({ solicitud, destino });
      setEnvioForm({
        id_empleado_responsable: '',
        observaciones: 'Asignación posterior a validación de pago',
      });
    } catch (requestError) {
      setError(requestError?.response?.data?.error?.message || 'No fue posible calcular el destino post pago.');
    } finally {
      setSaving(false);
    }
  };

  const confirmarEnvioPostPago = async (event) => {
    event.preventDefault();
    if (!destinoEnvio?.solicitud?.id_solicitud) return;

    setSaving(true);
    setError('');
    setMessage('');
    try {
      await enviarSolicitudPostPago(destinoEnvio.solicitud.id_solicitud, {
        id_empleado_responsable: envioForm.id_empleado_responsable || null,
        observaciones: envioForm.observaciones,
      });
      setDestinoEnvio(null);
      setMessage('Expediente enviado al área correspondiente.');
      await cargarSolicitudes();
    } catch (requestError) {
      setError(requestError?.response?.data?.error?.message || 'No fue posible enviar el expediente.');
    } finally {
      setSaving(false);
    }
  };

  const rechazarPagoSeleccionado = (pago) => {
    if (!pago?.id_pago) return;
    setRechazoPendiente(pago);
    setRechazoObservaciones('');
  };

  const confirmarRechazoPago = async (event) => {
    event.preventDefault();
    const pago = rechazoPendiente;
    if (!pago?.id_pago) return;
    const observaciones = rechazoObservaciones;

    setSaving(true);
    setError('');
    setMessage('');
    try {
      await rechazarPago(pago.id_pago, {
        observaciones,
        descripcion: observaciones || 'Finanzas rechazó el pago',
      });
      setMessage('Pago rechazado correctamente.');
      setRechazoPendiente(null);
      setRechazoObservaciones('');
      await abrirPagos(pagosSolicitud);
      await cargarSolicitudes();
    } catch (requestError) {
      setError(requestError?.response?.data?.error?.message || 'No fue posible rechazar el pago.');
    } finally {
      setSaving(false);
    }
  };

  const descargarComprobante = async (pago) => {
    if (!pago?.id_documento_comprobante) return;

    setError('');
    try {
      const response = await descargarDocumento(pago.id_documento_comprobante);
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getFileNameFromDisposition(
        response.headers['content-disposition'],
        pago.comprobante_nombre || `comprobante-${pago.id_pago}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setError('No fue posible descargar el comprobante.');
    }
  };

  const renderPagoResumen = (pago) => {
    if (!pago) return <span className="pp-muted">Sin pago registrado</span>;
    return (
      <div className="pp-payment-summary">
        <strong>{formatMoney(pago.monto, pago.moneda)}</strong>
        <span className={`pp-chip pp-chip-${pago.estado_pago || 'registrado'}`}>
          {pago.estado_pago || 'registrado'}
        </span>
      </div>
    );
  };

  const empleadosFiltrados = useMemo(() => {
    const destino = destinoEnvio?.destino;
    if (!destino?.clave_area_destino && !destino?.nombre_area_destino) return empleados;

    const areaClave = normalizeText(destino.clave_area_destino);
    const areaNombre = normalizeText(destino.nombre_area_destino);
    const filtered = empleados.filter((empleado) => {
      const empleadoArea = normalizeText(empleado.area);
      return empleadoArea === areaClave || empleadoArea === areaNombre;
    });

    return filtered.length > 0 ? filtered : empleados;
  }, [destinoEnvio, empleados]);

  return (
    <ManagementPage as="div" className="pp-container">
      <ManagementHeader className="pp-header">
        <div>
          <p className="pp-eyebrow">Finanzas / Pagos</p>
          <h1 className="pp-title">Solicitudes pendientes de pago</h1>
        </div>
        <button type="button" className="pp-secondary-btn" onClick={cargarSolicitudes} disabled={loading}>
          Actualizar
        </button>
      </ManagementHeader>

      <ManagementToolbar className="pp-toolbar">
        <input
          type="text"
          placeholder="Buscar por folio, aplicante, contacto, trámite o canal"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          className="pp-input-busqueda"
        />
      </ManagementToolbar>

      {message && <div className="pp-alert pp-alert-success">{message}</div>}
      {error && <div className="pp-alert pp-alert-error">{error}</div>}

      {loading ? (
        <div className="pp-loading">
          <div className="pp-spinner" />
          <p>Cargando solicitudes...</p>
        </div>
      ) : solicitudesFiltradas.length === 0 ? (
        <div className="pp-empty-state">
          <p>No hay solicitudes pendientes de pago inicial.</p>
        </div>
      ) : (
        <ManagementTableFrame className="pp-table-container">
          <table className="pp-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Aplicante</th>
                <th>Contacto</th>
                <th>Trámite</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Canal</th>
                <th>Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesFiltradas.map((solicitud) => (
                <tr
                  key={solicitud.id_solicitud}
                  className="admin-clickable-row"
                  onClick={() => navigate(`/empleado/solicitudes-nuevo?id_solicitud=${solicitud.id_solicitud}`)}
                >
                  <td>
                    <strong>#{solicitud.id_solicitud}</strong>
                  </td>
                  <td>{getNombreAplicante(solicitud)}</td>
                  <td>
                    <div className="pp-stacked">
                      <span>{solicitud.contacto_nombre || 'N/A'}</span>
                      <small>{solicitud.contacto_telefono || solicitud.contacto_correo || ''}</small>
                    </div>
                  </td>
                  <td>{solicitud.tipo_tramite || 'N/A'}</td>
                  <td>
                    <span className="pp-status">{solicitud.estado_actual_valor || solicitud.estado_actual}</span>
                  </td>
                  <td>{formatDate(solicitud.fecha_inicio)}</td>
                  <td>{solicitud.canal_contacto || 'N/A'}</td>
                  <td>{renderPagoResumen(solicitud.pago)}</td>
                  <td>
                    <div className="pp-actions" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => navigate(`/empleado/solicitudes-nuevo?id_solicitud=${solicitud.id_solicitud}`)}
                      >
                        Ver expediente
                      </button>
                      <button type="button" onClick={() => abrirRegistroPago(solicitud)}>
                        Registrar pago
                      </button>
                      <button type="button" onClick={() => abrirPagos(solicitud)}>
                        Ver pagos
                      </button>
                      <button type="button" onClick={() => abrirDestinoPostPago(solicitud)}>
                        Ver destino sugerido
                      </button>
                      {solicitud.pago?.id_pago && solicitud.pago?.estado_pago !== 'validado' && (
                        <button type="button" onClick={() => validarPagoSeleccionado(solicitud.pago, solicitud)}>
                          Validar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ManagementTableFrame>
      )}

      {registroSolicitud && (
        <div className="admin-modal-overlay" role="presentation">
          <form className="admin-modal" role="dialog" aria-modal="true" onSubmit={guardarPago}>
            <div className="admin-modal-header">
              <div><span className="admin-modal-kicker">Pagos</span><h2 className="admin-modal-title">Registrar pago</h2></div>
              <button className="admin-modal-close" type="button" onClick={cerrarRegistroPago} aria-label="Cerrar">&times;</button>
            </div>
            <p className="pp-modal-context">
              Solicitud #{registroSolicitud.id_solicitud} · {getNombreAplicante(registroSolicitud)}
            </p>
            <div className="pp-payment-form admin-modal-body">
              <label>
                Monto *
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentForm.monto}
                  onChange={(event) => setPaymentForm((current) => ({ ...current, monto: event.target.value }))}
                  required
                />
              </label>
              <label>
                Moneda
                <input
                  type="text"
                  value={paymentForm.moneda}
                  onChange={(event) => setPaymentForm((current) => ({ ...current, moneda: event.target.value }))}
                />
              </label>
              <label>
                Concepto *
                <input
                  type="text"
                  value={paymentForm.concepto}
                  onChange={(event) => setPaymentForm((current) => ({ ...current, concepto: event.target.value }))}
                  required
                />
              </label>
              <label>
                Método de pago
                {metodosPago.length > 0 ? (
                  <select
                    value={paymentForm.metodo_pago}
                    onChange={(event) => setPaymentForm((current) => ({ ...current, metodo_pago: event.target.value }))}
                  >
                    <option value="">Seleccionar método</option>
                    {metodosPago.map((metodo) => (
                      <option key={metodo.id_metodo_pago} value={metodo.nombre_metodo}>
                        {metodo.nombre_metodo}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={paymentForm.metodo_pago}
                    onChange={(event) => setPaymentForm((current) => ({ ...current, metodo_pago: event.target.value }))}
                    placeholder="Método de pago"
                  />
                )}
                {metodosPagoError && <small className="pp-field-note">{metodosPagoError}</small>}
              </label>
              <label>
                Referencia
                <input
                  type="text"
                  value={paymentForm.referencia}
                  onChange={(event) => setPaymentForm((current) => ({ ...current, referencia: event.target.value }))}
                />
              </label>
              <label>
                Fecha de pago
                <input
                  type="date"
                  value={paymentForm.fecha_pago}
                  onChange={(event) => setPaymentForm((current) => ({ ...current, fecha_pago: event.target.value }))}
                />
              </label>
              <label className="pp-form-wide">
                Observaciones
                <textarea
                  value={paymentForm.observaciones}
                  onChange={(event) => setPaymentForm((current) => ({ ...current, observaciones: event.target.value }))}
                  rows="3"
                />
              </label>
              <label className="pp-form-wide">
                Comprobante opcional
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={(event) => setPaymentForm((current) => ({
                    ...current,
                    comprobante: event.target.files?.[0] || null,
                  }))}
                />
              </label>
            </div>
            <div className="admin-modal-footer pp-modal-actions">
              <button className="admin-button admin-button-secondary" type="button" onClick={cerrarRegistroPago}>Cancelar</button>
              <button className="admin-button admin-button-primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar pago'}</button>
            </div>
          </form>
        </div>
      )}

      {pagosSolicitud && (
        <div className="admin-modal-overlay" role="presentation">
          <div className="admin-modal admin-modal--wide" role="dialog" aria-modal="true">
            <div className="admin-modal-header">
              <div><span className="admin-modal-kicker">Detalle de pagos</span><h2 className="admin-modal-title">Solicitud #{pagosSolicitud.id_solicitud}</h2></div>
              <button className="admin-modal-close" type="button" onClick={() => setPagosSolicitud(null)} aria-label="Cerrar">&times;</button>
            </div>
            {pagosDetalle.length === 0 ? (
              <p className="pp-muted">No hay pagos registrados.</p>
            ) : (
              <div className="admin-modal-body pp-payment-list">
                {pagosDetalle.map((pago) => (
                  <article key={pago.id_pago} className="pp-payment-card">
                    <div>
                      <strong>{formatMoney(pago.monto, pago.moneda)}</strong>
                      <span>{pago.concepto || 'Pago de expediente'}</span>
                      <small>{formatDate(pago.fecha_pago)} · {pago.metodo_pago || 'Método N/A'}</small>
                    </div>
                    <span className={`pp-chip pp-chip-${pago.estado_pago || 'registrado'}`}>
                      {pago.estado_pago || 'registrado'}
                    </span>
                    <div className="pp-actions">
                      {pago.id_documento_comprobante && (
                        <button type="button" onClick={() => descargarComprobante(pago)}>
                          Descargar comprobante
                        </button>
                      )}
                      {pago.estado_pago !== 'validado' && (
                        <button type="button" onClick={() => validarPagoSeleccionado(pago, pagosSolicitud)}>
                          Validar
                        </button>
                      )}
                      {pago.estado_pago !== 'rechazado' && (
                        <button type="button" onClick={() => rechazarPagoSeleccionado(pago)}>
                          Rechazar
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {destinoEnvio && (
        <div className="admin-modal-overlay" role="presentation">
          <form className="admin-modal" role="dialog" aria-modal="true" onSubmit={confirmarEnvioPostPago}>
            <div className="admin-modal-header">
              <div><span className="admin-modal-kicker">Validación de pago</span><h2 className="admin-modal-title">Enviar expediente después de pago</h2></div>
              <button className="admin-modal-close" type="button" onClick={() => setDestinoEnvio(null)} aria-label="Cerrar">&times;</button>
            </div>
            <div className="pp-payment-form admin-modal-body">
              <div className="pp-form-wide pp-destination-summary">
                <p>
                  <strong>Solicitud:</strong> #{destinoEnvio.solicitud?.id_solicitud || destinoEnvio.destino?.id_solicitud}
                </p>
                <p>
                  <strong>Aplicante:</strong> {getNombreAplicante(destinoEnvio.solicitud || {})}
                </p>
                <p>
                  <strong>Trámite:</strong> {destinoEnvio.solicitud?.tipo_tramite || destinoEnvio.destino?.nombre_tramite || 'N/A'}
                </p>
                <p>
                  <strong>Área sugerida:</strong> {destinoEnvio.destino?.nombre_area_destino || 'Asignación manual requerida'}
                </p>
                <p>
                  <strong>Estado sugerido:</strong> {destinoEnvio.destino?.nombre_estado_destino || 'N/A'}
                </p>
                <p>
                  <strong>Motivo:</strong> {destinoEnvio.destino?.motivo || 'N/A'}
                </p>
              </div>

              <label className="pp-form-wide">
                Responsable
                <select
                  value={envioForm.id_empleado_responsable}
                  onChange={(event) => setEnvioForm((current) => ({
                    ...current,
                    id_empleado_responsable: event.target.value,
                  }))}
                >
                  <option value="">Sin asignar por ahora</option>
                  {empleadosFiltrados.map((empleado) => (
                    <option key={empleado.id_empleado} value={empleado.id_empleado}>
                      {empleado.nombre} {empleado.apellidos || ''} - {empleado.area || 'Sin área'}
                    </option>
                  ))}
                </select>
              </label>

              <label className="pp-form-wide">
                Observaciones
                <textarea
                  value={envioForm.observaciones}
                  onChange={(event) => setEnvioForm((current) => ({
                    ...current,
                    observaciones: event.target.value,
                  }))}
                  rows="3"
                />
              </label>

              {destinoEnvio.destino?.requiere_asignacion_manual && (
                <div className="pp-alert pp-alert-error pp-form-wide">
                  No se pudo determinar un área automáticamente. Por ahora este envío requiere ajuste manual en backend.
                </div>
              )}

            </div>
            <div className="admin-modal-footer pp-modal-actions">
                <button className="admin-button admin-button-secondary" type="button" onClick={() => setDestinoEnvio(null)}>Cancelar</button>
                <button
                  className="admin-button admin-button-primary"
                  type="submit"
                  disabled={saving || destinoEnvio.destino?.requiere_asignacion_manual}
                >
                  {saving ? 'Enviando...' : 'Enviar expediente'}
                </button>
            </div>
          </form>
        </div>
      )}

      {validacionPendiente && (
        <div className="admin-modal-overlay" role="presentation">
          <div className="admin-modal admin-modal--compact" role="dialog" aria-modal="true">
            <header className="admin-modal-header">
              <div><span className="admin-modal-kicker">Pagos / validación</span><h2 className="admin-modal-title">Validar pago</h2><p className="admin-modal-subtitle">Esta acción actualizará el estado del pago y de la solicitud.</p></div>
              <button className="admin-modal-close" type="button" onClick={() => setValidacionPendiente(null)} aria-label="Cerrar">&times;</button>
            </header>
            <div className="admin-modal-body">
              <section className="admin-modal-section">
                <h3 className="admin-modal-section-title">Confirmación</h3>
                <div className="admin-detail-grid">
                  <div className="admin-detail-item"><span className="admin-detail-label">Pago</span><strong className="admin-detail-value">#{validacionPendiente.pago.id_pago}</strong></div>
                  <div className="admin-detail-item"><span className="admin-detail-label">Monto</span><strong className="admin-detail-value">{formatMoney(validacionPendiente.pago.monto, validacionPendiente.pago.moneda)}</strong></div>
                </div>
              </section>
            </div>
            <footer className="admin-modal-footer">
              <button className="admin-button admin-button-secondary" type="button" onClick={() => setValidacionPendiente(null)}>Cancelar</button>
              <button className="admin-button admin-button-primary" type="button" onClick={confirmarValidacionPago} disabled={saving}>{saving ? 'Validando...' : 'Validar pago'}</button>
            </footer>
          </div>
        </div>
      )}

      {rechazoPendiente && (
        <div className="admin-modal-overlay" role="presentation">
          <form className="admin-modal admin-modal--compact" role="dialog" aria-modal="true" onSubmit={confirmarRechazoPago}>
            <header className="admin-modal-header">
              <div><span className="admin-modal-kicker">Pagos / revisión</span><h2 className="admin-modal-title">Rechazar pago</h2><p className="admin-modal-subtitle">Registra el motivo que quedará asociado al pago.</p></div>
              <button className="admin-modal-close" type="button" onClick={() => setRechazoPendiente(null)} aria-label="Cerrar">&times;</button>
            </header>
            <div className="admin-modal-body">
              <label>Motivo del rechazo<textarea rows="4" value={rechazoObservaciones} onChange={(event) => setRechazoObservaciones(event.target.value)} autoFocus /></label>
            </div>
            <footer className="admin-modal-footer">
              <button className="admin-button admin-button-secondary" type="button" onClick={() => setRechazoPendiente(null)}>Cancelar</button>
              <button className="admin-button admin-button-primary" type="submit" disabled={saving}>{saving ? 'Rechazando...' : 'Rechazar pago'}</button>
            </footer>
          </form>
        </div>
      )}
    </ManagementPage>
  );
};

export default PagosPendientes;
