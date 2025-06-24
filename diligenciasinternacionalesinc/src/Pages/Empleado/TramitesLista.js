import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaPlus, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CrearTramiteModal from './NuevoTramite';

const Tramites = () => {
  // Estados
  const [tramites, setTramites] = useState([]);
  const [tramitesFiltrados, setTramitesFiltrados] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtro, setFiltro] = useState('all');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  
  const navigate = useNavigate();

  // Efectos
  useEffect(() => {
    cargarTramites();
  }, []);

  useEffect(() => {
    filtrarTramites();
  }, [terminoBusqueda, filtro, tramites]);

  // Funciones de API
  const cargarTramites = async () => {
    setCargando(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/tramites', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTramites(response.data);
      setTramitesFiltrados(response.data);
    } catch (err) {
      console.error('Error al cargar trámites:', err);
      setError(err.response?.data?.error || 'Error al cargar trámites');
    } finally {
      setCargando(false);
    }
  };

  // Funciones de manejo de datos
  const handleTramiteCreado = (nuevoTramite) => {
    setTramites(prev => [...prev, nuevoTramite]);
    setMostrarModalCrear(false);
  };

  const filtrarTramites = () => {
    let filtrados = tramites;

    // Filtro de búsqueda
    if (terminoBusqueda) {
      const terminoLower = terminoBusqueda.toLowerCase();
      filtrados = filtrados.filter(tramite => {
        const camposBusqueda = [
         tramite.tipotramite,
          tramite.descripcion,
          ...(tramite.clientes?.map(c => c.nombre) || []),
          ...(tramite.empleados?.map(e => e.nombre) || [])
        ];
        
        return camposBusqueda.some(campo => campo?.toLowerCase().includes(terminoLower));
      });
    }

    // Filtro de estado
    if (filtro === 'active') {
      filtrados = filtrados.filter(tramite => !tramite.fecha_fin);
    } else if (filtro === 'completed') {
      filtrados = filtrados.filter(tramite => tramite.fecha_fin);
    }

    setTramitesFiltrados(filtrados);
  };

  // Handlers
  const handleSearchChange = (e) => setTerminoBusqueda(e.target.value);
  const handleFilterChange = (newFilter) => setFiltro(newFilter);
  const handleHover = (id) => setHoveredItem(id);
  const handleHoverExit = () => setHoveredItem(null);
  const verDetalles = (id) => navigate(`/tramites/${id}`);
  const formatearFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString() : 'N/A';

  return (
    <div className="tramites-container">
      {/* Header */}
      <header className="tramites-header">
        <h1>Gestión de Trámites</h1>
        
        {/* Controles */}
        <div className="tramites-controls">
          {/* Buscador */}
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar trámites..."
              value={terminoBusqueda}
              onChange={handleSearchChange}
            />
          </div>
          
          {/* Filtros */}
          <div className="filter-buttons">
            <button 
              className={filtro === 'all' ? 'active' : ''}
              onClick={() => handleFilterChange('all')}
            >
              Todos
            </button>
            <button 
              className={filtro === 'active' ? 'active' : ''}
              onClick={() => handleFilterChange('active')}
            >
              Activos
            </button>
            <button 
              className={filtro === 'completed' ? 'active' : ''}
              onClick={() => handleFilterChange('completed')}
            >
              Completados
            </button>
          </div>
          
          {/* Botón nuevo trámite */}
          <button 
            className="primary-button"
            onClick={() => setMostrarModalCrear(true)}
          >
            <FaPlus className="button-icon" />
            Nuevo Trámite
          </button>
        </div>
      </header>

      {/* Modal */}
      <CrearTramiteModal
        mostrar={mostrarModalCrear}
        cerrar={() => setMostrarModalCrear(false)}
        onTramiteCreado={handleTramiteCreado}
      />

      {/* Estado de carga y errores */}
      {error && (
        <div className="error-message">
          {error}
          <button className="retry-button" onClick={cargarTramites}>
            Reintentar
          </button>
        </div>
      )}

      {cargando ? (
        <div className="loading-state">
          <FaSpinner className="spinner" />
          <p>Cargando trámites...</p>
        </div>
      ) : (
        <div className="tramites-grid">
          {/* Resultados */}
          {tramitesFiltrados.length === 0 ? (
            <div className="no-results">
              {terminoBusqueda ? 
                'No se encontraron trámites con ese criterio' : 
                'No hay trámites registrados'}
            </div>
          ) : (
            tramitesFiltrados.map((tramite) => (
              <div 
                key={tramite.idTramite}
                className={`tramite-card ${hoveredItem === tramite.idTramite ? 'hovered' : ''}`}
                onMouseEnter={() => handleHover(tramite.idTramite)}
                onMouseLeave={handleHoverExit}
                onClick={() => verDetalles(tramite.idTramite)}
              >
                {/* Encabezado de la tarjeta */}
                <div className="card-header">
                  <h3>{tramite.tipotramite}</h3>
                  <div className={`status-indicator ${tramite.fecha_fin ? 'completed' : 'active'}`}>
                    {tramite.fecha_fin ? <FaCheckCircle /> : <FaTimesCircle />}
                  </div>
                </div>
                
                {/* Descripción */}
                <p className="card-description">{tramite.descripcion || 'Sin descripción'}</p>
                
                {/* Metadatos */}
                <div className="card-meta">
                  <div className="meta-item">
                    <span className="meta-label">Clientes:</span>
                    <span className="meta-value">
                      {tramite.clientes?.map(c => c.nombre).join(', ') || 'N/A'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Responsables:</span>
                    <span className="meta-value">
                      {tramite.empleados?.map(e => e.nombre).join(', ') || 'N/A'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Inicio:</span>
                    <span className="meta-value">{formatearFecha(tramite.fecha_inicio)}</span>
                  </div>
                  {tramite.fecha_fin && (
                    <div className="meta-item">
                      <span className="meta-label">Fin:</span>
                      <span className="meta-value">{formatearFecha(tramite.fecha_fin)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Tramites;