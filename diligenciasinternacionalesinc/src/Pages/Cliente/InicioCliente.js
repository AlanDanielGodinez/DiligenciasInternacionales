import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ResumenReencuentroModal from '../Cliente/ResumenEncuentroModal';


const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

const InicioCliente = () => {
  const [cliente, setCliente] = useState(null);
  const [estadoActual, setEstadoActual] = useState('');
  const [tipoTramite, setTipoTramite] = useState('');
  const [idSolicitud, setIdSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const navigate = useNavigate();
  const [documentosEntregados, setDocumentosEntregados] = useState([]);
  const [mostrarModalResumen, setMostrarModalResumen] = useState(false);


  // Estado para el modal de subir documentos
  const [formData, setFormData] = useState({
    nombreDocumento: '',
    tipoDocumento: '',
    archivo: null
  });
  const [mensaje, setMensaje] = useState('');
  const [errorModal, setErrorModal] = useState('');

  const pasosPorTramite = {
    'Grupo AMA': [
      'Inicio del trámite',
      'Entrega de documentos',
      'Pago de anticipo',
      'Perfil de aplicación y revisión',
      'Pago final',
      'Llenado de formulario DS-160',
      'Cita en embajada programada',
      'Confirmación de datos',
      'Capacitación',
      'Organización del viaje',
      'Vuelo y reencuentro',
      'Trámite finalizado'
    ],
    'Visa Individual': [
      'Inicio del trámite',
      'Entrega de documentos',
      'Pago de anticipo',
      'Perfil de aplicación',
      'Pago final',
      'Llenado de formulario DS-160',
      'Pago de derecho a visa',
      'Cita programada',
      'Confirmación de datos',
      'Capacitación',
      'Trámite finalizado'
    ],
    'Visa Canadiense': [
      'Inicio del trámite',
      'Entrega de documentos',
      'Pago de anticipo',
      'Perfil de aplicación',
      'Pago final',
      'Llenado de solicitud',
      'Subida de documentos a la plataforma',
      'Espera de carta para biométricos',
      'Cita biométrica',
      'Envío de pasaporte',
      'Entrega de pasaporte con visa',
      'Trámite finalizado'
    ],
    'Pasaporte MX': [
      'Inicio del trámite',
      'Entrega de documentos',
      'Pago del trámite',
      'Perfil de aplicación',
      'Cita agendada',
      'Entrega de pasaporte',
      'Trámite finalizado'
    ],
    'Pasaporte GT': [
      'Inicio del trámite',
      'Entrega de documentos',
      'Pago',
      'Perfil de aplicación',
      'Entrega completa de requisitos',
      'Cita agendada',
      'Entrega de pasaporte',
      'Trámite finalizado'
    ],
    'Pasaporte Americano en MX': [
      'Inicio del trámite',
      'Entrega de documentos',
      'Pago de anticipo',
      'Perfil de aplicación',
      'Llenado de formato DS',
      'Pago final',
      'Pago de derecho a pasaporte',
      'Cita agendada',
      'Capacitación',
      'Entrega de pasaporte',
      'Trámite finalizado'
    ]
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userCliente'));

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setCliente(userData);
    fetchEstadoSolicitud(userData.idCliente);
  }, [navigate]);

  const fetchEstadoSolicitud = async (idCliente) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/solicitudes/cliente/${idCliente}`);

      if (!response.data) throw new Error('Respuesta vacía del servidor');

      const solicitud = response.data;
      console.log('Solicitud recibida:', solicitud);

      if (!solicitud.estado_actual) {
        setEstadoActual('Sin solicitudes registradas');
      } else {
        setEstadoActual(solicitud.estado_actual);
      }

      setTipoTramite(solicitud.tipoTramite || '');
      setIdSolicitud(solicitud.idsolicitud || null);

      if (solicitud.estado_actual === 'Documentos entregados') {
        fetchDocumentosEntregados(solicitud.idsolicitud);
      }



    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setEstadoActual('Sin solicitudes registradas');
        } else if (error.response.status === 403) {
          setError('Tu sesión ha expirado. Serás redirigido para iniciar sesión nuevamente.');
          setTimeout(() => handleLogout(), 3000);
        } else {
          setError(`Error del servidor: ${error.response.status}`);
        }
      } else if (error.request) {
        setError('No se recibió respuesta del servidor');
      } else {
        setError('Error al configurar la solicitud');
      }
      console.error('Error al obtener solicitud:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
    localStorage.removeItem('userCliente');
    navigate('/login');
  };

  const fetchDocumentosEntregados = async (idSolicitud) => {
  try {
    const response = await api.get(`/documentos/solicitud/${idSolicitud}`);
    setDocumentosEntregados(response.data);
  } catch (error) {
    console.error('Error al obtener documentos entregados:', error);
  }
};


  // Funciones para el modal de subir documentos
  const handleChangeModal = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setErrorModal('');
    setMensaje('');

    if (!formData.archivo) {
      setErrorModal('Debes seleccionar un archivo');
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
        setMostrarModal(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorModal('Error al subir el documento');
    }
  };

  const renderPasos = () => {
    const tipoTramiteFormateado = tipoTramite.trim();
    const pasos = pasosPorTramite[tipoTramiteFormateado] || [];
    const pasoActualIndex = pasos.findIndex(paso => paso === estadoActual);

    return (
      <div className="timeline-container">
        {pasos.map((paso, index) => {
          let estadoClase = 'pendiente';
          if (pasoActualIndex === -1) estadoClase = 'pendiente';
          else if (index < pasoActualIndex) estadoClase = 'completado';
          else if (index === pasoActualIndex) estadoClase = 'actual';

          return (
            <div key={index} className={`timeline-item ${estadoClase}`}>
              <div className="timeline-dot"></div>
              <div className="timeline-text">
                <span className="paso-numero">Paso {index + 1}</span>
                {paso}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando información de tu solicitud...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <p className="error-message">{error}</p>
          {!error.includes('expirado') && (
            <button onClick={() => fetchEstadoSolicitud(cliente.idCliente)} className="btn-reintentar">
              Reintentar
            </button>
          )}
        </div>
      );
    }

    if (estadoActual === 'Sin solicitudes registradas') {
      return (
        <div className="no-solicitud">
          <h2>No tienes solicitudes registradas</h2>
          <p>Por favor, contacta a tu asesor para iniciar un trámite.</p>
        </div>
      );
    }

    return (
      <>
        <div className="solicitud-info">
          <h2>Estado de tu solicitud</h2>
          <div className="info-row">
            <span className="info-label">Trámite:</span>
            <span className="info-value">{tipoTramite}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Estado actual:</span>
            <span className="info-value highlight">{estadoActual}</span>
          </div>
        </div>

        {renderPasos()}

        <div className="documentos-section">
          <h3>Documentos requeridos</h3>
          <p>Según el estado actual de tu trámite, podrías necesitar subir documentos.</p>
          <button 
            className="btn-subir-documentos" 
            onClick={() => {
              if (idSolicitud) {
                setMostrarModal(true);
              } else {
                alert('No hay una solicitud activa para subir documentos');
              }
            }}
          >
            Subir documentos
          </button>
        </div>
      </>
    );
  };

  

  return (
    <div className="inicio-cliente-container">
      <div className="header-cliente">
        <div className="welcome-section">
          <h1>
            Bienvenid@, {cliente
              ? `${cliente.nombreCliente} ${cliente.apellidoPaternoCliente} ${cliente.apellidoMaternoCliente}`
              : 'Cliente'}
          </h1>
          <p className="subtitle">Sistema de seguimiento de trámites</p>
        </div>
        <button onClick={handleLogout} className="btn-cerrar-sesion">
          Cerrar sesión
        </button>
      </div>

     <div className="content-container">
      {renderContent()}
      
      {estadoActual === 'Documentos entregados' && documentosEntregados.length > 0 && (
        <div className="documentos-entregados">
          <h3>Documentos entregados por el asesor</h3>
          <ul>
            {documentosEntregados.map((doc) => (
              <li key={doc.iddocumento}>
                <strong>{doc.nombreDocumento}</strong> ({doc.tipoDocumento}) – Subido el {new Date(doc.fechasubida).toLocaleDateString()}
                <br />
                <a
                  href={`http://localhost:5000/uploads/documentos/${doc.archivo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver documento
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>


      {/* Modal de subir documentos */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Subir Documento</h2>
            <form onSubmit={handleSubmitModal}>
              <input
                type="text"
                name="nombreDocumento"
                placeholder="Nombre del documento"
                value={formData.nombreDocumento}
                onChange={handleChangeModal}
                required
              />
              <input
                type="text"
                name="tipoDocumento"
                placeholder="Tipo de documento"
                value={formData.tipoDocumento}
                onChange={handleChangeModal}
                required
              />
              <input
                type="file"
                name="archivo"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleChangeModal}
                required
              />
              {errorModal && <p className="error-message">{errorModal}</p>}
              {mensaje && <p className="success-message">{mensaje}</p>}
              <button type="submit">Subir</button>
              <button 
                type="button" 
                onClick={() => {
                  setMostrarModal(false);
                  setFormData({ nombreDocumento: '', tipoDocumento: '', archivo: null });
                  setErrorModal('');
                  setMensaje('');
                }}
              >
                Cerrar
              </button>
            </form>
          </div>
        </div>
      )}

      {estadoActual === 'Vuelo y reencuentro' && (
        <button
          className="btn-ver-reencuentro"
          onClick={() => setMostrarModalResumen(true)}
        >
          Ver detalles de mi viaje
        </button>
      )}

      {mostrarModalResumen && (
        <ResumenReencuentroModal
          idSolicitud={idSolicitud}
          cerrar={() => setMostrarModalResumen(false)}
        />
      )}

    </div>
  );
};

export default InicioCliente;