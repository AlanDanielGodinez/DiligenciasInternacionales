import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaSpinner } from 'react-icons/fa';
import CrearCliente from './CrearCliente';
import EditarCliente from './EditarCliente';

const Clientes = () => {
  // Estados
  const [state, setState] = useState({
    clientes: [],
    clientesFiltrados: [],
    terminoBusqueda: '',
    cargando: true,
    error: null,
    mostrarModalCrear: false,
    mostrarModalEditar: false,
    clienteSeleccionado: null
  });

  // Efectos
  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    filtrarClientes();
  }, [state.terminoBusqueda, state.clientes]);

  // Funciones principales
  const cargarClientes = async () => {
    setState(prev => ({ ...prev, cargando: true, error: null }));
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/clientes', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const clientesFormateados = formatearClientes(response.data);
      
      setState(prev => ({
        ...prev,
        clientes: clientesFormateados,
        clientesFiltrados: clientesFormateados,
        cargando: false
      }));
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setState(prev => ({
        ...prev,
        error: err.response?.data?.error || 'Error al cargar clientes',
        cargando: false
      }));
    }
  };

  const filtrarClientes = () => {
    if (!state.terminoBusqueda) {
      setState(prev => ({ ...prev, clientesFiltrados: prev.clientes }));
      return;
    }

    const terminoLower = state.terminoBusqueda.toLowerCase();
    const filtrados = state.clientes.filter(cliente => {
      const camposBusqueda = [
        cliente.nombreCliente,
        cliente.apellidoPaternoCliente,
        cliente.apellidoMaternoCliente,
        cliente.identificacionunicanacional,
        cliente.telefono
      ].map(campo => campo?.toLowerCase() || '');

      return camposBusqueda.some(campo => campo.includes(terminoLower));
    });

    setState(prev => ({ ...prev, clientesFiltrados: filtrados }));
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
  const handleEliminarCliente = async (idCliente) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:5000/api/clientes/${idCliente}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await cargarClientes();
      alert('Cliente eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      alert(err.response?.data?.error || 'Error al eliminar cliente');
    }
  };

  const handleClienteCreado = () => {
    cargarClientes();
    setState(prev => ({ ...prev, mostrarModalCrear: false }));
  };

  const handleClienteActualizado = () => {
    cargarClientes();
    setState(prev => ({ ...prev, mostrarModalEditar: false }));
  };

  const handleInputChange = (e) => {
    setState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleModal = (modal, value, cliente = null) => {
    setState(prev => ({
      ...prev,
      [`mostrarModal${modal}`]: value,
      clienteSeleccionado: cliente
    }));
  };

  // Renderizado
  return (
    <div className="duo-container">
      <div className="duo-header">
        <h1 className="duo-title">Gestión de Clientes</h1>
        <div className="duo-controls">
          <div className="duo-search">
            <FaSearch className="duo-search-icon" />
            <input
              type="text"
              name="terminoBusqueda"
              placeholder="Buscar cliente..."
              value={state.terminoBusqueda}
              onChange={handleInputChange}
              className="duo-search-input"
            />
          </div>
          <button 
            className="duo-btn duo-btn-primary"
            onClick={() => toggleModal('Crear', true)}
          >
            <FaPlus className="duo-btn-icon" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {state.error && (
        <div className="duo-alert duo-alert-error">
          {state.error}
          <button className="duo-btn duo-btn-error" onClick={cargarClientes}>
            Reintentar
          </button>
        </div>
      )}

      {state.cargando ? (
        <div className="duo-loading">
          <FaSpinner className="duo-spinner" />
          <p>Cargando clientes...</p>
        </div>
      ) : (
        <div className="duo-table-container">
          <table className="duo-table">
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
              {state.clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="duo-no-results">
                    {state.terminoBusqueda ? 
                      'No se encontraron clientes con ese criterio' : 
                      'No hay clientes registrados'}
                  </td>
                </tr>
              ) : (
                state.clientesFiltrados.map((cliente) => (
                  <tr key={cliente.idCliente} className="duo-table-row">
                    <td>{cliente.identificacionunicanacional || 'N/A'}</td>
                    <td>{cliente.nombreCliente || 'N/A'}</td>
                    <td>{cliente.apellidoPaternoCliente || 'N/A'}</td>
                    <td>{cliente.apellidoMaternoCliente || 'N/A'}</td>
                    <td>{formatearTelefono(cliente.telefono)}</td>
                    <td className="duo-actions">
                      <div className="duo-actions-container">
                        <button 
                          className="duo-btn-action duo-btn-view"
                          onClick={() => {
                            alert(`Mostrando detalles del cliente: ${cliente.nombreCliente}`);
                          }}
                          title="Ver detalles"
                        >
                          <FaEye />
                        </button>
                        <button 
                          className="duo-btn-action duo-btn-edit"
                          onClick={() => toggleModal('Editar', true, cliente)}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="duo-btn-action duo-btn-delete"
                          onClick={() => handleEliminarCliente(cliente.idCliente)}
                          title="Eliminar"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <CrearCliente
        mostrar={state.mostrarModalCrear}
        cerrar={() => toggleModal('Crear', false)}
        onClienteCreado={handleClienteCreado}
      />

      {state.clienteSeleccionado && (
        <EditarCliente
          mostrar={state.mostrarModalEditar}
          cerrar={() => toggleModal('Editar', false)}
          clienteId={state.clienteSeleccionado.idCliente}
          onClienteActualizado={handleClienteActualizado}
        />
      )}
    </div>
  );
};

export default Clientes;