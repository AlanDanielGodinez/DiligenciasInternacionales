import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaSave, FaSpinner, FaPlus, FaMinus } from 'react-icons/fa';

const CrearTramiteModal = ({ mostrar, cerrar, onTramiteCreado }) => {
  // Estado principal del formulario
  const [formData, setFormData] = useState({
  tipoTramite: '',
  descripcion: '',
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: '',
  requisitos: '',
  plazo_estimado: '',
  costo: '',
  clientes: [''],
  empleados: ['']
});


  // Estados para datos relacionados
 
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Objeto con los requisitos predefinidos por tipo de trámite
  const requisitosPorTramite = {
    'Pasaporte Primera vez': `CURP certificada\nActa de nacimiento actualizada\nCredencial de elector\nComprobante de domicilio`,
    'Pasaporte Renovación': `Pasaporte vencido/vigente\nCURP certificada\nActa de nacimiento\nINE\nComprobante de domicilio\nCOMPARENCIA DE AMBOS PADRES (IDENTIFICACIÓN OFICIAL DE AMBOS), si es que es menor de edad`,
    'Visa Americana': `Acta de Nacimiento\nINE vigente\nPasaporte vigente\nComprobante de domicilio`,
    'FOIA': `Pasaporte y/o identificación oficial\nActa de nacimiento\nComprobante de domicilio`,
    'Grupo AMA Mexico': `Tener la edad de 57 años o mas.\nVivir en México, Guatemala, Honduras o El Salvador.\nActa de nacimiento\nINE\npasaporte vigente\ncomprobante de domicilio.`,
    'Grupo AMA Guatemala': `Tener la edad de 57 años o mas.\nVivir en México, Guatemala, Honduras o El Salvador.\nCertificado de nacimiento\nDPI\nPasaporte vigente\nComprobante de domicilio.`,
    'Apostilla': `Certificado o acta de nacimiento.\nIdentificación oficial con fotografía.`,
    'Visa Canadiense': `Comprobante de domicilio\nPasaporte vigente\nINE vigente\nActa de Nacimiento`,
    'CRBA Registro de hijos nacidos en el extranjero': `COPIAS\nActa de nacimiento del menor expedida por el registro civil (el formato largo)\nCertificado del hospital expedido por la Secretaría de Salud\nActa de matrimonio *solo si estuviera casado(a)*\nPrueba de ciudadanía del padre o madre ciudadano americano\nIdentificación del padre.\nAdemas:\nNúmero de teléfono local de México\nPresencia física en Estados Unidos del padre o madre americana (puede ser impuestos, formas W2, recibos de nómina, transcripciones académicas, registro de viajes, etc.) *Mínimo 5 años antes del nacimiento del bebé*\nImpresiones de ultrasonidos, fotos del embarazo progresivo y el seguimiento de las citas ginecológicas (todo debe llevar el nombre de la madre).\nActas de nacimiento de ambos padres así como comprobante de domicilio.\nFechas precisas y lugares de estadía en Estados Unidos del padre o madre americano/a.\nNúmero de seguro social del padre o madre americano/a.`,
    'Residencia Americana': `REQUISITOS PARA EL APLICANTE\nPasaporte (en caso de tener)\nIdentificación oficial con fotografía\nCertificado o acta de nacimiento\nCertificado de matrimonio *En caso de estar casado(a)*\nREQUISITOS PARA EL PETICIONARIO\nIdentificación oficial con fotografía\nPasaporte (en caso de tener)\nCertificado o acta de nacimiento\nCertificado de matrimonio *En caso de estar casado(a)*`,
    'Global Entry': `Pasaporte vigente\nIdentificación adicional (licencia, ID estatal, militar)\nNúmero de viajero (si aplica)\nCuenta CBP (si ya existe)\nComprobante de residencia actual`,
    'SENTRI': `Pasaporte vigente\nIdentificación adicional (licencia, ID estatal, militar)\nNúmero de viajero (si aplica)\nCuenta CBP (si ya existe)\nComprobante de residencia actual`,
    'Residencia Americana Requisitos': `Residencia estatal: Haber residido por lo menos 3 meses en el estado o distrito de USCIS donde se presenta la solicitud.\nBuena conducta moral: Demostrar ser una persona de buena conducta moral.\nEdad: Tener al menos 18 años al momento de presentar la solicitud.\nResidencia permanente legal: Ser residente permanente (Green Card) durante al menos 5 años (o 3 años si estás casado con un ciudadano).\nResidencia continua: Haber tenido residencia continua en EE. UU. durante al menos 5 años antes de presentar la solicitud.\nPresencia física: Haber estado físicamente presente en EE. UU. durante un tiempo específico (30 meses de los últimos 5 años).\nConocimiento del inglés y la historia de EE. UU.: Ser capaz de leer, escribir y hablar inglés básico, y tener conocimientos sobre la historia y el gobierno de EE. UU.\nJuramento de Lealtad: Estar dispuesto a prestar el Juramento de Lealtad a EE. UU.`
  };

  // Cargar datos relacionados cuando se muestra el modal
  useEffect(() => {
    if (mostrar) {
      cargarDatosRelacionados();
      
    }
  }, [mostrar]);

  // Actualizar requisitos cuando cambia el tipo de trámite
  useEffect(() => {
    if (formData.tipoTramite && requisitosPorTramite[formData.tipoTramite]) {
      setFormData(prev => ({
        ...prev,
        requisitos: requisitosPorTramite[formData.tipoTramite]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        requisitos: ''
      }));
    }
  }, [formData.tipoTramite]);



// Función para cargar clientes y empleados
const cargarDatosRelacionados = async () => {
  try {
    setCargando(true);
    setError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('No se encontró el token de autenticación.');
      setCargando(false);
      return;
      }

      const config = { 
        headers: { 
          Authorization: `Bearer ${token}` 
        } 
      };

      // Cargar clientes
      try {
        const clientesRes = await axios.get('http://localhost:5000/api/clientes', config);
        const clientesFormateados = clientesRes.data.map(cliente => ({
          idCliente: cliente.idCliente || cliente.idcliente,
          nombreCompleto: `${cliente.nombreCliente || cliente.nombrecliente || ''} ${cliente.apellidoPaternoCliente || cliente.apellidopaternocliente || ''}`.trim()
        }));
        setClientesDisponibles(clientesFormateados);
      } catch (err) {
        console.error('Error al cargar clientes:', err);
        setError(`Error al cargar clientes: ${err.response?.data?.error || err.message}`);
      }

      // Cargar empleados
      try {
        const empleadosRes = await axios.get('http://localhost:5000/api/empleados', config);
        const empleadosFormateados = empleadosRes.data.map(empleado => ({
          idEmpleado: empleado.idEmpleado || empleado.idempleado,
          nombreCompleto: `${empleado.nombreEmpleado || empleado.nombreempleado || ''} ${empleado.apellidoPaternoEmpleado || empleado.apellidopaternoempleado || ''}`.trim()
        }));
        setEmpleadosDisponibles(empleadosFormateados);
      } catch (err) {
        console.error('Error al cargar empleados:', err);
        setError(`Error al cargar empleados: ${err.response?.data?.error || err.message}`);
      }

      setCargando(false);
    } catch (err) {
      console.error('Error general al cargar datos:', err);
      setError('Error general al cargar datos');
      setCargando(false);
    }
  };

  // Manejador de cambios genérico
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Agregar un cliente al array
  const agregarCliente = () => {
    setFormData(prev => ({
      ...prev,
      clientes: [...prev.clientes, '']
    }));
  };

  // Eliminar un cliente del array
  const eliminarCliente = (index) => {
    setFormData(prev => ({
      ...prev,
      clientes: prev.clientes.filter((_, i) => i !== index)
    }));
  };

  // Actualizar un cliente específico
  const handleClienteChange = (index, value) => {
    const nuevosClientes = [...formData.clientes];
    nuevosClientes[index] = value;
    setFormData(prev => ({ ...prev, clientes: nuevosClientes }));
  };

  // Agregar un empleado al array
  const agregarEmpleado = () => {
    setFormData(prev => ({
      ...prev,
      empleados: [...prev.empleados, '']
    }));
  };

  // Eliminar un empleado del array
  const eliminarEmpleado = (index) => {
    setFormData(prev => ({
      ...prev,
      empleados: prev.empleados.filter((_, i) => i !== index)
    }));
  };

  // Actualizar un empleado específico
  const handleEmpleadoChange = (index, value) => {
    const nuevosEmpleados = [...formData.empleados];
    nuevosEmpleados[index] = value;
    setFormData(prev => ({ ...prev, empleados: nuevosEmpleados }));
  };

  // Enviar el formulario
    const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        setCargando(false);
        return;
      }

      // Validaciones básicas
      if (!formData.tipoTramite.trim()) {
        setError('El tipo de trámite es requerido');
        setCargando(false);
        return;
      }

      if (!formData.plazo_estimado.trim()) {
        setError('El plazo estimado es requerido');
        setCargando(false);
        return;
      }

      if (!formData.costo.trim()) {
        setError('El costo es requerido');
        setCargando(false);
        return;
      }

      // Validar que haya al menos un cliente y un empleado seleccionado
      const clientesSeleccionados = formData.clientes.filter(id => id !== '');
      const empleadosSeleccionados = formData.empleados.filter(id => id !== '');

      if (clientesSeleccionados.length === 0 || empleadosSeleccionados.length === 0) {
        setError('Debe asignar al menos un cliente y un empleado');
        setCargando(false);
        return;
      }

      // Preparar datos para enviar
      const datosParaEnviar = {
        tipoTramite: formData.tipoTramite.trim(),
        descripcion: formData.descripcion?.trim() || null,
        fecha_inicio: formData.fecha_inicio || null,
        fecha_fin: formData.fecha_fin || null,
        requisitos: formData.requisitos?.trim() || null,
        plazo_estimado: formData.plazo_estimado.trim(),
        costo: formData.costo.trim(),
        clientes: clientesSeleccionados.map(Number),
        empleados: empleadosSeleccionados.map(Number)
      };

      // Opcional: Formatear fechas si es necesario
      if (datosParaEnviar.fecha_inicio) {
        datosParaEnviar.fecha_inicio = new Date(datosParaEnviar.fecha_inicio).toISOString().split('T')[0];
      }
      if (datosParaEnviar.fecha_fin) {
        datosParaEnviar.fecha_fin = new Date(datosParaEnviar.fecha_fin).toISOString().split('T')[0];
      }

      const response = await axios.post(
        'http://localhost:5000/api/tramites',
        datosParaEnviar,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Mostrar mensaje de éxito y cerrar modal
      onTramiteCreado(response.data);
      cerrar();
      
    } catch (err) {
      console.error('Error al crear trámite:', err);
      
      // Manejo mejorado de errores
      let mensajeError = 'Error al crear trámite';
      
      if (err.response) {
        // Error desde el backend
        if (err.response.data && err.response.data.error) {
          mensajeError = err.response.data.error;
          if (err.response.data.details) {
            mensajeError += ` (${err.response.data.details})`;
          }
        } else {
          mensajeError = `Error ${err.response.status}: ${err.response.statusText}`;
        }
      } else if (err.request) {
        // Error de conexión
        mensajeError = 'No se pudo conectar con el servidor';
      }
      
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  };
  if (!mostrar) return null;

  return (
    <div className="duo-modal-overlay">
      <div className="duo-modal">
        <div className="duo-modal-header">
          <h2 className="duo-modal-title">Nuevo Trámite</h2>
          <button className="duo-modal-close" onClick={cerrar}><FaTimes /></button>
        </div>

        {error && <div className="duo-alert duo-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="duo-modal-form">
          {/* Campo Tipo de Trámite */}
          <div className="duo-form-group">
            <label className="duo-form-label">Tipo de Trámite *</label>
            <select
              name="tipoTramite"
              value={formData.tipoTramite}
              onChange={handleChange}
              className="duo-form-select"
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="Pasaporte Primera vez">Pasaporte Primera vez</option>
              <option value="Pasaporte Renovación">Pasaporte Renovación</option>
              <option value="Visa Americana">Visa Americana</option>
              <option value="Visa Canadiense">Visa Canadiense</option>
              <option value="Grupo AMA Mexico">Grupo AMA Mexico</option>
              <option value="Grupo AMA Guatemala">Grupo AMA Guatemala</option>
              <option value="FOIA">FOIA</option>
              <option value="Traduccion de documentos">Traduccion de documentos</option>
              <option value="Apostilla">Apostilla</option>
              <option value="CRBA Registro de hijos nacidos en el extranjero">CRBA Registro de hijos nacidos en el extranjero</option>
              <option value="Residencia Americana">Residencia Americana</option>
              <option value="Global Entry">Global Entry</option>
              <option value="SENTRI">SENTRI</option>
              <option value="Residencia Americana Requisitos">Residencia Americana Requisitos</option>
            </select>
          </div>

          {/* Campo Descripción */}
          <div className="duo-form-group">
            <label className="duo-form-label">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="duo-form-textarea"
              rows="3"
            />
          </div>

          {/* Fechas */}
          <div className="duo-form-row">
            <div className="duo-form-group">
              <label className="duo-form-label">Fecha Inicio</label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                className="duo-form-input"
              />
            </div>

            <div className="duo-form-group">
              <label className="duo-form-label">Fecha Fin</label>
              <input
                type="date"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                className="duo-form-input"
              />
            </div>
          </div>

          {/* Requisitos */}
          <div className="duo-form-group">
            <label className="duo-form-label">Requisitos</label>
            <textarea
              name="requisitos"
              value={formData.requisitos}
              onChange={handleChange}
              className="duo-form-textarea"
              rows="8"
              placeholder="Seleccione un tipo de trámite para cargar los requisitos automáticamente"
            />
          </div>

          {/* Plazo Estimado y Costo */}
          <div className="duo-form-row">
            <div className="duo-form-group">
              <label className="duo-form-label">Plazo Estimado</label>
              <input
                type="text"
                name="plazo_estimado"
                value={formData.plazo_estimado}
                onChange={handleChange}
                className="duo-form-input"
              />
            </div>

            <div className="duo-form-group">
              <label className="duo-form-label">Costo</label>
              <input
                type="text"
                name="costo"
                value={formData.costo}
                onChange={handleChange}
                className="duo-form-input"
              />
            </div>
          </div>

          {/* Sección de Clientes (múltiple) */}
          <div className="duo-form-group">
            <label className="duo-form-label">Clientes</label>
            {formData.clientes.map((clienteId, index) => (
              <div key={`cliente-${index}`} className="duo-form-row" style={{ marginBottom: '0.5rem' }}>
                <select
                  value={clienteId}
                  onChange={(e) => handleClienteChange(index, e.target.value)}
                  className="duo-form-select"
                >
                  <option value="">Seleccionar cliente</option>
                  {clientesDisponibles.map(cliente => (
                    <option key={cliente.idCliente} value={cliente.idCliente}>
                      {cliente.nombreCompleto}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => eliminarCliente(index)}
                  className="duo-btn duo-btn-small"
                  style={{ marginLeft: '0.5rem' }}
                  disabled={formData.clientes.length === 1}
                >
                  <FaMinus />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={agregarCliente}
              className="duo-btn duo-btn-secondary"
              style={{ marginTop: '0.5rem' }}
            >
              <FaPlus /> Agregar Cliente
            </button>
          </div>

          {/* Sección de Empleados (múltiple) */}
          <div className="duo-form-group">
            <label className="duo-form-label">Empleados Responsables</label>
            {formData.empleados.map((empleadoId, index) => (
              <div key={`empleado-${index}`} className="duo-form-row" style={{ marginBottom: '0.5rem' }}>
                <select
                  value={empleadoId}
                  onChange={(e) => handleEmpleadoChange(index, e.target.value)}
                  className="duo-form-select"
                >
                  <option value="">Seleccionar empleado</option>
                  {empleadosDisponibles.map(empleado => (
                    <option key={empleado.idEmpleado} value={empleado.idEmpleado}>
                      {empleado.nombreCompleto}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => eliminarEmpleado(index)}
                  className="duo-btn duo-btn-small"
                  style={{ marginLeft: '0.5rem' }}
                  disabled={formData.empleados.length === 1}
                >
                  <FaMinus />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={agregarEmpleado}
              className="duo-btn duo-btn-secondary"
              style={{ marginTop: '0.5rem' }}
            >
              <FaPlus /> Agregar Empleado
            </button>
          </div>


          {/* Botones del formulario */}
          <div className="duo-modal-footer">
            <button type="button" className="duo-btn duo-btn-secondary" onClick={cerrar} disabled={cargando}>
              Cancelar
            </button>
            <button type="submit" className="duo-btn duo-btn-primary" disabled={cargando}>
              {cargando ? (
                <>
                  <FaSpinner className="duo-spinner" />
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="duo-btn-icon" />
                  Guardar Trámite
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearTramiteModal;