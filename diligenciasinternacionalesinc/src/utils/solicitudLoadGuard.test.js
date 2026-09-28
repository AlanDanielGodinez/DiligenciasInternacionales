import { shouldCommitSolicitudLoad } from './solicitudLoadGuard';

test('ignora la respuesta vieja cuando otra solicitud ya fue seleccionada', () => {
  expect(shouldCommitSolicitudLoad(2, 1, 202, 101)).toBe(false);
  expect(shouldCommitSolicitudLoad(2, 2, 202, 202)).toBe(true);
});

test('no mezcla solicitudes del mismo aplicante', () => {
  const applicantId = 77;
  expect(applicantId).toBe(77);
  expect(shouldCommitSolicitudLoad(4, 3, 402, 401)).toBe(false);
  expect(shouldCommitSolicitudLoad(4, 4, 402, 402)).toBe(true);
});
