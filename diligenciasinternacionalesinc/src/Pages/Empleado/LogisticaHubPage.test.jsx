import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom', () => ({ Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a> }), { virtual: true });
const LogisticaHubPage = require('./LogisticaHubPage').default;

test('presenta logística como galería y enlaza los módulos reales', () => {
  render(<LogisticaHubPage />);
  expect(screen.getByRole('heading', { name: 'Operación de viajes' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Vuelos/ })).toHaveAttribute('href', '/empleado/viajes/vuelos');
  expect(screen.getByRole('link', { name: /Tours/ })).toHaveAttribute('href', '/empleado/viajes/tours');
  expect(screen.getByRole('link', { name: /Grupos de viaje/ })).toHaveAttribute('href', '/empleado/viajes/grupos');
  expect(screen.getAllByRole('link')).toHaveLength(6);
});
