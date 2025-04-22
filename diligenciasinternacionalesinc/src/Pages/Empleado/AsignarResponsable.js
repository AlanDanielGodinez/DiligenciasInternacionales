import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AsignarResponsableModal = ({ areaId, onClose, onAsignado }) => {
  const [coordinadores, setCoordinadores] = useState([]);
  const [idEmpleadoSeleccionado, setIdEmpleadoSeleccionado] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
  });

  // Añadir token a las peticiones
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, error => Promise.reject(error));

  useEffect(() => {
    const fetchCoordinadores = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/empleados/coordinadores');
        
        console.log('Coordinadores recibidos:', response.data); // Debug
        
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Formato de datos incorrecto');
        }
        
        setCoordinadores(response.data);
        setError('');
      } catch (err) {
        console.error('Error al obtener coordinadores:', err);
        setError(err.response?.data?.error || 'Error al cargar coordinadores');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCoordinadores();
  }, []);

  const handleAsignar = async () => {
    if (!idEmpleadoSeleccionado) {
      return setError('Debes seleccionar un coordinador');
    }
    
    try {
      setIsLoading(true);
      console.log('Intentando asignar responsable:', {
        areaId,
        idEmpleadoSeleccionado
      }); // Debug
      
      const response = await api.put(`/areas/${areaId}/responsable`, { 
        responsableArea: idEmpleadoSeleccionado 
      });
      
      
      console.log('Respuesta del servidor:', response.data); // Debug
      
      // Actualizar la lista de áreas
      await onAsignado();
      onClose();
    } catch (err) {
      console.error('Error al asignar responsable:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      
      setError(err.response?.data?.error || 
               err.response?.data?.message || 
               'Error al asignar responsable');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content asignar-modal">
        <h2>Asignar Responsable</h2>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="form-group">
          <label>Selecciona un Coordinador:</label>
          {isLoading && coordinadores.length === 0 ? (
            <p>Cargando coordinadores...</p>
          ) : (
            <select
              value={idEmpleadoSeleccionado}
              onChange={(e) => {
                setIdEmpleadoSeleccionado(e.target.value);
                setError('');
              }}
              disabled={isLoading}
            >
              <option value="">-- Seleccionar coordinador --</option>
              {coordinadores.map(c => (
                <option key={c.idEmpleado} value={c.idEmpleado}>
                  {c.nombreEmpleado} {c.apellidoPaternoEmpleado}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="modal-actions">
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            className="btn-confirm" 
            onClick={handleAsignar}
            disabled={isLoading || !idEmpleadoSeleccionado}
          >
            {isLoading ? 'Asignando...' : 'Asignar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsignarResponsableModal;