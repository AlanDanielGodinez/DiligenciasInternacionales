// Writes SQL for review only. No database connection or execution.
const fs = require('fs');
const path = require('path');
const structure = require('../src/templates/perfilVisaIndividualV3.template');
const json = JSON.stringify(structure, null, 2);
const sql = `-- Source for id_tipo_tramite=20: scripts/seed-perfil-visa-individual-v2.js.
-- Verify this mapping against the real catalog before executing this file.
-- V3 is for new profiles; V2 and existing profile links remain untouched.
BEGIN;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.tipos_tramite WHERE id_tipo_tramite=20 AND activo=true) THEN
    RAISE EXCEPTION 'Visa Individual tipo_tramite 20 is absent or inactive';
  END IF;
END $$;
DO $check$ BEGIN
  IF EXISTS (
    SELECT 1 FROM public.perfil_plantillas p WHERE p.clave='perfil_visa_individual_v3'
      AND (p.version IS DISTINCT FROM 3
        OR p.id_tipo_tramite IS DISTINCT FROM 20
        OR p.id_pais IS NOT NULL
        OR p.activo IS DISTINCT FROM true
        OR p.estructura_json IS DISTINCT FROM $visa$${json}$visa$::jsonb)
  ) THEN
    RAISE EXCEPTION 'Existing Visa Individual V3 differs; inspect without overwriting';
  END IF;
END $check$;
INSERT INTO public.perfil_plantillas
  (nombre,clave,version,activo,id_tipo_tramite,id_pais,estructura_json,creado_en,actualizado_en)
VALUES ('Perfil Visa Individual V3','perfil_visa_individual_v3',3,true,20,NULL,
  $visa$${json}$visa$::jsonb,NOW(),NOW())
ON CONFLICT (clave) DO NOTHING;
COMMIT;
`;
fs.writeFileSync(path.join(__dirname, '../sql/2026_09_18_perfil_visa_individual_v3.sql'), sql);
