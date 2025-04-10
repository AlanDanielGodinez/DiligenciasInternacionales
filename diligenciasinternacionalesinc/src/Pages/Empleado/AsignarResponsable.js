
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AsignarResponsableModal = ({ areaId, onClose, onAsignado }) => {
  const [coordinadores, setCoordinadores] = useState([]);
  const [idEmpleadoSeleccionado, setIdEmpleadoSeleccionado] = useState('');
  const [error, setError] = useState('');

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
  });

  api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  }, error => Promise.reject(error));

  useEffect(() => {
    const fetchCoordinadores = async () => {
      try {
        const { data } = await api.get('/empleados');
        const coordinadores = data.filter(e => e.nombreRol?.toLowerCase().includes('coordinador'));

        setCoordinadores(coordinadores);
      } catch (err) {
        setError('Error al cargar coordinadores');
        console.error(err);
      }
    };
    fetchCoordinadores();
  }, []);

  const handleAsignar = async () => {
    if (!idEmpleadoSeleccionado) return setError('Selecciona un coordinador');
    try {
      await api.put(`/areas/${areaId}`, { responsableArea: idEmpleadoSeleccionado });
      onAsignado();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al asignar responsable');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content asignar-modal">
        <h2>Asignar Responsable</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Selecciona un Coordinador:</label>
          <select
            value={idEmpleadoSeleccionado}
            onChange={(e) => setIdEmpleadoSeleccionado(e.target.value)}
          >
            <option value="">-- Seleccionar --</option>
            {coordinadores.map(c => (
              <option key={c.idEmpleado} value={c.idEmpleado}>
                {c.nombreEmpleado} {c.apellidoPaternoEmpleado}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-confirm" onClick={handleAsignar}>Asignar</button>
        </div>
      </div>
    </div>
  );
};

export default AsignarResponsableModal;
