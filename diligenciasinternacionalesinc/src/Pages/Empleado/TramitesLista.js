import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaPlus, FaSpinner,FaMinus, FaCheckCircle, FaTimesCircle, FaEdit, FaSave } from 'react-icons/fa';
import CrearTramiteModal from './NuevoTramite';


const Tramites = () => {
  const [tramites, setTramites] = useState([]);
  const [tramitesFiltrados, setTramitesFiltrados] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtro, setFiltro] = useState('all');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [tramiteEditando, setTramiteEditando] = useState(null);
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);

  useEffect(() => {
    cargarTramites();
    cargarClientesYEmpleados();
  }, []);

  useEffect(() => {
    filtrarTramites();
  }, [terminoBusqueda, filtro, tramites]);

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

  const cargarClientesYEmpleados = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const [clientesRes, empleadosRes] = await Promise.all([
        axios.get('http://localhost:5000/api/clientes', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/empleados', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setClientesDisponibles(clientesRes.data.map(c => ({
        id: c.idcliente || c.idCliente,
        nombre: `${c.nombrecliente || c.nombreCliente} ${c.apellidopaternocliente || c.apellidoPaternoCliente}`
      })));

      setEmpleadosDisponibles(empleadosRes.data.map(e => ({
        id: e.idempleado || e.idEmpleado,
        nombre: `${e.nombreempleado || e.nombreEmpleado} ${e.apellidopaternoempleado || e.apellidoPaternoEmpleado}`
      })));
    } catch (err) {
      console.error('Error al cargar clientes y empleados:', err);
    }
  };

  const handleTramiteCreado = (nuevoTramite) => {
    setTramites(prev => [...prev, nuevoTramite]);
    setMostrarModalCrear(false);
  };

  const filtrarTramites = () => {
    let filtrados = tramites;
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
    if (filtro === 'active') {
      filtrados = filtrados.filter(tramite => !tramite.fecha_fin);
    } else if (filtro === 'completed') {
      filtrados = filtrados.filter(tramite => tramite.fecha_fin);
    }
    setTramitesFiltrados(filtrados);
  };

  const abrirModalEditar = (tramite) => {
  console.log('Trámite a editar:', tramite); // Para depuración
  
  setTramiteEditando({
    idTramite: tramite.idTramite || tramite.idtramite, // Asegurar compatibilidad con ambos formatos
    tipotramite: tramite.tipotramite || '',
    descripcion: tramite.descripcion || '',
    fecha_inicio: tramite.fecha_inicio || '',
    fecha_fin: tramite.fecha_fin || '',
    requisitos: tramite.requisitos || '',
    plazo_estimado: tramite.plazo_estimado || '',
    costo: tramite.costo || '',
    clientes: tramite.clientes?.map(c => c.idCliente?.toString() || c.idcliente?.toString()) || [],
    empleados: tramite.empleados?.map(e => e.idEmpleado?.toString() || e.idempleado?.toString()) || []
  });
  
  setMostrarModalEditar(true);
};

  const handleEditarCambio = (e) => {
    const { name, value } = e.target;
    setTramiteEditando(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (key, index, value) => {
    const updated = [...tramiteEditando[key]];
    updated[index] = value;
    setTramiteEditando(prev => ({ ...prev, [key]: updated }));
  };

  const addItem = (key) => {
    setTramiteEditando(prev => ({ ...prev, [key]: [...prev[key], ''] }));
  };

  const removeItem = (key, index) => {
    const updated = [...tramiteEditando[key]];
    updated.splice(index, 1);
    setTramiteEditando(prev => ({ ...prev, [key]: updated }));
  };

  const guardarCambios = async () => {
  try {
    // Verificar que tenemos un trámite para editar
    if (!tramiteEditando || !tramiteEditando.idTramite) {
      console.error('Estado actual de tramiteEditando:', tramiteEditando);
      throw new Error('No se encontró el trámite para editar');
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    // Preparar payload con validación
    const payload = {
      tipoTramite: tramiteEditando.tipotramite || '',
      descripcion: tramiteEditando.descripcion || '',
      requisitos: tramiteEditando.requisitos || '',
      fecha_inicio: tramiteEditando.fecha_inicio || null,
      fecha_fin: tramiteEditando.fecha_fin || null,
      plazo_estimado: tramiteEditando.plazo_estimado || '',
      costo: tramiteEditando.costo || '',
      clientes: tramiteEditando.clientes
        .filter(id => id && id !== 'undefined' && !isNaN(parseInt(id)))
        .map(id => parseInt(id)),
      empleados: tramiteEditando.empleados
        .filter(id => id && id !== 'undefined' && !isNaN(parseInt(id)))
        .map(id => parseInt(id))
    };

    console.log('Payload a enviar:', payload); // Para depuración

    // Validaciones
    const errors = [];
    if (!payload.tipoTramite.trim()) errors.push('El tipo de trámite es requerido');
    if (!payload.plazo_estimado.trim()) errors.push('El plazo estimado es requerido');
    if (!payload.costo.trim()) errors.push('El costo es requerido');
    if (payload.clientes.length === 0) errors.push('Debe seleccionar al menos un cliente');
    if (payload.empleados.length === 0) errors.push('Debe seleccionar al menos un empleado');

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    // Enviar la petición
    const response = await axios.put(
      `http://localhost:5000/api/tramites/${tramiteEditando.idTramite}`,
      payload,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    // Actualizar el estado local
    setTramites(prev => prev.map(t => 
      (t.idTramite === tramiteEditando.idTramite || t.idtramite === tramiteEditando.idTramite) 
        ? response.data 
        : t
    ));
    
    setMostrarModalEditar(false);
    setError(null);

  } catch (err) {
    console.error('Error al actualizar trámite:', err);
    setError(err.response?.data?.error || err.message || 'Error al actualizar el trámite');
  }
};

  const handleSearchChange = (e) => setTerminoBusqueda(e.target.value);
  const handleFilterChange = (newFilter) => setFiltro(newFilter);
  const handleHover = (id) => setHoveredItem(id);
  const handleHoverExit = () => setHoveredItem(null);
  const formatearFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString() : 'N/A';

  return (
    <div className="tramites-container">
      <header className="tramites-header">
        <h1>Gestión de Trámites</h1>
        <div className="tramites-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar trámites..."
              value={terminoBusqueda}
              onChange={handleSearchChange}
            />
          </div>
          <div className="filter-buttons">
            <button className={filtro === 'all' ? 'active' : ''} onClick={() => handleFilterChange('all')}>Todos</button>
            <button className={filtro === 'active' ? 'active' : ''} onClick={() => handleFilterChange('active')}>Activos</button>
            <button className={filtro === 'completed' ? 'active' : ''} onClick={() => handleFilterChange('completed')}>Completados</button>
          </div>
          <button className="primary-button" onClick={() => setMostrarModalCrear(true)}>
            <FaPlus className="button-icon" /> Nuevo Trámite
          </button>
        </div>
      </header>

      <CrearTramiteModal
        mostrar={mostrarModalCrear}
        cerrar={() => setMostrarModalCrear(false)}
        onTramiteCreado={handleTramiteCreado}
      />

      {/* Modal de Edición */}
      {mostrarModalEditar && tramiteEditando && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Trámite</h2>
              <button className="close-button" onClick={() => setMostrarModalEditar(false)}>
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Tipo de Trámite:</label>
                <input
                  type="text"
                  name="tipotramite"
                  value={tramiteEditando.tipotramite}
                  onChange={handleEditarCambio}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  name="descripcion"
                  value={tramiteEditando.descripcion}
                  onChange={handleEditarCambio}
                  className="form-control"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha Inicio:</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={tramiteEditando.fecha_inicio?.split('T')[0] || ''}
                    onChange={handleEditarCambio}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Fecha Fin:</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={tramiteEditando.fecha_fin?.split('T')[0] || ''}
                    onChange={handleEditarCambio}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Requisitos:</label>
                <textarea
                  name="requisitos"
                  value={tramiteEditando.requisitos}
                  onChange={handleEditarCambio}
                  className="form-control"
                  rows="5"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Plazo Estimado:</label>
                  <input
                    type="text"
                    name="plazo_estimado"
                    value={tramiteEditando.plazo_estimado}
                    onChange={handleEditarCambio}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Costo:</label>
                  <input
                    type="text"
                    name="costo"
                    value={tramiteEditando.costo}
                    onChange={handleEditarCambio}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Clientes:</label>
                {tramiteEditando.clientes.map((id, idx) => (
                  <div key={`cliente-${idx}`} className="array-input-group">
                    <select
                      value={id}
                      onChange={(e) => handleArrayChange('clientes', idx, e.target.value)}
                      className="form-control"
                    >
                      <option value="">Seleccionar cliente</option>
                      {clientesDisponibles.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeItem('clientes', idx)}
                      disabled={tramiteEditando.clientes.length === 1}
                      className="btn-remove"
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem('clientes')}
                  className="btn-add"
                >
                  <FaPlus /> Agregar Cliente
                </button>
              </div>

              <div className="form-group">
                <label>Responsables:</label>
                {tramiteEditando.empleados.map((id, idx) => (
                  <div key={`empleado-${idx}`} className="array-input-group">
                    <select
                      value={id}
                      onChange={(e) => handleArrayChange('empleados', idx, e.target.value)}
                      className="form-control"
                    >
                      <option value="">Seleccionar empleado</option>
                      {empleadosDisponibles.map(e => (
                        <option key={e.id} value={e.id}>{e.nombre}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeItem('empleados', idx)}
                      disabled={tramiteEditando.empleados.length === 1}
                      className="btn-remove"
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem('empleados')}
                  className="btn-add"
                >
                  <FaPlus /> Agregar Empleado
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setMostrarModalEditar(false)}>
                Cancelar
              </button>
              <button className="btn-save" onClick={guardarCambios}>
                <FaSave /> Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
          <button className="retry-button" onClick={cargarTramites}>Reintentar</button>
        </div>
      )}

      {cargando ? (
        <div className="loading-state">
          <FaSpinner className="spinner" />
          <p>Cargando trámites...</p>
        </div>
      ) : (
        <div className="tramites-grid">
          {tramitesFiltrados.length === 0 ? (
            <div className="no-results">
              {terminoBusqueda ? 'No se encontraron trámites con ese criterio' : 'No hay trámites registrados'}
            </div>
          ) : (
            tramitesFiltrados.map((tramite) => (
              <div 
                key={tramite.idTramite}
                className={`tramite-card ${hoveredItem === tramite.idTramite ? 'hovered' : ''}`}
                onMouseEnter={() => handleHover(tramite.idTramite)}
                onMouseLeave={handleHoverExit}
              >
                <div className="card-header">
                  <h3>{tramite.tipotramite}</h3>
                  <div className={`status-indicator ${tramite.fecha_fin ? 'completed' : 'active'}`}>
                    {tramite.fecha_fin ? <FaCheckCircle /> : <FaTimesCircle />}
                  </div>
                </div>

                <p className="card-description">{tramite.descripcion || 'Sin descripción'}</p>

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

                <div className="card-actions">
                  <button className="edit-button" onClick={() => abrirModalEditar(tramite)}>
                    <FaEdit /> Editar
                  </button>
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