// Generates review-only SQL. This file never opens a database connection.
const fs = require('fs');
const path = require('path');
const { buildPassportTemplate } = require('../src/templates/perfilPasaporteV2.template');

const targets = [
  { country: 'México', legacy: 'perfil_pasaporte_mexico', key: 'perfil_pasaporte_mexico_v2', name: 'Perfil Pasaporte México V2' },
  { country: 'Guatemala', legacy: 'perfil_pasaporte_guatemala', key: 'perfil_pasaporte_guatemala_v2', name: 'Perfil Pasaporte Guatemala V2' },
];
const blocks = targets.map((target, index) => {
  const json = JSON.stringify(buildPassportTemplate(target.country), null, 2);
  const tag = `passport_${index + 1}`;
  return `DO $${tag}$
DECLARE
  source_template public.perfil_plantillas%ROWTYPE;
  current_template public.perfil_plantillas%ROWTYPE;
  expected_json jsonb := $json_${index + 1}$${json}$json_${index + 1}$::jsonb;
BEGIN
  SELECT * INTO source_template FROM public.perfil_plantillas
  WHERE clave='${target.legacy}' AND activo=true LIMIT 1;
  IF source_template.id_plantilla IS NULL THEN
    RAISE EXCEPTION 'Active legacy mapping ${target.legacy} is required; catalog IDs were not guessed';
  END IF;
  SELECT * INTO current_template FROM public.perfil_plantillas
  WHERE clave='${target.key}' LIMIT 1;
  IF current_template.id_plantilla IS NOT NULL THEN
    IF current_template.version IS DISTINCT FROM 2
      OR current_template.id_tipo_tramite IS DISTINCT FROM source_template.id_tipo_tramite
      OR current_template.id_pais IS DISTINCT FROM source_template.id_pais
      OR current_template.activo IS DISTINCT FROM true
      OR current_template.estructura_json IS DISTINCT FROM expected_json THEN
      RAISE EXCEPTION 'Existing ${target.key} differs; inspect without overwriting';
    END IF;
  ELSE
    INSERT INTO public.perfil_plantillas
      (nombre,clave,version,activo,id_tipo_tramite,id_pais,estructura_json,creado_en,actualizado_en)
    VALUES ('${target.name}','${target.key}',2,true,source_template.id_tipo_tramite,
      source_template.id_pais,expected_json,NOW(),NOW());
  END IF;
END $${tag}$;`;
}).join('\n\n');

const sql = `-- Review only. V1 mappings supply catalog IDs; no IDs are guessed.
-- V2 is selected only for new profiles. Existing profiles keep id_plantilla V1.
BEGIN;
${blocks}
COMMIT;
`;
fs.writeFileSync(path.join(__dirname,'../sql/2026_09_22_perfil_pasaporte_v2.sql'),sql);
