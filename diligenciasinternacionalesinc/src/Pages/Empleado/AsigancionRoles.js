import React, { useState, useEffect } from 'react';
import axios from 'axios';
 // archivo CSS separado

const AsignacionRoles = () => {
  const [areas, setAreas] = useState([]);
  const [coordinadores, setCoordinadores] = useState([]);
  const [selectedArea, setSelectedArea] = useState(0);
  const [selectedEmpleado, setSelectedEmpleado] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const areasRes = await api.get('/areas');
        const empleadosRes = await api.get('/empleados/coordinadores');
        setAreas(areasRes.data);
        setCoordinadores(empleadosRes.data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      }
    };

    fetchData();
  }, []);

  const handleAsignar = async () => {
    try {
      const area = areas[selectedArea];
      const empleado = coordinadores[selectedEmpleado];

      await api.put(`/areas/${area.idArea}`, {
        responsableArea: empleado.idEmpleado
      });

      setModalVisible(true);
    } catch (err) {
      console.error('Error al asignar responsable:', err);
    }
  };

  return (
    <div className="asignacion-container">
      <h1>Asignación de Roles</h1>
      <div className="asignacion-wrapper">
        <div className="carrusel">
          <h3>Esta área:</h3>
          <div className="carrusel-items">
            <button onClick={() => setSelectedArea((selectedArea - 1 + areas.length) % areas.length)}>◀</button>
            <div className="item-area">
              {areas.length > 0 ? (
                <>
                  <h4>{areas[selectedArea]?.nombreArea}</h4>
                  <p>{areas[selectedArea]?.descripcion}</p>
                </>
              ) : (
                <p>Cargando...</p>
              )}
            </div>
            <button onClick={() => setSelectedArea((selectedArea + 1) % areas.length)}>▶</button>
          </div>
        </div>

        <div className="asignacion-label">estará asignada a...</div>

        <div className="carrusel">
          <h3>Coordinador:</h3>
          <div className="carrusel-items">
            <button onClick={() => setSelectedEmpleado((selectedEmpleado - 1 + coordinadores.length) % coordinadores.length)}>◀</button>
            <div className="item-empleado">
              {coordinadores.length > 0 ? (
                <>
                  <h4>{coordinadores[selectedEmpleado]?.nombreEmpleado} {coordinadores[selectedEmpleado]?.apellidoPaternoEmpleado}</h4>
                  <p>{coordinadores[selectedEmpleado]?.correoEmpleado}</p>
                </>
              ) : (
                <p>Cargando...</p>
              )}
            </div>
            <button onClick={() => setSelectedEmpleado((selectedEmpleado + 1) % coordinadores.length)}>▶</button>
          </div>
        </div>
      </div>

      <button className="btn-asignar" onClick={handleAsignar}>
        Asignar
      </button>

      {modalVisible && (
        <div className="modal-asignado">
          <div className="modal-contenido">
            <span className="check">✅</span>
            <p>Responsable asignado exitosamente</p>
            <button onClick={() => setModalVisible(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsignacionRoles;
