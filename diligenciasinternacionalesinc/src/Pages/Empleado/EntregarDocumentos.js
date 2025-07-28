import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EntregarDocumentos = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [archivos, setArchivos] = useState({
    documento1: null,
    documento2: null,
    documento3: null
  });

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('http://localhost:5000/api/solicitudes/pendientes-documentos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitudes(res.data);
    } catch (err) {
      console.error('Error al obtener solicitudes:', err);
      alert('No se pudieron obtener solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setArchivos({ documento1: null, documento2: null, documento3: null });
    setModalVisible(true);
  };

  const handleFileChange = (e) => {
    setArchivos({ ...archivos, [e.target.name]: e.target.files[0] });
  };

  const enviarDocumentos = async () => {
    const token = localStorage.getItem('authToken');
    const idEmpleado = JSON.parse(localStorage.getItem('user'))?.id;

    if (!archivos.documento1 || !archivos.documento2 || !archivos.documento3) {
      return alert('Debes seleccionar los 3 documentos');
    }

    const formData = new FormData();
    formData.append('documento1', archivos.documento1);
    formData.append('documento2', archivos.documento2);
    formData.append('documento3', archivos.documento3);
    formData.append('idEmpleado', idEmpleado);

    try {
      await axios.post(
        `http://localhost:5000/api/solicitudes/${solicitudSeleccionada.idsolicitud}/entregar-documentos`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('✅ Documentos entregados correctamente');
      setModalVisible(false);
      fetchSolicitudes();
    } catch (err) {
      console.error('Error al entregar documentos:', err);
      alert('❌ Error al entregar los documentos');
    }
  };

  return (
    <div className="metodos-pago-container">
      <h1 className="metodos-pago-title">Entregar Documentos Oficiales</h1>

      {loading ? (
        <p>Cargando solicitudes...</p>
      ) : solicitudes.length === 0 ? (
        <p>No hay solicitudes pendientes de entrega</p>
      ) : (
        <table className="pp-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Trámite</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((s) => (
              <tr key={s.idsolicitud}>
                <td>{s.idsolicitud}</td>
                <td>{s.nombrecliente}</td>
                <td>{s.tipotramite}</td>
                <td>{s.estado_actual}</td>
                <td>{new Date(s.fecha_actualizacion).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => abrirModal(s)} className="metodos-pago-add-button">
                    Entregar documentos
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalVisible && (
        <div className="metodo-pago-modal-overlay">
          <div className="metodo-pago-modal">
            <h2 className="metodo-pago-modal-title">Subir Documentos Oficiales</h2>

            <div className="metodo-pago-modal-input-container">
              <label>Documento 1</label>
              <input type="file" name="documento1" onChange={handleFileChange} className="metodo-pago-modal-input" />

              <label>Documento 2</label>
              <input type="file" name="documento2" onChange={handleFileChange} className="metodo-pago-modal-input" />

              <label>Documento 3</label>
              <input type="file" name="documento3" onChange={handleFileChange} className="metodo-pago-modal-input" />
            </div>

            <div className="metodo-pago-modal-buttons">
              <button onClick={() => setModalVisible(false)} className="metodo-pago-modal-cancel">Cancelar</button>
              <button onClick={enviarDocumentos} className="metodo-pago-modal-save">Subir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntregarDocumentos;
