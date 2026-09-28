import React from 'react';
import { Link } from 'react-router-dom';
import AreaBandejaPage from '../../Components/AreaBandeja/AreaBandejaPage';

const IndividualesPage = () => (<>
  <nav className="grupos-ama-view-switch" aria-label="Área Individual">
    <Link className="is-active" to="/empleado/individuales">Solicitudes</Link>
    <Link to="/empleado/individuales/calendario">Calendario</Link>
    <Link to="/empleado/negados">Negados</Link>
  </nav>
  <AreaBandejaPage
    idArea={3}
    titulo="Expedientes Individuales"
    subtitulo="Solicitudes asignadas al área Individuales"
    emptyMessage="No hay expedientes asignados al área Individuales."
    tipoFiltroLabel="Todos los trámites"
    mostrarFiltroTipo
    variante="individuales"
    areaFallback="Individuales"
    responsableAreas={['INDIVIDUALES']}
    tramiteColumnLabel="Trámite"
    loadingMessage="Cargando expedientes..."
    errorMessage="No fue posible cargar la bandeja de Individuales."
    reasignarTitulo="Reasignar responsable"
    reasignarDescripcion="Responsable reasignado desde bandeja de Individuales"
  /></>
);

export default IndividualesPage;
