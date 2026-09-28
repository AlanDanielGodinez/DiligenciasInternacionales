import React from 'react';
export const activityDate = value => {
  if (!value) return 'Sin fecha verificable';
  const [year,month,day]=String(value).slice(0,10).split('-');
  return `${day}/${month}/${year}`;
};
export default function AmaActivitySummary({state}) {
  if (!state) return <p>No fue posible verificar la actividad.</p>;
  return <div>
    <strong>{state.elegible_por_actividad ? 'Elegible' : 'Requiere actualización'}</strong>
    <p>Último movimiento: {activityDate(state.ultima_actividad_valida)}</p>
    <p>Actividad: {state.tipo_ultima_actividad || 'Sin actividad verificable'}</p>
    {!state.elegible_por_actividad && <>
      <strong>No disponible para asignación a grupo</strong>
      <p>{state.motivo_bloqueo === 'SIN_FECHA_BASE' ? 'No existe una fecha base confiable de asignación de asesor.' :
        state.motivo_bloqueo === 'FECHA_BASE_FUTURA' ? 'La fecha base está en el futuro y requiere revisión.' :
        'El expediente supera el periodo permitido sin actividad. Debe actualizarse antes de asignarlo a un grupo.'}</p>
    </>}
    <p>Estado del último pago: {state.ultimo_pago_estado || 'Sin pagos registrados'}</p>
  </div>;
}
