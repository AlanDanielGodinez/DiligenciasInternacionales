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

  // Guardar cliente (nuevo o edición)
  const guardarCliente = async (e) => {
    e.preventDefault();

    const url = clienteActual.idCliente 
      ? `http://localhost:5000/api/clientes/${clienteActual.idCliente}` 
      : 'http://localhost:5000/api/clientes';

    const metodo = clienteActual.idCliente ? 'put' : 'post';

    try {
      await axios[metodo](url, clienteActual, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setMostrarModal(false);
      setClienteActual({});
      await cargarClientes();
    } catch (err) {
      console.error('Error al guardar cliente:', err);
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
            setMostrarModal(false);      // 🔹 Oculta el modal
            setClienteActual({});        // 🔹 Limpia el formulario
        }}
        cliente={clienteActual}
        onGuardar={guardarCliente}
        />
    </div>
  );
};

export default ClientesTable;
