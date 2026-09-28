import React, { useCallback, useEffect, useState } from 'react';
import { FaBalanceScale, FaPlus } from 'react-icons/fa';
import { getEmpleados, getTiposTramite } from '../../services/configuracion.service';
import { getLegalesSolicitud, updateLegal, addActividadLegal, addNotaLegal, resolverLegal, regresarLegal, cerrarLegal, crearSolicitudLegal } from '../../services/legales.service';
import { getCurrentEmployeeId } from '../../utils/authUser';
import { legalOriginLabel, legalResultLabel, legalServiceLabel, legalStateLabel } from '../../utils/legalLabels';
import './LegalProcessCard.css';

const states = ['PENDIENTE_ASIGNACION', 'EN_ANALISIS', 'ESPERANDO_INFORMACION', 'ESPERANDO_CLIENTE'];
const results = ['CANDIDATO', 'NO_CANDIDATO', 'REQUIERE_NUEVO_TRAMITE', 'REGRESA_ORIGEN', 'OTRO'];
const types = ['LLAMADA', 'WHATSAPP', 'CORREO', 'REUNION', 'ANALISIS', 'OTRA'];
const legalTypes = ['FOIA','PETICIÓN FAMILIAR (I-130)','VISA K-1','AJUSTE DE ESTATUS (I-485)','ASILO','REN GREEN CARD','PERMISO DE TRABAJO','CIUDADANÍA (N-400)','PETICIONES MIGRATORIAS','PERMISOS HUMANITARIOS','VISA DE TRABAJO CANADIENSE','TRADUCCIONES','APOSTILLA','VISA EMPLEADO DOMÉSTICO (B1)','DOBLE NACIONALIDAD','PERDÓN MIGRATORIO','SEGUIMIENTO','VISA U','VISA H2B','OTROS'];
const date = (value) => value ? new Date(String(value).length === 10 ? `${value}T00:00:00` : value).toLocaleString('es-MX') : 'Sin registrar';

export default function LegalProcessCard({ solicitud }) {
  const [data, setData] = useState(null);
  const [staff, setStaff] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [mode, setMode] = useState('');
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const load = useCallback(() => getLegalesSolicitud(solicitud.id_solicitud).then(setData).catch((requestError) => setError(requestError.response?.data?.error?.message || requestError.message)), [solicitud.id_solicitud]);

  useEffect(() => {
    load();
    getEmpleados().then(setStaff).catch(() => {});
    getTiposTramite().then((items) => setServiceTypes(items.filter((item) => item.activo !== false))).catch(() => {});
  }, [load]);

  if (!data?.active) return null;
  const process = data.active.process;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const body = { ...form, id_empleado: getCurrentEmployeeId() };
      if (mode === 'manage') await updateLegal(process.id_proceso, body);
      if (mode === 'activity') await addActividadLegal(process.id_proceso, body);
      if (mode === 'note') await addNotaLegal(process.id_proceso, body);
      if (mode === 'resolve') await resolverLegal(process.id_proceso, body);
      if (mode === 'return') await regresarLegal(process.id_proceso, body);
      if (mode === 'close') await cerrarLegal(process.id_proceso, body);
      if (mode === 'request') {
        const created = await crearSolicitudLegal(process.id_proceso, body);
        window.location.assign(`/empleado/solicitudes-nuevo?id_solicitud=${created.id_solicitud}`);
        return;
      }
      setMode(''); setForm({}); load();
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || requestError.message);
    }
  };

  return <section className="solicitudes-nuevo-profile-card legal-process">
    <header className="solicitudes-nuevo-profile-card-title solicitudes-nuevo-profile-card-title-split"><div><FaBalanceScale /><h2>Proceso Legal</h2></div><span>{legalStateLabel[process.estado_proceso] || process.estado_proceso}</span></header>
    <div className="legal-process__grid"><div><small>Origen</small><strong>{legalOriginLabel[process.origen] || process.origen}</strong></div><div><small>Tipo</small><strong>{process.tipos_legales?.length ? process.tipos_legales.join(', ') : legalServiceLabel(process)}</strong></div><div><small>Fecha de entrada</small><strong>{date(process.fecha_entrada)}</strong></div><div><small>Envío de solicitud</small><strong>{date(process.fecha_envio_solicitud)}</strong></div><div><small>Solicitado por</small><strong>{[process.solicitado_nombre, process.solicitado_apellidos].filter(Boolean).join(' ') || 'No identificado'}</strong></div><div><small>Asesor Legal</small><strong>{[process.responsable_nombre, process.responsable_apellidos].filter(Boolean).join(' ') || 'Sin asignar'}</strong></div><div><small>Última gestión</small><strong>{date(process.fecha_ultimo_contacto)}</strong></div><div><small>Próxima gestión</small><strong>{date(process.fecha_proximo_contacto)}</strong></div><div><small>Seguimientos</small><strong>{process.primer_mensaje_seguimiento ? 'Primer mensaje registrado' : 'Primer mensaje pendiente'} · {process.segundo_mensaje_seguimiento ? 'Segundo registrado' : 'Segundo pendiente'}</strong></div><div><small>Resultado</small><strong>{legalResultLabel[process.resultado_analisis] || 'Pendiente'}</strong></div></div>
    {process.resolucion && <p className="legal-process__resolution"><strong>Resolución:</strong> {process.resolucion}</p>}
    <div className="legal-process__actions">{!['CERRADO', 'RESUELTO'].includes(process.estado_proceso) && <><button onClick={() => setMode('manage')}>Asignar / continuar proceso</button><button onClick={() => setMode('activity')}>Registrar contacto o actividad</button><button onClick={() => setMode('note')}><FaPlus /> Nota Legal</button><button onClick={() => setMode('resolve')}>Registrar conclusión</button></>}{process.estado_proceso === 'RESUELTO' && <><button onClick={() => setMode('return')}>Regresar al proceso de origen</button>{process.resultado_analisis === 'REQUIERE_NUEVO_TRAMITE' && <button onClick={() => setMode('request')}>Continuar como servicio contratado</button>}<button onClick={() => setMode('close')}>Terminar sin continuación</button></>}</div>
    {data.active.activities?.length > 0 && <div className="legal-process__feed"><h3>Gestiones recientes</h3>{data.active.activities.slice(0, 5).map((item) => <p key={item.id_actividad}><strong>{item.tipo}</strong> · {date(item.fecha_actividad)}<br />{item.descripcion}</p>)}</div>}
    {data.active.notes?.length > 0 && <div className="legal-process__feed"><h3>Notas Legal</h3>{data.active.notes.slice(0, 5).map((item) => <p key={item.id_nota}>{item.contenido}</p>)}</div>}
    {data.history.length > 0 && <details><summary>Procesos Legal anteriores ({data.history.length})</summary>{data.history.map((item) => <p key={item.id_proceso}>#{item.id_proceso} · {legalStateLabel[item.estado_proceso] || item.estado_proceso} · {date(item.fecha_entrada)}</p>)}</details>}
    {error && <p className="legal-process__error">{error}</p>}
    {mode && <div className="legal-process__modal"><form onSubmit={submit}><h3>Gestionar proceso Legal</h3>
      {mode === 'manage' && <><label>Asesor Legal<select value={form.id_responsable_proceso ?? process.id_responsable_proceso ?? ''} onChange={(event) => setForm({ ...form, id_responsable_proceso: event.target.value || null })}><option value="">Sin asignar</option>{staff.map((person) => <option value={person.id_empleado} key={person.id_empleado}>{person.nombre} {person.apellidos}</option>)}</select></label><label>Etapa<select onChange={(event) => setForm({ ...form, estado_proceso: event.target.value })}><option value="">Sin cambio</option>{states.map((state) => <option value={state} key={state}>{legalStateLabel[state]}</option>)}</select></label><label>Próxima gestión<input type="date" onChange={(event) => setForm({ ...form, fecha_proximo_contacto: event.target.value })} /></label><label>Fecha de envío de solicitud<input type="date" value={form.fecha_envio_solicitud ?? (process.fecha_envio_solicitud ? String(process.fecha_envio_solicitud).slice(0, 10) : '')} onChange={(event) => setForm({ ...form, fecha_envio_solicitud: event.target.value })} /></label><fieldset><legend>Tipos legales</legend>{legalTypes.map((type) => { const selected = form.tipos_legales ?? process.tipos_legales ?? []; return <label key={type}><input type="checkbox" checked={selected.includes(type)} onChange={(event) => setForm({ ...form, tipos_legales: event.target.checked ? [...new Set([...selected, type])] : selected.filter((item) => item !== type) })} />{type}</label>; })}</fieldset><label><input type="checkbox" checked={form.primer_mensaje_seguimiento ?? Boolean(process.primer_mensaje_seguimiento)} onChange={(event) => setForm({ ...form, primer_mensaje_seguimiento: event.target.checked })} />Primer mensaje de seguimiento realizado</label><label><input type="checkbox" checked={form.segundo_mensaje_seguimiento ?? Boolean(process.segundo_mensaje_seguimiento)} onChange={(event) => setForm({ ...form, segundo_mensaje_seguimiento: event.target.checked })} />Segundo mensaje de seguimiento realizado</label></>}
      {mode === 'activity' && <><label>Tipo<select required onChange={(event) => setForm({ ...form, tipo: event.target.value })}><option value="">Seleccionar</option>{types.map((type) => <option key={type}>{type}</option>)}</select></label><label>Descripción<textarea onChange={(event) => setForm({ ...form, descripcion: event.target.value })} /></label><label>Próxima gestión<input type="date" onChange={(event) => setForm({ ...form, fecha_proxima_gestion: event.target.value })} /></label></>}
      {mode === 'note' && <label>Nota<textarea required onChange={(event) => setForm({ ...form, contenido: event.target.value })} /></label>}
      {mode === 'resolve' && <><label>Resultado<select required onChange={(event) => setForm({ ...form, resultado: event.target.value })}><option value="">Seleccionar</option>{results.map((result) => <option value={result} key={result}>{legalResultLabel[result]}</option>)}</select></label><label>Conclusión / resolución<textarea required onChange={(event) => setForm({ ...form, resolucion: event.target.value })} /></label></>}
      {mode === 'request' && <label>Tipo de trámite<select required value={form.id_tipo_tramite || ''} onChange={(event) => setForm({ ...form, id_tipo_tramite: event.target.value })}><option value="">Seleccionar trámite activo</option>{serviceTypes.map((type) => <option value={type.id_tipo_tramite} key={type.id_tipo_tramite}>{type.nombre_tramite}</option>)}</select></label>}
      {['return', 'close'].includes(mode) && <p>El análisis Legal terminará sin cambiar el responsable de la solicitud ni del proceso de origen.</p>}
      <div><button type="button" onClick={() => setMode('')}>Cancelar</button><button type="submit">Guardar</button></div>
    </form></div>}
  </section>;
}
