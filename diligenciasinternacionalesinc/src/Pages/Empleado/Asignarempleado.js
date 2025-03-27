import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import axios from 'axios';
import './AreasPage.css';

const AsignarEmpleados = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [area, setArea] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [empleadosAsignados, setEmpleadosAsignados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        // Obtener área
        const areaResponse = await axios.get(`/api/areas/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Obtener todos los empleados
        const empleadosResponse = await axios.get('/api/empleados', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Obtener empleados asignados a esta área
        const asignadosResponse = await axios.get(`/api/areas/${id}/empleados`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setArea(areaResponse.data);
        setEmpleados(empleadosResponse.data);
        setEmpleadosAsignados(asignadosResponse.data.map(e => e.idEmpleado));
        setIsLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const toggleAsignacion = (idEmpleado) => {
    setEmpleadosAsignados(prev => 
      prev.includes(idEmpleado)
        ? prev.filter(id => id !== idEmpleado)
        : [...prev, idEmpleado]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Actualizar asignaciones
      await Promise.all(
        empleados.map(async empleado => {
          const shouldBeAssigned = empleadosAsignados.includes(empleado.idEmpleado);
          const isCurrentlyAssigned = empleado.idArea === parseInt(id);
          
          if (shouldBeAssigned && !isCurrentlyAssigned) {
            await axios.put(
              `/api/empleados/${empleado.idEmpleado}/area`,
              { idArea: id },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } else if (!shouldBeAssigned && isCurrentlyAssigned) {
            await axios.put(
              `/api/empleados/${empleado.idEmpleado}/area`,
              { idArea: null },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        })
      );
      
      navigate(`/editar-area/${id}`, { 
        state: { message: 'Asignaciones actualizadas correctamente' } 
      });
    } catch (err) {
      console.error('Error al guardar asignaciones:', err);
      setError(err.response?.data?.error || 'Error al guardar las asignaciones');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-animation">
        <div className="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="assign-container">
      <div className="assign-header">
        <button 
          onClick={() => navigate(`/editar-area/${id}`)}
          className="btn-back"
        >
          <FaArrowLeft /> Volver
        </button>
        <h1>Asignar Empleados a: {area?.nombreArea}</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="empleados-grid">
          {empleados.map(empleado => (
            <div 
              key={empleado.idEmpleado} 
              className={`empleado-card ${empleadosAsignados.includes(empleado.idEmpleado) ? 'asignado' : ''}`}
            >
              <div className="empleado-info">
                <h3>{empleado.nombreEmpleado} {empleado.apellidoPaternoEmpleado}</h3>
                <p>{empleado.correoEmpleado}</p>
              </div>
              
              <button
                type="button"
                className={`toggle-btn ${empleadosAsignados.includes(empleado.idEmpleado) ? 'btn-remove' : 'btn-add'}`}
                onClick={() => toggleAsignacion(empleado.idEmpleado)}
              >
                {empleadosAsignados.includes(empleado.idEmpleado) ? (
                  <FaUserMinus />
                ) : (
                  <FaUserPlus />
                )}
                {empleadosAsignados.includes(empleado.idEmpleado) ? 'Quitar' : 'Asignar'}
              </button>
            </div>
          ))}
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-save">
            <FaSave /> Guardar Asignaciones
          </button>
        </div>
      </form>
    </div>
  );
};

export default AsignarEmpleados;