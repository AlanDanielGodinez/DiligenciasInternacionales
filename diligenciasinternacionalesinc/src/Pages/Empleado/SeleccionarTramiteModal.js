import React, { useEffect, useState } from 'react';
import axios from 'axios';


const SeleccionarTramiteModal = ({ isOpen, onClose, clientesSeleccionados, onTramiteActualizado }) => {
  const [tramites, setTramites] = useState([]);
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTramitesGrupoAMA();
      setMensaje('');
      setError('');
      setExito(false);
      setTramiteSeleccionado('');
    }
  }, [isOpen]);

  const fetchTramitesGrupoAMA = async () => {
    try {
      const token = localStorage.getItem('authToken');
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
      setExito(true);
      onTramiteActualizado(tramiteSeleccionado);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error al agregar clientes:', err);
      setError('No se pudieron agregar los clientes al trámite');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-tramite-overlay">
      <div className="modal-tramite-content">
        <h2 className="modal-tramite-title">Seleccionar Trámite Grupo AMA</h2>

        <div className="modal-tramite-section">
          <label className="modal-tramite-label">Trámite:</label>
          <select
            value={tramiteSeleccionado}
            onChange={e => setTramiteSeleccionado(e.target.value)}
            className="modal-tramite-select"
          >
            <option value="">-- Selecciona un trámite --</option>
            {tramites.map(t => (
              <option key={t.idtramite} value={t.idtramite}>
                {t.tipotramite} (ID: {t.idtramite})
              </option>
            ))}
          </select>
        </div>

        <div className="modal-tramite-section">
          <h4>Clientes seleccionados:</h4>
          {clientesSeleccionados.length > 0 ? (
            <ul className="modal-tramite-client-list">
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

        {error && <p className="modal-tramite-error">{error}</p>}
        {mensaje && <p className="modal-tramite-success">{mensaje}</p>}

        <div className="modal-tramite-actions">
          <button onClick={onClose} disabled={loading || exito} className="modal-tramite-btn cancel">
            Cancelar
          </button>
          {exito ? (
            <button disabled className="modal-tramite-btn success">✅ Agregado</button>
          ) : (
            <button
              onClick={handleAgregarClientes}
              disabled={loading || !tramiteSeleccionado}
              className="modal-tramite-btn primary"
            >
              {loading ? 'Agregando...' : 'Agregar Clientes al Trámite'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeleccionarTramiteModal;
