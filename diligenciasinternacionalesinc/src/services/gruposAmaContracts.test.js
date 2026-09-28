import api from '../lib/api';
import {
  addSolicitudesGrupoAma,
  createGrupoAma,
  getCandidatosGrupoAma,
  getGrupoAma,
  getGrupoAmaChecklist,
  removeSolicitudGrupoAma,
} from './gruposAma.service';

jest.mock('../lib/api', () => ({ get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() }));

test('crea grupo por el contrato canónico', async () => {
  api.post.mockResolvedValue({ data: { id_grupo_ama: 4 } });
  await expect(createGrupoAma({ nombre_grupo: 'Grupo 4' })).resolves.toEqual({ id_grupo_ama: 4 });
  expect(api.post).toHaveBeenCalledWith('/grupos-ama', { nombre_grupo: 'Grupo 4' });
});
test('consulta detalle y checklist por grupo', async () => {
  api.get.mockResolvedValueOnce({ data: { id_grupo_ama: 4 } }).mockResolvedValueOnce({ data: [{ id_checklist: 1 }] });
  await getGrupoAma(4); await getGrupoAmaChecklist(4);
  expect(api.get).toHaveBeenNthCalledWith(1, '/grupos-ama/4');
  expect(api.get).toHaveBeenNthCalledWith(2, '/grupos-ama/4/checklist');
});
test('consulta candidatos con filtros', async () => {
  api.get.mockResolvedValue({ data: [] });
  await getCandidatosGrupoAma({ q: 'Ana' });
  expect(api.get).toHaveBeenCalledWith('/grupos-ama/candidatos', { params: { q: 'Ana' } });
});
test('agrega solicitudes sin copiar clientes', async () => {
  api.post.mockResolvedValue({ data: { agregadas: [8, 9] } });
  await addSolicitudesGrupoAma(4, [8, 9]);
  expect(api.post).toHaveBeenCalledWith('/grupos-ama/4/solicitudes', { id_solicitudes: [8, 9] });
});
test('retira mediante baja lógica del contrato de membresía', async () => {
  api.delete.mockResolvedValue({ data: { ok: true } });
  await removeSolicitudGrupoAma(4, 8);
  expect(api.delete).toHaveBeenCalledWith('/grupos-ama/4/solicitudes/8');
});
