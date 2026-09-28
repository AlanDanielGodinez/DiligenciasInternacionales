import React from 'react';
import AreaBandejaPage from '../../Components/AreaBandeja/AreaBandejaPage';

const AMA_TIPOS = [
  { value: 1, label: 'Ama Costa Rica' },
  { value: 2, label: 'Ama El Salvador' },
  { value: 3, label: 'Ama Guatemala' },
  { value: 4, label: 'Ama Honduras' },
  { value: 5, label: 'Ama Mexico' },
  { value: 6, label: 'Ama Panamá' },
];

const AmaPage = () => (
  <AreaBandejaPage
    idArea={4}
    titulo="Expedientes AMA"
    subtitulo="Solicitudes asignadas al área AMA"
    emptyMessage="No hay expedientes asignados al área AMA."
    tipoFiltroLabel="Todos los tipos AMA"
    tipoFiltroOptions={AMA_TIPOS}
    mostrarFiltroTipo
    variante="ama"
    areaFallback="AMA"
    responsableAreas={['AMA']}
    tramiteColumnLabel="Trámite AMA"
    loadingMessage="Cargando expedientes AMA..."
    errorMessage="No fue posible cargar la bandeja AMA."
    reasignarTitulo="Reasignar responsable AMA"
    reasignarDescripcion="Responsable reasignado desde bandeja AMA"
  />
);

export default AmaPage;
