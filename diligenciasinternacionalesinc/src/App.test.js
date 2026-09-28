import fs from 'fs';
import path from 'path';

test('registra la ruta React de configuracion QuickBooks', () => {
  const source = fs.readFileSync(path.join(__dirname, 'App.js'), 'utf8');
  expect(source).toContain('path="/empleado/configuracion/quickbooks"');
  expect(source).toContain('element={<QuickBooksIntegracionPage />}');
});
