import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalCliente from './ModalCliente';

const ClientesTable = () => {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [termino, setTermino] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [clienteActual, setClienteActual] = useState({});

  // Cargar clientes
  const cargarClientes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/clientes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setClientes(res.data);
      setClientesFiltrados(res.data);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // Función para guardar cliente (nuevo o edición)
  const handleGuardarCliente = async (datosCliente) => {
    try {
      const token = localStorage.getItem('authToken');
      let response;
      
      if (clienteActual.idCliente) {
        // Editar cliente existente
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
      
      // Actualizar lista de clientes
      await cargarClientes();
      setMostrarModal(false);
      setClienteActual({});
      return response.data;
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      throw error; // Permite que el ModalCliente maneje el error
    }
  };

  // Eliminar cliente
  const eliminarCliente = async (idCliente) => {
    if (!window.confirm('¿Seguro que quieres eliminar este cliente?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/clientes/${idCliente}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      await cargarClientes();
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
    }
  };

  // Buscar
  useEffect(() => {
    const t = termino.toLowerCase();
    setClientesFiltrados(clientes.filter(c => 
      c.nombreCliente?.toLowerCase().includes(t) ||
      c.apellidoPaternoCliente?.toLowerCase().includes(t) ||
      c.apellidoMaternoCliente?.toLowerCase().includes(t) ||
      c.identificacionunicanacional?.toLowerCase().includes(t)
    ));
  }, [termino, clientes]);

  return (
    <div className="clientes-container">
      <div className="clientes-header">
        <h1>Clientes Registrados</h1>
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o identificación..."
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          className="clientes-busqueda"
        />
        <button 
          className="btn-agregar-cliente" 
          onClick={() => {
            setClienteActual({});
            setMostrarModal(true);
          }}
        >
          + Agregar Cliente
        </button>
      </div>

      <div className="clientes-tabla-wrapper">
        <table className="clientes-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Identificación</th>
              <th>Sexo</th>
              <th>Edad</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length === 0 ? (
              <tr><td colSpan="7" className="sin-resultados">No se encontraron resultados</td></tr>
            ) : (
              clientesFiltrados.map(cliente => (
                <tr key={cliente.idCliente}>
                  <td>{cliente.nombreCliente}</td>
                  <td>{cliente.apellidoPaternoCliente} {cliente.apellidoMaternoCliente}</td>
                  <td>{cliente.identificacionunicanacional}</td>
                  <td>{cliente.sexo || '-'}</td>
                  <td>{cliente.edad || '-'}</td>
                  <td>{cliente.telefono || '-'}</td>
                  <td>
                    <button 
                      className="btn-editar"
                      onClick={() => {
                        setClienteActual(cliente);
                        setMostrarModal(true);
                      }}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-eliminar"
                      onClick={() => eliminarCliente(cliente.idCliente)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ModalCliente 
        mostrar={mostrarModal}
        cerrar={() => {
          setMostrarModal(false);
          setClienteActual({});
        }}
        cliente={clienteActual}
        guardarCliente={handleGuardarCliente}
      />
    </div>
  );
};

export default ClientesTable;