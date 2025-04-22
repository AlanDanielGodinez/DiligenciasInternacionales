// ClientesTable.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ClientesTable = () => {
  const [clientes, setClientes] = useState([]);
  const [termino, setTermino] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/clientes', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })
    .then(res => {
      setClientes(res.data);
      setClientesFiltrados(res.data);
    })
    .catch(err => console.error('Error al cargar clientes:', err));
  }, []);

  useEffect(() => {
    const t = termino.toLowerCase();
    setClientesFiltrados(clientes.filter(c => 
      c.nombreCliente.toLowerCase().includes(t) ||
      c.apellidoPaternoCliente.toLowerCase().includes(t) ||
      c.apellidoMaternoCliente.toLowerCase().includes(t) ||
      c.identificacionunicanacional.toLowerCase().includes(t)
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
        <button className="btn-agregar-cliente">+ Agregar Cliente</button>
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
                    <button className="btn-editar">Editar</button>
                    <button className="btn-eliminar">Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientesTable;
