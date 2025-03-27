import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AnadirClienteModal from './AnadirCliente';
import AnadirTramiteModal from './AnadirTramite';

const SolicitudForm = () => {
  // Estados principales
  const [formData, setFormData] = useState({
    idCliente: '',
    idTramite: '',
    idEmpleado: '',
    fechaSolicitud: new Date().toISOString().split('T')[0],
    estado_actual: 'Pendiente'
  });

  // Estados para los datos
  const [clientes, setClientes] = useState([]);
  const [tramites, setTramites] = useState([]);
  const [empleadoActual, setEmpleadoActual] = useState(null);
  const [paises, setPaises] = useState([]);
  
  // Estados para los modales
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showTramiteModal, setShowTramiteModal] = useState(false);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };

        // Obtener datos en paralelo
        const [clientesRes, tramitesRes, empleadoRes, paisesRes] = await Promise.all([
          axios.get('/api/clientes', config),
          axios.get('/api/tramites', config),
          axios.get('/api/auth/current-user', config),
          axios.get('/api/paises', config)
        ]);

        setClientes(clientesRes.data);
        setTramites(tramitesRes.data);
        setEmpleadoActual(empleadoRes.data);
        setPaises(paisesRes.data);
        
        // Auto-seleccionar empleado actual
        if (empleadoRes.data) {
          setFormData(prev => ({
            ...prev,
            idEmpleado: empleadoRes.data.idEmpleado
          }));
        }

        setLoading(false);
      } catch (err) {
        console.error('Error:', err.response);
        setError(err.response?.data?.error || 'Error al cargar datos');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Manejador de cambios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Enviar solicitud
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/solicitudes', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 201) {
        setSuccess(true);
        // Resetear formulario (excepto empleado y fecha)
        setFormData(prev => ({
          idCliente: '',
          idTramite: '',
          idEmpleado: prev.idEmpleado,
          fechaSolicitud: new Date().toISOString().split('T')[0],
          estado_actual: 'Pendiente'
        }));
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear solicitud');
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Cargando datos...</p>
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
        {/* Campo Cliente con botón para agregar nuevo */}
        <div className="form-group">
          <label htmlFor="idCliente">Cliente:</label>
          <div className="combo-with-button">
            <select
              id="idCliente"
              name="idCliente"
              value={formData.idCliente}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.idCliente} value={cliente.idCliente}>
                  {cliente.nombreCliente} {cliente.apellidoPaternoCliente}
                </option>
              ))}
            </select>
            <button 
              type="button" 
              className="add-button"
              onClick={() => setShowClienteModal(true)}
            >
              +
            </button>
          </div>
        </div>
        
        {/* Campo Trámite con botón para agregar nuevo */}
        <div className="form-group">
          <label htmlFor="idTramite">Trámite:</label>
          <div className="combo-with-button">
            <select
              id="idTramite"
              name="idTramite"
              value={formData.idTramite}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un trámite</option>
              {tramites.map(tramite => (
                <option key={tramite.idTramite} value={tramite.idTramite}>
                  {tramite.tipoTramite} - {tramite.descripcion}
                </option>
              ))}
            </select>
            <button 
              type="button" 
              className="add-button"
              onClick={() => setShowTramiteModal(true)}
            >
              +
            </button>
          </div>
        </div>
        
        {/* Campo Empleado (auto-seleccionado) */}
        <div className="form-group">
          <label htmlFor="idEmpleado">Empleado asignado:</label>
          <input
            type="text"
            id="idEmpleado"
            value={empleadoActual ? 
              `${empleadoActual.nombreEmpleado} ${empleadoActual.apellidoPaternoEmpleado}` : 
              'Cargando...'}
            readOnly
          />
        </div>
        
        {/* Fecha y Estado */}
        <div className="form-group">
          <label htmlFor="fechaSolicitud">Fecha de solicitud:</label>
          <input
            type="date"
            id="fechaSolicitud"
            name="fechaSolicitud"
            value={formData.fechaSolicitud}
            onChange={handleChange}
            required
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
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En proceso">En proceso</option>
            <option value="Completado">Completado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
        
        <button type="submit" className="submit-btn">
          Crear Solicitud
        </button>
      </form>

      {/* Modal para nuevo Cliente */}
      {showClienteModal && (
        <AnadirClienteModal 
          onClose={() => setShowClienteModal(false)}
          onClienteCreado={(cliente) => {
            setClientes(prev => [...prev, cliente]);
            setFormData(prev => ({ ...prev, idCliente: cliente.idCliente }));
          }}
          paises={paises}
        />
      )}

      {/* Modal para nuevo Trámite */}
      {showTramiteModal && (
        <AnadirTramiteModal 
          onClose={() => setShowTramiteModal(false)}
          onTramiteCreado={(tramite) => {
            setTramites(prev => [...prev, tramite]);
            setFormData(prev => ({ ...prev, idTramite: tramite.idTramite }));
          }}
        />
      )}
    </div>
  );
};

export default SolicitudForm;