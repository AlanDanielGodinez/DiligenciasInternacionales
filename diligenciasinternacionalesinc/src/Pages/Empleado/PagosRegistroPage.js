import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaExternalLinkAlt, FaSearch } from 'react-icons/fa';
import { descargarDocumento, getBandejaFinanzas, getEmpleadosActivos, rechazarPago, validarPago } from '../../services/finanzas.service';
import { getAreas, getTiposTramite } from '../../services/configuracion.service';
import { getCurrentEmployeeId } from '../../utils/authUser';
import { getMetodosPago } from '../../services/metodosPago.service';
import { ManagementHeader, ManagementPage, ManagementTableFrame } from '../../Components/Management/ManagementUI';

const emptyFilters = {
  q: '',
  estado_pago: '',
  metodo_pago: '',
  fecha_desde: '',
  fecha_hasta: '',
  id_tipo_tramite:'',id_area:'',id_responsable:'',
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

const PagosRegistroPage = () => {
  const navigate = useNavigate();
  const [pagos, setPagos] = useState([]);
  const [metodos, setMetodos] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resumen,setResumen]=useState({}),[areas,setAreas]=useState([]),[tipos,setTipos]=useState([]),[empleados,setEmpleados]=useState([]);

  const cargarPagos = async (override = filters) => {
    setLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(
        Object.entries({ ...override, limit: 100 }).filter(([, value]) => value !== '')
      );
      const data = await getBandejaFinanzas(params);
      setPagos(data.pagos||[]);setResumen(data.resumen||{});
    } catch (requestError) {
      setError('No fue posible cargar el historial financiero.');
      setPagos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPagos(emptyFilters);
    getMetodosPago()
      .then((data) => setMetodos(data.filter((metodo) => metodo.activo !== false)))
      .catch(() => setMetodos([]));
    Promise.all([getAreas(),getTiposTramite(),getEmpleadosActivos()]).then(([a,t,e])=>{setAreas(a||[]);setTipos(t||[]);setEmpleados(e||[])}).catch(()=>{});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const estados = useMemo(() => {
    const unique = new Set(pagos.map((pago) => pago.estado_pago).filter(Boolean));
    return Array.from(unique).sort();
  }, [pagos]);

  const onFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const aplicarFiltros = (event) => {
    event.preventDefault();
    cargarPagos(filters);
  };

  const limpiarFiltros = () => {
    setFilters(emptyFilters);
    cargarPagos(emptyFilters);
  };

  const descargarComprobante = async (pago) => {
    if (!pago?.id_documento_comprobante) return;
    setError('');
    setMessage('');
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
      setMessage('Comprobante descargado.');
    } catch (requestError) {
      setError('No fue posible descargar el comprobante.');
    }
  };
  const cambiarEstado=async(pago,action)=>{const observations=action==='rechazar'?window.prompt('Motivo del rechazo:'):'';if(action==='rechazar'&&!observations)return;await (action==='validar'?validarPago(pago.id_pago,{validado_por:getCurrentEmployeeId()||null}):rechazarPago(pago.id_pago,{validado_por:getCurrentEmployeeId()||null,observaciones:observations,descripcion:observations}));setMessage(action==='validar'?'Pago validado.':'Pago rechazado.');await cargarPagos(filters)};
  const proxima=p=>p.estado_pago==='rechazado'?'Registrar nuevo comprobante':p.estado_pago==='validado'?'Validado':p.id_documento_comprobante?'Validar comprobante':'Esperando comprobante';

  return (
    <ManagementPage className="pp-container pagos-registro-page">
      <ManagementHeader className="pp-header">
        <div>
          <p className="pp-eyebrow">Finanzas / Registro</p>
          <h1 className="pp-title">Registro de pagos</h1>
        </div>
        <button type="button" className="pp-secondary-btn" onClick={() => cargarPagos(filters)} disabled={loading}>
          Actualizar
        </button>
      </ManagementHeader>
      <section className="grupos-ama-kpis"><article><span>Por validar</span><strong>{resumen.por_validar||0}</strong></article><article><span>Rechazados</span><strong>{resumen.rechazados||0}</strong></article><article><span>Validados</span><strong>{resumen.validados||0}</strong></article><article><span>Total validado</span><strong>{formatMoney(resumen.total_validado||0)}</strong></article></section>

      <form className="pagos-registro-filtros" onSubmit={aplicarFiltros}>
        <label>
          Buscar
          <div className="pagos-registro-search">
            <FaSearch />
            <input
              type="search"
              placeholder="Folio, aplicante, contacto, método o referencia"
              value={filters.q}
              onChange={(event) => onFilterChange('q', event.target.value)}
            />
          </div>
        </label>
        <label>
          Estado
          <select
            value={filters.estado_pago}
            onChange={(event) => onFilterChange('estado_pago', event.target.value)}
          >
            <option value="">Todos</option>
            {estados.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </label>
        <label>
          Método
          <select
            value={filters.metodo_pago}
            onChange={(event) => onFilterChange('metodo_pago', event.target.value)}
          >
            <option value="">Todos</option>
            {metodos.map((metodo) => (
              <option key={metodo.id_metodo_pago} value={metodo.nombre_metodo}>
                {metodo.nombre_metodo}
              </option>
            ))}
          </select>
        </label>
        <label>
          Desde
          <input
            type="date"
            value={filters.fecha_desde}
            onChange={(event) => onFilterChange('fecha_desde', event.target.value)}
          />
        </label>
        <label>Trámite<select value={filters.id_tipo_tramite} onChange={e=>onFilterChange('id_tipo_tramite',e.target.value)}><option value="">Todos</option>{tipos.map(x=><option key={x.id_tipo_tramite} value={x.id_tipo_tramite}>{x.nombre_tramite}</option>)}</select></label>
        <label>Área<select value={filters.id_area} onChange={e=>onFilterChange('id_area',e.target.value)}><option value="">Todas</option>{areas.map(x=><option key={x.id_area} value={x.id_area}>{x.nombre}</option>)}</select></label>
        <label>Responsable<select value={filters.id_responsable} onChange={e=>onFilterChange('id_responsable',e.target.value)}><option value="">Todos</option>{empleados.map(x=><option key={x.id_empleado} value={x.id_empleado}>{[x.nombre,x.apellidos].filter(Boolean).join(' ')}</option>)}</select></label>
        <label>
          Hasta
          <input
            type="date"
            value={filters.fecha_hasta}
            onChange={(event) => onFilterChange('fecha_hasta', event.target.value)}
          />
        </label>
        <div className="pagos-registro-filter-actions">
          <button type="submit">Filtrar</button>
          <button type="button" onClick={limpiarFiltros}>Limpiar</button>
        </div>
      </form>

      {message && <div className="pp-alert pp-alert-success">{message}</div>}
      {error && <div className="pp-alert pp-alert-error">{error}</div>}

      {loading ? (
        <div className="pp-loading">
          <div className="pp-spinner" />
          <p>Cargando historial financiero...</p>
        </div>
      ) : pagos.length === 0 ? (
        <div className="pp-empty-state">
          <p>No hay pagos registrados con los filtros actuales.</p>
        </div>
      ) : (
        <ManagementTableFrame className="pp-table-container">
          <table className="pp-table pagos-registro-table">
            <thead>
              <tr>
                <th>Pago</th>
                <th>Solicitud</th>
                <th>Aplicante</th>
                <th>Contacto</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Estado</th>
                <th>Área / responsable</th>
                <th>Fecha pago</th>
                <th>Validación</th>
                <th>Comprobante</th>
                <th>Próxima acción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => (
                <tr
                  key={pago.id_pago}
                  className={pago.id_solicitud ? 'admin-clickable-row' : ''}
                  onClick={() => pago.id_solicitud && navigate(`/empleado/solicitudes-nuevo?id_solicitud=${pago.id_solicitud}`)}
                >
                  <td>
                    <strong>#{pago.id_pago}</strong>
                    <small>{pago.concepto || 'Pago de expediente'}</small>
                  </td>
                  <td>
                    <strong>#{pago.id_solicitud || 'N/A'}</strong>
                    <small>{pago.tipo_tramite || 'N/A'}</small>
                  </td>
                  <td>{pago.aplicante || 'N/A'}</td>
                  <td>
                    <div className="pp-stacked">
                      <span>{pago.contacto_nombre || 'N/A'}</span>
                      <small>{pago.contacto_telefono || pago.contacto_correo || ''}</small>
                    </div>
                  </td>
                  <td>{formatMoney(pago.monto, pago.moneda)}</td>
                  <td>{pago.metodo_pago || 'N/A'}</td>
                  <td>
                    <span className={`pp-chip pp-chip-${pago.estado_pago || 'registrado'}`}>
                      {pago.estado_pago || 'registrado'}
                    </span>
                  </td>
                  <td><div className="pp-stacked"><span>{pago.area_nombre||'N/A'}</span><small>{pago.responsable||'Sin responsable'}</small></div></td>
                  <td>{formatDate(pago.fecha_pago)}</td>
                  <td>{formatDate(pago.fecha_validacion)}</td>
                  <td>{pago.id_documento_comprobante ? pago.comprobante_nombre || 'Disponible' : 'Sin comprobante'}</td>
                  <td>{proxima(pago)}</td>
                  <td>
                    <div className="pp-actions">
                      {pago.id_documento_comprobante && (
                        <button type="button" onClick={(event) => { event.stopPropagation(); descargarComprobante(pago); }}>
                          <FaDownload /> Descargar
                        </button>
                      )}
                      {pago.id_solicitud && (
                        <button
                          type="button"
                          onClick={(event) => { event.stopPropagation(); navigate(`/empleado/solicitudes-nuevo?id_solicitud=${pago.id_solicitud}`); }}
                        >
                          <FaExternalLinkAlt /> Expediente
                        </button>
                      )}
                      {pago.estado_pago==='registrado'&&pago.id_documento_comprobante&&<button type="button" onClick={e=>{e.stopPropagation();cambiarEstado(pago,'validar')}}>Validar</button>}
                      {pago.estado_pago!=='rechazado'&&<button type="button" onClick={e=>{e.stopPropagation();cambiarEstado(pago,'rechazar')}}>Rechazar</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ManagementTableFrame>
      )}
    </ManagementPage>
  );
};

export default PagosRegistroPage;
