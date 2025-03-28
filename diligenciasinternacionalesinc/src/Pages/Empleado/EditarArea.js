import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSave, FaTimes } from 'react-icons/fa';
import { MdOutlineMeetingRoom } from 'react-icons/md';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const EditarArea = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [area, setArea] = useState({
    nombreArea: '',
    descripcion: '',
    responsableArea: null
  });
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Obtener el área y empleados en paralelo
        const [areaResponse, empleadosResponse] = await Promise.all([
          api.get(`/areas/${id}`),
          api.get('/empleados')
        ]);

        if (!areaResponse.data) {
          throw new Error('Área no encontrada');
        }

        setArea({
          nombreArea: areaResponse.data.nombreArea || '',
          descripcion: areaResponse.data.descripcion || '',
          responsableArea: areaResponse.data.responsableArea || null
        });
        
        setEmpleados(empleadosResponse.data || []);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || 
                err.response?.data?.message || 
                err.message || 
                'Error al cargar datos');
        
        if (err.response?.status === 404) {
          navigate('/areas', { state: { error: 'Área no encontrada' } });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.put(`/areas/${id}`, {
        nombreArea: area.nombreArea,
        descripcion: area.descripcion,
        responsableArea: area.responsableArea || null
      });
      
      navigate('/areas', { 
        state: { 
          success: 'Área actualizada correctamente',
          updatedArea: response.data
        } 
      });
      
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.error || 
              err.response?.data?.message || 
              'Error al actualizar el área');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando datos del área...</p>
      </div>
    );
  }

  return (
    <div className="container editar-area-container">
      <h1>
        <MdOutlineMeetingRoom /> Editar Área
      </h1>
      
      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="editar-area-form">
        <div className="form-group">
          <label>Nombre del Área:</label>
          <input
            type="text"
            className="form-control"
            value={area.nombreArea}
            onChange={(e) => setArea({...area, nombreArea: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Descripción:</label>
          <textarea
            className="form-control"
            value={area.descripcion}
            onChange={(e) => setArea({...area, descripcion: e.target.value})}
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label>Responsable:</label>
          <select
            className="form-control"
            value={area.responsableArea || ''}
            onChange={(e) => setArea({
              ...area, 
              responsableArea: e.target.value ? parseInt(e.target.value) : null
            })}
          >
            <option value="">Seleccionar responsable...</option>
            {empleados.map(emp => (
              <option key={emp.idEmpleado} value={emp.idEmpleado}>
                {emp.nombreEmpleado} {emp.apellidoPaternoEmpleado}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/areas')}
          >
            <FaTimes /> Cancelar
          </button>
          
          <button type="submit" className="btn btn-primary">
            <FaSave /> Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarArea;