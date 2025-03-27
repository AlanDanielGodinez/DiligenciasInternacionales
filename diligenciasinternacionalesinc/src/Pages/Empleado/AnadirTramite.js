import React, { useState } from 'react';
import axios from 'axios';

const AnadirTramiteModal = ({ onClose, onTramiteCreado }) => {
  const [tramite, setTramite] = useState({
    tipoTramite: '',
    descripcion: '',
    requisitos: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    plazo_estimado: '',
    costo: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTramite(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!tramite.tipoTramite) {
      setError('El tipo de trámite es requerido');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/tramites', tramite, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      onTramiteCreado(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear trámite');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content tramite-modal">
        <div className="modal-header">
          <h3>Nuevo Trámite</h3>
          <button className="close-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tramite-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Tipo de Trámite:</label>
            <input
              type="text"
              name="tipoTramite"
              value={tramite.tipoTramite}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={tramite.descripcion}
              onChange={handleChange}
              required
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Requisitos:</label>
            <textarea
              name="requisitos"
              value={tramite.requisitos}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha Inicio:</label>
              <input
                type="date"
                name="fecha_inicio"
                value={tramite.fecha_inicio}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Fecha Fin:</label>
              <input
                type="date"
                name="fecha_fin"
                value={tramite.fecha_fin}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Plazo Estimado:</label>
              <input
                type="text"
                name="plazo_estimado"
                value={tramite.plazo_estimado}
                onChange={handleChange}
                placeholder="Ej: 15 días hábiles"
              />
            </div>

            <div className="form-group">
              <label>Costo:</label>
              <input
                type="text"
                name="costo"
                value={tramite.costo}
                onChange={handleChange}
                placeholder="Ej: $100.00 USD"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="submit-btn">
              Guardar Trámite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnadirTramiteModal;