import React, { useState } from 'react';
import axios from 'axios';
const AnadirCliente = ({ onClose, onClienteCreado, paises }) => {
  // Estados para los datos del cliente
  const [cliente, setCliente] = useState({
    nombreCliente: '',
    apellidoPaternoCliente: '',
    apellidoMaternoCliente: '',
    sexo: '',
    edad: '',
    telefono: '',
    estado_civil: '',
    identificacion: '',
    tipoIdentificacion: 'CURP',
    idPais: 1,
    Domicilio: '',
    condicionesEspeciales: '',
    fechaNacimiento: '',
    municipioNacimiento: '',
    EstadoNacimiento: '',
    PaisNacimiento: '',
    idCiudad: ''
  });

  const [error, setError] = useState('');

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
    const { tipoIdentificacion, identificacion } = cliente;
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

    setError(mensajeError);
    return valido;
  };

  // Manejador de cambios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente(prev => ({ ...prev, [name]: value }));
  };

  // Manejador de envío
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar identificación
    if (!validarIdentificacion()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/clientes', {
        ...cliente,
        identificacionunicanacional: `${cliente.tipoIdentificacion}:${cliente.identificacion}`
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Notificar al componente padre y cerrar modal
      onClienteCreado(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear cliente');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content cliente-modal">
        <div className="modal-header">
          <h3>Nuevo Cliente</h3>
          <button className="close-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cliente-form">
          {/* Sección de información básica */}
          <fieldset className="form-section">
            <legend>Información Personal</legend>
            
            <div className="form-row">
              <div className="form-group">
                <label>Nombre(s):</label>
                <input
                  type="text"
                  name="nombreCliente"
                  value={cliente.nombreCliente}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Apellido Paterno:</label>
                <input
                  type="text"
                  name="apellidoPaternoCliente"
                  value={cliente.apellidoPaternoCliente}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Apellido Materno:</label>
                <input
                  type="text"
                  name="apellidoMaternoCliente"
                  value={cliente.apellidoMaternoCliente}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Sexo:</label>
                <select
                  name="sexo"
                  value={cliente.sexo}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Edad:</label>
                <input
                  type="number"
                  name="edad"
                  value={cliente.edad}
                  onChange={handleChange}
                  min="1"
                  max="120"
                />
              </div>
              
              <div className="form-group">
                <label>Estado Civil:</label>
                <select
                  name="estado_civil"
                  value={cliente.estado_civil}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Soltero/a">Soltero/a</option>
                  <option value="Casado/a">Casado/a</option>
                  <option value="Divorciado/a">Divorciado/a</option>
                  <option value="Viudo/a">Viudo/a</option>
                  <option value="Unión Libre">Unión Libre</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Fecha de Nacimiento:</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={cliente.fechaNacimiento}
                onChange={handleChange}
              />
            </div>
          </fieldset>

          {/* Sección de identificación */}
          <fieldset className="form-section">
            <legend>Identificación</legend>
            
            <div className="form-row">
              <div className="form-group">
                <label>País:</label>
                <select
                  name="idPais"
                  value={cliente.idPais}
                  onChange={(e) => {
                    const paisId = parseInt(e.target.value);
                    setCliente(prev => ({
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
                  value={cliente.tipoIdentificacion}
                  onChange={handleChange}
                  required
                >
                  {obtenerOpcionesIdentificacion(cliente.idPais)}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Número de Identificación:</label>
              <input
                type="text"
                name="identificacion"
                value={cliente.identificacion}
                onChange={handleChange}
                onBlur={validarIdentificacion}
                required
              />
              <small className="hint">
                {obtenerEjemploIdentificacion(cliente.tipoIdentificacion)}
              </small>
              {error && <div className="error-text">{error}</div>}
            </div>
          </fieldset>

          {/* Sección de contacto */}
          <fieldset className="form-section">
            <legend>Contacto</legend>
            
            <div className="form-group">
              <label>Teléfono:</label>
              <input
                type="tel"
                name="telefono"
                value={cliente.telefono}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Domicilio:</label>
              <textarea
                name="Domicilio"
                value={cliente.Domicilio}
                onChange={handleChange}
                rows="3"
              />
            </div>
          </fieldset>

          {/* Sección de información adicional */}
          <fieldset className="form-section">
            <legend>Información Adicional</legend>
            
            <div className="form-group">
              <label>Condiciones Especiales:</label>
              <textarea
                name="condicionesEspeciales"
                value={cliente.condicionesEspeciales}
                onChange={handleChange}
                rows="3"
                placeholder="Alergias, discapacidades, etc."
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Municipio de Nacimiento:</label>
                <input
                  type="text"
                  name="municipioNacimiento"
                  value={cliente.municipioNacimiento}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>Estado de Nacimiento:</label>
                <input
                  type="text"
                  name="EstadoNacimiento"
                  value={cliente.EstadoNacimiento}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>País de Nacimiento:</label>
                <input
                  type="text"
                  name="PaisNacimiento"
                  value={cliente.PaisNacimiento}
                  onChange={handleChange}
                />
              </div>
            </div>
          </fieldset>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="submit-btn">
              Guardar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnadirCliente; 