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

    requiredFields.forEach(field => {
      if (!formData[field]?.toString().trim()) {
        errors[field] = 'Este campo es obligatorio';
      }
    });

    if (formData.nombreCliente?.trim().length < 2) {
      errors.nombreCliente = 'Mínimo 2 caracteres';
    }

    const cleanPhone = formData.telefono?.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.telefono = 'Mínimo 10 dígitos';
    }

    if (formData.edad && (formData.edad < 0 || formData.edad > 120)) {
      errors.edad = 'Edad inválida';
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
          ...formData,
          edad: formData.edad ? Number(formData.edad) : null,
          telefono: formData.telefono.replace(/\D/g, '')
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Cliente creado exitosamente');
      onClienteCreado(response.data);
      cerrar();
    } catch (error) {
      console.error('Error creating client:', error);
      alert(error.response?.data?.error || 'Error al crear cliente');
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
            </div>

            {/* Sección Ubicación */}
            <div className="cliente-form-section">
              <h3 className="cliente-section-title">Ubicación</h3>
              
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
            </div>

            {/* Sección Información Adicional */}
            <div className="cliente-form-section">
              <h3 className="cliente-section-title">Información Adicional</h3>
              
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
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
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
              {isSubmitting ? 'Creando...' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearCliente;