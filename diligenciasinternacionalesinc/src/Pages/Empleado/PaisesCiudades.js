import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';

const PaisesCiudadesPage = () => {
  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [nuevoPais, setNuevoPais] = useState('');
  const [nuevaCiudad, setNuevaCiudad] = useState('');

  const cargarDatos = async () => {
    try {
      const paisesRes = await axios.get('http://localhost:5000/api/paises', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setPaises(paisesRes.data);

      const ciudadesRes = await axios.get('http://localhost:5000/api/ciudades', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setCiudades(ciudadesRes.data);
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const agregarPais = async () => {
    if (!nuevoPais.trim()) return;
    try {
      const res = await axios.post('http://localhost:5000/api/paises', { nombrePais: nuevoPais }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setPaises([...paises, res.data]);
      setNuevoPais('');
    } catch (err) {
      console.error('Error al agregar país:', err);
    }
  };

  const agregarCiudad = async () => {
    if (!nuevaCiudad.trim()) return;
    try {
      const res = await axios.post('http://localhost:5000/api/ciudades', { nombreCiudad: nuevaCiudad }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setCiudades([...ciudades, res.data]);
      setNuevaCiudad('');
    } catch (err) {
      console.error('Error al agregar ciudad:', err);
    }
  };

  const eliminarPais = async (id) => {
    if (!id || isNaN(id)) return console.error('ID de país inválido:', id);
    if (!window.confirm('¿Estás seguro de eliminar este país?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/paises/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setPaises(paises.filter(p => (p.idPais || p.idpais) !== id));
    } catch (err) {
      console.error('Error al eliminar país:', err);
    }
  };

  const eliminarCiudad = async (id) => {
    if (!id || isNaN(id)) return console.error('ID de ciudad inválido:', id);
    if (!window.confirm('¿Estás seguro de eliminar esta ciudad?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/ciudades/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setCiudades(ciudades.filter(c => (c.idCiudad || c.idciudad) !== id));
    } catch (err) {
      console.error('Error al eliminar ciudad:', err);
    }
  };

  return (
    <div className="gestion-container">
      <h1 className="titulo-gestion">Gestión de Países y Ciudades</h1>

      <div className="seccion-doble">
        {/* Países */}
        <div className="gestion-card">
          <h2>Países</h2>
          <div className="form-nuevo">
            <input
              type="text"
              placeholder="Nuevo país"
              value={nuevoPais}
              onChange={(e) => setNuevoPais(e.target.value)}
            />
            <button onClick={agregarPais}>Agregar</button>
          </div>

          <table className="tabla-gestion">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre del País</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paises.map((pais, idx) => {
                const id = pais.idPais || pais.idpais;
                return (
                  <tr key={id}>
                    <td>{idx + 1}</td>
                    <td>{pais.nombrePais || pais.nombrepais}</td>
                    <td>
                      <button className="btn-eliminar" onClick={() => eliminarPais(id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Ciudades */}
        <div className="gestion-card">
          <h2>Ciudades</h2>
          <div className="form-nuevo">
            <input
              type="text"
              placeholder="Nueva ciudad"
              value={nuevaCiudad}
              onChange={(e) => setNuevaCiudad(e.target.value)}
            />
            <button onClick={agregarCiudad}>Agregar</button>
          </div>

          <table className="tabla-gestion">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre de la Ciudad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ciudades.map((ciudad, idx) => {
                const id = ciudad.idCiudad || ciudad.idciudad;
                return (
                  <tr key={id}>
                    <td>{idx + 1}</td>
                    <td>{ciudad.nombreCiudad || ciudad.nombreciudad}</td>
                    <td>
                      <button className="btn-eliminar" onClick={() => eliminarCiudad(id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaisesCiudadesPage;
