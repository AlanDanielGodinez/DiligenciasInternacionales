import React, { useCallback, useEffect, useState } from 'react';
import { FaCheck, FaClipboardList, FaTimes } from 'react-icons/fa';
import { createEncuestaSatisfaccionCliente, listEncuestasSatisfaccion, updateEncuestaSatisfaccionCliente } from '../../services/encuestasSatisfaccion.service';
import { getCurrentEmployeeId } from '../../utils/authUser';
import './SatisfactionSurveyCard.css';

export const SATISFACTION_QUESTIONS = [
  { name: 'satisfaccion_general', label: 'En general, ¿cómo calificaría su experiencia con nuestro servicio?', min: 1, max: 5 },
  { name: 'claridad_informacion', label: '¿Qué tan clara fue la información que recibió durante su proceso?', min: 1, max: 5 },
  { name: 'calidad_atencion', label: '¿Cómo calificaría la atención y el trato de nuestro equipo?', min: 1, max: 5 },
  { name: 'tiempo_respuesta', label: '¿Qué tan oportuno fue nuestro seguimiento y la respuesta a sus dudas?', min: 1, max: 5 },
  { name: 'utilidad_asesoria', label: '¿Considera que nuestra asesoría le brindó herramientas claras para su entrevista?', min: 1, max: 5 },
  { name: 'fortalezas_servicio', label: '¿Qué parte de nuestro servicio considera que hicimos mejor?', type: 'text' },
  { name: 'punto_mejora', label: '¿Qué podemos mejorar en nuestro servicio?', type: 'text' },
  { name: 'probabilidad_recomendacion', label: '¿Qué tan probable es que recomiende a Diligencias Internacionales a un familiar o amigo?', min: 0, max: 10 },
  { name: 'aprobado_negado', label: 'Resultado del trámite', type: 'enum', options: ['Negado', 'Aprobado'] },
];
const emptyForm = SATISFACTION_QUESTIONS.reduce((form, question) => ({ ...form, [question.name]: '' }), {});

const SatisfactionSurveyCard = ({ idCliente, idSolicitud = null }) => {
  const [surveys, setSurveys] = useState([]); const [loading, setLoading] = useState(true); const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); const [form, setForm] = useState(emptyForm); const [saving, setSaving] = useState(false); const [message, setMessage] = useState('');
  const load = useCallback(async () => { if (!idCliente) { setLoading(false); return; } setLoading(true); try { setSurveys(await listEncuestasSatisfaccion(idCliente)); } catch (error) { setMessage(error.message || 'No fue posible cargar las encuestas.'); } finally { setLoading(false); } }, [idCliente]);
  useEffect(() => { load(); }, [load]);
  const startNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const startEdit = (survey) => { setEditing(survey); setForm(Object.fromEntries(SATISFACTION_QUESTIONS.map((question) => [question.name, survey[question.name] ?? '']))); setOpen(true); };
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setMessage('');
    try {
      const payload = { ...form, id_solicitud: idSolicitud || null, id_empleado: getCurrentEmployeeId() };
      if (editing) await updateEncuestaSatisfaccionCliente(idCliente, editing.id_encuesta, payload);
      else await createEncuestaSatisfaccionCliente(idCliente, payload);
      setOpen(false); await load();
    } catch (error) { setMessage(error.response?.data?.error?.message || error.message || 'No fue posible guardar la encuesta.'); } finally { setSaving(false); }
  };
  const date = (value) => value ? new Date(value).toLocaleDateString('es-MX') : 'N/A';
  return <>
    <section className="solicitudes-nuevo-profile-card satisfaction-card">
      <header className="solicitudes-nuevo-profile-card-title solicitudes-nuevo-profile-card-title-split"><div><FaClipboardList /><h2>Encuestas de satisfacción</h2></div><button type="button" onClick={startNew}>Registrar encuesta</button></header>
      {loading ? <div className="solicitudes-nuevo-profile-empty">Cargando encuestas...</div> : surveys.length ? surveys.map((survey) => <div key={survey.id_encuesta} className="satisfaction-card__summary"><div><span>Fecha</span><strong>{date(survey.creado_en)}</strong></div><div><span>Calificación general</span><strong>{survey.satisfaccion_general ?? 'N/A'}/5</strong></div><div><span>Resultado</span><strong>{survey.aprobado_negado || 'N/A'}</strong></div><button type="button" onClick={() => startEdit(survey)}>Ver / editar</button></div>) : <div className="solicitudes-nuevo-applicant-profile-empty"><strong>Sin encuestas</strong><p>Este aplicante todavía no tiene respuestas registradas.</p></div>}
      {message && <div className="solicitudes-nuevo-message solicitudes-nuevo-message-error">{message}</div>}
    </section>
    {open && <div className="admin-modal-overlay" role="presentation" onMouseDown={() => !saving && setOpen(false)}><form className="admin-modal satisfaction-modal" onSubmit={save} onMouseDown={(event) => event.stopPropagation()}><div className="admin-modal-header"><div><span className="admin-modal-kicker">Aplicante #{idCliente}</span><h2 className="admin-modal-title">Encuesta de satisfacción</h2></div><button type="button" className="admin-modal-close" onClick={() => setOpen(false)} aria-label="Cerrar"><FaTimes /></button></div><div className="admin-modal-body satisfaction-modal__body">
      {SATISFACTION_QUESTIONS.map((question) => <label key={question.name}><span>{question.label}{question.min !== undefined && ` Escala: ${question.min} a ${question.max}`}</span>{question.type === 'text' ? <textarea rows="3" value={form[question.name]} onChange={(event) => setForm((current) => ({ ...current, [question.name]: event.target.value }))} /> : question.type === 'enum' ? <select value={form[question.name]} onChange={(event) => setForm((current) => ({ ...current, [question.name]: event.target.value }))}><option value="">Sin respuesta</option>{question.options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <div className="satisfaction-scale">{Array.from({ length: question.max - question.min + 1 }, (_, index) => question.min + index).map((value) => <label key={value}><input type="radio" name={question.name} value={value} checked={String(form[question.name]) === String(value)} onChange={(event) => setForm((current) => ({ ...current, [question.name]: event.target.value }))} /><span>{value}</span></label>)}</div>}</label>)}
    </div><div className="admin-modal-footer"><button type="button" className="admin-button admin-button-secondary" onClick={() => setOpen(false)}>Cerrar</button><button type="submit" className="admin-button admin-button-primary" disabled={saving}><FaCheck /> {saving ? 'Guardando...' : 'Guardar encuesta'}</button></div></form></div>}
  </>;
};
export default SatisfactionSurveyCard;
