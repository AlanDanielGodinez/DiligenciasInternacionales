import React,{useEffect,useState} from 'react';
import api from '../../lib/api';
import {activityDate} from './AmaActivitySummary';
export default function SolicitudReviewNotes({solicitud}) {
  const [notes,setNotes]=useState([]),[content,setContent]=useState(''),[error,setError]=useState(''),[saving,setSaving]=useState(false);
  const [loading,setLoading]=useState(true);
  const id=solicitud.id_solicitud;
  useEffect(()=>{
    let active=true;setNotes([]);setContent('');setError('');setLoading(true);
    api.get(`/solicitudes/${id}/notas`).then(({data})=>{if(active)setNotes(data);})
      .catch(()=>{if(active)setError('No fue posible cargar las notas.');})
      .finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[id]);
  const submit=async event=>{
    event.preventDefault();setSaving(true);setError('');
    try {
      const {data}=await api.post(`/solicitudes/${id}/notas`,{contenido:content},
        {headers:{Authorization:`Bearer ${localStorage.getItem('authToken') || ''}`}});
      setNotes(previous=>[data,...previous]);setContent('');
    } catch(e) {setError(e.response?.data?.error?.message || 'No fue posible guardar la nota.');}
    finally {setSaving(false);}
  };
  return <section className="solicitudes-nuevo-profile-card">
    <h2>Notas del Revisor</h2>
    {loading && <p>Cargando notas...</p>}
    {error && <p role="alert">{error}</p>}
    <form onSubmit={submit}>
      <label>Nueva nota<textarea required maxLength={10000} value={content} onChange={e=>setContent(e.target.value)} /></label>
      <button disabled={loading || saving || !content.trim()}>{saving?'Guardando...':'Agregar nota'}</button>
    </form>
    {notes.map(note=><article className="solicitudes-nuevo-review-note" key={note.id_nota}>
      <strong>{note.autor_nombre_historico || [note.autor_nombre_actual,note.autor_apellidos_actual].filter(Boolean).join(' ') || 'Autor no registrado'}</strong>
      <p>{activityDate(note.creado_en)} · Área: {note.area_historica || (note.area_actual ? `${note.area_actual} (actual; área histórica no registrada)` : 'No registrada')}</p>
      <p style={{whiteSpace:'pre-wrap'}}>{note.contenido}</p>
    </article>)}
    {solicitud.observaciones && <article className="solicitudes-nuevo-review-note">
      <strong>Observaciones heredadas</strong><p>Autor, fecha y área originales no registrados.</p>
      <p style={{whiteSpace:'pre-wrap'}}>{solicitud.observaciones}</p>
    </article>}
  </section>;
}
