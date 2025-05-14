import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch, FaSpinner, FaHistory, FaTrash, FaEdit } from 'react-icons/fa';


const Antecedentes = () => {
  // Estados
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModalAntecedentes, setMostrarModalAntecedentes] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [antecedentes, setAntecedentes] = useState([]);
  const [cargandoAntecedentes, setCargandoAntecedentes] = useState(false);

  // Efectos
  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    filtrarClientes();
  }, [terminoBusqueda, clientes]);

  // Funciones principales
  const cargarClientes = async () => {
    setCargando(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/clientes', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const clientesFormateados = formatearClientes(response.data);
      
      setClientes(clientesFormateados);
      setClientesFiltrados(clientesFormateados);
      setCargando(false);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError(err.response?.data?.error || 'Error al cargar clientes');
      setCargando(false);
    }
  };

  const cargarAntecedentes = async (idCliente) => {
    setCargandoAntecedentes(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:5000/api/clientes/${idCliente}/antecedentes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAntecedentes(response.data);
    } catch (err) {
      console.error('Error al cargar antecedentes:', err);
      setAntecedentes([]);
    } finally {
      setCargandoAntecedentes(false);
    }
  };

  const filtrarClientes = () => {
    if (!terminoBusqueda) {
      setClientesFiltrados(clientes);
      return;
    }

    const terminoLower = terminoBusqueda.toLowerCase();
    const filtrados = clientes.filter(cliente => {
      const camposBusqueda = [
        cliente.nombreCliente,
        cliente.apellidoPaternoCliente,
        cliente.apellidoMaternoCliente,
        cliente.identificacionunicanacional,
        cliente.telefono
      ].map(campo => campo?.toLowerCase() || '');

      return camposBusqueda.some(campo => campo.includes(terminoLower));
    });

    setClientesFiltrados(filtrados);
  };

  // Funciones auxiliares
  const formatearClientes = (clientes) => {
    return clientes.map(cliente => ({
      idCliente: cliente.idCliente || cliente.idcliente,
      nombreCliente: cliente.nombreCliente || cliente.nombrecliente,
      apellidoPaternoCliente: cliente.apellidoPaternoCliente || cliente.apellidopaternocliente,
      apellidoMaternoCliente: cliente.apellidoMaternoCliente || cliente.apellidomaternocliente,
      telefono: cliente.telefono,
      identificacionunicanacional: cliente.identificacionunicanacional
    }));
  };

  const formatearTelefono = (telefono) => {
    if (!telefono) return 'N/A';
    const numeros = telefono.replace(/\D/g, '');
    return numeros.length === 10 ? 
      `${numeros.substring(0, 3)}-${numeros.substring(3, 6)}-${numeros.substring(6)}` : 
      telefono;
  };

  // Handlers
  const handleVerAntecedentes = async (cliente) => {
    setClienteSeleccionado(cliente);
    await cargarAntecedentes(cliente.idCliente);
    setMostrarModalAntecedentes(true);
  };

  const handleAgregarAntecedente = () => {
    // Implementar lógica para agregar antecedente
    alert(`Agregar antecedente al cliente: ${clienteSeleccionado.nombreCliente}`);
  };

  const handleEliminarAntecedente = (idAntecedente) => {
    if (window.confirm('¿Estás seguro de eliminar este antecedente?')) {
      // Implementar lógica para eliminar antecedente
      alert(`Eliminar antecedente con ID: ${idAntecedente}`);
    }
  };

  const handleInputChange = (e) => {
    setTerminoBusqueda(e.target.value);
  };

  // Renderizado
  return (
    <div className="antecedentes-container">
      <div className="antecedentes-header">
        <h1 className="antecedentes-title">
          <FaHistory className="antecedentes-title-icon" />
          Gestión de Antecedentes
        </h1>
        <div className="antecedentes-controls">
          <div className="antecedentes-search">
            <FaSearch className="antecedentes-search-icon" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={terminoBusqueda}
              onChange={handleInputChange}
              className="antecedentes-search-input"
            />
          </div>
          <button 
            className="antecedentes-btn antecedentes-btn-primary"
            onClick={handleAgregarAntecedente}
            disabled={!clienteSeleccionado}
          >
            <FaPlus className="antecedentes-btn-icon" />
            Agregar Antecedente
          </button>
        </div>
      </div>

      {error && (
        <div className="antecedentes-alert antecedentes-alert-error">
          {error}
          <button className="antecedentes-btn antecedentes-btn-error" onClick={cargarClientes}>
            Reintentar
          </button>
        </div>
      )}

      {cargando ? (
        <div className="antecedentes-loading">
          <FaSpinner className="antecedentes-spinner" />
          <p>Cargando clientes...</p>
        </div>
      ) : (
        <div className="antecedentes-table-container">
          <table className="antecedentes-table">
            <thead>
              <tr>
                <th>Identificación</th>
                <th>Nombre</th>
                <th>Apellido Paterno</th>
                <th>Apellido Materno</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="antecedentes-no-results">
                    {terminoBusqueda ? 
                      'No se encontraron clientes con ese criterio' : 
                      'No hay clientes registrados'}
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr key={cliente.idCliente} className="antecedentes-table-row">
                    <td>{cliente.identificacionunicanacional || 'N/A'}</td>
                    <td>{cliente.nombreCliente || 'N/A'}</td>
                    <td>{cliente.apellidoPaternoCliente || 'N/A'}</td>
                    <td>{cliente.apellidoMaternoCliente || 'N/A'}</td>
                    <td>{formatearTelefono(cliente.telefono)}</td>
                    <td className="antecedentes-actions">
                      <button 
                        className="antecedentes-btn antecedentes-btn-view"
                        onClick={() => handleVerAntecedentes(cliente)}
                        title="Ver antecedentes"
                      >
                        <FaHistory className="antecedentes-btn-icon" />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de antecedentes */}
      {mostrarModalAntecedentes && (
        <div className="antecedentes-modal">
          <div className="antecedentes-modal-content">
            <div className="antecedentes-modal-header">
              <h3>Antecedentes del Cliente</h3>
              <button 
                className="antecedentes-modal-close"
                onClick={() => setMostrarModalAntecedentes(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="antecedentes-modal-info">
              <p><strong>Nombre:</strong> {clienteSeleccionado?.nombreCliente} {clienteSeleccionado?.apellidoPaternoCliente}</p>
              <p><strong>Identificación:</strong> {clienteSeleccionado?.identificacionunicanacional}</p>
            </div>

            {cargandoAntecedentes ? (
              <div className="antecedentes-loading">
                <FaSpinner className="antecedentes-spinner" />
                <p>Cargando antecedentes...</p>
              </div>
            ) : (
              <div className="antecedentes-list">
                {antecedentes.length === 0 ? (
                  <div className="antecedentes-no-results">
                    No se encontraron antecedentes para este cliente
                  </div>
                ) : (
                  <table className="antecedentes-inner-table">
                    <thead>
                      <tr>
                        <th>Tipo de Trámite</th>
                        <th>Descripción</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {antecedentes.map((antecedente) => (
                        <tr key={antecedente.idAntecedente}>
                          <td>{antecedente.TipoTramiteA || 'N/A'}</td>
                          <td>{antecedente.descipcion || 'N/A'}</td>
                          <td>{antecedente.fechaTramiteAntecendente || 'N/A'}</td>
                          <td>
                            <span className={`antecedentes-status antecedentes-status-${antecedente.estadoTramiteAntecente?.toLowerCase() || 'desconocido'}`}>
                              {antecedente.estadoTramiteAntecente || 'Desconocido'}
                            </span>
                          </td>
                          <td className="antecedentes-actions">
                            <button 
                              className="antecedentes-btn-action antecedentes-btn-edit"
                              title="Editar"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="antecedentes-btn-action antecedentes-btn-delete"
                              title="Eliminar"
                              onClick={() => handleEliminarAntecedente(antecedente.idAntecedente)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            <div className="antecedentes-modal-footer">
              <button 
                className="antecedentes-btn antecedentes-btn-primary"
                onClick={handleAgregarAntecedente}
              >
                <FaPlus className="antecedentes-btn-icon" />
                Agregar Antecedente
              </button>
              <button 
                className="antecedentes-btn antecedentes-btn-cancel"
                onClick={() => setMostrarModalAntecedentes(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Antecedentes;