jest.mock('react-router-dom', () => ({
  Link: ({ children }) => children,
  useLocation: () => ({ pathname: '/home' }),
  useNavigate: () => jest.fn(),
}), { virtual: true });

const { getSidebarRole, getMenuItemsByRole } = require('./Sidebar');

test('un rol o área no reconocidos ya no reciben el menú de administrador', () => {
  expect(getSidebarRole({ rol: 'Recepción' })).toBe('SIN_ROL');
  expect(getMenuItemsByRole({ rol: 'Recepción' }).map((m) => m.title)).toEqual(['Dashboard']);
  expect(getSidebarRole({})).toBe('SIN_ROL');
});

test('roles conocidos conservan su menú; Protocolo ve AMA', () => {
  expect(getSidebarRole({ rol: 'Administrador' })).toBe('ADMIN');
  expect(getSidebarRole({ area: 'Administración' })).toBe('ADMIN');
  expect(getSidebarRole({ rol: 'Auxiliar de finanzas' })).toBe('FINANZAS');
  expect(getMenuItemsByRole({ area: 'Protocolo' }).map((m) => m.title)).toEqual(['Dashboard', 'AMA', 'Aplicantes']);
});
