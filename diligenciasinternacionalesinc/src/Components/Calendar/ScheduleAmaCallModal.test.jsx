import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ScheduleAmaCallModal from './ScheduleAmaCallModal';

test('agenda llamada seleccionando aplicante, responsable, fecha y hora', async () => {
 const onSave=jest.fn().mockResolvedValue({}); render(<ScheduleAmaCallModal open applicants={[{id_solicitud:2,aplicante:'Ana Sol'}]} employees={[{id_empleado:3,nombre:'Blanca'}]} groups={[{id_grupo_ama:4,nombre_grupo:'Costa Rica'}]} onClose={jest.fn()} onSave={onSave}/>);
 fireEvent.change(screen.getByLabelText('Aplicante'),{target:{value:'2'}}); fireEvent.change(screen.getByLabelText('Responsable'),{target:{value:'3'}}); fireEvent.change(screen.getByLabelText('Fecha'),{target:{value:'2026-09-25'}}); fireEvent.change(screen.getByLabelText('Hora'),{target:{value:'09:30'}}); fireEvent.click(screen.getByRole('button',{name:'Guardar llamada'}));
 await waitFor(()=>expect(onSave).toHaveBeenCalledWith(expect.objectContaining({id_solicitud:2,id_empleado_responsable:3,fecha:'2026-09-25',hora:'09:30'})));
});
