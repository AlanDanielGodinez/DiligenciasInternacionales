import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditarCliente = ({ mostrar, cerrar, clienteId, onClienteActualizado }) => {
  // Estados
  const [formData, setFormData] = useState({
    nombreCliente: '',
    apellidoPaternoCliente: '',
    apellidoMaternoCliente: '',
    sexo: '',
    edad: '',
    telefono: '',
    estado_civil: '',
    identificacionunicanacional: '',
    Domicilio: '',
    condicionesEspeciales: '',
    fechaNacimiento: '',
    municipioNacimiento: '',
    EstadoNacimiento: '',
    PaisNacimiento: '',
    idPais: '',
    idCiudad: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Efectos
  useEffect(() => {
    const loadData = async () => {
      if (mostrar && clienteId) {
        // Primero cargar países
        await fetchCountries();
        // Luego cargar datos del cliente (que también cargará las ciudades)
        await fetchClientData();
      }
    };
    
    loadData();
  }, [mostrar, clienteId]);

  // Funciones de API
  const fetchClientData = async () => {
    setIsLoadingData(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:5000/api/clientes/${clienteId}/completo`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const clientData = response.data;
      
      // Función para normalizar nombres de campos
      const normalizeField = (data, fieldName) => {
        return data[fieldName] !== undefined ? data[fieldName] : 
               data[fieldName.toLowerCase()] !== undefined ? data[fieldName.toLowerCase()] : 
               '';
      };
  
      // Formatear todos los datos del cliente para el formulario
      const formattedData = {
        nombreCliente: normalizeField(clientData, 'nombreCliente'),
        apellidoPaternoCliente: normalizeField(clientData, 'apellidoPaternoCliente'),
        apellidoMaternoCliente: normalizeField(clientData, 'apellidoMaternoCliente'),
        sexo: normalizeField(clientData, 'sexo'),
        edad: clientData.edad ? clientData.edad.toString() : '',
        telefono: normalizeField(clientData, 'telefono'),
        estado_civil: normalizeField(clientData, 'estado_civil'),
        identificacionunicanacional: normalizeField(clientData, 'identificacionunicanacional'),
        Domicilio: normalizeField(clientData, 'Domicilio'),
        condicionesEspeciales: normalizeField(clientData, 'condicionesEspeciales'),
        fechaNacimiento: normalizeField(clientData, 'fechaNacimiento'),
        municipioNacimiento: normalizeField(clientData, 'municipioNacimiento'),
        EstadoNacimiento: normalizeField(clientData, 'EstadoNacimiento'),
        PaisNacimiento: normalizeField(clientData, 'paisNacimiento'),
        idPais: normalizeField(clientData, 'idPais'),
        idCiudad: normalizeField(clientData, 'idCiudad'),
        nombreCiudad: normalizeField(clientData, 'nombreCiudad'),
        nombrePais: normalizeField(clientData, 'nombrePais')
      };
      
      setFormData(formattedData);
      
      // Cargar países primero si no están cargados
      if (countries.length === 0) {
        await fetchCountries();
      }
      
      // Cargar ciudades si hay un país seleccionado
      if (formattedData.idPais) {
        await fetchCitiesByCountry(formattedData.idPais);
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
      alert('Error al cargar datos del cliente');
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/paises', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const formattedCountries = response.data.map(country => ({
        idPais: country.idPais || country.idpais,
        nombrePais: country.nombrePais || country.nombrepais
      }));
      
      setCountries(formattedCountries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      alert('Error al cargar países');
    }
  };

  const fetchCitiesByCountry = async (countryId) => {
    if (!countryId) {
      setCities([]);
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:5000/api/paises/${countryId}/ciudades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const formattedCities = response.data.map(city => ({
        idCiudad: city.idCiudad || city.idciudad,
        nombreCiudad: city.nombreCiudad || city.nombreciudad
      }));
      
      setCities(formattedCities);
      
      // Verificar si la ciudad actual del cliente existe en las nuevas ciudades cargadas
      if (formData.idCiudad) {
        const ciudadExiste = formattedCities.some(c => c.idCiudad === formData.idCiudad);
        if (!ciudadExiste) {
          setFormData(prev => ({ ...prev, idCiudad: '' }));
        }
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    }
  };

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updatedForm = { ...prev, [name]: value };
      
      if (name === 'idPais') {
        fetchCitiesByCountry(value);
        updatedForm.idCiudad = '';
      }
      
      return updatedForm;
    });
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updatedForm = { ...prev, [name]: value };
      
      // Calcular edad automáticamente si se proporciona fecha de nacimiento
      if (name === 'fechaNacimiento' && value) {
        const birthDate = new Date(value);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        
        // Ajustar si aún no ha pasado el cumpleaños este año
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        
        updatedForm.edad = calculatedAge.toString();
      }
      
      return updatedForm;
    });
    
    if (validationErrors[name] || validationErrors.edad) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined,
        edad: undefined
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      'nombreCliente',
      'apellidoPaternoCliente',
      'telefono',
      'identificacionunicanacional',
      'idPais',
      'idCiudad'
    ];

    // Validación de campos obligatorios
    requiredFields.forEach(field => {
      if (!formData[field]?.toString().trim()) {
        errors[field] = 'Este campo es obligatorio';
      }
    });

    // Validación de nombre
    if (formData.nombreCliente?.trim().length < 2) {
      errors.nombreCliente = 'Mínimo 2 caracteres';
    }

    // Validación de teléfono
    const cleanPhone = formData.telefono?.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.telefono = 'Mínimo 10 dígitos';
    }

    // Validación de edad
    if (formData.edad && (parseInt(formData.edad) < 0 || parseInt(formData.edad) > 120)) {
      errors.edad = 'Edad inválida (0-120)';
    }

    // Validación de identificación según país de nacimiento
    if (formData.identificacionunicanacional && formData.PaisNacimiento) {
      const idNumber = formData.identificacionunicanacional.trim();
      const birthCountry = formData.PaisNacimiento.toLowerCase();

      // Validación para México (CURP/RFC)
      if (birthCountry.includes('méxico') || birthCountry.includes('mexico')) {
        if (!/^[A-Z]{4}\d{6}[A-Z]{6}\d{2}$/.test(idNumber.toUpperCase()) && // CURP
            !/^[A-Z]{4}\d{6}[A-Z0-9]{3}$/.test(idNumber.toUpperCase())) {   // RFC
          errors.identificacionunicanacional = 'Formato inválido para México (debe ser CURP o RFC)';
        }
      }
      // Validación para Estados Unidos (SSN)
      else if (birthCountry.includes('estados unidos') || birthCountry.includes('united states')) {
        if (!/^\d{3}-\d{2}-\d{4}$/.test(idNumber)) {
          errors.identificacionunicanacional = 'Formato inválido para USA (debe ser ###-##-####)';
        }
      }
      // Validación para otros países (documento genérico)
      else {
        if (idNumber.length < 5 || idNumber.length > 20) {
          errors.identificacionunicanacional = 'Longitud inválida (5-20 caracteres)';
        }
      }
    }

    // Validación de fecha de nacimiento vs edad
    if (formData.fechaNacimiento && formData.edad) {
      const birthDate = new Date(formData.fechaNacimiento);
      const today = new Date();
      const calculatedAge = today.getFullYear() - birthDate.getFullYear();
      
      // Ajuste para meses/días no cumplidos
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      if (Math.abs(calculatedAge - parseInt(formData.edad)) > 1) {
        errors.edad = `La edad no coincide con la fecha de nacimiento (edad calculada: ${calculatedAge})`;
        errors.fechaNacimiento = `La fecha no coincide con la edad (${formData.edad} años)`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `http://localhost:5000/api/clientes/${clienteId}`,
        {
          ...formData,
          edad: formData.edad ? parseInt(formData.edad) : null,
          telefono: formData.telefono.replace(/\D/g, '')
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Cliente actualizado exitosamente');
      onClienteActualizado();
      cerrar();
    } catch (error) {
      console.error('Error updating client:', error);
      
      let errorMessage = 'Error al actualizar cliente';
      if (error.response) {
        if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 404) {
          errorMessage = 'Cliente no encontrado';
        } else if (error.response.status === 400) {
          errorMessage = 'Datos inválidos';
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mostrar) return null;

  return (
    <div className="editar-modal-overlay">
      <div className="editar-modal-container">
        <h2 className="editar-modal-title">Editar Cliente</h2>
        
        {isLoadingData ? (
          <div className="editar-loading">
            <div className="spinner"></div>
            <p>Cargando datos del cliente...</p>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="editar-form">
            <div className="editar-form-grid">
              {/* Sección 1: Información Básica */}
              <div className="editar-form-section">
                <h3 className="editar-section-title">Información Básica</h3>
                
                <div className="editar-form-group">
                  <label className="editar-form-label">Nombre*</label>
                  <input
                    type="text"
                    name="nombreCliente"
                    value={formData.nombreCliente}
                    onChange={handleInputChange}
                    className={`editar-form-input ${validationErrors.nombreCliente ? 'editar-input-error' : ''}`}
                    placeholder="Nombre del cliente"
                  />
                  {validationErrors.nombreCliente && (
                    <span className="editar-error-message">{validationErrors.nombreCliente}</span>
                  )}
                </div>

                <div className="editar-form-group">
                  <label className="editar-form-label">Apellido Paterno*</label>
                  <input
                    type="text"
                    name="apellidoPaternoCliente"
                    value={formData.apellidoPaternoCliente}
                    onChange={handleInputChange}
                    className={`editar-form-input ${validationErrors.apellidoPaternoCliente ? 'editar-input-error' : ''}`}
                    placeholder="Apellido paterno"
                  />
                  {validationErrors.apellidoPaternoCliente && (
                    <span className="editar-error-message">{validationErrors.apellidoPaternoCliente}</span>
                  )}
                </div>

                <div className="editar-form-group">
                  <label className="editar-form-label">Apellido Materno</label>
                  <input
                    type="text"
                    name="apellidoMaternoCliente"
                    value={formData.apellidoMaternoCliente}
                    onChange={handleInputChange}
                    className="editar-form-input"
                    placeholder="Apellido materno (opcional)"
                  />
                </div>

                <div className="editar-form-group">
                  <label className="editar-form-label">Sexo</label>
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleInputChange}
                    className="editar-form-select"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                    <option value="Prefiero no decir">Prefiero no decir</option>
                  </select>
                </div>

                <div className="editar-form-group">
                  <label className="editar-form-label">Edad</label>
                  <input
                    type="number"
                    name="edad"
                    value={formData.edad}
                    onChange={handleInputChange}
                    min="0"
                    max="120"
                    className={`editar-form-input ${validationErrors.edad ? 'editar-input-error' : ''}`}
                    placeholder="Edad (opcional)"
                  />
                  {validationErrors.edad && (
                    <span className="editar-error-message">{validationErrors.edad}</span>
                  )}
                </div>
              </div>

              {/* Sección 2: Contacto e Identificación */}
              <div className="editar-form-section">
                <h3 className="editar-section-title">Contacto e Identificación</h3>
                
                <div className="editar-form-group">
                  <label className="editar-form-label">Teléfono*</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className={`editar-form-input ${validationErrors.telefono ? 'editar-input-error' : ''}`}
                    placeholder="Ej: 5551234567"
                  />
                  {validationErrors.telefono && (
                    <span className="editar-error-message">{validationErrors.telefono}</span>
                  )}
                </div>

                <div className="editar-form-group">
                  <label className="editar-form-label">Estado Civil</label>
                  <select
                    name="estado_civil"
                    value={formData.estado_civil}
                    onChange={handleInputChange}
                    className="editar-form-select"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Soltero/a">Soltero/a</option>
                    <option value="Casado/a">Casado/a</option>
                    <option value="Divorciado/a">Divorciado/a</option>
                    <option value="Viudo/a">Viudo/a</option>
                    <option value="Unión Libre">Unión Libre</option>
                  </select>
                </div>

                <div className="editar-form-group">
                  <label className="editar-form-label">Identificación*</label>
                  <input
                    type="text"
                    name="identificacionunicanacional"
                    value={formData.identificacionunicanacional}
                    onChange={handleInputChange}
                    className={`editar-form-input ${validationErrors.identificacionunicanacional ? 'editar-input-error' : ''}`}
                    placeholder="Número de identificación"
                  />
                  {validationErrors.identificacionunicanacional && (
                    <span className="editar-error-message">{validationErrors.identificacionunicanacional}</span>
                  )}
                </div>

                <div className="editar-form-group">
                  <label className="editar-form-label">Domicilio</label>
                  <textarea
                    name="Domicilio"
                    value={formData.Domicilio}
                    onChange={handleInputChange}
                    className="editar-form-textarea"
                    placeholder="Dirección completa"
                    rows="3"
                  />
                </div>

                <div className="editar-form-group">
                  <label className="editar-form-label">Condiciones Especiales</label>
                  <textarea
                    name="condicionesEspeciales"
                    value={formData.condicionesEspeciales}
                    onChange={handleInputChange}
                    className="editar-form-textarea"
                    placeholder="Alergias, discapacidades, etc."
                    rows="3"
                  />
                </div>
              </div>

              {/* Sección 3: Ubicación */}
              <div className="editar-form-section">
                <h3 className="editar-section-title">Ubicación</h3>
                
                <div className="editar-form-group">
                  <label className="editar-form-label">País*</label>
                  <select
                    name="idPais"
                    value={formData.idPais}
                    onChange={handleInputChange}
                    className={`editar-form-select ${validationErrors.idPais ? 'editar-input-error' : ''}`}
                  >
                    <option value="">Seleccionar país</option>
                    {countries.map(country => (
                      <option key={country.idPais} value={country.idPais}>
                        {country.nombrePais}
                      </option>
                    ))}
                  </select>
                  {validationErrors.idPais && (
                    <span className="editar-error-message">{validationErrors.idPais}</span>
                  )}
                </div>

                <div className="editar-form-group">
                  <label className="editar-form-label">Ciudad*</label>
                  <select
                    name="idCiudad"
                    value={formData.idCiudad}
                    onChange={handleInputChange}
                    disabled={!formData.idPais}
                    className={`editar-form-select ${validationErrors.idCiudad ? 'editar-input-error' : ''}`}
                  >
                    <option value="">{formData.idPais ? 'Seleccionar ciudad' : 'Seleccione un país primero'}</option>
                    {cities.map(city => (
                      <option key={city.idCiudad} value={city.idCiudad}>
                        {city.nombreCiudad}
                      </option>
                    ))}
                  </select>
                  {validationErrors.idCiudad && (
                    <span className="editar-error-message">{validationErrors.idCiudad}</span>
                  )}
                </div>
              </div>

              {/* Sección 4: Datos de Nacimiento */}
              <div className="editar-form-section">
                <h3 className="editar-section-title">Datos de Nacimiento</h3>
                
                <div className="editar-form-group">
                  <label className="editar-form-label">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleDateChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={`editar-form-input ${validationErrors.fechaNacimiento ? 'editar-input-error' : ''}`}
                  />
                  {validationErrors.fechaNacimiento && (
                    <span className="editar-error-message">{validationErrors.fechaNacimiento}</span>
                  )}
                </div>

                <div className="editar-form-group">
                  <label className="editar-form-label">Municipio de Nacimiento</label>
                  <input
                    type="text"
                    name="municipioNacimiento"
                    value={formData.municipioNacimiento}
                    onChange={handleInputChange}
                    className="editar-form-input"
                    placeholder="Municipio donde nació"
                  />
                </div>

                <div className="editar-form-group">
                  <label className="editar-form-label">Estado de Nacimiento</label>
                  <input
                    type="text"
                    name="EstadoNacimiento"
                    value={formData.EstadoNacimiento}
                    onChange={handleInputChange}
                    className="editar-form-input"
                    placeholder="Estado donde nació"
                  />
                </div>

                <div className="editar-form-group">
                  <label className="editar-form-label">País de Nacimiento</label>
                  <input
                    type="text"
                    name="PaisNacimiento"
                    value={formData.PaisNacimiento}
                    onChange={handleInputChange}
                    className="editar-form-input"
                    placeholder="País donde nació"
                  />
                </div>
              </div>
            </div>

            <div className="editar-form-actions">
              <button 
                type="button" 
                onClick={cerrar} 
                disabled={isSubmitting}
                className="editar-btn editar-btn-cancel"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="editar-btn editar-btn-submit"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-small"></span>
                    Guardando...
                  </>
                ) : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditarCliente;