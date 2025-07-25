// AgregarPagoModal.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AgregarPagoModal = ({ visible, onClose, idSolicitud }) => {
  const [metodosPago, setMetodosPago] = useState([]);
  const [formData, setFormData] = useState({
    monto: '',
    idMetodopago: '',
    fechaPago: new Date().toISOString().split('T')[0],
    estadoPago: 'validado'
  });

  useEffect(() => {
    if (visible) {
      fetchMetodosPago();
    }
  }, [visible]);

  const fetchMetodosPago = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/metodos-pago', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetodosPago(response.data);
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`http://localhost:5000/api/solicitudes/${idSolicitud}/pagos`, {
        ...formData,
        idSolicitud
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('✅ Pago registrado correctamente');
      onClose(true); // cerrar modal
    } catch (error) {
      console.error('Error al guardar pago:', error);
      alert('❌ Error al registrar el pago');
    }
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Agregar Pago</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Monto:</label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Método de pago:</label>
            <select
              name="idMetodopago"
              value={formData.idMetodopago}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona</option>
              {metodosPago.map(mp => (
                <option key={mp.idmetodopago} value={mp.idmetodopago}>
                  {mp.nombremetodo}
                </option>
              ))}
            </select>
          </div>

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

          <div className="form-group">
            <label>Estado del pago:</label>
            <input
              type="text"
              name="estadoPago"
              value={formData.estadoPago}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-guardar">Guardar</button>
            <button type="button" className="btn-cancelar" onClick={() => onClose(false)}>Cancelar</button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarPagoModal;
