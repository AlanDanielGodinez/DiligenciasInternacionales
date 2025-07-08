// src/components/CrearSolicitud.js
import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Importamos el CSS profesional

const CrearSolicitud = () => {
  const [tramites, setTramites] = useState([]);
  const [tramiteSeleccionadoId, setTramiteSeleccionadoId] = useState('');
  const [clientesDelTramite, setClientesDelTramite] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [fechaSolicitud, setFechaSolicitud] = useState('');
  const [estadoActual, setEstadoActual] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const estados = [
    "Iniciado",
    "En espera de documentos",
    "Documentos entregados",
    "En espera de anticipo pago",
    "Anticipo realizado",
    "Pendiente de perfil de aplicación",
    "Falta de información",
    "En espera de pago",
    "Pago completado",
    "En proceso llenado de formulario DS-160",
    "Pendiente de pago de derecho a visa",
    "Cita programada",
    "Confirmación de datos",
    "Capacitación realizada",
    "Documentos entregados",
    "Finalizado"
  ];

  useEffect(() => {
    const fetchTramitesYEmpleados = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        const [tramitesRes, empleadosRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tramites', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/empleados', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const tramitesActivos = tramitesRes.data
          .filter(t => !t.fecha_fin)
          .map(t => ({
            id: t.idTramite || t.idtramite,
            nombre: t.tipotramite,
            clientes: t.clientes || []
          }));

        const empleadosList = empleadosRes.data.map(e => ({
          id: e.idEmpleado || e.idempleado,
          nombre: `${e.nombreEmpleado || e.nombreempleado} ${e.apellidoPaternoEmpleado || e.apellidopaternoempleado}`
        }));

        setTramites(tramitesActivos);
        setEmpleados(empleadosList);
      } catch (error) {
        console.error('Error al obtener datos:', error);
        setMensaje('Error al cargar los datos. Intente recargar la página.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTramitesYEmpleados();
  }, []);

  const handleTramiteSeleccionado = (idSeleccionado) => {
    setTramiteSeleccionadoId(idSeleccionado);
    const tramite = tramites.find(t => t.id.toString() === idSeleccionado);
    if (tramite?.clientes) {
      setClientesDelTramite(tramite.clientes);
    } else {
      setClientesDelTramite([]);
    }
  };

  const handleAgregarSolicitud = async () => {
    setMensaje('');
    if (!tramiteSeleccionadoId || !empleadoSeleccionado || !fechaSolicitud || !estadoActual || clientesDelTramite.length === 0) {
      setMensaje('Por favor completa todos los campos requeridos.');
      return;
    }

    const idCliente = clientesDelTramite[0]?.idCliente || clientesDelTramite[0]?.idcliente || clientesDelTramite[0]?.id;
    const payload = {
      idCliente,
      idTramite: tramiteSeleccionadoId,
      idEmpleado: empleadoSeleccionado,
      fechaSolicitud,
      estado_actual: estadoActual,
      observaciones: observaciones || null
    };

    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post('http://localhost:5000/api/solicitudes', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMensaje('Solicitud creada correctamente ✅');
      console.log('Solicitud creada:', res.data);

      // Limpiar formulario
      setTramiteSeleccionadoId('');
      setClientesDelTramite([]);
      setEmpleadoSeleccionado('');
      setFechaSolicitud('');
      setEstadoActual('');
      setObservaciones('');
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      setMensaje(error.response?.data?.error || 'Error al crear solicitud');
    }
  };

  return (
    <div className="crear-solicitud-container">
      <h2 className="crear-solicitud-title">Crear nueva solicitud</h2>

      <div className="crear-solicitud-form-group">
        <label htmlFor="tramite">Seleccionar trámite activo:</label>
        <select
          id="tramite"
          value={tramiteSeleccionadoId}
          onChange={(e) => handleTramiteSeleccionado(e.target.value)}
          className={`crear-solicitud-select ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          <option value="">-- Selecciona un trámite --</option>
          {tramites.map((tramite) => (
            <option key={tramite.id} value={tramite.id}>
              {tramite.nombre}
            </option>
          ))}
        </select>
      </div>

      {clientesDelTramite.length > 0 && (
        <div className="crear-solicitud-clientes-box">
          <h3>Clientes asociados:</h3>
          <ul className="crear-solicitud-lista">
            {clientesDelTramite.map((cliente, idx) => (
              <li key={idx}>
                {cliente.nombre || cliente.nombrecliente || cliente.nombreCliente || 'Cliente sin nombre'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="crear-solicitud-form-group">
        <label htmlFor="empleado">Seleccionar empleado responsable:</label>
        <select
          id="empleado"
          value={empleadoSeleccionado}
          onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
          className="crear-solicitud-select"
          disabled={isLoading}
        >
          <option value="">-- Selecciona un empleado --</option>
          {empleados.map((empleado) => (
            <option key={empleado.id} value={empleado.id}>
              {empleado.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="crear-solicitud-form-group">
        <label htmlFor="fecha">Fecha de solicitud:</label>
        <input
          type="date"
          id="fecha"
          value={fechaSolicitud}
          onChange={(e) => setFechaSolicitud(e.target.value)}
          className="crear-solicitud-input"
          max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
        />
      </div>

      <div className="crear-solicitud-form-group">
        <label htmlFor="estado">Estado actual:</label>
        <select
          id="estado"
          value={estadoActual}
          onChange={(e) => setEstadoActual(e.target.value)}
          className="crear-solicitud-select"
        >
          <option value="">-- Selecciona un estado --</option>
          {estados.map((estado, index) => (
            <option key={index} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      </div>

      <div className="crear-solicitud-form-group">
        <label htmlFor="observaciones">Observaciones:</label>
        <textarea
          id="observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={4}
          className="crear-solicitud-textarea"
          placeholder="Escribe aquí cualquier comentario adicional..."
        />
      </div>

      <div className="crear-solicitud-form-group">
        <button 
          onClick={handleAgregarSolicitud} 
          className="crear-solicitud-button"
          disabled={isLoading}
        >
          {isLoading ? 'Cargando...' : 'Agregar Solicitud'}
        </button>
      </div>

      {mensaje && (
        <div className={`crear-solicitud-mensaje ${mensaje.includes('✅') ? 'success' : 'error'}`}>
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default CrearSolicitud;