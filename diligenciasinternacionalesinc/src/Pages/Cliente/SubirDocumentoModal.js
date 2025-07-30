import React, { useState } from 'react';
import axios from 'axios';

const SubirDocumentoModal = ({ mostrar, cerrar, idSolicitud, documentosSubidos }) => {

  const [formData, setFormData] = useState({
    nombreDocumento: '',
    tipoDocumento: '',
    archivo: null
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  if (!mostrar) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!formData.archivo) {
      setError('Debes seleccionar un archivo');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const data = new FormData();
      data.append('nombreDocumento', formData.nombreDocumento);
      data.append('tipoDocumento', formData.tipoDocumento);
      data.append('archivo', formData.archivo);

      // Solo para depuración
      for (let pair of data.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      const response = await axios.post(
        `http://localhost:5000/api/solicitudes/${idSolicitud}/documentos`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMensaje('Documento subido correctamente');
      setFormData({ nombreDocumento: '', tipoDocumento: '', archivo: null });

      // Cerrar modal tras 1.5 segundos
      setTimeout(() => {
        cerrar();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Error al subir el documento');
    }
    if (documentosSubidos >= 8) {
      setError('Ya has subido el máximo permitido de 8 documentos.');
      return;
    }

  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Subir Documento</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombreDocumento"
            placeholder="Nombre del documento"
            value={formData.nombreDocumento}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="tipoDocumento"
            placeholder="Tipo de documento"
            value={formData.tipoDocumento}
            onChange={handleChange}
            required
          />
          <input
            type="file"
            name="archivo"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleChange}
            required
          />

          {error && <p className="error-message">{error}</p>}
          {mensaje && <p className="success-message">{mensaje}</p>}
          <p className="info-message">
            Documentos subidos: {documentosSubidos} / 8
          </p>
          {documentosSubidos < 5 && (
            <p className="warning-message">Debes subir al menos 5 documentos</p>
          )}

          <button type="submit">Subir</button>
          <button type="button" onClick={cerrar}>Cerrar</button>
        </form>
      </div>
    </div>
  );
};

export default SubirDocumentoModal;
