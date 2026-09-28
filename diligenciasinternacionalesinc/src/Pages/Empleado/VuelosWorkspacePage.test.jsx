import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import VuelosWorkspacePage from './VuelosWorkspacePage';

jest.mock('./ViajesCalendarioPage', () => () => <div>Calendario operativo de vuelos</div>);
jest.mock('./VuelosPage', () => () => <div>Lista administrativa de vuelos</div>);

test('abre calendario por defecto y conserva la lista secundaria', () => {
  render(<VuelosWorkspacePage />);
  expect(screen.getByText('Calendario operativo de vuelos')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Lista' }));
  expect(screen.getByText('Lista administrativa de vuelos')).toBeInTheDocument();
});
