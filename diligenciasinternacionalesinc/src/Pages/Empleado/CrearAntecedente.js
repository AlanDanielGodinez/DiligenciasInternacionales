import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSave, FaTimes, FaCalendarAlt, FaPhone, FaHome, FaStickyNote } from 'react-icons/fa';


const CrearAntecedente = ({ mostrar, cerrar, cliente, onAntecedenteCreado }) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    tipoTramite: '',
    descripcion: '',
    telefono: cliente?.telefono || '',
    fechaTramite: new Date().toISOString().split('T')[0], // Fecha actual
    estadoTramite: 'Pendiente',
    Domicilio: cliente?.Domicilio || '',
    observaciones: ''
  });

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Efecto para resetear el formulario cuando cambia el cliente
  useEffect(() => {
    if (cliente) {
      setFormData(prev => ({
        ...prev,
        telefono: cliente.telefono || '',
        Domicilio: cliente.Domicilio || ''
      }));
    }
  }, [cliente]);

  // Manejadores de cambios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error si se corrige
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTelefonoChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    setFormData(prev => ({
      ...prev,
      telefono: value
    }));
  };

  // Validación del formulario
  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.tipoTramite.trim()) {
      nuevosErrores.tipoTramite = 'El tipo de trámite es requerido';
    }
    
    if (formData.telefono && formData.telefono.length < 10) {
      nuevosErrores.telefono = 'El teléfono debe tener al menos 10 dígitos';
    }
    
    if (!formData.fechaTramite) {
      nuevosErrores.fechaTramite = 'La fecha es requerida';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;
    if (!cliente) return;
    
    setCargando(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:5000/api/antecedentes',
        {
          idCliente: cliente.idCliente,
          ...formData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      onAntecedenteCreado(response.data);
      cerrar();
    } catch (err) {
      console.error('Error al crear antecedente:', err);
      setError(err.response?.data?.error || 'Error al crear antecedente');
    } finally {
      setCargando(false);
    }
  };

  if (!mostrar) return null;

  return (
    <div className="crear-antecedente-modal">
      <div className="crear-antecedente-contenido">
        <div className="crear-antecedente-header">
          <h3>Agregar Antecedente</h3>
          <button onClick={cerrar} className="crear-antecedente-cerrar">
            <FaTimes />
          </button>
        </div>
        
        <div className="crear-antecedente-info-cliente">
          <p><strong>Cliente:</strong> {cliente?.nombreCliente} {cliente?.apellidoPaternoCliente}</p>
          <p><strong>ID:</strong> {cliente?.idCliente}</p>
        </div>
        
        {error && (
          <div className="crear-antecedente-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="crear-antecedente-form">
          <div className="crear-antecedente-form-group">
            <label>Tipo de Trámite *</label>
            <input
              type="text"
              name="tipoTramite"
              value={formData.tipoTramite}
              onChange={handleChange}
              className={errores.tipoTramite ? 'input-error' : ''}
            />
            {errores.tipoTramite && <span className="error-message">{errores.tipoTramite}</span>}
          </div>
          
          <div className="crear-antecedente-form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="crear-antecedente-form-row">
            <div className="crear-antecedente-form-group">
              <label>Teléfono</label>
              <div className="input-with-icon">
                <FaPhone className="input-icon" />
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleTelefonoChange}
                  maxLength="10"
                  className={errores.telefono ? 'input-error' : ''}
                />
              </div>
              {errores.telefono && <span className="error-message">{errores.telefono}</span>}
            </div>
            
            <div className="crear-antecedente-form-group">
              <label>Fecha de Trámite *</label>
              <div className="input-with-icon">
                <FaCalendarAlt className="input-icon" />
                <input
                  type="date"
                  name="fechaTramite"
                  value={formData.fechaTramite}
                  onChange={handleChange}
                  className={errores.fechaTramite ? 'input-error' : ''}
                />
              </div>
              {errores.fechaTramite && <span className="error-message">{errores.fechaTramite}</span>}
            </div>
          </div>
          
          <div className="crear-antecedente-form-row">
            <div className="crear-antecedente-form-group">
              <label>Estado del Trámite</label>
              <select
                name="estadoTramite"
                value={formData.estadoTramite}
                onChange={handleChange}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Completado">Completado</option>
                <option value="Cancelado">Cancelado</option>
                <option value="En proceso">En proceso</option>
              </select>
            </div>
            
            <div className="crear-antecedente-form-group">
              <label>Domicilio</label>
              <div className="input-with-icon">
                <FaHome className="input-icon" />
                <input
                  type="text"
                  name="Domicilio"
                  value={formData.Domicilio}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="crear-antecedente-form-group">
            <label>Observaciones</label>
            <div className="input-with-icon">
              <FaStickyNote className="input-icon" />
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows="2"
              />
            </div>
          </div>
          
          <div className="crear-antecedente-footer">
            <button
              type="button"
              onClick={cerrar}
              className="crear-antecedente-btn crear-antecedente-btn-cancelar"
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="crear-antecedente-btn crear-antecedente-btn-guardar"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <span className="spinner"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave /> Guardar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearAntecedente;