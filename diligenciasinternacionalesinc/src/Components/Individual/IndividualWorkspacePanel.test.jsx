import {render,screen,waitFor} from '@testing-library/react';
import IndividualWorkspacePanel from './IndividualWorkspacePanel';
jest.mock('react-router-dom',()=>({Link:({to,children})=><a href={to}>{children}</a>}),{virtual:true});
jest.mock('../../services/finanzas.service',()=>({getPagosSolicitud:jest.fn(()=>Promise.resolve([]))}));
jest.mock('../../services/individualOperacion.service',()=>({getCitasIndividual:jest.fn(()=>Promise.resolve([])),getDsIndividual:jest.fn(()=>Promise.resolve([])),createDsIndividual:jest.fn(),setResultadoIndividual:jest.fn()}));
jest.mock('../../utils/authUser',()=>({getCurrentEmployeeId:()=>1}));
const base={id_solicitud:8,tipo_tramite:'Visa Individual',cliente_nombre:'Ana',responsable_nombre:'Rosa'};
test('workspace Visa presenta resumen, próxima acción y etapas reales',async()=>{render(<IndividualWorkspacePanel solicitud={base} resumen={{perfil:{porcentaje_completado:20},documentos:{porcentaje_obligatorios:50}}}/>);expect(screen.getByText(/Próxima acción: Completar perfil/)).toBeInTheDocument();expect(screen.getByText('CAS')).toBeInTheDocument();expect(screen.getAllByText('DS').length).toBeGreaterThan(0);await waitFor(()=>expect(screen.getByText('Ana')).toBeInTheDocument())});
test('workspace Pasaporte no presenta etapas CAS ni Consulado',async()=>{render(<IndividualWorkspacePanel solicitud={{...base,tipo_tramite:'Pasaporte México'}} resumen={{}}/>);expect(screen.getByText('Cita pasaporte')).toBeInTheDocument();expect(screen.queryByText('CAS')).not.toBeInTheDocument();expect(screen.queryByText('Consulado')).not.toBeInTheDocument();await waitFor(()=>expect(screen.getByText('Ana')).toBeInTheDocument())});
