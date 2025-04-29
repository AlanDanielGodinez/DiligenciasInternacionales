import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import ModalCliente from './ModalCliente';


const ClientesTable = () => {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [termino, setTermino] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [clienteActual, setClienteActual] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar clientes
  const cargarClientes = async () => {
    setCargando(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/clientes', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const clientesTransformados = response.data.map(cliente => {
        // Formatear teléfono si existe
        const formatoTelefono = (tel) => tel ? tel.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') : 'Sin teléfono';
        
        return {
          idCliente: cliente.idcliente,
          identificacion: cliente.identificacionunicanacional || 'Sin ID',
          nombre: cliente.nombrecliente || 'Sin nombre',
          apellidoPaterno: cliente.apellidopaternocliente || '',
          apellidoMaterno: cliente.apellidomaternocliente || '',
          telefono: formatoTelefono(cliente.telefono),
          rawTelefono: cliente.telefono // Guardamos el original sin formato
        };
      });

      setClientes(clientesTransformados);
      setClientesFiltrados(clientesTransformados);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError(err.response?.data?.error || err.message || 'Error al cargar clientes');
    } finally {
      setCargando(false);
    }
  };

  // Función para eliminar cliente
  const eliminarCliente = async (idCliente) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:5000/api/clientes/${idCliente}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await cargarClientes(); // Recargar la lista después de eliminar
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      alert(err.response?.data?.error || 'Error al eliminar cliente');
    }
  };

  // Función para guardar (crear/actualizar) cliente
  const handleGuardarCliente = async (datosCliente) => {
    try {
      const token = localStorage.getItem('authToken');
      let response;

      if (clienteActual?.idCliente) {
        // Actualizar cliente existente
        response = await axios.put(
          `http://localhost:5000/api/clientes/${clienteActual.idCliente}`,
          datosCliente,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Crear nuevo cliente
        response = await axios.post(
          'http://localhost:5000/api/clientes',
          datosCliente,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      await cargarClientes(); // Recargar la lista
      return response.data;
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      throw error;
    } finally {
      setMostrarModal(false);
      setClienteActual(null);
    }
  };

  // Efecto para cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes();
  }, []);

  // Efecto para filtrar clientes
  useEffect(() => {
    if (!termino) {
      setClientesFiltrados(clientes);
      return;
    }

    const terminoLower = termino.toLowerCase();
    const filtrados = clientes.filter(cliente => {
      const camposBusqueda = [
        cliente.nombre,
        cliente.apellidoPaterno,
        cliente.apellidoMaterno,
        cliente.identificacion,
        cliente.telefono
      ].map(campo => campo?.toLowerCase() || '');

      return camposBusqueda.some(campo => campo.includes(terminoLower));
    });

    setClientesFiltrados(filtrados);
  }, [termino, clientes]);

  return (
    <div className="clientes-container">
      <div className="clientes-header">
        <h1>Clientes Registrados</h1>
        <div className="clientes-controls">
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            className="clientes-busqueda"
          />
          <button 
            className="btn-agregar-cliente" 
            onClick={() => setMostrarModal(true)}
          >
            <i className="fas fa-plus"></i> Nuevo Cliente
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
          <button onClick={cargarClientes}>Reintentar</button>
        </div>
      )}

      {cargando ? (
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Cargando clientes...
        </div>
      ) : (
        <div className="clientes-tabla-wrapper">
          <table className="clientes-tabla">
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
                  <td colSpan="6" className="sin-resultados">
                    {termino ? 'No se encontraron clientes con ese criterio' : 'No hay clientes registrados'}
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map(cliente => (
                  <tr key={cliente.idCliente}>
                    <td>{cliente.identificacion || 'N/A'}</td>
                    <td>{cliente.nombre || 'N/A'}</td>
                    <td>{cliente.apellidoPaterno || 'N/A'}</td>
                    <td>{cliente.apellidoMaterno || 'N/A'}</td>
                    <td>{cliente.telefono || 'N/A'}</td>
                    <td className="acciones">
                      <button 
                        className="btn-ver"
                        onClick={() => {/* Implementar lógica de visualización */}}
                        title="Ver detalles"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="btn-editar"
                        onClick={() => {
                          setClienteActual(cliente);
                          setMostrarModal(true);
                        }}
                        title="Editar cliente"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-eliminar"
                        onClick={() => eliminarCliente(cliente.idCliente)}
                        title="Eliminar cliente"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ModalCliente 
        mostrar={mostrarModal}
        cerrar={() => {
          setMostrarModal(false);
          setClienteActual(null);
        }}
        cliente={clienteActual}
        guardarCliente={handleGuardarCliente}
      />
    </div>
  );
};

export default ClientesTable;