import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SeleccionarTramiteModal = ({ mostrar, cerrar, clientesSeleccionados, onTramiteActualizado }) => {
  const [tramites, setTramites] = useState([]);
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    if (!mostrar) return;

    const fetchTramites = async () => {
      setIsLoading(true);
      setMensaje('');
      setTramiteSeleccionado(null);

      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/tramites/grupo-ama', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setTramites(response.data);
      } catch (error) {
        console.error('Error al obtener trámites Grupo AMA:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTramites();
  }, [mostrar]);

  const handleConfirmar = async () => {
    if (!tramiteSeleccionado) {
      alert('Seleccione un trámite');
      return;
    }

    const token = localStorage.getItem('authToken');
    const clientesIds = clientesSeleccionados.map(c => c.idCliente || c.idcliente);

    try {
      setConfirmando(true);
      await axios.patch(
        `http://localhost:5000/api/tramites/${tramiteSeleccionado.idtramite}/agregar-clientes`,
        { clientes: clientesIds },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMensaje('✅ Clientes agregados correctamente al trámite');
      onTramiteActualizado(tramiteSeleccionado);

      // Opcional: cerrar modal automáticamente tras 1s
      setTimeout(() => {
        cerrar();
        setConfirmando(false);
        setMensaje('');
      }, 1000);
    } catch (error) {
      console.error('Error al agregar clientes al trámite:', error);
      alert('❌ Ocurrió un error al asociar clientes');
    } finally {
      setConfirmando(false);
    }
  };

  if (!mostrar) return null;

  return (
    <div className="modal">
      <div className="modal-content modal-content-tramite">
        <h2>Seleccionar Trámite Existente - Grupo AMA</h2>

        {isLoading ? (
          <p>Cargando trámites...</p>
        ) : tramites.length === 0 ? (
          <p>No hay trámites disponibles del tipo "Grupo AMA"</p>
        ) : (
          <ul className="tramite-lista">
            {tramites.map(tramite => {
              const seleccionado = tramiteSeleccionado?.idtramite === tramite.idtramite;
              return (
                <li
                  key={tramite.idtramite}
                  className={`tramite-item ${seleccionado ? 'selected' : ''}`}
                  onClick={() => setTramiteSeleccionado(tramite)}
                  style={{
                    border: seleccionado ? '2px solid var(--color-primary)' : '1px solid #ccc',
                    backgroundColor: seleccionado ? '#e9f5ff' : '#fff',
                    padding: '10px',
                    marginBottom: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h4>{tramite.tipotramite}</h4>
                  <p>{tramite.descripcion}</p>
                  <p>
                    <strong>Clientes actuales:</strong>{' '}
                    {tramite.clientes?.map(c => c.nombre).join(', ') || 'Ninguno'}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {mensaje && <p className="success-message">{mensaje}</p>}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={cerrar} disabled={confirmando}>
            Cancelar
          </button>
          <button
            className="btn-confirm"
            onClick={handleConfirmar}
            disabled={!tramiteSeleccionado || confirmando}
          >
            {confirmando ? 'Asociando...' : 'Confirmar y Asociar Clientes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeleccionarTramiteModal;
