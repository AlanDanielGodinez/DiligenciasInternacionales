import React, { useState, useEffect } from 'react';
import axios from 'axios';


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
  
  // Estados para los formularios de creación
  const [nuevoCliente, setNuevoCliente] = useState({
    nombreCliente: '',
    apellidoPaternoCliente: '',
    apellidoMaternoCliente: '',
    telefono: '',
    identificacion: '',
    tipoIdentificacion: 'CURP',
    idPais: 1,
    errorIdentificacion: ''
  });

  const [nuevoTramite, setNuevoTramite] = useState({
    tipoTramite: '',
    descripcion: '',
    requisitos: ''
  });

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Funciones auxiliares para identificación
  const obtenerTipoIdentificacionDefault = (idPais) => {
    const paises = {
      1: 'CURP', // México
      2: 'ITIN', // Estados Unidos
      3: 'DPI',  // Guatemala
      4: 'RTN',  // Honduras
      5: 'DUI'   // El Salvador
    };
    return paises[idPais] || 'OTRO';
  };

  const obtenerOpcionesIdentificacion = (idPais) => {
    const opciones = {
      1: [ // México
        { value: 'CURP', label: 'CURP' },
        { value: 'RFC', label: 'RFC' },
        { value: 'INE', label: 'INE' },
        { value: 'PASAPORTE', label: 'Pasaporte' }
      ],
      2: [ // Estados Unidos
        { value: 'ITIN', label: 'ITIN' },
        { value: 'SSN', label: 'SSN' },
        { value: 'PASAPORTE', label: 'Pasaporte' }
      ],
      3: [ // Guatemala
        { value: 'DPI', label: 'DPI' },
        { value: 'PASAPORTE', label: 'Pasaporte' }
      ],
      4: [ // Honduras
        { value: 'RTN', label: 'RTN' },
        { value: 'DNI', label: 'DNI' },
        { value: 'PASAPORTE', label: 'Pasaporte' }
      ],
      5: [ // El Salvador
        { value: 'DUI', label: 'DUI' },
        { value: 'NIT', label: 'NIT' },
        { value: 'PASAPORTE', label: 'Pasaporte' }
      ]
    };

    return opciones[idPais]?.map(opcion => (
      <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
    )) || <option value="OTRO">Otro</option>;
  };

  const obtenerEjemploIdentificacion = (tipo) => {
    const ejemplos = {
      'CURP': 'Ejemplo: GODE920511HDFLRN01',
      'RFC': 'Ejemplo: GODE920511ABC',
      'INE': 'Ejemplo: 1234567890123456',
      'ITIN': 'Ejemplo: 9XX-XX-XXXX',
      'SSN': 'Ejemplo: XXX-XX-XXXX',
      'DPI': 'Ejemplo: 1234567890101',
      'RTN': 'Ejemplo: 12345678901234',
      'DUI': 'Ejemplo: 12345678-9',
      'NIT': 'Ejemplo: 0614-123456-123-4',
      'PASAPORTE': 'Ejemplo: M12345678'
    };
    return ejemplos[tipo] || 'Ingrese el número de identificación';
  };

  const validarIdentificacion = () => {
    const { tipoIdentificacion, identificacion } = nuevoCliente;
    let valido = true;
    let mensajeError = '';

    // Expresiones regulares para cada tipo
    const regexes = {
      'CURP': /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2}$/,
      'RFC': /^[A-Z]{4}\d{6}[A-Z0-9]{3}$/,
      'INE': /^\d{13,18}$/,
      'ITIN': /^9\d{2}-\d{2}-\d{4}$/,
      'SSN': /^\d{3}-\d{2}-\d{4}$/,
      'DPI': /^\d{13}$/,
      'RTN': /^\d{14}$/,
      'DUI': /^\d{8}-\d$/,
      'NIT': /^\d{4}-\d{6}-\d{3}-\d$/,
      'PASAPORTE': /^[A-Z0-9]{6,12}$/
    };

    if (regexes[tipoIdentificacion]) {
      const regex = new RegExp(regexes[tipoIdentificacion]);
      if (!regex.test(identificacion)) {
        valido = false;
        mensajeError = `Formato de ${tipoIdentificacion} inválido. ${obtenerEjemploIdentificacion(tipoIdentificacion)}`;
      }
    }

    setNuevoCliente(prev => ({
      ...prev,
      errorIdentificacion: valido ? '' : mensajeError
    }));

    return valido;
  };

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

  // Manejadores de cambios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    setNuevoCliente(prev => ({ ...prev, [name]: value }));
  };

  const handleTramiteChange = (e) => {
    const { name, value } = e.target;
    setNuevoTramite(prev => ({ ...prev, [name]: value }));
  };

  // Crear nuevo cliente
  const crearCliente = async (e) => {
    e.preventDefault();
    
    if (!validarIdentificacion()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/clientes', {
        ...nuevoCliente,
        identificacionunicanacional: `${nuevoCliente.tipoIdentificacion}:${nuevoCliente.identificacion}`
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Agregar el nuevo cliente a la lista y seleccionarlo
      const clienteCreado = response.data;
      setClientes(prev => [...prev, clienteCreado]);
      setFormData(prev => ({ ...prev, idCliente: clienteCreado.idCliente }));
      setShowClienteModal(false);
      
      // Resetear formulario
      setNuevoCliente({
        nombreCliente: '',
        apellidoPaternoCliente: '',
        apellidoMaternoCliente: '',
        telefono: '',
        identificacion: '',
        tipoIdentificacion: 'CURP',
        idPais: 1,
        errorIdentificacion: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear cliente');
    }
  };

  // Crear nuevo trámite
  const crearTramite = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/tramites', nuevoTramite, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Agregar el nuevo trámite a la lista y seleccionarlo
      const tramiteCreado = response.data;
      setTramites(prev => [...prev, tramiteCreado]);
      setFormData(prev => ({ ...prev, idTramite: tramiteCreado.idTramite }));
      setShowTramiteModal(false);
      
      // Resetear formulario
      setNuevoTramite({
        tipoTramite: '',
        descripcion: '',
        requisitos: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear trámite');
    }
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nuevo Cliente</h3>
            <button 
              className="close-modal"
              onClick={() => setShowClienteModal(false)}
            >
              &times;
            </button>
            
            <form onSubmit={crearCliente}>
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  name="nombreCliente"
                  value={nuevoCliente.nombreCliente}
                  onChange={handleClienteChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Apellido Paterno:</label>
                <input
                  type="text"
                  name="apellidoPaternoCliente"
                  value={nuevoCliente.apellidoPaternoCliente}
                  onChange={handleClienteChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Apellido Materno:</label>
                <input
                  type="text"
                  name="apellidoMaternoCliente"
                  value={nuevoCliente.apellidoMaternoCliente}
                  onChange={handleClienteChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Teléfono:</label>
                <input
                  type="text"
                  name="telefono"
                  value={nuevoCliente.telefono}
                  onChange={handleClienteChange}
                />
              </div>
              
              <div className="form-group">
                <label>País:</label>
                <select
                  name="idPais"
                  value={nuevoCliente.idPais}
                  onChange={(e) => {
                    const paisId = parseInt(e.target.value);
                    setNuevoCliente(prev => ({
                      ...prev, 
                      idPais: paisId,
                      tipoIdentificacion: obtenerTipoIdentificacionDefault(paisId)
                    }));
                  }}
                  required
                >
                  {paises.map(pais => (
                    <option key={pais.idPais} value={pais.idPais}>
                      {pais.nombrePais}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Tipo de Identificación:</label>
                <select
                  name="tipoIdentificacion"
                  value={nuevoCliente.tipoIdentificacion}
                  onChange={handleClienteChange}
                  required
                >
                  {obtenerOpcionesIdentificacion(nuevoCliente.idPais)}
                </select>
              </div>
              
              <div className="form-group">
                <label>Identificación:</label>
                <input
                  type="text"
                  name="identificacion"
                  value={nuevoCliente.identificacion}
                  onChange={handleClienteChange}
                  onBlur={validarIdentificacion}
                  required
                />
                <small className="hint">
                  {obtenerEjemploIdentificacion(nuevoCliente.tipoIdentificacion)}
                </small>
                {nuevoCliente.errorIdentificacion && (
                  <div className="error-text">{nuevoCliente.errorIdentificacion}</div>
                )}
              </div>
              
              <button type="submit" className="submit-btn">
                Crear Cliente
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal para nuevo Trámite */}
      {showTramiteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nuevo Trámite</h3>
            <button 
              className="close-modal"
              onClick={() => setShowTramiteModal(false)}
            >
              &times;
            </button>
            
            <form onSubmit={crearTramite}>
              <div className="form-group">
                <label>Tipo de Trámite:</label>
                <input
                  type="text"
                  name="tipoTramite"
                  value={nuevoTramite.tipoTramite}
                  onChange={handleTramiteChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  name="descripcion"
                  value={nuevoTramite.descripcion}
                  onChange={handleTramiteChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Requisitos:</label>
                <textarea
                  name="requisitos"
                  value={nuevoTramite.requisitos}
                  onChange={handleTramiteChange}
                />
              </div>
              
              <button type="submit" className="submit-btn">
                Crear Trámite
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitudForm;