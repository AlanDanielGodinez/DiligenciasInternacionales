import React,{useEffect,useState} from 'react';
import api from '../../lib/api';
import AmaActivitySummary from './AmaActivitySummary';
export default function AmaSolicitudActivity({idSolicitud}) {
  const [state,setState]=useState(null);
  useEffect(()=>{
    let active=true;
    const load=()=>api.get(`/solicitudes/${idSolicitud}/actividad-ama`)
      .then(({data})=>{if(active)setState(data);}).catch(()=>{if(active)setState(null);});
    load();window.addEventListener('focus',load);window.addEventListener('ama-actividad-actualizada',load);
    return ()=>{active=false;window.removeEventListener('focus',load);window.removeEventListener('ama-actividad-actualizada',load);};
  },[idSolicitud]);
  return <section className="solicitudes-nuevo-profile-card"><h2>Actividad AMA</h2><AmaActivitySummary state={state}/></section>;
}
