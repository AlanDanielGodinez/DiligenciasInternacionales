// Generates a reviewable migration. Does not connect to a database.
const fs=require('fs');
const path=require('path');
const structure=require('../src/templates/perfilAmaV2.template');
const names=['costa_rica','el_salvador','guatemala','honduras','mexico','panama'];
const values=names.map((name,index)=>"("+(index+1)+",'"+name+"')").join(',');
const sql="-- Solo plantillas nuevas; no cambia plantillas, respuestas o versiones hist?ricas.\nBEGIN;\n"+
 "INSERT INTO public.perfil_plantillas (nombre,clave,version,activo,id_tipo_tramite,id_pais,estructura_json,creado_en,actualizado_en)\n"+
 "SELECT 'Perfil AMA '||t.nombre||' V2','perfil_ama_'||t.nombre||'_v2',2,true,t.id,NULL,\n"+
 "$ama$"+JSON.stringify(structure,null,2)+"$ama$::jsonb,NOW(),NOW()\n"+
 "FROM (VALUES "+values+") AS t(id,nombre)\n"+
 "WHERE EXISTS (SELECT 1 FROM public.tipos_tramite WHERE id_tipo_tramite=t.id)\n"+
 "ON CONFLICT (clave) DO NOTHING;\nCOMMIT;\n";
fs.writeFileSync(path.join(__dirname,'../sql/2026_09_10_perfil_ama_v2.sql'),sql);
