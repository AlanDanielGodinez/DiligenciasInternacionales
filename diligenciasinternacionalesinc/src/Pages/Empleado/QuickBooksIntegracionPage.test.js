import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import QuickBooksIntegracionPage, { getConnectionPresentation } from './QuickBooksIntegracionPage';
import * as quickbooksApi from '../../services/quickbooks.service';

jest.mock('../../services/quickbooks.service', () => ({
  connectQuickBooks: jest.fn(),
  disconnectQuickBooks: jest.fn(),
  getPendingQuickBooksContacts: jest.fn(),
  getQuickBooksStatus: jest.fn(),
  syncContactToQuickBooks: jest.fn(),
}));
let mockLocation = { pathname: '/empleado/configuracion/quickbooks', search: '' };
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate,
}), { virtual: true });

const renderPage = (search = '') => {
  mockLocation = { pathname: '/empleado/configuracion/quickbooks', search };
  return render(<QuickBooksIntegracionPage />);
};

beforeEach(() => {
  jest.clearAllMocks();
  const payload = btoa(JSON.stringify({ rol: 'Administrador', exp: Math.floor(Date.now() / 1000) + 3600 }));
  localStorage.setItem('authToken', `${payload}.test-signature`);
  localStorage.setItem('user', JSON.stringify({ rol: 'Administrador' }));
  quickbooksApi.getPendingQuickBooksContacts.mockResolvedValue({ contactos: [] });
});

test('tolera connection null durante el render inicial', () => {
  expect(getConnectionPresentation(null)).toEqual({ key: 'not-configured', label: 'No configurado' });
});

test('muestra estado desconectado y boton Conectar', async () => {
  quickbooksApi.getQuickBooksStatus.mockResolvedValue({ configured: true, connected: false, environment: 'sandbox', status: 'disconnected', message: 'QuickBooks no está conectado' });
  renderPage();
  expect(await screen.findByText('Desconectado')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Conectar con QuickBooks/i })).toBeEnabled();
});

test('muestra estado conectado', async () => {
  quickbooksApi.getQuickBooksStatus.mockResolvedValue({ configured: true, connected: true, environment: 'sandbox', status: 'connected', message: 'QuickBooks está conectado' });
  renderPage();
  expect(await screen.findByText('Conectado')).toBeInTheDocument();
});

test('interpreta invalid_callback dentro de la pagina', async () => {
  quickbooksApi.getQuickBooksStatus.mockResolvedValue({ configured: true, connected: false, environment: 'sandbox', status: 'disconnected' });
  renderPage('?quickbooks=error&reason=invalid_callback');
  expect(await screen.findByText(/respuesta incompleta/i)).toBeInTheDocument();
});

test('boton Conectar solicita URL mediante API autenticable', async () => {
  quickbooksApi.getQuickBooksStatus.mockResolvedValue({ configured: true, connected: false, environment: 'sandbox', status: 'disconnected' });
  quickbooksApi.connectQuickBooks.mockRejectedValue(new Error('navigation intentionally stopped'));
  renderPage();
  const button = await screen.findByRole('button', { name: /Conectar con QuickBooks/i });
  fireEvent.click(button);
  await waitFor(() => expect(quickbooksApi.connectQuickBooks).toHaveBeenCalledTimes(1));
});
