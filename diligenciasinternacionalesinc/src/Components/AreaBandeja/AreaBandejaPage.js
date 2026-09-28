import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSolicitudesByArea } from '../../services/areas.service';
import { getEmpleadosActivos } from '../../services/finanzas.service';
import { updateSolicitudResponsable } from '../../services/solicitudes.service';
import { deriveInboxNextAction, getIndividualFlow } from '../../utils/individualWorkspace';
import {
  ManagementActions,
  ManagementBadge,
  ManagementHeader,
  ManagementPage,
  ManagementState,
  ManagementTableFrame,
  ManagementToolbar,
} from '../Management/ManagementUI';

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('es-MX');
};

const buildNombre = (...parts) =>
  parts
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

const getResponsable = (solicitud) =>
  solicitud.responsable_nombre_completo ||
  buildNombre(solicitud.responsable_nombre, solicitud.responsable_apellidos) ||
  'Sin asignar';

const normalizeOptions = (options = []) =>
  options.map((option) => ({
    value: option.value ?? option.id ?? option.id_area ?? option.nombre ?? option.label,
    label: option.label ?? option.nombre ?? option.nombre_area ?? option.value ?? option.id,
  }));

const AreaBandejaPage = ({
  idArea,
  fetchFunction = null,
  titulo,
  subtitulo,
  emptyMessage,
  tipoFiltroLabel = 'Todos los tramites',
  tipoFiltroOptions = null,
  areaFiltroLabel = 'Todas las areas',
  areaFiltroOptions = [],
  mostrarFiltroTipo = true,
  mostrarFiltroArea = false,
  mostrarFiltroResponsable = true,
  variante = 'default',
  areaFallback = 'Area',
  responsableAreas = [],
  tipoFiltroParam = 'tipo_tramite',
  tipoFiltroMode = 'param',
  tramiteColumnLabel = 'Tramite',
  mostrarContactoColumn = true,
  mostrarAreaColumn = false,
  mostrarResponsableColumn = true,
  permitirReasignar = true,
  loadingMessage = 'Cargando expedientes...',
  errorMessage = 'No fue posible cargar la bandeja.',
  reasignarTitulo = 'Reasignar responsable',
  reasignarDescripcion = 'Responsable reasignado desde bandeja operativa',
}) => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [area, setArea] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    q: '',
    id_empleado_responsable: '',
    id_area_actual: '',
    tipo: '',
    estado_actual: '',
  });
  const [reasignarSolicitud, setReasignarSolicitud] = useState(null);
  const [responsableSeleccionado, setResponsableSeleccionado] = useState('');

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        include_avance: true,
        q: filters.q || undefined,
        id_empleado_responsable: filters.id_empleado_responsable || undefined,
        id_area_actual: filters.id_area_actual || undefined,
        estado_actual: filters.estado_actual || undefined,
      };

      if (mostrarFiltroTipo && filters.tipo) {
        if (tipoFiltroMode === 'q') {
          params.q = [filters.q, filters.tipo].filter(Boolean).join(' ');
        } else {
          params[tipoFiltroParam] = filters.tipo;
        }
      }

      const loadBandeja = fetchFunction || ((requestParams) => getSolicitudesByArea(idArea, requestParams));
      const [bandeja, empleadosActivos] = await Promise.all([
        loadBandeja(params),
        empleados.length ? Promise.resolve(empleados) : getEmpleadosActivos(),
      ]);
      setSolicitudes(bandeja.solicitudes || []);
      setArea(bandeja.area || null);
      setEmpleados(empleadosActivos || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.error?.message || requestError?.message || errorMessage);
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const empleadosFiltrados = useMemo(() => {
    if (!responsableAreas.length) return empleados;
    const allowedAreas = responsableAreas.map(normalizeText);
    const filtered = empleados.filter((empleado) =>
      allowedAreas.includes(normalizeText(empleado.area))
    );
    return filtered.length > 0 ? filtered : empleados;
  }, [empleados, responsableAreas]);

  const tipoOptions = useMemo(() => {
    if (Array.isArray(tipoFiltroOptions)) return normalizeOptions(tipoFiltroOptions);

    const map = new Map();
    solicitudes.forEach((solicitud) => {
      if (solicitud.id_tipo_tramite && solicitud.tipo_tramite) {
        map.set(solicitud.id_tipo_tramite, solicitud.tipo_tramite);
      }
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ value: id, label: nombre }));
  }, [solicitudes, tipoFiltroOptions]);

  const areaOptions = useMemo(() => {
    if (Array.isArray(areaFiltroOptions) && areaFiltroOptions.length > 0) {
      return normalizeOptions(areaFiltroOptions);
    }

    const map = new Map();
    solicitudes.forEach((solicitud) => {
      if (solicitud.id_area_actual && (solicitud.area_actual_nombre || solicitud.area_actual_clave)) {
        map.set(solicitud.id_area_actual, solicitud.area_actual_nombre || solicitud.area_actual_clave);
      }
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ value: id, label: nombre }));
  }, [solicitudes, areaFiltroOptions]);

  const estadosDisponibles = useMemo(() => {
    const map = new Map();
    solicitudes.forEach((solicitud) => {
      if (solicitud.estado_actual && solicitud.estado_actual_nombre) {
        map.set(solicitud.estado_actual, solicitud.estado_actual_nombre);
      }
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [solicitudes]);

  const abrirReasignacion = (solicitud) => {
    setReasignarSolicitud(solicitud);
    setResponsableSeleccionado(solicitud.id_empleado_responsable || '');
  };

  const guardarResponsable = async (event) => {
    event.preventDefault();
    if (!reasignarSolicitud?.id_solicitud) return;

    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updateSolicitudResponsable(reasignarSolicitud.id_solicitud, {
        id_empleado_responsable: responsableSeleccionado || null,
        descripcion: reasignarDescripcion,
        origen: 'asesor_asignado',
      });
      setReasignarSolicitud(null);
      setMessage('Responsable actualizado correctamente.');
      await cargarDatos();
    } catch (requestError) {
      setError(requestError?.response?.data?.error?.message || 'No fue posible reasignar responsable.');
    } finally {
      setSaving(false);
    }
  };

  const renderAvance = (avance) => {
    if (!avance) return <span className="area-bandeja__muted">Sin avance</span>;
    const perfil = Number(avance.perfil_porcentaje || 0);
    const documentos = `${avance.documentos_obligatorios_subidos || 0}/${avance.documentos_obligatorios_total || 0}`;
    return (
      <div className="area-bandeja__progress">
        <div>
          <span>Perfil {perfil}%</span>
          <div className="area-bandeja__progress-bar">
            <i style={{ width: `${Math.min(100, perfil)}%` }} />
          </div>
        </div>
        <small>Docs obligatorios: {documentos}</small>
        <small>PDF: {avance.pdf_generado ? 'Generado' : 'Pendiente'}</small>
        {avance.faltantes?.length > 0 && (
          <small>Faltan: {avance.faltantes.join(', ')}</small>
        )}
      </div>
    );
  };

  return (
    <ManagementPage as="div" className={`area-bandeja area-bandeja--${variante}`}>
      <ManagementHeader className="area-bandeja__header">
        <div>
          <p className="area-bandeja__eyebrow">{area?.nombre || areaFallback}</p>
          <h1>{titulo}</h1>
          <span>{subtitulo}</span>
        </div>
        <button type="button" onClick={cargarDatos} disabled={loading}>
          Actualizar
        </button>
      </ManagementHeader>

      <ManagementToolbar as="section" className="area-bandeja__filters">
        <input
          type="text"
          placeholder="Buscar por folio, aplicante, contacto o tramite"
          value={filters.q}
          onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
        />
        {mostrarFiltroResponsable && (
          <select
            value={filters.id_empleado_responsable}
            onChange={(event) => setFilters((current) => ({
              ...current,
              id_empleado_responsable: event.target.value,
            }))}
          >
            <option value="">Todos los responsables</option>
            {empleadosFiltrados.map((empleado) => (
              <option key={empleado.id_empleado} value={empleado.id_empleado}>
                {empleado.nombre} {empleado.apellidos || ''}
              </option>
            ))}
          </select>
        )}
        {mostrarFiltroArea && (
          <select
            value={filters.id_area_actual}
            onChange={(event) => setFilters((current) => ({
              ...current,
              id_area_actual: event.target.value,
            }))}
          >
            <option value="">{areaFiltroLabel}</option>
            {areaOptions.map((areaOption) => (
              <option key={areaOption.value} value={areaOption.value}>{areaOption.label}</option>
            ))}
          </select>
        )}
        {mostrarFiltroTipo && (
          <select
            value={filters.tipo}
            onChange={(event) => setFilters((current) => ({ ...current, tipo: event.target.value }))}
          >
            <option value="">{tipoFiltroLabel}</option>
            {tipoOptions.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
        )}
        <select
          value={filters.estado_actual}
          onChange={(event) => setFilters((current) => ({ ...current, estado_actual: event.target.value }))}
        >
          <option value="">Todos los estados</option>
          {estadosDisponibles.map((estado) => (
            <option key={estado.id} value={estado.id}>{estado.nombre}</option>
          ))}
        </select>
        <button type="button" onClick={cargarDatos}>Aplicar filtros</button>
      </ManagementToolbar>

      {message && <div className="area-bandeja__alert area-bandeja__alert--success">{message}</div>}
      {error && <div className="area-bandeja__alert area-bandeja__alert--error">{error}</div>}

      {loading ? (
        <ManagementState className="area-bandeja__state">{loadingMessage}</ManagementState>
      ) : solicitudes.length === 0 ? (
        <ManagementState className="area-bandeja__state">{emptyMessage}</ManagementState>
      ) : (
        <ManagementTableFrame className="area-bandeja__table-wrap">
          <table className="area-bandeja__table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Aplicante</th>
                {mostrarContactoColumn && <th>Contacto</th>}
                {mostrarAreaColumn && <th>Area</th>}
                <th>{tramiteColumnLabel}</th>
                <th>Estado</th>
                {variante === 'individuales' && <th>Pago</th>}
                {variante === 'individuales' && <th>Próxima acción</th>}
                {mostrarResponsableColumn && <th>Responsable</th>}
                <th>Avance</th>
                <th>Ultimo movimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id_solicitud}>
                  <td><strong>#{solicitud.id_solicitud}</strong></td>
                  <td>{solicitud.aplicante || 'N/A'}</td>
                  {mostrarContactoColumn && (
                    <td>
                      <div className="area-bandeja__stacked">
                        <span>{solicitud.contacto_nombre || 'N/A'}</span>
                        <small>{solicitud.contacto_telefono || ''}</small>
                      </div>
                    </td>
                  )}
                  {mostrarAreaColumn && (
                    <td>{solicitud.area_actual_nombre || solicitud.area_actual_clave || 'N/A'}</td>
                  )}
                  <td>{solicitud.tipo_tramite || 'N/A'}</td>
                  <td>
                    <ManagementBadge className="area-bandeja__chip">
                      {solicitud.estado_actual_nombre || solicitud.estado_actual}
                    </ManagementBadge>
                  </td>
                  {variante === 'individuales' && <td><ManagementBadge>{solicitud.estado_pago || 'Sin pago'}</ManagementBadge></td>}
                  {variante === 'individuales' && <td><ManagementBadge>{deriveInboxNextAction({flow:getIndividualFlow(solicitud.tipo_tramite),profilePercent:solicitud.avance?.perfil_porcentaje,paymentStatus:solicitud.estado_pago,missingDocuments:solicitud.avance?.faltantes?.length})}</ManagementBadge></td>}
                  {mostrarResponsableColumn && <td>{getResponsable(solicitud)}</td>}
                  <td>{renderAvance(solicitud.avance)}</td>
                  <td>{formatDate(solicitud.fecha_ultimo_movimiento || solicitud.fecha_inicio)}</td>
                  <td>
                    <ManagementActions className="area-bandeja__actions">
                      <button
                        type="button"
                        onClick={() => navigate(`/empleado/solicitudes-nuevo?id_solicitud=${solicitud.id_solicitud}`)}
                      >
                        Ver expediente
                      </button>
                      {(Number(solicitud.id_area_actual) === 4 || variante === 'individuales') && <>
                        <button type="button" onClick={() => navigate(`/empleado/solicitudes-nuevo?id_solicitud=${solicitud.id_solicitud}&perfil=ver`)}>Ver perfil</button>
                        <button type="button" onClick={() => navigate(`/empleado/solicitudes-nuevo?id_solicitud=${solicitud.id_solicitud}&perfil=editar`)}>Editar perfil</button>
                      </>}
                      {permitirReasignar && (
                        <button type="button" onClick={() => abrirReasignacion(solicitud)}>
                          Reasignar responsable
                        </button>
                      )}
                      <button type="button" onClick={() => window.alert(
                        solicitud.avance?.faltantes?.length
                          ? `Faltantes: ${solicitud.avance.faltantes.join(', ')}`
                          : 'Sin faltantes obligatorios detectados.'
                      )}>
                        Ver resumen
                      </button>
                    </ManagementActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ManagementTableFrame>
      )}

      {reasignarSolicitud && (
        <div className="area-bandeja__modal-backdrop" role="presentation">
          <form className="area-bandeja__modal" onSubmit={guardarResponsable}>
            <header>
              <h2>{reasignarTitulo}</h2>
              <button type="button" onClick={() => setReasignarSolicitud(null)}>Cerrar</button>
            </header>
            <p>Solicitud #{reasignarSolicitud.id_solicitud} - {reasignarSolicitud.aplicante}</p>
            <label>
              Responsable
              <select
                value={responsableSeleccionado}
                onChange={(event) => setResponsableSeleccionado(event.target.value)}
              >
                <option value="">Sin asignar</option>
                {empleadosFiltrados.map((empleado) => (
                  <option key={empleado.id_empleado} value={empleado.id_empleado}>
                    {empleado.nombre} {empleado.apellidos || ''} - {empleado.area || 'Sin area'}
                  </option>
                ))}
              </select>
            </label>
            <div className="area-bandeja__modal-actions">
              <button type="button" onClick={() => setReasignarSolicitud(null)}>Cancelar</button>
              <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </form>
        </div>
      )}
    </ManagementPage>
  );
};

export default AreaBandejaPage;
