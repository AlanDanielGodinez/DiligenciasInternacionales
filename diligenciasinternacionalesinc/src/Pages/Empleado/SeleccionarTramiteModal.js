import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SeleccionarTramiteModal = ({ isOpen, onClose, clientesSeleccionados, onTramiteActualizado }) => {
  const [tramites, setTramites] = useState([]);
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTramitesGrupoAMA();
    }
  }, [isOpen]);

  const fetchTramitesGrupoAMA = async () => {
    try {
      const token = localStorage.getItem('authToken'); // Asegúrate que este es el nombre correcto
const res = await axios.get('http://localhost:5000/api/tramites/grupo-ama', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});


      setTramites(res.data);
    } catch (err) {
      console.error('Error al obtener trámites:', err);
      setError('No se pudieron cargar los trámites');
    }
  };

  const handleAgregarClientes = async () => {
    if (!tramiteSeleccionado || clientesSeleccionados.length === 0) {
      setError('Selecciona un trámite y al menos un cliente');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMensaje('');

      const token = localStorage.getItem('authToken');


      const res = await axios.patch(
        'http://localhost:5000/api/tramites/agregar-clientes',
        {
          idTramite: tramiteSeleccionado,
          clientes: clientesSeleccionados.map(c => c.idCliente),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      setMensaje(res.data.mensaje || 'Clientes agregados correctamente');
      onTramiteActualizado(tramiteSeleccionado); // Notifica al padre
      onClose(); // Cierra modal
    } catch (err) {
      console.error('Error al agregar clientes:', err);
      setError('No se pudieron agregar los clientes al trámite');
      console.error('Error al agregar clientes:', err.response?.data || err.message);

    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Seleccionar Trámite Grupo AMA</h2>

        <div>
          <label>Trámite:</label>
          <select
            value={tramiteSeleccionado}
            onChange={e => setTramiteSeleccionado(e.target.value)}
          >
            <option value="">-- Selecciona un trámite --</option>
            {tramites.map(t => (
              <option key={t.idtramite} value={t.idtramite}>
                {t.tipotramite} (ID: {t.idtramite})
              </option>
            ))}

          </select>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h4>Clientes seleccionados:</h4>
          {clientesSeleccionados.length > 0 ? (
            <ul>
              {clientesSeleccionados.map(cliente => (
                <li key={cliente.idCliente}>
                  {cliente.nombreCliente} {cliente.apellidoPaternoCliente} {cliente.apellidoMaternoCliente}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay clientes seleccionados</p>
          )}
        </div>

        {error && <p className="error">{error}</p>}
        {mensaje && <p className="success">{mensaje}</p>}

        <div className="modal-actions">
          <button onClick={onClose} disabled={loading}>Cancelar</button>
          <button onClick={handleAgregarClientes} disabled={loading || !tramiteSeleccionado}>
            {loading ? 'Agregando...' : 'Agregar Clientes al Trámite'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeleccionarTramiteModal;
