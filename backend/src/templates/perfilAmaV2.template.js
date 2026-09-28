const legacy=require('./perfilAmaLegacy.template');
// Preserve answer keys and stored option values. Publish only for new profiles.
const template={
  schema_version:2,
  source:{document:'Application Documentation Formularios.pdf',audited_pages:'17–18; auditoría AMA 2026-09-07'},
  activation:{applies_to:'new_profiles_only',preserves_existing_profiles:true},
  sections:legacy.secciones.map((section,index)=>({id:`ama_${index+1}`,label:section.titulo,
    fields:section.campos.map(({name,...field})=>({...field,key:name}))})),
  documentos_requeridos:legacy.documentos_requeridos,
};
const general=template.sections[0].fields;
const other=general.find(f=>f.key==='otros_nombres_cual');
other.label='¿Cuál fue su otro nombre?';
other.type='textarea';
other.show_if={field:'ha_usado_otros_nombres',operator:'eq',value:'Sí'};
general.splice(general.indexOf(other),1);general.splice(1,0,other);
general.find(f=>f.key==='estado_civil').options=[
  {value:'Casado/a',label:'CASADO/A'}, {value:'Viudo/a',label:'VIUDO/A'},
  {value:'Soltero/a',label:'SOLTERO/A'}, {value:'Divorciado/a',label:'DIVORCIADO/A'},
  {value:'Separado/a',label:'LEGALMENTE SEPARADO/A'}, {value:'Unión libre',label:'UNION LIBRE'},
];
module.exports=template;
