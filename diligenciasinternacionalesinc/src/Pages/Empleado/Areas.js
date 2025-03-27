

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaUsers, FaChevronDown, FaChevronUp, FaInfoCircle } from 'react-icons/fa';
import { MdOutlineMeetingRoom } from 'react-icons/md';
import axios from 'axios';


const AreasPage = () => {
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedArea, setExpandedArea] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newArea, setNewArea] = useState({
    nombreArea: '',
    descripcion: '',
    responsableArea: null  // Añade esto para ser explícito
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Colores predefinidos para las áreas
  const areaColors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#d35400'];

  // Obtener áreas del backend
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No autenticado - Redirigiendo a login');
        }

        console.log('Iniciando carga de áreas...');
        const response = await api.get('/areas');
        console.log('Datos recibidos:', response.data);

        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Formato de datos inválido');
        }

        const areasWithColors = response.data.map((area, index) => ({
          idArea: area.idArea,
          nombreArea: area.nombreArea || 'Área sin nombre',
          descripcion: area.descripcion || 'Sin descripción',
          responsable: area.responsable || 'Sin asignar',
          empleados: area.empleados || 0,
          color: areaColors[index % areaColors.length]
        }));

        setAreas(areasWithColors);
        setFilteredAreas(areasWithColors);
        
      } catch (err) {
        console.error('Error en fetchAreas:', err);
        setError(err.message || 'Error al cargar áreas');
        if (err.message.includes('No autenticado')) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAreas();
  }, []);

  // Filtrado de áreas
  useEffect(() => {
    if (!areas || areas.length === 0) {
      setFilteredAreas([]);
      return;
    }
  
    const searchTermLower = searchTerm ? searchTerm.toLowerCase() : '';
    
    const results = areas.filter(area => {
      const nombre = area.nombreArea ? area.nombreArea.toLowerCase() : '';
      const descripcion = area.descripcion ? area.descripcion.toLowerCase() : '';
      
      return nombre.includes(searchTermLower) || 
             descripcion.includes(searchTermLower);
    });
  
    setFilteredAreas(results);
  }, [searchTerm, areas]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewArea(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Crear nueva área
  // 1. Crear una instancia configurada de axios (añade esto al inicio del archivo)
  const api = axios.create({
    baseURL: 'http://localhost:5000/api', // URL completa en desarrollo
    timeout: 10000,
  });
  
  // Interceptor para añadir automáticamente el token
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, error => {
    return Promise.reject(error);
  });
  
  // 2. Modificar handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No hay token de autenticación');
  
      console.log('Enviando datos:', newArea);
      
      const response = await api.post('/areas', {
        nombreArea: newArea.nombreArea,
        descripcion: newArea.descripcion
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      // Obtener la lista actualizada de áreas
      const updatedAreasResponse = await api.get('/areas');
      
      // Asignar colores a todas las áreas, incluyendo la nueva
      const areasWithColors = updatedAreasResponse.data.map((area, index) => ({
        idArea: area.idArea,
        nombreArea: area.nombreArea,
        descripcion: area.descripcion,
        responsable: area.responsable || 'Sin asignar',
        empleados: area.empleados || 0,
        color: areaColors[index % areaColors.length]
      }));
      
      setAreas(areasWithColors);
      setFilteredAreas(areasWithColors);
      setNewArea({ nombreArea: '', descripcion: '', responsableArea: null });
      setShowModal(false);
      
    } catch (err) {
      console.error('Error completo:', {
        message: err.message,
        response: err.response,
        config: err.config
      });
      
      setError(err.response?.data?.error || `Error al crear el área: ${err.message}`);
      
      if (err.response?.status === 401) {
        setTimeout(() => navigate('/login'), 2000);
      }
    }
  };

  // Eliminar área
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta área?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`/api/areas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAreas(areas.filter(area => area.idArea !== id));
    } catch (err) {
      console.error('Error al eliminar área:', err);
      setError(err.response?.data?.error || 'Error al eliminar el área');
    }
  };

  // Redirigir a edición
  const handleEdit = (id) => {
    navigate(`/editar-area/${id}`);
  };

  // Redirigir a asignación de empleados
  const handleAssign = (id) => {
    navigate(`/asignar-empleados/${id}`);
  };

  const toggleExpand = (id) => {
    setExpandedArea(expandedArea === id ? null : id);
  };

  return (
    <div className="areas-container">
      <div className="areas-header">
        <h1>
          <MdOutlineMeetingRoom className="header-icon" />
          Gestión de Áreas
        </h1>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-add-area"
        >
          <span className="btn-icon-circle">
            <FaPlus className="btn-icon" />
          </span>
          <span className="btn-text">Crear Nueva Área</span>
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar áreas por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="loading-animation">
          <div className="spinner"></div>
          <p>Cargando áreas...</p>
        </div>
      ) : filteredAreas.length === 0 ? (
        <div className="no-results">
          <FaInfoCircle className="info-icon" />
          <p>No se encontraron áreas que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="areas-grid">
          {filteredAreas.map((area, index) => (
            <div 
              key={area.idArea} 
              className={`area-card ${expandedArea === area.idArea ? 'expanded' : ''}`}
              style={{ 
                '--area-color': area.color,
                '--area-color-light': `${area.color}20`,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="card-header" onClick={() => toggleExpand(area.idArea)}>
                <h3>{area.nombreArea || 'Área sin nombre'}</h3>
                <span className="toggle-icon">
                    {expandedArea === area.idArea ? <FaChevronUp /> : <FaChevronDown />}
                </span>
                </div>
              
              <div className="card-content">
                <p className="area-description">{area.descripcion || 'Sin descripción'}</p>
                
                <div className="area-stats">
                  <div className="stat-item">
                    <span className="stat-label">Empleados:</span>
                    <span className="stat-value">{area.empleados}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Responsable:</span>
                    <span className="stat-value">{area.responsable || 'Sin asignar'}</span>
                  </div>
                </div>

                {expandedArea === area.idArea && (
                  <div className="expanded-content">
                    <div className="area-actions">
                      <button
                        onClick={() => handleEdit(area.idArea)}
                        className="btn-edit"
                      >
                        <FaEdit /> Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(area.idArea)}
                        className="btn-delete"
                      >
                        <FaTrash /> Eliminar
                      </button>
                      <button
                        onClick={() => handleAssign(area.idArea)}
                        className="btn-assign"
                      >
                        <FaUsers /> Asignar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para nueva área */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              <MdOutlineMeetingRoom />
              Crear Nueva Área
            </h2>
            
            {error && <div className="modal-error">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Área:</label>
                <input
                  type="text"
                  name="nombreArea"
                  value={newArea.nombreArea}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  name="descripcion"
                  value={newArea.descripcion}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-confirm"
                >
                  Crear Área
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreasPage;
