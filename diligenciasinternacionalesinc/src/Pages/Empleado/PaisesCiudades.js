// GestionPaisesCiudades.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';

const GestionPaisesCiudades = () => {
  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [nuevoPais, setNuevoPais] = useState('');
  const [nuevaCiudad, setNuevaCiudad] = useState('');
  const [paisParaCiudad, setPaisParaCiudad] = useState('');

  const token = localStorage.getItem('authToken');
  const headers = { Authorization: `Bearer ${token}` };

  const cargarDatos = async () => {
    try {
      const resPaises = await axios.get('http://localhost:5000/api/paises', { headers });
      setPaises(resPaises.data);
      const resCiudades = await axios.get('http://localhost:5000/api/ciudades', { headers });
      setCiudades(resCiudades.data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const agregarPais = async () => {
    if (!nuevoPais.trim()) return;
    try {
      const res = await axios.post('http://localhost:5000/api/paises', { nombrePais: nuevoPais }, { headers });
      setPaises([...paises, res.data]);
      setNuevoPais('');
    } catch (err) {
      console.error('Error al agregar país:', err);
    }
  };

  const agregarCiudad = async () => {
    if (!nuevaCiudad.trim() || !paisParaCiudad) return;
    try {
      const res = await axios.post('http://localhost:5000/api/ciudades', {
        nombreCiudad: nuevaCiudad,
        idPais: paisParaCiudad
      }, { headers });
      setCiudades([...ciudades, res.data]);
      setNuevaCiudad('');
    } catch (err) {
      console.error('Error al agregar ciudad:', err);
    }
  };

  const eliminarPais = async (id) => {
    if (window.confirm('¿Eliminar este país?')) {
      try {
        await axios.delete(`http://localhost:5000/api/paises/${id}`, { headers });
        setPaises(paises.filter(p => (p.idPais || p.idpais) !== id));
      } catch (err) {
        console.error('Error al eliminar país:', err);
      }
    }
  };

  const eliminarCiudad = async (id) => {
    if (window.confirm('¿Eliminar esta ciudad?')) {
      try {
        await axios.delete(`http://localhost:5000/api/ciudades/${id}`, { headers });
        setCiudades(ciudades.filter(c => (c.idCiudad || c.idciudad) !== id));
      } catch (err) {
        console.error('Error al eliminar ciudad:', err);
      }
    }
  };

  return (
    <div className="gestion-paisesciudades-container">
      <h1 className="gestion-paisesciudades-titulo">Gestión de Países y Ciudades</h1>

      <div className="gestion-paisesciudades-panel">
        {/* Países */}
        <div className="gestion-paisesciudades-card">
          <h2>Países</h2>
          <div className="gestion-paisesciudades-form">
            <input
              type="text"
              value={nuevoPais}
              onChange={(e) => setNuevoPais(e.target.value)}
              placeholder="Nombre del país"
            />
            <button onClick={agregarPais}>Agregar</button>
          </div>
          <ul>
            {paises.map((p) => (
              <li key={p.idPais || p.idpais}>
                {p.nombrePais || p.nombrepais}
                <button className="btn-eliminar" onClick={() => eliminarPais(p.idPais || p.idpais)}>
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Ciudades */}
        <div className="gestion-paisesciudades-card">
          <h2>Ciudades</h2>
          <div className="gestion-paisesciudades-form">
            <input
              type="text"
              value={nuevaCiudad}
              onChange={(e) => setNuevaCiudad(e.target.value)}
              placeholder="Nombre de la ciudad"
            />
            <select value={paisParaCiudad} onChange={(e) => setPaisParaCiudad(e.target.value)}>
              <option value="">Selecciona un país</option>
              {paises.map((p) => (
                <option key={p.idPais || p.idpais} value={p.idPais || p.idpais}>
                  {p.nombrePais || p.nombrepais}
                </option>
              ))}
            </select>
            <button onClick={agregarCiudad}>Agregar</button>
          </div>
          <ul>
            {ciudades.map((c) => (
              <li key={c.idCiudad || c.idciudad}>
                {c.nombreCiudad || c.nombreciudad}
                <button className="btn-eliminar" onClick={() => eliminarCiudad(c.idCiudad || c.idciudad)}>
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GestionPaisesCiudades;
