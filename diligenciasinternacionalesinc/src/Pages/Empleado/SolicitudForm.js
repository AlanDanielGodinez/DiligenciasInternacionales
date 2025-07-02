import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SolicitudForm = () => {
  const [tramites, setTramites] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [idTramite, setIdTramite] = useState('');
  const [idCliente, setIdCliente] = useState('');
  const [idEmpleado, setIdEmpleado] = useState('');
  const [fechaSolicitud, setFechaSolicitud] = useState(new Date().toISOString().slice(0, 10));
  const [estadoActual, setEstadoActual] = useState('Pendiente');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [tramitesRes, clientesRes, empleadosRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tramites', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/clientes', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/empleados', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        console.log('Datos recibidos:', {
          tramites: tramitesRes.data,
          clientes: clientesRes.data,
          empleados: empleadosRes.data
        });

        // Verificar que los datos tengan la estructura esperada
        if (!Array.isArray(tramitesRes.data) || !Array.isArray(clientesRes.data) || !Array.isArray(empleadosRes.data)) {
          throw new Error('Los datos recibidos no tienen el formato esperado');
        }

        setTramites(tramitesRes.data);
        setClientes(clientesRes.data);
        setEmpleados(empleadosRes.data);
      } catch (err) {
        console.error('Error cargando datos:', err);
        let errorMsg = 'Error cargando datos';
        
        if (err.response) {
          if (err.response.status === 401) {
            errorMsg = 'No autorizado - por favor inicie sesión nuevamente';
          } else if (err.response.data && err.response.data.error) {
            errorMsg = err.response.data.error;
          }
        } else if (err.message) {
          errorMsg = err.message;
        }
        
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!idTramite || !idCliente || !idEmpleado) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/solicitudes',
        {
          idTramite,
          idCliente,
          idEmpleado,
          fechaSolicitud,
          estado_actual: estadoActual
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMensaje('Solicitud creada correctamente');
      // Resetear formulario
      setIdTramite('');
      setIdCliente('');
      setIdEmpleado('');
      setEstadoActual('Pendiente');
    } catch (err) {
      console.error('Error al crear solicitud:', err);
      let errorMsg = 'Ocurrió un error al crear la solicitud';
      
      if (err.response) {
        if (err.response.data && err.response.data.error) {
          errorMsg = err.response.data.error;
          if (err.response.data.details) {
            errorMsg += `: ${JSON.stringify(err.response.data.details)}`;
          }
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && tramites.length === 0 && clientes.length === 0 && empleados.length === 0) {
    return <div className="text-center py-8">Cargando datos...</div>;
  }

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md p-6 rounded-xl mt-8 border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Crear Solicitud</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {mensaje && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trámite */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Selecciona el trámite:
          </label>
          <select
            value={idTramite}
            onChange={(e) => setIdTramite(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded"
            disabled={tramites.length === 0}
          >
            <option value="">-- Selecciona un trámite --</option>
            {tramites.map((t) => (
              <option key={t.idTramite} value={t.idTramite}>
                {t.tipoTramite}
              </option>
            ))}
          </select>
          {tramites.length === 0 && !loading && (
            <p className="text-sm text-red-500 mt-1">No hay trámites disponibles</p>
          )}
        </div>

        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Selecciona el cliente:
          </label>
          <select
            value={idCliente}
            onChange={(e) => setIdCliente(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded"
            disabled={clientes.length === 0}
          >
            <option value="">-- Selecciona un cliente --</option>
            {clientes.map((c) => (
              <option key={c.idCliente} value={c.idCliente}>
                {c.nombreCliente} {c.apellidoPaternoCliente}
              </option>
            ))}
          </select>
          {clientes.length === 0 && !loading && (
            <p className="text-sm text-red-500 mt-1">No hay clientes disponibles</p>
          )}
        </div>

        {/* Empleado */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Selecciona el empleado:
          </label>
          <select
            value={idEmpleado}
            onChange={(e) => setIdEmpleado(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded"
            disabled={empleados.length === 0}
          >
            <option value="">-- Selecciona un empleado --</option>
            {empleados.map((e) => (
              <option key={e.idEmpleado} value={e.idEmpleado}>
                {e.nombreEmpleado} {e.apellidoPaternoEmpleado}
              </option>
            ))}
          </select>
          {empleados.length === 0 && !loading && (
            <p className="text-sm text-red-500 mt-1">No hay empleados disponibles</p>
          )}
        </div>

        {/* Fecha de solicitud */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha de Solicitud:
          </label>
          <input
            type="date"
            value={fechaSolicitud}
            onChange={(e) => setFechaSolicitud(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Estado actual */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estado Actual:
          </label>
          <select
            value={estadoActual}
            onChange={(e) => setEstadoActual(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En proceso">En proceso</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </div>

        {/* Botón */}
        <div className="text-right">
          <button
            type="submit"
            disabled={loading || tramites.length === 0 || clientes.length === 0 || empleados.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Solicitud'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SolicitudForm;