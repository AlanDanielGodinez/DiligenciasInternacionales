import React from 'react';
import {render,screen} from '@testing-library/react';
import AmaActivitySummary,{activityDate} from './AmaActivitySummary';
test('muestra bloqueo recibido del backend sin recalcular fechas',()=>{
  render(<AmaActivitySummary state={{elegible_por_actividad:false,ultima_actividad_valida:'2026-03-10 12:00:00',motivo_bloqueo:'SIN_ACTIVIDAD_6_MESES',ultimo_pago_estado:'rechazado'}}/>);
  expect(screen.getByText('No disponible para asignación a grupo')).toBeTruthy();
  expect(screen.getByText('Último movimiento: 10/03/2026')).toBeTruthy();
  expect(screen.getByText('Estado del último pago: rechazado')).toBeTruthy();
});
test('fecha base ausente tiene explicación propia',()=>{
  render(<AmaActivitySummary state={{elegible_por_actividad:false,motivo_bloqueo:'SIN_FECHA_BASE'}}/>);
  expect(screen.getByText('No existe una fecha base confiable de asignación de asesor.')).toBeTruthy();
  expect(activityDate('2026-09-10T00:00:00Z')).toBe('10/09/2026');
});
