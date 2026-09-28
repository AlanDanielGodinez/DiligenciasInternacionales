import React from 'react';
import AreaBandejaPage from '../../Components/AreaBandeja/AreaBandejaPage';

const VUELOS_TIPOS = [
  { value: 'Vuelo', label: 'Vuelo' },
  { value: 'Hotel', label: 'Hotel' },
  { value: 'Tour', label: 'Tour' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Paquete', label: 'Paquete' },
  { value: 'Servicio de viaje', label: 'Servicio de viaje' },
];

const VuelosPage = () => (
  <AreaBandejaPage
    idArea={11}
    titulo="Expedientes de Vuelos y Viajes"
    subtitulo="Solicitudes asignadas al area de Vuelos/Viajes"
    emptyMessage="No hay expedientes asignados al area de Vuelos/Viajes."
    tipoFiltroLabel="Todos los servicios de viaje"
    tipoFiltroOptions={VUELOS_TIPOS}
    mostrarFiltroTipo
    variante="vuelos"
    areaFallback="Vuelos"
    responsableAreas={['VUELOS', 'LOGISTICA']}
    tipoFiltroMode="q"
    tramiteColumnLabel="Servicio"
    loadingMessage="Cargando expedientes de vuelos y viajes..."
    errorMessage="No fue posible cargar la bandeja de Vuelos/Viajes."
    reasignarTitulo="Reasignar responsable de viaje"
    reasignarDescripcion="Responsable reasignado desde bandeja de Vuelos/Viajes"
  />
);

export default VuelosPage;
