import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CrearCliente = ({ mostrar, cerrar, onClienteCreado }) => {
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

  // Efectos
  useEffect(() => {
    if (mostrar) {
      fetchCountries();
    }
  }, [mostrar]);

  // Funciones de API
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
      alert('Error al cargar países. Intente nuevamente.');
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
      const response = await axios.post(
        'http://localhost:5000/api/clientes',
        {
          nombreCliente: formData.nombreCliente,
          apellidoPaternoCliente: formData.apellidoPaternoCliente,
          apellidoMaternoCliente: formData.apellidoMaternoCliente || null,
          sexo: formData.sexo || null,
          edad: formData.edad ? Number(formData.edad) : null,
          telefono: formData.telefono.replace(/\D/g, ''),
          estado_civil: formData.estado_civil || null,
          identificacionunicanacional: formData.identificacionunicanacional,
          Domicilio: formData.Domicilio || null,
          condicionesEspeciales: formData.condicionesEspeciales || null,
          fechaNacimiento: formData.fechaNacimiento || null,
          municipioNacimiento: formData.municipioNacimiento || null,
          EstadoNacimiento: formData.EstadoNacimiento || null,
          PaisNacimiento: formData.PaisNacimiento || null,
          idPais: formData.idPais,
          idCiudad: formData.idCiudad
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      alert('Cliente creado exitosamente');
      onClienteCreado(response.data);
      cerrar();
    } catch (error) {
      console.error('Error creando cliente:', error);
      
      let errorMessage = 'Error al crear cliente';
      if (error.response) {
        if (error.response.data?.error) {
          errorMessage = error.response.data.error;
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
    <div className="cliente-modal-overlay">
      <div className="cliente-modal-container">
        <h2 className="cliente-modal-title">Crear Nuevo Cliente</h2>
        
        <form onSubmit={handleFormSubmit} className="cliente-form">
          <div className="cliente-form-grid">
            {/* Sección Datos Personales */}
            <div className="cliente-form-section">
              <h3 className="cliente-section-title">Datos Personales</h3>
              
              <div className="cliente-form-group">
                <label className="cliente-form-label">Nombre*</label>
                <input
                  type="text"
                  name="nombreCliente"
                  value={formData.nombreCliente}
                  onChange={handleInputChange}
                  className={`cliente-form-input ${validationErrors.nombreCliente ? 'cliente-input-error' : ''}`}
                />
                {validationErrors.nombreCliente && (
                  <span className="cliente-error-message">{validationErrors.nombreCliente}</span>
                )}
              </div>

              <div className="cliente-form-group">
                <label className="cliente-form-label">Apellido Paterno*</label>
                <input
                  type="text"
                  name="apellidoPaternoCliente"
                  value={formData.apellidoPaternoCliente}
                  onChange={handleInputChange}
                  className={`cliente-form-input ${validationErrors.apellidoPaternoCliente ? 'cliente-input-error' : ''}`}
                />
                {validationErrors.apellidoPaternoCliente && (
                  <span className="cliente-error-message">{validationErrors.apellidoPaternoCliente}</span>
                )}
              </div>

              <div className="cliente-form-group">
                <label className="cliente-form-label">Apellido Materno</label>
                <input
                  type="text"
                  name="apellidoMaternoCliente"
                  value={formData.apellidoMaternoCliente}
                  onChange={handleInputChange}
                  className="cliente-form-input"
                />
              </div>

              <div className="cliente-form-group">
                <label className="cliente-form-label">Sexo</label>
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleInputChange}
                  className="cliente-form-select"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="cliente-form-group">
                <label className="cliente-form-label">Edad</label>
                <input
                  type="number"
                  name="edad"
                  value={formData.edad}
                  onChange={handleInputChange}
                  min="0"
                  max="120"
                  className={`cliente-form-input ${validationErrors.edad ? 'cliente-input-error' : ''}`}
                />
                {validationErrors.edad && (
                  <span className="cliente-error-message">{validationErrors.edad}</span>
                )}
              </div>

              <div className="cliente-form-group">
                <label className="cliente-form-label">Estado Civil</label>
                <input
                  type="text"
                  name="estado_civil"
                  value={formData.estado_civil}
                  onChange={handleInputChange}
                  className="cliente-form-input"
                />
              </div>

              <div className="cliente-form-group">
                <label className="cliente-form-label">Fecha Nacimiento</label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleDateChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`cliente-form-input ${validationErrors.fechaNacimiento ? 'cliente-input-error' : ''}`}
                />
                {validationErrors.fechaNacimiento && (
                  <span className="cliente-error-message">{validationErrors.fechaNacimiento}</span>
                )}
              </div>
            </div>

            {/* Sección Ubicación y Datos Adicionales */}
            <div className="cliente-form-section">
              <h3 className="cliente-section-title">Ubicación y Datos Adicionales</h3>
              
              <div className="cliente-form-group">
                <label className="cliente-form-label">País*</label>
                <select
                  name="idPais"
                  value={formData.idPais}
                  onChange={handleInputChange}
                  className={`cliente-form-select ${validationErrors.idPais ? 'cliente-input-error' : ''}`}
                >
                  <option value="">Seleccionar país</option>
                  {countries.map(country => (
                    <option key={country.idPais} value={country.idPais}>
                      {country.nombrePais}
                    </option>
                  ))}
                </select>
                {validationErrors.idPais && (
                  <span className="cliente-error-message">{validationErrors.idPais}</span>
                )}
              </div>

              <div className="cliente-form-group">
                <label className="cliente-form-label">Ciudad*</label>
                <select
                  name="idCiudad"
                  value={formData.idCiudad}
                  onChange={handleInputChange}
                  disabled={!formData.idPais}
                  className={`cliente-form-select ${validationErrors.idCiudad ? 'cliente-input-error' : ''}`}
                >
                  <option value="">{formData.idPais ? 'Seleccionar ciudad' : 'Seleccione un país primero'}</option>
                  {cities.map(city => (
                    <option key={city.idCiudad} value={city.idCiudad}>
                      {city.nombreCiudad}
                    </option>
                  ))}
                </select>
                {validationErrors.idCiudad && (
                  <span className="cliente-error-message">{validationErrors.idCiudad}</span>
                )}
              </div>

              <div className="cliente-form-group">
                <label className="cliente-form-label">Domicilio</label>
                <input
                  type="text"
                  name="Domicilio"
                  value={formData.Domicilio}
                  onChange={handleInputChange}
                  className="cliente-form-input"
                />
              </div>

              <div className="cliente-form-group">
                <label className="cliente-form-label">Identificación*</label>
                <input
                  type="text"
                  name="identificacionunicanacional"
                  value={formData.identificacionunicanacional}
                  onChange={handleInputChange}
                  className={`cliente-form-input ${validationErrors.identificacionunicanacional ? 'cliente-input-error' : ''}`}
                />
                {validationErrors.identificacionunicanacional && (
                  <span className="cliente-error-message">{validationErrors.identificacionunicanacional}</span>
                )}
              </div>

              <div className="cliente-form-group">
                <label className="cliente-form-label">Teléfono*</label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={`cliente-form-input ${validationErrors.telefono ? 'cliente-input-error' : ''}`}
                />
                {validationErrors.telefono && (
                  <span className="cliente-error-message">{validationErrors.telefono}</span>
                )}
              </div>

              <div className="cliente-form-group">
                <label className="cliente-form-label">Condiciones Especiales</label>
                <textarea
                  name="condicionesEspeciales"
                  value={formData.condicionesEspeciales}
                  onChange={handleInputChange}
                  className="cliente-form-input"
                  rows="3"
                />
              </div>
            </div>

            {/* Sección Lugar de Nacimiento */}
            <div className="cliente-form-section">
              <h3 className="cliente-section-title">Lugar de Nacimiento</h3>
              
              <div className="cliente-form-group">
                <label className="cliente-form-label">Municipio de Nacimiento</label>
                <input
                  type="text"
                  name="municipioNacimiento"
                  value={formData.municipioNacimiento}
                  onChange={handleInputChange}
                  className="cliente-form-input"
                />
              </div>

              <div className="cliente-form-group">
                <label className="cliente-form-label">Estado de Nacimiento</label>
                <input
                  type="text"
                  name="EstadoNacimiento"
                  value={formData.EstadoNacimiento}
                  onChange={handleInputChange}
                  className="cliente-form-input"
                />
              </div>

              <div className="cliente-form-group">
                <label className="cliente-form-label">País de Nacimiento</label>
                <input
                  type="text"
                  name="PaisNacimiento"
                  value={formData.PaisNacimiento}
                  onChange={handleInputChange}
                  className="cliente-form-input"
                />
              </div>
            </div>
          </div>

          <div className="cliente-form-actions">
            <button 
              type="button" 
              onClick={cerrar} 
              disabled={isSubmitting}
              className="cliente-btn cliente-btn-cancel"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="cliente-btn cliente-btn-submit"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  Creando...
                </>
              ) : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearCliente;