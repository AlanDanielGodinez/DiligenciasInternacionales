import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VerPagoModal = ({ visible, onClose, idSolicitud }) => {
  const [pago, setPago] = useState(null);
  const [metodo, setMetodo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && idSolicitud) {
      fetchPago();
    }
  }, [visible, idSolicitud]);

  const fetchPago = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`http://localhost:5000/api/pagos/solicitud/${idSolicitud}`, {

        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data && res.data.length > 0) {
        const pagoEncontrado = res.data[0]; // Suponiendo un pago por solicitud
        setPago(pagoEncontrado);
        setMetodo(pagoEncontrado.nombremetodo || ''); // Si ya viene con JOIN
      } else {
        setPago(null);
      }
    } catch (error) {
      console.error('Error al obtener el pago:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Detalle del Pago</h3>

        {loading ? (
          <p>Cargando...</p>
        ) : !pago ? (
          <p>No se encontró ningún pago para esta solicitud.</p>
        ) : (
          <div className="pago-detalle">
            <p><strong>Monto:</strong> ${pago.monto}</p>
            <p><strong>Método de pago:</strong> {metodo || `ID ${pago.idmetodopago}`}</p>
            <p><strong>Fecha de pago:</strong> {new Date(pago.fechapago).toLocaleDateString()}</p>
            <p><strong>Estado del pago:</strong> {pago.estadopago}</p>
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose} className="btn-cerrar">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default VerPagoModal;
