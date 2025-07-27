import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AgregarPagoModal = ({ visible, onClose, idSolicitud, onPagoSuccess }) => {
  const [metodosPago, setMetodosPago] = useState([]);
  const [empleadoId, setEmpleadoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    monto: '',
    idMetodopago: '',
    fechaPago: new Date().toISOString().split('T')[0],
    estadoPago: 'validado',
    idEmpleado: ''
  });

  // Obtener métodos de pago y ID del empleado al abrir el modal
  useEffect(() => {
    if (visible) {
      fetchMetodosPago();
      obtenerEmpleadoId();
    }
  }, [visible]);

  const fetchMetodosPago = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/metodos-pago', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetodosPago(response.data);
    } catch (err) {
      console.error('Error al cargar métodos de pago:', err);
      setError('No se pudieron cargar los métodos de pago');
    }
  };

  const obtenerEmpleadoId = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const decoded = jwtDecode(token);
        setEmpleadoId(decoded.id);
        setFormData(prev => ({ ...prev, idEmpleado: decoded.id }));
      }
    } catch (err) {
      console.error('Error al decodificar el token:', err);
      setError('No se pudo identificar al empleado');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `http://localhost:5000/api/solicitudes/${idSolicitud}/pagos`,
        {
          ...formData,
          idEmpleado: empleadoId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Notificar éxito y cerrar modal
      if (onPagoSuccess) onPagoSuccess(response.data);
      onClose(true);
      
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setError(err.response?.data?.error || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="close-button" onClick={() => onClose(false)}>×</button>
        
        <h3>Registrar Nuevo Pago</h3>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Campo Monto */}
          <div className="form-group">
            <label>Monto:</label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              placeholder="Ej: 1500.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Método de Pago */}
          <div className="form-group">
            <label>Método de pago:</label>
            <select
              name="idMetodopago"
              value={formData.idMetodopago}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un método</option>
              {metodosPago.map(mp => (
                <option key={mp.idmetodopago} value={mp.idmetodopago}>
                  {mp.nombremetodo}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha de Pago */}
          <div className="form-group">
            <label>Fecha de pago:</label>
            <input
              type="date"
              name="fechaPago"
              value={formData.fechaPago}
              onChange={handleChange}
              required
            />
          </div>

          {/* Estado del Pago */}
          <div className="form-group">
            <label>Estado:</label>
            <select
              name="estadoPago"
              value={formData.estadoPago}
              onChange={handleChange}
              required
            >
              <option value="validado">Validado</option>
              <option value="pendiente">Pendiente</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>

          {/* Campo oculto para el ID del empleado */}
          <input type="hidden" name="idEmpleado" value={empleadoId || ''} />

          {/* Botones de acción */}
          <div className="modal-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Guardar Pago'}
            </button>
            
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => onClose(false)}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarPagoModal;