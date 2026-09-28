BEGIN;

UPDATE public.perfil_plantillas
SET estructura_json = jsonb_set(
      estructura_json,
      '{documentos_requeridos}',
      '[{"clave":"curp","nombre":"CURP","obligatorio":true},{"clave":"respaldo","nombre":"Respaldo","obligatorio":false,"grupo":"respaldo_ds","grupo_nombre":"Respaldo y DS"},{"clave":"ds","nombre":"DS","obligatorio":false,"grupo":"respaldo_ds","grupo_nombre":"Respaldo y DS"}]'::jsonb,
      true
    ),
    actualizado_en = NOW()
WHERE clave IN ('perfil_visa_individual','perfil_visa_individual_v2','perfil_visa_individual_v3')
  AND NOT (estructura_json ? 'documentos_requeridos');

COMMIT;
