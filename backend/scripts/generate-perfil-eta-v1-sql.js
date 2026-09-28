// Generates review-only SQL. It never connects to PostgreSQL.
const fs=require('fs');
const path=require('path');
const template=require('../src/templates/perfilEtaV1.template');
const json=JSON.stringify(template,null,2);
const sql=`-- Review only. Resolve the active ETA catalog row by name; do not guess an ID.
-- The country is NULL because ETA's audited form is not country-specific.
BEGIN;
DO $eta_v1$
DECLARE
  eta_type_id integer;
  eta_type_count integer;
  current_template public.perfil_plantillas%ROWTYPE;
  expected_json jsonb := $eta_json$${json}$eta_json$::jsonb;
BEGIN
  SELECT count(*), min(id_tipo_tramite) INTO eta_type_count, eta_type_id
  FROM public.tipos_tramite
  WHERE activo=true AND lower(trim(nombre_tramite)) IN ('eta','e.t.a.','e-t-a');
  IF eta_type_count <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one active ETA tipo_tramite; found %', eta_type_count;
  END IF;
  SELECT * INTO current_template FROM public.perfil_plantillas
  WHERE clave='perfil_eta_v1' LIMIT 1;
  IF current_template.id_plantilla IS NOT NULL THEN
    IF current_template.version IS DISTINCT FROM 1
      OR current_template.id_tipo_tramite IS DISTINCT FROM eta_type_id
      OR current_template.id_pais IS NOT NULL
      OR current_template.activo IS DISTINCT FROM true
      OR current_template.estructura_json IS DISTINCT FROM expected_json THEN
      RAISE EXCEPTION 'Existing perfil_eta_v1 differs; inspect without overwriting';
    END IF;
  ELSE
    INSERT INTO public.perfil_plantillas
      (nombre,clave,version,activo,id_tipo_tramite,id_pais,estructura_json,creado_en,actualizado_en)
    VALUES ('Perfil ETA V1','perfil_eta_v1',1,true,eta_type_id,NULL,expected_json,NOW(),NOW());
  END IF;
END $eta_v1$;
COMMIT;
`;
fs.writeFileSync(path.join(__dirname,'../sql/2026_09_22_perfil_eta_v1.sql'),sql);
