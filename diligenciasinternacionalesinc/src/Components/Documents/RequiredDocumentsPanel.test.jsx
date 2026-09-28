import React from 'react';
import { render, screen } from '@testing-library/react';
import RequiredDocumentsPanel from './RequiredDocumentsPanel';

const build = (respaldo = null, ds = null) => [{ clave: 'curp', nombre: 'CURP', obligatorio: true, estado: 'pendiente', documento: null },{ clave: 'respaldo', nombre: 'Respaldo', obligatorio: false, grupo: 'respaldo_ds', grupo_nombre: 'Respaldo y DS', estado: respaldo ? 'subido' : 'pendiente', documento: respaldo },{ clave: 'ds', nombre: 'DS', obligatorio: false, grupo: 'respaldo_ds', grupo_nombre: 'Respaldo y DS', estado: ds ? 'subido' : 'pendiente', documento: ds }];
const props = { uploading: {}, onPick: jest.fn(), onUpload: jest.fn(), onPreview: jest.fn(), onDownload: jest.fn(), formatDate: () => '24/09/2026' };

test('renderiza CURP requerida y Respaldo/DS en una sola tarjeta con dos uploaders', () => { const { container } = render(<RequiredDocumentsPanel {...props} requirements={build()} />); expect(screen.getByText('CURP')).toBeInTheDocument(); expect(screen.getByText('Requerido')).toBeInTheDocument(); expect(screen.getByText('Respaldo y DS')).toBeInTheDocument(); expect(screen.getByText('0/2 archivos')).toBeInTheDocument(); expect(container.querySelectorAll('article')).toHaveLength(2); expect(container.querySelectorAll('input[type="file"]')).toHaveLength(3); });
test.each([[{ nombre_documento: 'respaldo.pdf', fecha_subida: '2026-09-24' }, null, '1/2 archivos'],[{ nombre_documento: 'respaldo.pdf', fecha_subida: '2026-09-24' },{ nombre_documento: 'ds.pdf', fecha_subida: '2026-09-24' },'2/2 archivos']])('muestra progreso independiente del bloque', (respaldo, ds, label) => { render(<RequiredDocumentsPanel {...props} requirements={build(respaldo, ds)} />); expect(screen.getByText(label)).toBeInTheDocument(); });
