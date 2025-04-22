import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaUserShield, 
  FaChevronDown, FaChevronUp, FaInfoCircle, FaUsersCog,
  FaTimes, FaCheck, FaExclamationTriangle, FaLock
} from 'react-icons/fa';
import axios from 'axios';


const RolesPage = () => {
  // Estados
  const [rolEditando, setRolEditando] = useState(null);
  const [listaRoles, setListaRoles] = useState([]);
  const [rolesFiltrados, setRolesFiltrados] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [rolExpandido, setRolExpandido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoRol, setNuevoRol] = useState({ 
    nombreRol: ''
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const navigate = useNavigate();

  // Configuración de axios
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
  });

  // Interceptor para añadir token a las peticiones
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  }, error => Promise.reject(error));

  // Obtener roles al cargar el componente
  useEffect(() => {
    obtenerRoles();
  }, []);

  // Filtrar roles cuando cambia el término de búsqueda
  useEffect(() => {
    if (terminoBusqueda === '') {
      setRolesFiltrados(listaRoles);
    } else {
      const termino = terminoBusqueda.toLowerCase();
      const resultados = listaRoles.filter(rol => {
        // Asegurar que nombreRol siempre sea un string
        const nombreRol = rol.nombreRol ? rol.nombreRol.toString() : '';
        return nombreRol.toLowerCase().includes(termino);
      });
      setRolesFiltrados(resultados);
    }
  }, [terminoBusqueda, listaRoles]);

  // Función para obtener roles
  const obtenerRoles = async () => {
    try {
      setCargando(true);
      setError('');
      const respuesta = await api.get('/roles');
      setListaRoles(respuesta.data);
      setRolesFiltrados(respuesta.data);
    } catch (err) {
      manejarError(err, 'Error al cargar roles');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setCargando(false);
    }
  };

  // Manejador genérico de errores
  const manejarError = (err, mensajeDefault) => {
    const mensaje = err.response?.data?.error || 
                   err.response?.data?.details || 
                   err.message || 
                   mensajeDefault;
    setError(mensaje);
    setTimeout(() => setError(''), 5000);
  };

  // Manejador de éxito
  const manejarExito = (mensaje) => {
    setExito(mensaje);
    setTimeout(() => setExito(''), 5000);
  };

  // Manejadores de cambios en formularios
  const manejarCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoRol(prev => ({ ...prev, [name]: value }));
  };

  const manejarCambioEdicion = (e) => {
    const { name, value } = e.target;
    setRolEditando(prev => ({ ...prev, [name]: value }));
  };

  // Crear un nuevo rol
  const crearRol = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const respuesta = await api.post('/roles', {
        nombreRol: nuevoRol.nombreRol
      });
      
      setListaRoles(prev => [...prev, {
        idRol: respuesta.data.idRol,
        nombreRol: respuesta.data.nombreRol,
        empleados: 0
      }]);
      
      setNuevoRol({ nombreRol: '' });
      setMostrarModal(false);
      manejarExito('Rol creado exitosamente');
    } catch (err) {
      manejarError(err, 'Error al crear rol');
    }
  };

  // Actualizar un rol existente
  const actualizarRol = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const respuesta = await api.put(`/roles/${rolEditando.idRol}`, {
        nombreRol: rolEditando.nombreRol
      });
      
      setListaRoles(listaRoles.map(rol => 
        rol.idRol === rolEditando.idRol ? respuesta.data : rol
      ));
      
      setRolesFiltrados(rolesFiltrados.map(rol => 
        rol.idRol === rolEditando.idRol ? respuesta.data : rol
      ));
      
      setRolEditando(null);
      manejarExito('Rol actualizado exitosamente');
    } catch (err) {
      manejarError(err, 'Error al actualizar rol');
    }
  };

  // Eliminar un rol
  const eliminarRol = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este rol? Los empleados con este rol quedarán sin asignación.')) return;
    
    try {
      await api.delete(`/roles/${id}`);
      setListaRoles(listaRoles.filter(rol => rol.idRol !== id));
      setRolesFiltrados(rolesFiltrados.filter(rol => rol.idRol !== id));
      manejarExito('Rol eliminado correctamente');
    } catch (err) {
      manejarError(err, 'Error al eliminar rol');
    }
  };

  // Alternar visibilidad de detalles del rol
  const alternarExpandido = (id) => {
    setRolExpandido(rolExpandido === id ? null : id);
  };

  // Verificar si es el rol Administrador
  const esRolAdministrador = (rol) => {
    return rol.nombreRol.toLowerCase() === 'administrador';
  };

  return (
    <div className="roles-container">
      {/* Encabezado */}
      <div className="roles-header">
        <h1><FaUserShield className="roles-header__icon" /> Gestión de Roles</h1>
        <button 
          onClick={() => setMostrarModal(true)} 
          className="roles-add-button"
        >
          <span className="roles-add-button__circle"><FaPlus className="roles-add-button__plus" /></span>
          <span className="roles-add-button__text">Crear Nuevo Rol</span>
        </button>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="roles-alert roles-alert--error">
          <FaExclamationTriangle /> {error}
        </div>
      )}
      {exito && (
        <div className="roles-alert roles-alert--success">
          <FaCheck /> {exito}
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="roles-search-container">
        <div className="roles-search-box">
          <FaSearch className="roles-search-box__icon" />
          <input
            type="text"
            placeholder="Buscar roles por nombre..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            className="roles-search-box__input"
          />
        </div>
      </div>

      {/* Modal de Edición */}
      {rolEditando && (
        <div className="roles-modal-backdrop">
          <div className="roles-modal">
            <div className="roles-modal__header">
              <h2><FaUserShield /> Editar Rol</h2>
              <button 
                className="roles-modal__close-button"
                onClick={() => setRolEditando(null)}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={actualizarRol} className="roles-form">
              <div className="roles-form__group">
                <label className="roles-form__label">Nombre del Rol:</label>
                <input
                  type="text"
                  name="nombreRol"
                  value={rolEditando.nombreRol}
                  onChange={manejarCambioEdicion}
                  required
                  disabled={esRolAdministrador(rolEditando)}
                  className="roles-form__input"
                />
                {esRolAdministrador(rolEditando) && (
                  <div className="roles-form__warning">
                    <FaLock /> El rol Administrador no puede ser modificado
                  </div>
                )}
              </div>
              
              <div className="roles-modal__actions">
                <button 
                  type="button" 
                  className="roles-button roles-button--cancel"
                  onClick={() => setRolEditando(null)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="roles-button roles-button--confirm"
                  disabled={esRolAdministrador(rolEditando)}
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      {cargando ? (
        <div className="roles-loading">
          <div className="roles-loading__spinner"></div>
          <p className="roles-loading__text">Cargando roles...</p>
        </div>
      ) : rolesFiltrados.length === 0 ? (
        <div className="roles-empty">
          <FaInfoCircle className="roles-empty__icon" />
          <p className="roles-empty__text">
            {terminoBusqueda ? 'No hay resultados para tu búsqueda' : 'No hay roles registrados'}
          </p>
        </div>
      ) : (
        <div className="roles-grid">
          {rolesFiltrados.map((rol, index) => (
            <div 
              key={rol.idRol} 
              className={`roles-card ${rolExpandido === rol.idRol ? 'roles-card--expanded' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              data-type={esRolAdministrador(rol) ? 'admin' : 'default'}
            >
              <div 
                className="roles-card__header" 
                onClick={() => alternarExpandido(rol.idRol)}
              >
                <div className="roles-card__icon">
                  {esRolAdministrador(rol) ? (
                    <FaUserShield />
                  ) : (
                    <FaUsersCog />
                  )}
                </div>
                <div className="roles-card__content">
                  <h3 className="roles-card__title">{rol.nombreRol}</h3>
                  <div className="roles-card__count">
                    {rol.empleados} {rol.empleados === 1 ? 'empleado' : 'empleados'}
                  </div>
                </div>
                <span className="roles-card__expand-icon">
                  {rolExpandido === rol.idRol ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>
              
              <div className="roles-card__body">
                {rolExpandido === rol.idRol && (
                  <div className="roles-card__expanded-content">
                    <div className="roles-card__actions">
                      <button
                        onClick={() => setRolEditando(rol)}
                        className="roles-button roles-button--edit"
                        disabled={esRolAdministrador(rol)}
                      >
                        <FaEdit /> Editar
                      </button>
                      <button 
                        onClick={() => eliminarRol(rol.idRol)}
                        className="roles-button roles-button--delete"
                        disabled={rol.empleados > 0 || esRolAdministrador(rol)}
                        title={
                          esRolAdministrador(rol) ? 
                          'El rol Administrador no puede eliminarse' : 
                          rol.empleados > 0 ? 'No se puede eliminar un rol con empleados asignados' : ''
                        }
                      >
                        <FaTrash /> Eliminar
                      </button>
                    </div>
                    {esRolAdministrador(rol) && (
                      <div className="roles-card__admin-protection">
                        <FaLock className="roles-card__lock-icon" />
                        <span>Este rol está protegido y no puede ser eliminado</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para nuevo rol */}
      {mostrarModal && (
        <div className="roles-modal-backdrop">
          <div className="roles-modal">
            <div className="roles-modal__header">
              <h2><FaUserShield /> Crear Nuevo Rol</h2>
              <button 
                className="roles-modal__close-button"
                onClick={() => {
                  setMostrarModal(false);
                  setError('');
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={crearRol} className="roles-form">
              <div className="roles-form__group">
                <label className="roles-form__label">Nombre del Rol: <span className="roles-form__required">*</span></label>
                <input
                  type="text"
                  name="nombreRol"
                  value={nuevoRol.nombreRol}
                  onChange={manejarCambioInput}
                  required
                  className="roles-form__input"
                />
              </div>
              
              <div className="roles-modal__actions">
                <button 
                  type="button" 
                  className="roles-button roles-button--cancel"
                  onClick={() => {
                    setMostrarModal(false);
                    setError('');
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="roles-button roles-button--confirm">
                  Crear Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPage;