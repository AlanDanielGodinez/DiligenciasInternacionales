import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Configuración de axios con interceptor para manejo de errores
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
  const navigate = useNavigate();

  // Definición de los pasos por tipo de trámite
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

    // Verificar autenticación
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    // Configurar el token en los headers por defecto
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setCliente(userData);
    fetchEstadoSolicitud(userData.idCliente);
  }, [navigate]);

  const fetchEstadoSolicitud = async (idCliente) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/solicitudes/cliente/${idCliente}`);
      
      if (!response.data) {
        throw new Error('Respuesta vacía del servidor');
      }

      const solicitud = response.data;
      
      if (!solicitud.estado_actual) {
        setEstadoActual('Sin solicitudes registradas');
      } else {
        setEstadoActual(solicitud.estado_actual);
      }
      
      setTipoTramite(solicitud.tipoTramite || '');
      setIdSolicitud(solicitud.idSolicitud || null);
      
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
    // Limpiar headers de axios
    delete api.defaults.headers.common['Authorization'];
    
    // Limpiar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userCliente');
    
    // Redirigir al login
    navigate('/login');
  };

  const renderPasos = () => {
    const pasos = pasosPorTramite[tipoTramite] || [];
    const pasoActualIndex = pasos.findIndex(paso => paso === estadoActual);

    return (
      <div className="timeline-container">
        {pasos.map((paso, index) => {
          let estadoClase = 'pendiente';
          
          if (pasoActualIndex === -1) {
            estadoClase = 'pendiente';
          } else if (index < pasoActualIndex) {
            estadoClase = 'completado';
          } else if (index === pasoActualIndex) {
            estadoClase = 'actual';
          }

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
          {error.includes('expirado') ? null : (
            <button 
              onClick={() => fetchEstadoSolicitud(cliente.idCliente)}
              className="btn-reintentar"
            >
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
          <button className="btn-subir-documentos">
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
            Bienvenido, {cliente
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
      </div>
    </div>
  );
};

export default InicioCliente;