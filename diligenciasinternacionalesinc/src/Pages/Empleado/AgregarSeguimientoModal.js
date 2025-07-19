// AgregarSeguimientoModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AgregarSeguimientoModal = ({ isOpen, onClose, idSolicitud, onSeguimientoAgregado }) => {
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('authToken');
      axios.get('http://localhost:5000/api/empleados', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setEmpleados(res.data))
      .catch(err => {
        console.error('Error al obtener empleados:', err);
        setError('No se pudieron cargar los empleados');
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (!empleadoSeleccionado || !descripcion.trim() || !estado.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(`http://localhost:5000/api/solicitudes/${idSolicitud}/seguimientos`, {
        idEmpleado: empleadoSeleccionado,
        descripcion,
        estado
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMensaje('Seguimiento agregado correctamente');
      onSeguimientoAgregado(res.data);
      onClose();
    } catch (err) {
      console.error('Error al agregar seguimiento:', err);
      setError('No se pudo agregar el seguimiento');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Agregar Seguimiento</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Empleado Responsable:
            <select
              value={empleadoSeleccionado}
              onChange={e => setEmpleadoSeleccionado(e.target.value)}
            >
              <option value="">-- Selecciona un empleado --</option>
              {empleados.map(emp => (
                <option key={emp.idEmpleado} value={emp.idEmpleado}>
                  {emp.nombreEmpleado} {emp.apellidoPaternoEmpleado} ({emp.nombreRol} - {emp.nombreArea})
                </option>
              ))}
            </select>
          </label>

          <label>
            Estado:
            <input
              type="text"
              value={estado}
              onChange={e => setEstado(e.target.value)}
              placeholder="Ej. En proceso, Finalizado..."
            />
          </label>

          <label>
            Descripción del seguimiento:
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows="4"
              placeholder="Describe lo que se ha hecho o el cambio de estado"
            />
          </label>

          {error && <p className="error">{error}</p>}
          {mensaje && <p className="success">{mensaje}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Agregar Seguimiento</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarSeguimientoModal;
