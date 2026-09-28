import React, { useEffect, useState } from 'react';

const empty = { id_solicitud: '', id_empleado_responsable: '', id_grupo_ama: '', fecha: '', hora: '', tipo: 'LLAMADA', notas: '' };

export default function ScheduleAmaCallModal({ open, applicants = [], employees = [], groups = [], initialApplicant = null, onClose, onSave }) {
  const [form, setForm] = useState(empty); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  useEffect(() => { if (open) setForm({ ...empty, id_solicitud: initialApplicant?.id_solicitud || '', id_grupo_ama: initialApplicant?.id_grupo_ama || '' }); }, [open, initialApplicant]);
  if (!open) return null;
  const change = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  const submit = async (event) => { event.preventDefault(); setSaving(true); setError(''); try { await onSave({ ...form, id_solicitud: Number(form.id_solicitud), id_empleado_responsable: Number(form.id_empleado_responsable), id_grupo_ama: form.id_grupo_ama ? Number(form.id_grupo_ama) : null }); onClose(); } catch (err) { setError(err.response?.data?.message || err.message || 'No fue posible guardar la llamada.'); } finally { setSaving(false); } };
  return <div className="calendar-detail-backdrop" role="presentation" onMouseDown={onClose}><form className="calendar-detail schedule-call" role="dialog" aria-modal="true" aria-label="Agendar llamada" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
    <div className="calendar-detail__header"><h2>Agendar llamada</h2><button type="button" className="calendar-detail__close" onClick={onClose} aria-label="Cerrar">×</button></div>
    {error && <p className="schedule-call__error">{error}</p>}<div className="schedule-call__grid">
      <label>Aplicante<select name="id_solicitud" required value={form.id_solicitud} onChange={change}><option value="">Seleccionar</option>{applicants.map((a) => <option key={a.id_solicitud} value={a.id_solicitud}>{a.aplicante || a.nombre_cliente || `Solicitud #${a.id_solicitud}`}</option>)}</select></label>
      <label>Responsable<select name="id_empleado_responsable" required value={form.id_empleado_responsable} onChange={change}><option value="">Seleccionar</option>{employees.map((e) => <option key={e.id_empleado} value={e.id_empleado}>{[e.nombre,e.apellidos].filter(Boolean).join(' ') || e.correo}</option>)}</select></label>
      <label>Grupo relacionado<select name="id_grupo_ama" value={form.id_grupo_ama} onChange={change}><option value="">Sin grupo</option>{groups.map((g) => <option key={g.id_grupo_ama} value={g.id_grupo_ama}>{g.nombre_grupo}</option>)}</select></label>
      <label>Tipo<select name="tipo" value={form.tipo} onChange={change}><option value="LLAMADA">Llamada</option><option value="PROTOCOLO">Llamada de protocolo</option><option value="ENTREVISTA_CONSULAR">Entrevista consular</option></select></label><label>Fecha<input name="fecha" type="date" required value={form.fecha} onChange={change} /></label><label>Hora<input name="hora" type="time" required value={form.hora} onChange={change} /></label>
      <label className="schedule-call__wide">Notas<textarea name="notas" rows="3" value={form.notas} onChange={change} /></label>
    </div><div className="calendar-detail__actions"><button type="button" onClick={onClose}>Cancelar</button><button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar llamada'}</button></div>
  </form></div>;
}
