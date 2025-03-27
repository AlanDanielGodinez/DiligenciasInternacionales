import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaUsers, FaChevronDown, FaChevronUp, FaInfoCircle } from 'react-icons/fa';
import { MdOutlineMeetingRoom } from 'react-icons/md';


const AreasPage = () => {
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedArea, setExpandedArea] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newArea, setNewArea] = useState({
    nombreArea: '',
    descripcion: ''
  });

  // Datos de ejemplo (simulando API)
  useEffect(() => {
    const fetchAreas = async () => {
      setTimeout(() => {
        const mockAreas = [
          {
            idArea: 1,
            nombreArea: 'Finanzas',
            descripcion: 'Área encargada de la gestión económica y contable',
            empleados: 5,
            responsable: 'Juan Pérez',
            color: '#3498db'
          },
          {
            idArea: 2,
            nombreArea: 'Recursos Humanos',
            descripcion: 'Gestión del personal, contrataciones y desarrollo',
            empleados: 3,
            responsable: 'María Gómez',
            color: '#2ecc71'
          },
          {
            idArea: 3,
            nombreArea: 'Operaciones',
            descripcion: 'Gestión de trámites y procesos principales',
            empleados: 8,
            responsable: 'Carlos Ruiz',
            color: '#e74c3c'
          },
          {
            idArea: 4,
            nombreArea: 'Tecnología',
            descripcion: 'Sistemas, desarrollo de software e infraestructura',
            empleados: 4,
            responsable: 'Ana Martínez',
            color: '#f39c12'
          },
          {
            idArea: 5,
            nombreArea: 'Legal',
            descripcion: 'Asesoría jurídica y cumplimiento normativo',
            empleados: 2,
            responsable: 'Laura Fernández',
            color: '#9b59b6'
          }
        ];
        setAreas(mockAreas);
        setFilteredAreas(mockAreas);
        setIsLoading(false);
      }, 1000);
    };

    fetchAreas();
  }, []);

  // Filtrado de áreas
  useEffect(() => {
    const results = areas.filter(area =>
      area.nombreArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAreas(results);
  }, [searchTerm, areas]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewArea(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Colores predefinidos para nuevas áreas
    const areaColors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#d35400'];
    const randomColor = areaColors[Math.floor(Math.random() * areaColors.length)];
    
    const newAreaObj = {
      idArea: areas.length + 1,
      nombreArea: newArea.nombreArea,
      descripcion: newArea.descripcion,
      empleados: 0,
      responsable: 'Sin asignar',
      color: randomColor
    };
    
    setAreas([...areas, newAreaObj]);
    setNewArea({ nombreArea: '', descripcion: '' });
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setAreas(areas.filter(area => area.idArea !== id));
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
              <div 
                className="card-header" 
                onClick={() => toggleExpand(area.idArea)}
                style={{ backgroundColor: area.color }}
              >
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
                      <Link 
                        to={`/editar-area/${area.idArea}`} 
                        className="btn-edit"
                      >
                        <FaEdit /> Editar
                      </Link>
                      <button 
                        onClick={() => handleDelete(area.idArea)}
                        className="btn-delete"
                      >
                        <FaTrash /> Eliminar
                      </button>
                      <Link 
                        to={`/asignar-empleados/${area.idArea}`}
                        className="btn-assign"
                      >
                        <FaUsers /> Asignar
                      </Link>
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
                  onClick={() => setShowModal(false)}
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