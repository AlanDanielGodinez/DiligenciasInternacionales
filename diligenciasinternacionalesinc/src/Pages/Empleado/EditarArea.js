import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSave, FaTimes } from 'react-icons/fa';
import { MdOutlineMeetingRoom } from 'react-icons/md';


const EditarArea = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [area, setArea] = useState({
    nombreArea: '',
    descripcion: '',
    responsableArea: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [empleados, setEmpleados] = useState([]);

  // Obtener datos del área y empleados
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        // Obtener área
        const areaResponse = await axios.get(`/api/areas/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Obtener lista de empleados para el select
        const empleadosResponse = await axios.get('/api/empleados', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setArea(areaResponse.data);
        setEmpleados(empleadosResponse.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar los datos');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setArea(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`/api/areas/${id}`, area, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      navigate('/areas', { state: { message: 'Área actualizada correctamente' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar el área');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-animation">
        <div className="spinner"></div>
        <p>Cargando datos del área...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/areas')}>Volver a áreas</button>
      </div>
    );
  }

  return (
    <div className="edit-area-container">
      <div className="edit-area-header">
        <h1>
          <MdOutlineMeetingRoom />
          Editar Área: {area.nombreArea}
        </h1>
        <button 
          onClick={() => navigate('/areas')}
          className="btn-cancel"
        >
          <FaTimes /> Cancelar
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="edit-area-form">
        <div className="form-group">
          <label>Nombre del Área:</label>
          <input
            type="text"
            name="nombreArea"
            value={area.nombreArea}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Descripción:</label>
          <textarea
            name="descripcion"
            value={area.descripcion || ''}
            onChange={handleInputChange}
            rows="5"
          />
        </div>
        
        <div className="form-group">
          <label>Responsable:</label>
          <select
            name="responsableArea"
            value={area.responsableArea || ''}
            onChange={handleInputChange}
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
          <button type="submit" className="btn-confirm">
            <FaSave /> Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarArea;