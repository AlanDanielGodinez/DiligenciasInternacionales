import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import LegalProcessCard from './LegalProcessCard';
import { getLegalesSolicitud } from '../../services/legales.service';
import { getEmpleados, getTiposTramite } from '../../services/configuracion.service';

jest.mock('../../services/legales.service', () => ({
  getLegalesSolicitud: jest.fn(), updateLegal: jest.fn(), addActividadLegal: jest.fn(),
  addNotaLegal: jest.fn(), resolverLegal: jest.fn(), regresarLegal: jest.fn(),
  cerrarLegal: jest.fn(), crearSolicitudLegal: jest.fn(),
}));
jest.mock('../../services/configuracion.service', () => ({ getEmpleados: jest.fn(() => Promise.resolve([])), getTiposTramite: jest.fn(() => Promise.resolve([])) }));
jest.mock('../../utils/authUser', () => ({ getCurrentEmployeeId: () => 9 }));

const active = {
  active: {
    process: { id_proceso: 4, estado_proceso: 'EN_ANALISIS', origen: 'NEGADOS_INDIVIDUALES', servicio_legal: 'Análisis legal', fecha_entrada: '2026-09-01', responsable_nombre: 'Ana', responsable_apellidos: 'Legal' },
    activities: [{ id_actividad: 1, tipo: 'LLAMADA', fecha_actividad: '2026-09-02', descripcion: 'Contacto registrado' }],
    notes: [{ id_nota: 2, contenido: 'Nota aislada del caso' }],
  },
  history: [{ id_proceso: 3, estado_proceso: 'CERRADO', fecha_entrada: '2026-08-01' }],
};

beforeEach(() => {
  jest.clearAllMocks();
  getEmpleados.mockResolvedValue([]);
  getTiposTramite.mockResolvedValue([]);
});

test('renders the active case, its responsible person, activity, note and history', async () => {
  getLegalesSolicitud.mockResolvedValue(active);
  render(<LegalProcessCard solicitud={{ id_solicitud: 10 }} />);
  expect(await screen.findByText('Ana Legal')).toBeInTheDocument();
  expect(screen.getByText((_, element) => element.tagName === 'P' && element.textContent.includes('Contacto registrado'))).toBeInTheDocument();
  expect(screen.getByText('Nota aislada del caso')).toBeInTheDocument();
  expect(screen.getByText(/Procesos Legal anteriores/)).toBeInTheDocument();
});

test('a closed case does not expose operational mutation actions', async () => {
  getLegalesSolicitud.mockResolvedValue({ active: { process: { ...active.active.process, estado_proceso: 'CERRADO' }, activities: [], notes: [] }, history: [] });
  render(<LegalProcessCard solicitud={{ id_solicitud: 11 }} />);
  await screen.findByText('Terminado');
  expect(screen.queryByText('Registrar contacto o actividad')).not.toBeInTheDocument();
  expect(screen.queryByText('Registrar conclusión')).not.toBeInTheDocument();
});

test('does not render a Legal card for a request without an active Legal case', async () => {
  getLegalesSolicitud.mockResolvedValue({ active: null, history: [] });
  const { container } = render(<LegalProcessCard solicitud={{ id_solicitud: 12 }} />);
  await waitFor(() => expect(getLegalesSolicitud).toHaveBeenCalledWith(12));
  expect(container).toBeEmptyDOMElement();
});
