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
    if (mostrar && clienteId) {
      fetchClientData();
      fetchCountries();
    }
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
      if (clientData.fechaNacimiento) {
        clientData.fechaNacimiento = new Date(clientData.fechaNacimiento).toISOString().split('T')[0];
      }
      
      setFormData(clientData);
      
      if (clientData.idPais) {
        await fetchCitiesByCountry(clientData.idPais);
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
      const response = await axios.put(
        `http://localhost:5000/api/clientes/${clienteId}`,
        {
          ...formData,
          edad: formData.edad ? Number(formData.edad) : null,
          telefono: formData.telefono.replace(/\D/g, '')
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Cliente actualizado exitosamente');
      onClienteActualizado(response.data);
      cerrar();
    } catch (error) {
      console.error('Error updating client:', error);
      alert(error.response?.data?.error || 'Error al actualizar cliente');
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
          <div className="editar-loading">Cargando datos del cliente...</div>
        ) : (
          <form onSubmit={handleFormSubmit} className="editar-form">
            <div className="editar-form-grid">
              {/* Sección Datos Personales */}
              <div className="editar-form-section">
                <h3 className="editar-section-title">Datos Personales</h3>
                
                <div className="editar-form-group">
                  <label className="editar-form-label">Nombre*</label>
                  <input
                    type="text"
                    name="nombreCliente"
                    value={formData.nombreCliente}
                    onChange={handleInputChange}
                    className={`editar-form-input ${validationErrors.nombreCliente ? 'editar-input-error' : ''}`}
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
                  />
                </div>

                <div className="editar-form-group">
                  <label className="editar-form-label">Teléfono*</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className={`editar-form-input ${validationErrors.telefono ? 'editar-input-error' : ''}`}
                  />
                  {validationErrors.telefono && (
                    <span className="editar-error-message">{validationErrors.telefono}</span>
                  )}
                </div>
              </div>

              {/* Sección Ubicación */}
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

                <div className="editar-form-group">
                  <label className="editar-form-label">Domicilio</label>
                  <input
                    type="text"
                    name="Domicilio"
                    value={formData.Domicilio}
                    onChange={handleInputChange}
                    className="editar-form-input"
                  />
                </div>

                <div className="editar-form-group">
                  <label className="editar-form-label">Identificación*</label>
                  <input
                    type="text"
                    name="identificacionunicanacional"
                    value={formData.identificacionunicanacional}
                    onChange={handleInputChange}
                    className={`editar-form-input ${validationErrors.identificacionunicanacional ? 'editar-input-error' : ''}`}
                  />
                  {validationErrors.identificacionunicanacional && (
                    <span className="editar-error-message">{validationErrors.identificacionunicanacional}</span>
                  )}
                </div>
              </div>

              {/* Sección Información Adicional */}
              <div className="editar-form-section">
                <h3 className="editar-section-title">Información Adicional</h3>
                
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
                  />
                  {validationErrors.edad && (
                    <span className="editar-error-message">{validationErrors.edad}</span>
                  )}
                </div>

                <div className="editar-form-group">
                  <label className="editar-form-label">Estado Civil</label>
                  <input
                    type="text"
                    name="estado_civil"
                    value={formData.estado_civil}
                    onChange={handleInputChange}
                    className="editar-form-input"
                  />
                </div>

                <div className="editar-form-group">
                  <label className="editar-form-label">Fecha Nacimiento</label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="editar-form-input"
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
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditarCliente;