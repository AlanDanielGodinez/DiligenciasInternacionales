// Documentation generator only. No database connection or schema mutation.
const fs=require('fs');
const path=require('path');
const {primary,negados}=require('../.tmp/extract-visa-canadiense-rules');
const technical=new Set([1,2,3]);
const canonical=new Set([4,5,11,17,19]);
const credentials=new Set([12,13,14]);
const operational=new Set([6,7,8,9,10,15,16,18,20,21,22,23,24,25]);
const escape=value=>String(value??'—').replace(/\|/g,'\\|').replace(/\r?\n/g,' ');
const rule=(value,meaningful)=>meaningful(value)?value.replace(/^"|"$/g,'').replace(/\\"/g,'"'):'—';
const lines=['# Visa Canadiense — matriz AppSheet 2026-09-22','',
  'Fuente autoritativa: `docs/appsheet/Application Documentation Visas inv.pdf`, esquema `VISA CANADIENSE_Schema`. La copia de `Application Documentation Negados.pdf` se auditó como contraste: conserva 25 columnas físicas, sin virtuales ni Ref tipados, y degrada la mayoría de tipos a Text.','',
  `Conteo principal: ${primary.summary.total} columnas; ${primary.summary.physical} físicas; ${primary.summary.virtual} virtual; ${primary.summary.show} Show_If; ${primary.summary.required} Required_If; ${primary.summary.valid} Valid_If; ${primary.summary.editable} Editable_If; ${primary.summary.reset} Reset_If; ${primary.summary.suggested} Suggested Values; ${primary.summary.refs} Ref; ${primary.summary.lists} listas virtuales; 0 repetibles.`, '',
  '| AppSheet | Display name | Tipo | Sección | Show_If | Required_If | Valid_If | Editable_If | Reset_If | Suggested Values | Virtual | Ref | Relación | Clave React actual | Estado |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|'];
for(const row of primary.rows){
  let section='Operación del trámite',status='REQUIERE_DECISIÓN',relation='—';
  if(row.virtual){section='Cálculo';status='VIRTUAL_NO_CAPTURA';}
  else if(technical.has(row.number)){section='Técnico';status=row.number===3?'REQUIERE_DECISIÓN':'REQUIERE_DECISIÓN';}
  else if(canonical.has(row.number)){section='Datos canónicos del cliente';status='REQUIERE_DECISIÓN';}
  else if(credentials.has(row.number)){section='Credenciales / acceso';status='REQUIERE_DECISIÓN';}
  else if(operational.has(row.number)){section='Operación del trámite';status=row.ref?'RELACIONAL':'REQUIERE_DECISIÓN';}
  if(row.ref)relation=`Ref a ${row.ref}`;
  lines.push(`| ${escape(row.name)} | ${escape(row.display||'—')} | ${row.type} | ${section} | ${escape(rule(row.show,primary.meaningful))} | ${escape(rule(row.required,primary.meaningful))} | ${escape(rule(row.valid,primary.meaningful))} | ${escape(rule(row.editable,primary.meaningful))} | ${escape(rule(row.reset,primary.meaningful))} | ${escape(rule(row.suggested,primary.meaningful))} | ${row.virtual?'Sí':'No'} | ${escape(row.ref||'—')} | ${escape(relation)} | — | ${status} |`);
}
lines.push('',`Contraste Negados: ${negados.summary.total} columnas, ${negados.summary.physical} físicas, ${negados.summary.virtual} virtuales, ${negados.summary.refs} Ref tipados. No se usa como contrato del formulario porque es una copia operativa con pérdida de tipos.`,'',
  'No existe una tabla documental de perfil/cuestionario de Visa Canadiense con preguntas de pasaporte, ciudadanía, familiares, viajes, empleo, educación, finanzas o antecedentes. Por ello no se genera una plantilla dinámica a partir de esta tabla operativa.','');
fs.writeFileSync(path.join(__dirname,'../../docs/perfiles/visa-canadiense-appsheet-matriz-2026-09-22.md'),lines.join('\n'));
module.exports={technical,canonical,credentials,operational};
