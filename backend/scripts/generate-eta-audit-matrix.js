// Documentation generator only. No database connection.
const fs=require('fs');
const path=require('path');
const {rows,summary,meaningful}=require('../.tmp/extract-eta-rules');
const template=require('../src/templates/perfilEtaV1.template');
const represented=new Set(template.sections.flatMap(section=>section.fields).map(field=>field.source_column));
const escape=value=>String(value??'—').replace(/\|/g,'\\|').replace(/\r?\n/g,' ');
const rule=value=>meaningful(value)?value.replace(/^"|"$/g,'').replace(/\\"/g,'"'):'—';
const section=number=>number<=3?'Técnico':number<=6?'Pasaporte':number<=9?'Visa':number<=19?'Datos personales':number<=24?'Empleo':number<=30?'Domicilio':number<=33?'Viaje':number<=39?'Antecedentes':'Virtual / navegación';
const lines=['# ETA — matriz AppSheet 2026-09-22','',
  'Fuente: `docs/appsheet/Application Documentation Visas inv.pdf`, esquema `PERFIL ETA_Schema`. Las expresiones partidas entre páginas se reconstruyeron antes del conteo.','',
  `Conteo: ${summary.total} columnas; ${summary.physical} físicas; ${summary.virtual} virtuales; ${summary.show} Show_If; ${summary.required} Required_If; ${summary.valid} Valid_If; ${summary.editable} Editable_If; ${summary.reset} Reset_If; ${summary.suggested} Suggested Values; ${summary.refs} Ref; ${summary.lists} listas virtuales; 0 repetibles.`, '',
  '| AppSheet | Display name | Tipo | Sección | Show_If | Required_If | Valid_If | Editable_If | Reset_If | Suggestions | Virtual | Ref | Clave React actual | Estado |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|'];
for(const row of rows){
  let status=row.virtual?'VIRTUAL_NO_CAPTURA':row.number===3?'RELACIONAL':row.number<=2?'REQUIERE_DECISIÓN':represented.has(row.name)?'FALTA':'REQUIERE_DECISIÓN';
  lines.push(`| ${escape(row.name)} | ${escape(row.display||'—')} | ${row.type} | ${section(row.number)} | ${escape(rule(row.show))} | ${escape(rule(row.required))} | ${escape(rule(row.valid))} | ${escape(rule(row.editable))} | ${escape(rule(row.reset))} | ${escape(rule(row.suggested))} | ${row.virtual?'Sí':'No'} | ${escape(row.ref||'—')} | — | ${status} |`);
}
lines.push('','No existía plantilla React/JSON para ETA. `FALTA` describe el estado anterior; los 36 campos de captura están representados por la nueva plantilla V1. Las tres primeras columnas son técnicas/relacionales y las seis virtuales no se convierten en inputs.','');
fs.writeFileSync(path.join(__dirname,'../../docs/perfiles/eta-appsheet-matriz-2026-09-22.md'),lines.join('\n'));
