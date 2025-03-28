import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaUsers, FaChevronDown, FaChevronUp, FaInfoCircle } from 'react-icons/fa';
import { MdOutlineMeetingRoom } from 'react-icons/md';
import axios from 'axios';

const AreasPage = () => {
  // Estados
  const [editingArea, setEditingArea] = useState(null);
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedArea, setExpandedArea] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newArea, setNewArea] = useState({ nombreArea: '', descripcion: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Colores para las tarjetas de áreas
  const areaColors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#d35400'];

  // Configuración de axios
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
  });

  api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  }, error => Promise.reject(error));

  // Obtener áreas del backend
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const response = await api.get('/areas');
        const areasWithColors = response.data.map((area, index) => ({
          ...area,
          nombreArea: area.nombreArea || 'Área sin nombre',
          descripcion: area.descripcion || 'Sin descripción',
          responsable: area.responsable || 'Sin asignar',
          empleados: area.empleados || 0,
          color: areaColors[index % areaColors.length]
        }));

        setAreas(areasWithColors);
        setFilteredAreas(areasWithColors);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar áreas');
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAreas();
  }, []);

  // Filtrado de áreas
  useEffect(() => {
    if (!areas.length) return;
    
    const searchTermLower = searchTerm.toLowerCase();
    const results = areas.filter(area => 
      area.nombreArea.toLowerCase().includes(searchTermLower) || 
      area.descripcion.toLowerCase().includes(searchTermLower)
    );
    
    setFilteredAreas(results);
  }, [searchTerm, areas]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewArea(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateArea = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.post('/areas', newArea);
      const updatedAreas = await api.get('/areas');
      
      const areasWithColors = updatedAreas.data.map((area, index) => ({
        ...area,
        color: areaColors[index % areaColors.length]
      }));
      
      setAreas(areasWithColors);
      setFilteredAreas(areasWithColors);
      setNewArea({ nombreArea: '', descripcion: '' });
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear área');
    }
  };

  const handleUpdateArea = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.put(`/areas/${editingArea.idArea}`, editingArea);
      
      setAreas(areas.map(area => 
        area.idArea === editingArea.idArea ? { ...response.data, color: area.color } : area
      ));
      
      setFilteredAreas(filteredAreas.map(area => 
        area.idArea === editingArea.idArea ? { ...response.data, color: area.color } : area
      ));
      
      setEditingArea(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar área');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta área?')) return;
    
    try {
      await api.delete(`/areas/${id}`);
      
      setAreas(areas.filter(area => area.idArea !== id));
      setFilteredAreas(filteredAreas.filter(area => area.idArea !== id));
      
      alert('Área eliminada correctamente');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al eliminar área';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const toggleExpand = (id) => {
    setExpandedArea(expandedArea === id ? null : id);
  };

  return (
    <div className="areas-container">
      <div className="areas-header">
        <h1><MdOutlineMeetingRoom className="header-icon" /> Gestión de Áreas</h1>
        <button onClick={() => setShowModal(true)} className="btn-add-area">
          <span className="btn-icon-circle"><FaPlus className="btn-icon" /></span>
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

      {/* Modal de Edición */}
      {editingArea && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2><MdOutlineMeetingRoom /> Editar Área</h2>
            
            <form onSubmit={handleUpdateArea}>
              <div className="form-group">
                <label>Nombre del Área:</label>
                <input
                  type="text"
                  value={editingArea.nombreArea}
                  onChange={(e) => setEditingArea({
                    ...editingArea,
                    nombreArea: e.target.value
                  })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  value={editingArea.descripcion}
                  onChange={(e) => setEditingArea({
                    ...editingArea,
                    descripcion: e.target.value
                  })}
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setEditingArea(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      {isLoading ? (
        <div className="loading-animation">
          <div className="spinner"></div>
          <p>Cargando áreas...</p>
        </div>
      ) : filteredAreas.length === 0 ? (
        <div className="no-results">
          <FaInfoCircle className="info-icon" />
          <p>{searchTerm ? 'No hay resultados para tu búsqueda' : 'No hay áreas registradas'}</p>
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
                <h3>{area.nombreArea}</h3>
                <span className="toggle-icon">
                  {expandedArea === area.idArea ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>
              
              <div className="card-content">
                <p className="area-description">{area.descripcion}</p>
                
                <div className="area-stats">
                  <div className="stat-item">
                    <span className="stat-label">Empleados:</span>
                    <span className="stat-value">{area.empleados}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Responsable:</span>
                    <span className="stat-value">{area.responsable}</span>
                  </div>
                </div>

                {expandedArea === area.idArea && (
                  <div className="expanded-content">
                    <div className="area-actions">
                      <button
                        onClick={() => setEditingArea(area)}
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
                        onClick={() => navigate(`/asignar-empleados/${area.idArea}`)}
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
            <h2><MdOutlineMeetingRoom /> Crear Nueva Área</h2>
            
            <form onSubmit={handleCreateArea}>
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
                <button type="submit" className="btn-confirm">
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