import { render, screen, waitFor } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  Navigate: ({ to }) => <div>redirige a {to}</div>,
  Outlet: () => <div>contenido protegido</div>,
  useLocation: () => ({ pathname: '/empleado/clientes', search: '' }),
}), { virtual: true });
jest.mock('../Sidebar', () => () => <nav>menu</nav>);
jest.mock('../../lib/api', () => ({ get: jest.fn() }));
jest.mock('axios', () => ({ interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } } }));

const api = require('../../lib/api');
const EmpleadoLayout = require('./EmpleadoLayout').default;

const tokenWith = (exp) => `${btoa(JSON.stringify({ id_empleado: 1, exp }))}.firma`;

beforeEach(() => {
  localStorage.clear();
  api.get.mockReset();
});

test('sin sesión redirige a login y no muestra la aplicación', () => {
  render(<EmpleadoLayout />);
  expect(screen.getByText(/redirige a \/login/)).toBeInTheDocument();
  expect(screen.queryByText('contenido protegido')).not.toBeInTheDocument();
  expect(api.get).not.toHaveBeenCalled();
});

test('token vencido redirige a login', () => {
  localStorage.setItem('authToken', tokenWith(10));
  render(<EmpleadoLayout />);
  expect(screen.getByText(/redirige a \/login/)).toBeInTheDocument();
});

test('con sesión válida confirmada por el backend muestra la aplicación', async () => {
  localStorage.setItem('authToken', tokenWith(Math.floor(Date.now() / 1000) + 3600));
  api.get.mockResolvedValue({ data: { user: { id_empleado: 1, rol: 'Administrador' } } });
  render(<EmpleadoLayout />);
  expect(await screen.findByText('contenido protegido')).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith('/auth/me');
});

test('si el backend rechaza el token, limpia la sesión y redirige', async () => {
  localStorage.setItem('authToken', tokenWith(Math.floor(Date.now() / 1000) + 3600));
  api.get.mockRejectedValue({ response: { status: 401, data: { error: { code: 'TOKEN_REVOKED' } } } });
  render(<EmpleadoLayout />);
  await waitFor(() => expect(screen.getByText(/redirige a \/login/)).toBeInTheDocument());
  expect(localStorage.getItem('authToken')).toBeNull();
});

test('contraseña temporal obliga a ir a cambiarla', async () => {
  localStorage.setItem('authToken', tokenWith(Math.floor(Date.now() / 1000) + 3600));
  api.get.mockResolvedValue({ data: { user: { id_empleado: 1, debe_cambiar_password: true } } });
  render(<EmpleadoLayout />);
  expect(await screen.findByText(/redirige a \/cambiar-password/)).toBeInTheDocument();
});
