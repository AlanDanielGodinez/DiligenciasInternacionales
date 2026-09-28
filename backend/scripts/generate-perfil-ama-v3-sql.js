// Creates a reviewable SQL file only. It never connects to PostgreSQL.
const fs = require('fs');
const path = require('path');
const structure = require('../src/templates/perfilAmaV3.template');
const names = ['costa_rica', 'el_salvador', 'guatemala', 'honduras', 'mexico', 'panama'];
const values = names.map((name, index) => `(${index + 1},'${name}')`).join(',');
const json = JSON.stringify(structure, null, 2);
const sql = `-- Revisar IDs de tipos_tramite contra el esquema real antes de ejecutar.
-- Sólo publica V3 para perfiles nuevos; no altera V2 ni perfiles históricos.
BEGIN;
DO $$ BEGIN
  IF (SELECT COUNT(*) FROM public.tipos_tramite WHERE id_tipo_tramite IN (1,2,3,4,5,6)) <> 6 THEN
    RAISE EXCEPTION 'Faltan tipos_tramite AMA esperados; revisar IDs antes de publicar V3';
  END IF;
END $$;
DO $check$ BEGIN
  IF EXISTS (
    SELECT 1 FROM public.perfil_plantillas p
    JOIN (VALUES ${values}) AS t(id,nombre) ON p.clave = 'perfil_ama_'||t.nombre||'_v3'
    WHERE p.version IS DISTINCT FROM 3
       OR p.estructura_json IS DISTINCT FROM $ama$${json}$ama$::jsonb
       OR p.id_tipo_tramite IS DISTINCT FROM t.id
       OR p.id_pais IS NOT NULL
       OR p.activo IS DISTINCT FROM true
  ) THEN
    RAISE EXCEPTION 'Existe una clave AMA V3 con contenido diferente; revisar sin sobrescribir';
  END IF;
END $check$;
INSERT INTO public.perfil_plantillas
  (nombre,clave,version,activo,id_tipo_tramite,id_pais,estructura_json,creado_en,actualizado_en)
SELECT 'Perfil AMA '||t.nombre||' V3','perfil_ama_'||t.nombre||'_v3',3,true,t.id,NULL,
$ama$${json}$ama$::jsonb,NOW(),NOW()
FROM (VALUES ${values}) AS t(id,nombre)
ON CONFLICT (clave) DO NOTHING;
COMMIT;
`;
fs.writeFileSync(path.join(__dirname, '../sql/2026_09_18_perfil_ama_v3.sql'), sql);
