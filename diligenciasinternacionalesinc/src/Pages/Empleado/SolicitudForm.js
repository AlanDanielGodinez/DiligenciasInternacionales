import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SolicitudForm = () => {
  const [formData, setFormData] = useState({
    idCliente: '',
    idTramite: '',
    idEmpleado: '',
    fechaSolicitud: new Date().toISOString().split('T')[0],
    estado_actual: 'Pendiente'
  });

  const [clientes, setClientes] = useState([]);
  const [tramites, setTramites] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Configuración de axios para incluir el token de autenticación
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const [clientesRes, tramitesRes, empleadosRes] = await Promise.all([
          axios.get('/api/clientes', config),
          axios.get('/api/tramites', config),
          axios.get('/api/empleados', config)
        ]);
        
        setClientes(clientesRes.data);
        setTramites(tramitesRes.data);
        setEmpleados(empleadosRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error details:', err.response);
        setError(err.response?.data?.error || 'Error al cargar los datos necesarios. Verifica tu conexión o contacta al administrador.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await axios.post('/api/solicitudes', formData, config);
      if (response.status === 201) {
        setSuccess(true);
        // Reset form but keep the date
        setFormData(prev => ({
          idCliente: '',
          idTramite: '',
          idEmpleado: '',
          fechaSolicitud: new Date().toISOString().split('T')[0],
          estado_actual: 'Pendiente'
        }));
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Submission error:', err.response);
      setError(err.response?.data?.error || 'Error al crear la solicitud. Por favor intenta nuevamente.');
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Cargando datos necesarios...</p>
    </div>
  );

  return (
    <div className="solicitud-form-container">
      <h2>Nueva Solicitud</h2>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => window.location.reload()} className="retry-btn">
            Reintentar
          </button>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          Solicitud creada exitosamente!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="idCliente">Cliente:</label>
          <select
            id="idCliente"
            name="idCliente"
            value={formData.idCliente}
            onChange={handleChange}
            required
            disabled={loading || error}
          >
            <option value="">Seleccione un cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.idcliente} value={cliente.idcliente}>
                {cliente.nombrecliente} {cliente.apellidopaternocliente} {cliente.apellidomaternocliente}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="idTramite">Trámite:</label>
          <select
            id="idTramite"
            name="idTramite"
            value={formData.idTramite}
            onChange={handleChange}
            required
            disabled={loading || error}
          >
            <option value="">Seleccione un trámite</option>
            {tramites.map(tramite => (
              <option key={tramite.idtramite} value={tramite.idtramite}>
                {tramite.tipotramite} - {tramite.descripcion}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="idEmpleado">Empleado asignado:</label>
          <select
            id="idEmpleado"
            name="idEmpleado"
            value={formData.idEmpleado}
            onChange={handleChange}
            required
            disabled={loading || error}
          >
            <option value="">Seleccione un empleado</option>
            {empleados.map(empleado => (
              <option key={empleado.idempleado} value={empleado.idempleado}>
                {empleado.nombreempleado} {empleado.apellidopaternoempleado} ({empleado.correoempleado})
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="fechaSolicitud">Fecha de solicitud:</label>
          <input
            type="date"
            id="fechaSolicitud"
            name="fechaSolicitud"
            value={formData.fechaSolicitud}
            onChange={handleChange}
            required
            disabled={loading || error}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="estado_actual">Estado inicial:</label>
          <select
            id="estado_actual"
            name="estado_actual"
            value={formData.estado_actual}
            onChange={handleChange}
            required
            disabled={loading || error}
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En proceso">En proceso</option>
            <option value="Completado">Completado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading || error}
        >
          {loading ? 'Cargando...' : 'Crear Solicitud'}
        </button>
      </form>
    </div>
  );
};

export default SolicitudForm;