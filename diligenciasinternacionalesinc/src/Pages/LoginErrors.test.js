import { fireEvent, render, screen } from '@testing-library/react';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ search: '' }),
}), { virtual: true });
jest.mock('axios', () => ({ post: jest.fn(), get: jest.fn() }));

const axios = require('axios');
const Login = require('./Login').default;

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

const submit = (email, password) => {
  fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: password } });
  fireEvent.submit(screen.getByPlaceholderText('Correo electrónico').closest('form'));
};

test('muestra el mensaje del backend cuando la contraseña es incorrecta (antes se intentaba renderizar un objeto)', async () => {
  axios.post.mockRejectedValue({ response: { status: 401, data: { error: { code: 'INVALID_CREDENTIALS', message: 'Usuario o contraseña incorrectos' } } } });
  render(<Login />);
  submit('ana@example.test', 'incorrecta');
  expect(await screen.findByText('Usuario o contraseña incorrectos')).toBeInTheDocument();
  expect(localStorage.getItem('authToken')).toBeNull();
});

test('con contraseña temporal redirige a cambiarla', async () => {
  axios.post.mockResolvedValue({ data: { token: 'p.s', user: { id_empleado: 1 }, debe_cambiar_password: true } });
  render(<Login />);
  submit('ana@example.test', 'Temporal12345');
  await screen.findByPlaceholderText('Correo electrónico');
  await new Promise((r) => setTimeout(r, 0));
  expect(mockNavigate).toHaveBeenCalledWith('/cambiar-password', { replace: true });
  expect(localStorage.getItem('authToken')).toBe('p.s');
});
