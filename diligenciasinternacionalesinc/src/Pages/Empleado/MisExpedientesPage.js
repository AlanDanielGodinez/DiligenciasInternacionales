import React, { useEffect, useMemo, useState } from 'react';
import AreaBandejaPage from '../../Components/AreaBandeja/AreaBandejaPage';
import { getAreasActivas, getMisExpedientes } from '../../services/misExpedientes.service';
import { getAuthUserIssue, getCurrentEmployeeId } from '../../utils/authUser';

const MisExpedientesPage = () => {
  const [areaOptions, setAreaOptions] = useState([]);
  const idEmpleado = useMemo(() => getCurrentEmployeeId(), []);
  const sessionIssue = getAuthUserIssue();

  useEffect(() => {
    let mounted = true;
    getAreasActivas()
      .then((areas) => {
        if (!mounted) return;
        setAreaOptions((areas || []).map((area) => ({
          value: area.id_area,
          label: area.nombre || area.clave || `Area ${area.id_area}`,
        })));
      })
      .catch(() => {
        if (mounted) setAreaOptions([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const fetchMisExpedientes = (params = {}) =>
    idEmpleado
      ? getMisExpedientes({
        ...params,
        id_empleado: idEmpleado,
      })
      : Promise.reject(new Error(sessionIssue || 'Tu sesión no tiene empleado asociado.'));

  return (
    <AreaBandejaPage
      fetchFunction={fetchMisExpedientes}
      titulo="Mis expedientes"
      subtitulo="Solicitudes asignadas a mi usuario"
      emptyMessage="No tienes expedientes asignados."
      tipoFiltroLabel="Todos los tramites"
      areaFiltroLabel="Todas las areas"
      areaFiltroOptions={areaOptions}
      mostrarFiltroTipo
      mostrarFiltroArea
      mostrarFiltroResponsable={false}
      variante="mis-expedientes"
      areaFallback="Mis expedientes"
      tipoFiltroParam="tipo_tramite"
      tramiteColumnLabel="Tramite"
      mostrarContactoColumn={false}
      mostrarAreaColumn
      mostrarResponsableColumn={false}
      permitirReasignar
      loadingMessage="Cargando mis expedientes..."
      errorMessage="No fue posible cargar tus expedientes asignados."
      reasignarTitulo="Reasignar responsable"
      reasignarDescripcion="Responsable reasignado desde Mis expedientes"
    />
  );
};

export default MisExpedientesPage;
