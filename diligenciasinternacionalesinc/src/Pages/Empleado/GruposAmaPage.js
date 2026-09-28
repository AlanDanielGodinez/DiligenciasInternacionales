import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AmaActivitySummary from '../../Components/AreaBandeja/AmaActivitySummary';
import ScheduleAmaCallModal from '../../Components/Calendar/ScheduleAmaCallModal';
import { createLlamadaAma } from '../../services/calendarioAma.service';
import {
  addSolicitudesGrupoAma,
  createGrupoAma,
  generarGrupoAmaChecklist,
  getCandidatosGrupoAma,
  getEmpleados,
  getGrupoAma,
  getGrupoAmaChecklist,
  getGrupoAmaSolicitudes,
  getGruposAma,
  getPaises,
  getTiposTramite,
  removeSolicitudGrupoAma,
  updateGrupoAmaChecklistItem,
  updateGrupoAma,
  terminarGrupoAma,
} from '../../services/gruposAma.service';
import '../../Styles/GruposAmaPage.css';
import { getCurrentEmployeeId } from '../../utils/authUser';
import { ManagementHeader, ManagementPage, ManagementToolbar } from '../../Components/Management/ManagementUI';

const emptyForm = {
  nombre_grupo: '',
  id_tipo_tramite: '',
  id_pais: '',
  fecha_tentativa_salida: '',
  fecha_confirmada_salida: '',
  estado_grupo: 'activo',
  cupo_estimado: '',
  id_empleado_responsable: '',
  observaciones: '',
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-MX');
};

const formatPercent = (value) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return '0%';
  return `${Math.max(0, Math.min(100, numberValue))}%`;
};

const getNombreEmpleado = (empleado) =>
  [empleado?.nombre, empleado?.apellidos].filter(Boolean).join(' ') || empleado?.correo || `Empleado #${empleado?.id_empleado}`;

const getNombreTipo = (tipo) => tipo?.nombre_tramite || tipo?.tipo_tramite || tipo?.nombre || `Tipo #${tipo?.id_tipo_tramite}`;

const getNombrePais = (pais) => pais?.nombre_pais || pais?.nombre || `PaÃƒÂ­s #${pais?.id_pais}`;

const normalizeError = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const GruposAmaPage = () => {
  const [grupos, setGrupos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [paises, setPaises] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [filters, setFilters] = useState({
    q: '',
    id_tipo_tramite: '',
    id_pais: '',
    estado_grupo: '',
    id_empleado_responsable: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [detailGroup, setDetailGroup] = useState(null);
  const [detailSolicitudes, setDetailSolicitudes] = useState([]);
  const [detailChecklist, setDetailChecklist] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [callApplicant, setCallApplicant] = useState(null);

  const tiposAma = useMemo(
    () => tipos.filter((tipo) => String(getNombreTipo(tipo)).toLowerCase().includes('ama')),
    [tipos]
  );

  const fetchCatalogs = async () => {
    const [tiposData, paisesData, empleadosData] = await Promise.all([
      getTiposTramite(),
      getPaises(),
      getEmpleados(),
    ]);
    setTipos(tiposData);
    setPaises(paisesData);
    setEmpleados(empleadosData);
  };

  const fetchGrupos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getGruposAma({
        ...filters,
        activo: true,
      });
      setGrupos(data);
    } catch (err) {
      setError(normalizeError(err, 'No fue posible cargar los grupos AMA.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogs().catch((err) => setError(normalizeError(err, 'No fue posible cargar catalogos.')));
  }, []);

  useEffect(() => {
    fetchGrupos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const openCreate = () => {
    setEditingGroup(null);
    setForm(emptyForm);
    setFormOpen(true);
    setError('');
    setSuccess('');
  };

  const openEdit = (grupo) => {
    setEditingGroup(grupo);
    setForm({
      nombre_grupo: grupo.nombre_grupo || '',
      id_tipo_tramite: grupo.id_tipo_tramite || '',
      id_pais: grupo.id_pais || '',
      fecha_tentativa_salida: grupo.fecha_tentativa_salida ? grupo.fecha_tentativa_salida.slice(0, 10) : '',
      fecha_confirmada_salida: grupo.fecha_confirmada_salida ? grupo.fecha_confirmada_salida.slice(0, 10) : '',
      estado_grupo: grupo.estado_grupo || 'activo',
      cupo_estimado: grupo.cupo_estimado ?? '',
      id_empleado_responsable: grupo.id_empleado_responsable || '',
      observaciones: grupo.observaciones || '',
    });
    setFormOpen(true);
    setError('');
    setSuccess('');
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => ({
    nombre_grupo: form.nombre_grupo.trim(),
    id_tipo_tramite: form.id_tipo_tramite || null,
    id_pais: form.id_pais || null,
    fecha_tentativa_salida: form.fecha_tentativa_salida || null,
    fecha_confirmada_salida: form.fecha_confirmada_salida || null,
    estado_grupo: form.estado_grupo || 'activo',
    cupo_estimado: form.cupo_estimado === '' ? null : Number(form.cupo_estimado),
    id_empleado_responsable: form.id_empleado_responsable || null,
    observaciones: form.observaciones.trim() || null,
  });

  const handleSaveGroup = async (event) => {
    event.preventDefault();
    if (!form.nombre_grupo.trim()) {
      setError('El nombre del grupo es obligatorio.');
      return;
    }
    const cupo = form.cupo_estimado === '' ? null : Number(form.cupo_estimado);
    if (
      editingGroup &&
      cupo !== null &&
      Number.isFinite(cupo) &&
      cupo < Number(editingGroup.cantidad_solicitudes || 0)
    ) {
      setError('El cupo estimado no puede ser menor que las solicitudes activas del grupo.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (editingGroup) {
        await updateGrupoAma(editingGroup.id_grupo_ama, buildPayload());
        setSuccess('Grupo AMA actualizado.');
      } else {
        await createGrupoAma(buildPayload());
        setSuccess('Grupo AMA creado.');
      }
      setFormOpen(false);
      await fetchGrupos();
    } catch (err) {
      setError(normalizeError(err, 'No fue posible guardar el grupo AMA.'));
    } finally {
      setSaving(false);
    }
  };

  const loadGroupDetail = async (idGrupo) => {
    setDetailLoading(true);
    setError('');
    try {
      const [grupo, solicitudes, checklist] = await Promise.all([
        getGrupoAma(idGrupo),
        getGrupoAmaSolicitudes(idGrupo),
        getGrupoAmaChecklist(idGrupo),
      ]);
      setDetailGroup(grupo);
      setDetailSolicitudes(grupo.solicitudes || solicitudes);
      setDetailChecklist(grupo.checklist || checklist);
    } catch (err) {
      setError(normalizeError(err, 'No fue posible cargar el detalle del grupo.'));
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshChecklist = async (idGrupo = detailGroup?.id_grupo_ama) => {
    if (!idGrupo) return;
    const checklist = await getGrupoAmaChecklist(idGrupo);
    setDetailChecklist(checklist);
  };

  const openCandidates = async () => {
    if (!detailGroup) return;
    setCandidateModalOpen(true);
    setSelectedCandidates([]);
    setCandidateSearch('');
    await loadCandidates('');
  };

  const loadCandidates = async (q = candidateSearch) => {
    setError('');
    try {
      const data = await getCandidatosGrupoAma({ q });
      setCandidates(data);
      setSelectedCandidates(previous => previous.filter(id => data.some(row => row.id_solicitud === id && row.elegible_por_actividad === true)));
    } catch (err) {
      setCandidates([]);
      setSelectedCandidates([]);
      setError(normalizeError(err, 'No fue posible cargar candidatos AMA.'));
    }
  };

  const toggleCandidate = (idSolicitud) => {
    if (!candidates.some(row => row.id_solicitud === idSolicitud && row.elegible_por_actividad === true)) return;
    setSelectedCandidates((prev) =>
      prev.includes(idSolicitud)
        ? prev.filter((id) => id !== idSolicitud)
        : [...prev, idSolicitud]
    );
  };

  const handleAddCandidates = async () => {
    if (!detailGroup || !selectedCandidates.length) return;
    const cupoEstimado = detailGroup.cupo_estimado == null ? Infinity : Number(detailGroup.cupo_estimado);
    const cantidadActual = Number(detailSolicitudes.length || detailGroup.cantidad_solicitudes || 0);
    if (Number.isFinite(cupoEstimado) && cantidadActual + selectedCandidates.length > cupoEstimado) {
      setError('El cupo del grupo estÃƒÂ¡ lleno o no permite agregar todas las solicitudes seleccionadas.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await addSolicitudesGrupoAma(detailGroup.id_grupo_ama, selectedCandidates);
      setDetailGroup(result.grupo);
      setDetailSolicitudes(result.solicitudes);
      setCandidateModalOpen(false);
      setSuccess('Solicitudes agregadas al grupo.');
      await fetchGrupos();
    } catch (err) {
      setError(normalizeError(err, 'No fue posible agregar solicitudes al grupo.'));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!candidateModalOpen) return undefined;
    const refresh = () => loadCandidates(candidateSearch);
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateModalOpen, candidateSearch]);

  const handleRemoveSolicitud = async (idSolicitud) => {
    if (!detailGroup) return;
    setSaving(true);
    setError('');
    try {
      await removeSolicitudGrupoAma(detailGroup.id_grupo_ama, idSolicitud);
      await loadGroupDetail(detailGroup.id_grupo_ama);
      await fetchGrupos();
      setSuccess('Solicitud desvinculada del grupo.');
    } catch (err) {
      setError(normalizeError(err, 'No fue posible quitar la solicitud del grupo.'));
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateChecklist = async () => {
    if (!detailGroup?.id_grupo_ama) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const checklist = await generarGrupoAmaChecklist(detailGroup.id_grupo_ama);
      setDetailChecklist(checklist);
      await fetchGrupos();
      await loadGroupDetail(detailGroup.id_grupo_ama);
      setSuccess('Checklist operativo generado.');
    } catch (err) {
      setError(normalizeError(err, 'No fue posible generar el checklist.'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleChecklist = async (item) => {
    if (!detailGroup?.id_grupo_ama) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateGrupoAmaChecklistItem(detailGroup.id_grupo_ama, item.id_checklist, {
        completado: !item.completado,
        completado_por: null,
      });
      await refreshChecklist(detailGroup.id_grupo_ama);
      await fetchGrupos();
      setSuccess(item.completado ? 'Item marcado como pendiente.' : 'Item marcado como completado.');
    } catch (err) {
      setError(normalizeError(err, 'No fue posible actualizar el checklist.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ManagementPage className="grupos-ama-page">
      <ManagementHeader className="grupos-ama-header">
        <div>
          <span className="grupos-ama-eyebrow">AMA</span>
          <h1>Grupos AMA</h1>
          <p>Administra grupos, salidas y aplicantes vinculados a solicitudes AMA.</p>
        </div>
        <div className="grupos-ama-header-actions">
          <button type="button" onClick={openCreate}>Crear grupo</button>
          <button type="button" onClick={fetchGrupos}>Actualizar</button>
        </div>
      </ManagementHeader>

      {(error || success) && (
        <div className={`grupos-ama-alert ${error ? 'grupos-ama-alert-error' : 'grupos-ama-alert-success'}`}>
          {error || success}
        </div>
      )}


      <nav className="grupos-ama-view-switch" aria-label="Vistas AMA">
        <Link className="is-active" to="/empleado/ama/grupos">Grupos</Link>
        <Link to="/empleado/ama/calendario">Calendario</Link>
        <Link to="/empleado/ama/participantes">Aplicantes</Link>
      </nav>

      <section className="grupos-ama-kpis" aria-label="Resumen de grupos por estado">
        {[...new Set(grupos.map((grupo) => grupo.estado_grupo).filter(Boolean))].map((estado) => (
          <button type="button" key={estado} onClick={() => setFilters((prev) => ({ ...prev, estado_grupo: estado }))}>
            <span>{estado}</span><strong>{grupos.filter((grupo) => grupo.estado_grupo === estado).length}</strong>
          </button>
        ))}
      </section>
      <ManagementToolbar as="section" className="grupos-ama-toolbar" aria-label="Filtros de grupos AMA">
        <label>
          Buscar
          <input name="q" type="search" value={filters.q} onChange={handleFilterChange} placeholder="Grupo, paÃƒÂ­s, responsable" />
        </label>
        <label>
          Tipo AMA
          <select name="id_tipo_tramite" value={filters.id_tipo_tramite} onChange={handleFilterChange}>
            <option value="">Todos</option>
            {tiposAma.map((tipo) => (
              <option key={tipo.id_tipo_tramite} value={tipo.id_tipo_tramite}>{getNombreTipo(tipo)}</option>
            ))}
          </select>
        </label>
        <label>
          PaÃƒÂ­s
          <select name="id_pais" value={filters.id_pais} onChange={handleFilterChange}>
            <option value="">Todos</option>
            {paises.map((pais) => (
              <option key={pais.id_pais} value={pais.id_pais}>{getNombrePais(pais)}</option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select name="estado_grupo" value={filters.estado_grupo} onChange={handleFilterChange}>
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="planeado">Planeado</option>
            <option value="cerrado">Cerrado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </label>
        <button type="button" onClick={fetchGrupos}>Filtrar</button>
      </ManagementToolbar>

      <section className="grupos-ama-cards" aria-label="Grupos AMA">
        {loading ? <div className="grupos-ama-empty">Cargando grupos AMA...</div> : grupos.length === 0 ? <div className="grupos-ama-empty"><strong>No hay grupos AMA registrados</strong><span>Crea un grupo para comenzar a vincular solicitudes AMA.</span></div> : grupos.map((grupo) => (
          <article key={grupo.id_grupo_ama} className="grupos-ama-card" onClick={() => loadGroupDetail(grupo.id_grupo_ama)}>
            <header><div><span className="grupos-ama-muted">Grupo #{grupo.id_grupo_ama}</span><h2>{grupo.nombre_grupo}</h2></div><span className="grupos-ama-chip">{grupo.estado_grupo}</span></header>
            <p>{grupo.tipo_tramite || 'Tipo AMA no asignado'} Â· {grupo.pais || 'PaÃ­s no asignado'}</p>
            <div className="grupos-ama-card__date"><span>PrÃ³xima fecha</span><strong>{formatDate(grupo.fecha_confirmada_salida || grupo.fecha_tentativa_salida)}</strong></div>
            <div><span>Integrantes <strong>{grupo.cantidad_solicitudes || 0} / {grupo.cupo_estimado ?? 'N/A'}</strong></span><div className="grupos-ama-progress"><span style={{ width: formatPercent(grupo.porcentaje_ocupacion) }} /></div></div>
            <div><span>Checklist <strong>{grupo.checklist_completados || 0} / {grupo.checklist_total || 0}</strong></span><div className="grupos-ama-progress"><span style={{ width: formatPercent(grupo.avance_checklist) }} /></div></div>
            <p className="grupos-ama-card__responsible">Responsable: <strong>{grupo.responsable || 'Sin asignar'}</strong></p>
            <div className="grupos-ama-actions" onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => loadGroupDetail(grupo.id_grupo_ama)}>Ver grupo</button><button type="button" onClick={() => openEdit(grupo)}>Editar</button></div>
          </article>
        ))}
      </section>

      {formOpen && (
        <div className="admin-modal-overlay" role="presentation">
          <form className="admin-modal" role="dialog" aria-modal="true" onSubmit={handleSaveGroup}>
            <header className="admin-modal-header">
              <div><span className="admin-modal-kicker">AMA / grupos</span><h2 className="admin-modal-title">{editingGroup ? 'Editar grupo AMA' : 'Crear grupo AMA'}</h2></div>
              <button className="admin-modal-close" type="button" onClick={() => setFormOpen(false)} aria-label="Cerrar">&times;</button>
            </header>
            <div className="grupos-ama-form admin-modal-body">
              <label>
                Nombre del grupo *
                <input name="nombre_grupo" value={form.nombre_grupo} onChange={handleFormChange} required />
              </label>
              <label>
                Tipo AMA
                <select name="id_tipo_tramite" value={form.id_tipo_tramite} onChange={handleFormChange}>
                  <option value="">Sin tipo</option>
                  {tiposAma.map((tipo) => (
                    <option key={tipo.id_tipo_tramite} value={tipo.id_tipo_tramite}>{getNombreTipo(tipo)}</option>
                  ))}
                </select>
              </label>
              <label>
                PaÃƒÂ­s
                <select name="id_pais" value={form.id_pais} onChange={handleFormChange}>
                  <option value="">Sin paÃƒÂ­s</option>
                  {paises.map((pais) => (
                    <option key={pais.id_pais} value={pais.id_pais}>{getNombrePais(pais)}</option>
                  ))}
                </select>
              </label>
              <label>
                Fecha tentativa salida
                <input name="fecha_tentativa_salida" type="date" value={form.fecha_tentativa_salida} onChange={handleFormChange} />
              </label>
              <label>
                Fecha confirmada salida
                <input name="fecha_confirmada_salida" type="date" value={form.fecha_confirmada_salida} onChange={handleFormChange} />
              </label>
              <label>
                Estado grupo
                <select name="estado_grupo" value={form.estado_grupo} onChange={handleFormChange}>
                  <option value="activo">Activo</option>
                  <option value="planeado">Planeado</option>
                  <option value="cerrado">Cerrado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </label>
              <label>
                Cupo estimado
                <input name="cupo_estimado" type="number" min="0" value={form.cupo_estimado} onChange={handleFormChange} />
              </label>
              <label>
                Responsable
                <select name="id_empleado_responsable" value={form.id_empleado_responsable} onChange={handleFormChange}>
                  <option value="">Sin responsable</option>
                  {empleados.map((empleado) => (
                    <option key={empleado.id_empleado} value={empleado.id_empleado}>{getNombreEmpleado(empleado)}</option>
                  ))}
                </select>
              </label>
              <label className="grupos-ama-form-wide">
                Observaciones
                <textarea name="observaciones" value={form.observaciones} onChange={handleFormChange} rows="3" />
              </label>
            </div>
            <div className="admin-modal-footer grupos-ama-modal-actions">
              <button className="admin-button admin-button-secondary" type="button" onClick={() => setFormOpen(false)}>Cancelar</button>
              <button className="admin-button admin-button-primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar grupo'}</button>
            </div>
          </form>
        </div>
      )}

      {detailGroup && (
        <div className="admin-modal-overlay" role="presentation">
          <section className="admin-modal admin-modal--wide" role="dialog" aria-modal="true">
            <header className="admin-modal-header">
              <div>
                <span className="admin-modal-kicker">Detalle de grupo AMA</span>
                <h2 className="admin-modal-title">{detailGroup.nombre_grupo}</h2>
                <p className="admin-modal-subtitle">{detailGroup.tipo_tramite || 'Sin tipo'} Ã‚Â· {detailGroup.pais || 'Sin paÃƒÂ­s'}</p>
              </div>
              <button className="admin-modal-close" type="button" onClick={() => setDetailGroup(null)} aria-label="Cerrar">&times;</button>
            </header>
            <div className="admin-modal-body">
            <section className="admin-modal-section grupos-ama-detail-section">
              <h3 className="admin-modal-section-title">Resumen del grupo</h3>
              <div className="grupos-ama-summary">
                <span>Estado: <strong>{detailGroup.estado_grupo}</strong></span>
                <span>Cupo: <strong>{detailSolicitudes.length || detailGroup.cantidad_solicitudes || 0} / {detailGroup.cupo_estimado ?? 'N/A'}</strong></span>
                <span>Disponible: <strong>{detailGroup.cupo_disponible ?? 'N/A'}</strong></span>
                <span>OcupaciÃƒÂ³n: <strong>{formatPercent(detailGroup.porcentaje_ocupacion)}</strong></span>
                <span>Responsable: <strong>{detailGroup.responsable || 'Sin asignar'}</strong></span>
                <span>Tentativa: <strong>{formatDate(detailGroup.fecha_tentativa_salida)}</strong></span>
                <span>Confirmada: <strong>{formatDate(detailGroup.fecha_confirmada_salida)}</strong></span>
                <span>Checklist: <strong>{detailGroup.checklist_completados || 0} / {detailGroup.checklist_total || detailChecklist.length || 0}</strong></span>
              </div>
            </section>

            <div className="grupos-ama-detail-actions">
              <button type="button" onClick={openCandidates}>Agregar solicitudes</button>
              <button type="button" onClick={() => window.open('/empleado/ama', '_self')}>Ver expedientes AMA</button><button type="button" disabled={detailGroup.estado_grupo === 'GRUPO TERMINADO'} onClick={async()=>{if(!window.confirm('¿Marcar grupo terminado?'))return;try{await terminarGrupoAma(detailGroup.id_grupo_ama,{id_empleado:getCurrentEmployeeId()||null});setSuccess('Grupo AMA terminado.');await loadGroupDetail(detailGroup.id_grupo_ama);await fetchGrupos()}catch(err){setError(normalizeError(err,'No fue posible terminar el grupo.'))}}}>Grupo terminado</button>
            </div>

            <section className="admin-modal-section grupos-ama-detail-section">
              <h3 className="admin-modal-section-title">Solicitudes / aplicantes</h3>
              {detailLoading ? (
                <div className="grupos-ama-empty">Cargando solicitudes...</div>
              ) : detailSolicitudes.length === 0 ? (
                <div className="grupos-ama-empty">Este grupo todavÃƒÂ­a no tiene solicitudes vinculadas.</div>
              ) : (
                <table className="grupos-ama-table">
                  <thead>
                    <tr>
                      <th>Solicitud</th>
                      <th>Aplicante</th>
                      <th>TrÃƒÂ¡mite</th>
                      <th>Estado</th>
                      <th>Responsable</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailSolicitudes.map((solicitud) => (
                      <tr key={solicitud.id_grupo_ama_solicitud}>
                        <td>#{solicitud.id_solicitud}</td>
                        <td>{solicitud.aplicante || 'N/A'}</td>
                        <td>{solicitud.tipo_tramite || 'N/A'}</td>
                        <td>{solicitud.estado || 'N/A'}</td>
                        <td>{solicitud.responsable || 'Sin asignar'}</td>
                        <td>
                          <div className="grupos-ama-actions">
                            <button type="button" onClick={() => window.open(`/empleado/solicitudes-nuevo?id_solicitud=${solicitud.id_solicitud}`, '_self')}>Ver expediente</button>
                            <button type="button" onClick={() => window.open(`/empleado/solicitudes-nuevo?id_solicitud=${solicitud.id_solicitud}&perfil=ver`, '_self')}>Ver perfil</button>
                            <button type="button" onClick={() => window.open(`/empleado/solicitudes-nuevo?id_solicitud=${solicitud.id_solicitud}&perfil=editar`, '_self')}>Editar perfil</button>
                            <button type="button" onClick={() => setCallApplicant({ ...solicitud, id_grupo_ama: detailGroup.id_grupo_ama })}>Agendar llamada</button>
                            <AmaActivitySummary state={solicitud} />
                            <button type="button" onClick={() => handleRemoveSolicitud(solicitud.id_solicitud)} disabled={saving}>Quitar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="admin-modal-section grupos-ama-detail-section">
              <div className="grupos-ama-section-heading">
                <h3>Checklist operativo</h3>
                {detailChecklist.length === 0 && (
                  <button type="button" onClick={handleGenerateChecklist} disabled={saving}>
                    Generar checklist
                  </button>
                )}
              </div>
              {detailChecklist.length === 0 ? (
                <div className="grupos-ama-empty">No hay checklist generado para este grupo.</div>
              ) : (
                <div className="grupos-ama-checklist">
                  {detailChecklist.map((item) => (
                    <article key={item.id_checklist} className={`grupos-ama-check-item ${item.completado ? 'is-done' : ''}`}>
                      <label>
                        <input
                          type="checkbox"
                          checked={Boolean(item.completado)}
                          disabled={saving}
                          onChange={() => handleToggleChecklist(item)}
                        />
                        <span>
                          <strong>{item.titulo}</strong>
                          {item.descripcion && <small>{item.descripcion}</small>}
                          <small>{item.completado ? `Completado: ${formatDate(item.fecha_completado)}` : 'Pendiente'}</small>
                        </span>
                      </label>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="admin-modal-section grupos-ama-detail-section">
              <h3 className="admin-modal-section-title">Observaciones</h3>
              <p className="grupos-ama-observaciones">{detailGroup.observaciones || 'Sin observaciones registradas.'}</p>
            </section>
            </div>
          </section>
        </div>
      )}

      {candidateModalOpen && detailGroup && (
        <div className="admin-modal-overlay" role="presentation">
          <section className="admin-modal admin-modal--wide" role="dialog" aria-modal="true">
            <header className="admin-modal-header">
              <div><span className="admin-modal-kicker">AMA / solicitudes</span><h2 className="admin-modal-title">Agregar solicitudes a {detailGroup.nombre_grupo}</h2></div>
              <button className="admin-modal-close" type="button" onClick={() => setCandidateModalOpen(false)} aria-label="Cerrar">&times;</button>
            </header>
            <div className="admin-modal-body">
            <div className="grupos-ama-candidate-search">
              <input value={candidateSearch} onChange={(event) => setCandidateSearch(event.target.value)} placeholder="Buscar candidato AMA" />
              <button type="button" onClick={() => loadCandidates(candidateSearch)}>Buscar</button>
            </div>
            {candidates.length === 0 ? (
              <div className="grupos-ama-empty">No hay candidatos AMA disponibles.</div>
            ) : (
              <table className="grupos-ama-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Solicitud</th>
                    <th>Aplicante</th>
                    <th>Contacto</th>
                    <th>TrÃƒÂ¡mite</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr key={candidate.id_solicitud}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(candidate.id_solicitud)}
                          disabled={candidate.elegible_por_actividad !== true || saving}
                          onChange={() => toggleCandidate(candidate.id_solicitud)}
                        />
                      </td>
                      <td>#{candidate.id_solicitud}</td>
                      <td>{candidate.aplicante || 'N/A'}</td>
                      <td>{candidate.contacto || 'N/A'}</td>
                      <td>{candidate.tipo_tramite || 'N/A'}</td>
                      <td>{candidate.estado || 'N/A'}
                        <AmaActivitySummary state={candidate} />
                        <a href={`/empleado/solicitudes-nuevo?id_solicitud=${candidate.id_solicitud}&perfil=ver`}>Ver perfil</a>
                        {' Ã‚Â· '}<a href={`/empleado/solicitudes-nuevo?id_solicitud=${candidate.id_solicitud}&perfil=editar`}>Editar perfil</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            </div>
            <div className="admin-modal-footer grupos-ama-modal-actions">
              <button className="admin-button admin-button-secondary" type="button" onClick={() => setCandidateModalOpen(false)}>Cancelar</button>
              <button className="admin-button admin-button-primary" type="button" onClick={handleAddCandidates} disabled={saving || !selectedCandidates.length}>
                {saving ? 'Agregando...' : `Agregar seleccionadas (${selectedCandidates.length})`}
              </button>
            </div>
          </section>
        </div>
      )}
      <ScheduleAmaCallModal
        open={Boolean(callApplicant)}
        applicants={callApplicant ? [callApplicant] : []}
        employees={empleados}
        groups={detailGroup ? [detailGroup] : []}
        initialApplicant={callApplicant}
        onClose={() => setCallApplicant(null)}
        onSave={createLlamadaAma}
      />
    </ManagementPage>
  );
};

export default GruposAmaPage;

