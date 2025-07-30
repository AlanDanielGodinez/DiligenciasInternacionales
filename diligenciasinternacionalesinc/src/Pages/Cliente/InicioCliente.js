import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ResumenReencuentroModal from '../Cliente/ResumenEncuentroModal';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

const InicioCliente = () => {
  const [cliente, setCliente] = useState(null);
  const [estadoActual, setEstadoActual] = useState('');
  const [tipoTramite, setTipoTramite] = useState('');
  const [idSolicitud, setIdSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalResumen, setMostrarModalResumen] = useState(false);
  const [documentosEntregados, setDocumentosEntregados] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);
  const [formData, setFormData] = useState({ nombreDocumento: '', tipoDocumento: '', archivo: null });
  const [mensaje, setMensaje] = useState('');
  const [errorModal, setErrorModal] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userCliente'));
    if (!token || !userData) return navigate('/login');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setCliente(userData);
    fetchEstadoSolicitud(userData.idCliente);
  }, [navigate]);

  const fetchEstadoSolicitud = async (idCliente) => {
    setLoading(true);
    try {
      const response = await api.get(`/solicitudes/cliente/${idCliente}`);
      const solicitud = response.data;
      if (!solicitud.estado_actual) return setEstadoActual('Sin solicitudes registradas');
      setTipoTramite(solicitud.tipoTramite);
      setEstadoActual(solicitud.estado_actual);
      setIdSolicitud(solicitud.idsolicitud);
      if (solicitud.estado_actual === 'Documentos entregados') fetchDocumentosEntregados(solicitud.idsolicitud);
      if (solicitud.idsolicitud) fetchSeguimientos(solicitud.idsolicitud);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404) setEstadoActual('Sin solicitudes registradas');
      else if (status === 403) {
        setError('Tu sesión ha expirado. Serás redirigido para iniciar sesión.');
        setTimeout(() => handleLogout(), 3000);
      } else setError('Error al obtener solicitud');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeguimientos = async (idSolicitud) => {
    try {
      const response = await api.get(`/solicitudes/${idSolicitud}/linea-tiempo`);
      const { tipoTramite, estadoActual, seguimientos } = response.data;
      setTipoTramite(tipoTramite);
      setEstadoActual(estadoActual);
      setSeguimientos(seguimientos);
    } catch (error) {
      console.error('Error al obtener seguimientos:', error);
    }
  };

  const fetchDocumentosEntregados = async (idSolicitud) => {
    try {
      const response = await api.get(`/documentos/solicitud/${idSolicitud}`);
      setDocumentosEntregados(response.data);
    } catch (error) {
      console.error('Error al obtener documentos:', error);
    }
  };

  const handleLogout = () => {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
    localStorage.removeItem('userCliente');
    navigate('/login');
  };

  const handleChangeInput = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleUploadDocumento = async (e) => {
    e.preventDefault();
    setErrorModal('');
    setMensaje('');
    if (!formData.archivo) return setErrorModal('Debes seleccionar un archivo');
    try {
      const token = localStorage.getItem('authToken');
      const data = new FormData();
      data.append('nombreDocumento', formData.nombreDocumento);
      data.append('tipoDocumento', formData.tipoDocumento);
      data.append('archivo', formData.archivo);
      await axios.post(`http://localhost:5000/api/solicitudes/${idSolicitud}/documentos`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensaje('Documento subido correctamente');
      setFormData({ nombreDocumento: '', tipoDocumento: '', archivo: null });
      setTimeout(() => setMostrarModal(false), 1500);
    } catch (err) {
      setErrorModal('Error al subir el documento');
    }
  };

  const renderLineaTiempo = () => {
    const pasos = [...seguimientos].reverse().map((s) => s.estado);

    return (
      <div className="cliente-timeline-horizontal">
        {pasos.map((paso, i) => (
          <div key={i} className="cliente-timeline-paso">
            <div className="cliente-paso-circulo">{i + 1}</div>
            <div className="cliente-paso-etiqueta">{paso}</div>
            {i < pasos.length - 1 && <div className="cliente-linea-conector" />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="cliente-inicio-container">
      <header className="cliente-header">
        <h1>Bienvenid@, {cliente?.nombreCliente || 'Cliente'}</h1>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </header>

      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="cliente-error">{error}</p>
      ) : (
        <div className="cliente-panel">
          <h2>Estado de tu solicitud</h2>
          <p><strong>Trámite:</strong> {tipoTramite}</p>
          <p><strong>Estado actual:</strong> {estadoActual}</p>

          {renderLineaTiempo()}

          

          <div className="cliente-subida-documentos">
            <h3>Sube tus documentos</h3>
            <button onClick={() => setMostrarModal(true)}>Subir documentos</button>
          </div>
        </div>
      )}

      {mostrarModal && (
        <div className="cliente-modal-overlay">
          <div className="cliente-modal">
            <h2>Subir documento</h2>
            <form onSubmit={handleUploadDocumento}>
              <input type="text" name="nombreDocumento" placeholder="Nombre del documento" value={formData.nombreDocumento} onChange={handleChangeInput} required />
              <input type="text" name="tipoDocumento" placeholder="Tipo de documento" value={formData.tipoDocumento} onChange={handleChangeInput} required />
              <input type="file" name="archivo" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChangeInput} required />
              {errorModal && <p className="cliente-error">{errorModal}</p>}
              {mensaje && <p className="cliente-success">{mensaje}</p>}
              <button type="submit">Subir</button>
              <button type="button" onClick={() => setMostrarModal(false)}>Cerrar</button>
            </form>
          </div>
        </div>
      )}

      {estadoActual === 'Vuelo y reencuentro' && (
        <button className="cliente-btn-ver-reencuentro" onClick={() => setMostrarModalResumen(true)}>
          Ver detalles de mi viaje
        </button>
      )}

      {mostrarModalResumen && (
        <ResumenReencuentroModal idSolicitud={idSolicitud} cerrar={() => setMostrarModalResumen(false)} />
      )}
    </div>
  );
};

export default InicioCliente;
