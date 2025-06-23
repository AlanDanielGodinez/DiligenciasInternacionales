import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaPlus, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CrearTramiteModal from './NuevoTramite';

const Tramites = () => {
  // Estados
  const [state, setState] = useState({
    tramites: [],
    tramitesFiltrados: [],
    terminoBusqueda: '',
    filtro: 'all',
    cargando: true,
    error: null,
    hoveredItem: null
  });

  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const navigate = useNavigate();

  // Efectos
  useEffect(() => {
    cargarTramites();
  }, []);

  useEffect(() => {
    filtrarTramites();
  }, [state.terminoBusqueda, state.filtro, state.tramites]);

  // Funciones principales
  const cargarTramites = async () => {
    setState(prev => ({ ...prev, cargando: true, error: null }));
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/tramites', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setState(prev => ({
        ...prev,
        tramites: response.data,
        tramitesFiltrados: response.data,
        cargando: false
      }));
    } catch (err) {
      console.error('Error al cargar trámites:', err);
      setState(prev => ({
        ...prev,
        error: err.response?.data?.error || 'Error al cargar trámites',
        cargando: false
      }));
    }
  };

  const handleTramiteCreado = (nuevoTramite) => {
  setState(prev => ({
    ...prev,
    tramites: [...prev.tramites, nuevoTramite],
    mostrarModalCrear: false // Opcional: cerrar modal desde aquí también
  }));
};


  const filtrarTramites = () => {
    let filtrados = state.tramites;

    // Aplicar filtro de búsqueda
    if (state.terminoBusqueda) {
      const terminoLower = state.terminoBusqueda.toLowerCase();
      filtrados = filtrados.filter(tramite => {
        const camposBusqueda = [
        tramite.tipoTramite,
        tramite.descripcion,
        ...(tramite.clientes?.map(c => c.nombre) || []),
        ...(tramite.empleados?.map(e => e.nombre) || [])
      ];

        
        return camposBusqueda.some(campo => campo.includes(terminoLower));
      });
    }

    // Aplicar filtro de estado
    if (state.filtro === 'active') {
      filtrados = filtrados.filter(tramite => !tramite.fecha_fin);
    } else if (state.filtro === 'completed') {
      filtrados = filtrados.filter(tramite => tramite.fecha_fin);
    }

    setState(prev => ({ ...prev, tramitesFiltrados: filtrados }));
  };

  // Handlers
  const handleInputChange = (e) => {
    setState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFilterChange = (filtro) => {
    setState(prev => ({ ...prev, filtro }));
  };

  const handleHover = (id) => {
    setState(prev => ({ ...prev, hoveredItem: id }));
  };

  const handleHoverExit = () => {
    setState(prev => ({ ...prev, hoveredItem: null }));
  };

  const verDetalles = (id) => {
    navigate(`/tramites/${id}`);
  };

  const crearNuevoTramite = () => {
    navigate('/tramites/nuevo');
  };

  // Funciones auxiliares
  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString();
  };

  // Renderizado
  return (
    <div className="duo-container">
      <div className="duo-header">
        <h1 className="duo-title">Gestión de Trámites</h1>
        <div className="duo-controls">
          <div className="duo-search">
            <FaSearch className="duo-search-icon" />
            <input
              type="text"
              name="terminoBusqueda"
              placeholder="Buscar trámites..."
              value={state.terminoBusqueda}
              onChange={handleInputChange}
              className="duo-search-input"
            />
          </div>
          
          <div className="duo-filter-buttons">
            <button 
              className={`duo-btn duo-btn-filter ${state.filtro === 'all' ? 'duo-btn-active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              Todos
            </button>
            <button 
              className={`duo-btn duo-btn-filter ${state.filtro === 'active' ? 'duo-btn-active' : ''}`}
              onClick={() => handleFilterChange('active')}
            >
              Activos
            </button>
            <button 
              className={`duo-btn duo-btn-filter ${state.filtro === 'completed' ? 'duo-btn-active' : ''}`}
              onClick={() => handleFilterChange('completed')}
            >
              Completados
            </button>
          </div>
          
           <button 
            className="duo-btn duo-btn-primary"
            onClick={() => setMostrarModalCrear(true)}
          >
            <FaPlus className="duo-btn-icon" />
            Nuevo Trámite
          </button>
        </div>
      </div>
      <CrearTramiteModal
        mostrar={mostrarModalCrear}
        cerrar={() => setMostrarModalCrear(false)}
        onTramiteCreado={handleTramiteCreado}
      />

      {state.error && (
        <div className="duo-alert duo-alert-error">
          {state.error}
          <button className="duo-btn duo-btn-error" onClick={cargarTramites}>
            Reintentar
          </button>
        </div>
      )}

      {state.cargando ? (
        <div className="duo-loading">
          <FaSpinner className="duo-spinner" />
          <p>Cargando trámites...</p>
        </div>
      ) : (
        <div className="duo-grid-container">
          {state.tramitesFiltrados.length === 0 ? (
            <div className="duo-no-results">
              {state.terminoBusqueda ? 
                'No se encontraron trámites con ese criterio' : 
                'No hay trámites registrados'}
            </div>
          ) : (
            state.tramitesFiltrados.map((tramite) => (
              <div 
                key={tramite.idTramite}
                className={`duo-card ${state.hoveredItem === tramite.idTramite ? 'duo-card-hovered' : ''}`}
                onMouseEnter={() => handleHover(tramite.idTramite)}
                onMouseLeave={handleHoverExit}
                onClick={() => verDetalles(tramite.idTramite)}
              >
                <div className="duo-card-header">
                  <h3 className="duo-card-title">{tramite.tipoTramite}</h3>
                  <div className={`duo-status-indicator ${tramite.fecha_fin ? 'duo-status-completed' : 'duo-status-active'}`}>
                    {tramite.fecha_fin ? <FaCheckCircle /> : <FaTimesCircle />}
                  </div>
                </div>
                
                <p className="duo-card-desc">{tramite.descripcion || 'Sin descripción'}</p>
                
                <div className="duo-card-meta">
                  <div className="duo-meta-item">
                  <span className="duo-meta-label">Clientes:</span>
                  <span className="duo-meta-value">
                    {tramite.clientes && tramite.clientes.length > 0
                      ? tramite.clientes.map(c => c.nombre).join(', ')
                      : 'N/A'}
                  </span>
                </div>
                <div className="duo-meta-item">
                  <span className="duo-meta-label">Responsables:</span>
                  <span className="duo-meta-value">
                    {tramite.empleados && tramite.empleados.length > 0
                      ? tramite.empleados.map(e => e.nombre).join(', ')
                      : 'N/A'}
                  </span>
                </div>
                  <div className="duo-meta-item">
                    <span className="duo-meta-label">Inicio:</span>
                    <span className="duo-meta-value">{formatearFecha(tramite.fecha_inicio)}</span>
                  </div>
                  {tramite.fecha_fin && (
                    <div className="duo-meta-item">
                      <span className="duo-meta-label">Fin:</span>
                      <span className="duo-meta-value">{formatearFecha(tramite.fecha_fin)}</span>
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