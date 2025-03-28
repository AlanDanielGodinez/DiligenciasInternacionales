import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaUserTie, 
  FaChevronDown, FaChevronUp, FaInfoCircle, FaUserShield 
} from 'react-icons/fa';
import axios from 'axios';

const EmpleadosPage = () => {
  // Estados
  const [empleadoEditando, setEmpleadoEditando] = useState(null);
  const [listaEmpleados, setListaEmpleados] = useState([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [empleadoExpandido, setEmpleadoExpandido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({ 
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    correo: '',
    idRol: '',
    idArea: ''
  });
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Configuración de axios
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
  });

  api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  }, error => Promise.reject(error));

  // Obtener datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError('');
        
        const [respuestaEmpleados, respuestaRoles, respuestaAreas] = await Promise.all([
          api.get('/empleados'),
          api.get('/roles'),
          api.get('/areas')
        ]);

        setListaEmpleados(respuestaEmpleados.data);
        setEmpleadosFiltrados(respuestaEmpleados.data);
        setRoles(respuestaRoles.data);
        setAreas(respuestaAreas.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar datos');
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Filtrado de empleados
  useEffect(() => {
    if (!listaEmpleados.length) return;
    
    const termino = terminoBusqueda.toLowerCase();
    const resultados = listaEmpleados.filter(emp => 
      emp.nombreEmpleado.toLowerCase().includes(termino) || 
      emp.apellidoPaternoEmpleado.toLowerCase().includes(termino) ||
      emp.correoEmpleado.toLowerCase().includes(termino)
    );
    
    setEmpleadosFiltrados(resultados);
  }, [terminoBusqueda, listaEmpleados]);

  // Manejadores de eventos
  const manejarCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoEmpleado(prev => ({ ...prev, [name]: value }));
  };

  const manejarCambioEdicion = (e) => {
    const { name, value } = e.target;
    setEmpleadoEditando(prev => ({ ...prev, [name]: value }));
  };

  const crearEmpleado = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const respuesta = await api.post('/empleados', nuevoEmpleado);
      
      setListaEmpleados([...listaEmpleados, respuesta.data]);
      setEmpleadosFiltrados([...empleadosFiltrados, respuesta.data]);
      
      setNuevoEmpleado({ 
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        correo: '',
        idRol: '',
        idArea: ''
      });
      
      setMostrarModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear empleado');
    }
  };

  const actualizarEmpleado = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const respuesta = await api.put(`/empleados/${empleadoEditando.idEmpleado}`, empleadoEditando);
      
      setListaEmpleados(listaEmpleados.map(emp => 
        emp.idEmpleado === empleadoEditando.idEmpleado ? respuesta.data : emp
      ));
      
      setEmpleadosFiltrados(empleadosFiltrados.map(emp => 
        emp.idEmpleado === empleadoEditando.idEmpleado ? respuesta.data : emp
      ));
      
      setEmpleadoEditando(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar empleado');
    }
  };

  const eliminarEmpleado = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) return;
    
    try {
      await api.delete(`/empleados/${id}`);
      
      setListaEmpleados(listaEmpleados.filter(emp => emp.idEmpleado !== id));
      setEmpleadosFiltrados(empleadosFiltrados.filter(emp => emp.idEmpleado !== id));
      
      alert('Empleado eliminado correctamente');
    } catch (err) {
      const mensajeError = err.response?.data?.error || 'Error al eliminar empleado';
      setError(mensajeError);
      alert(mensajeError);
    }
  };

  const alternarExpandido = (id) => {
    setEmpleadoExpandido(empleadoExpandido === id ? null : id);
  };

  return (
    <div className="contenedor-empleados">
      <div className="encabezado-empleados">
        <h1><FaUserTie className="icono-encabezado" /> Gestión de Empleados</h1>
        <button onClick={() => setMostrarModal(true)} className="boton-agregar-empleado">
          <span className="circulo-icono"><FaPlus className="icono-mas" /></span>
          <span className="texto-boton">Agregar Empleado</span>
        </button>
      </div>

      {error && <div className="mensaje-error">{error}</div>}

      <div className="contenedor-busqueda">
        <div className="caja-busqueda">
          <FaSearch className="icono-busqueda" />
          <input
            type="text"
            placeholder="Buscar empleados por nombre, apellido o correo..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Modal de Edición */}
      {empleadoEditando && (
        <div className="fondo-modal">
          <div className="contenido-modal">
            <h2><FaUserTie /> Editar Empleado</h2>
            
            <form onSubmit={actualizarEmpleado}>
              <div className="fila-formulario">
                <div className="grupo-formulario">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    name="nombreEmpleado"
                    value={empleadoEditando.nombreEmpleado}
                    onChange={manejarCambioEdicion}
                    required
                  />
                </div>
                
                <div className="grupo-formulario">
                  <label>Apellido Paterno:</label>
                  <input
                    type="text"
                    name="apellidoPaternoEmpleado"
                    value={empleadoEditando.apellidoPaternoEmpleado}
                    onChange={manejarCambioEdicion}
                    required
                  />
                </div>
              </div>
              
              <div className="fila-formulario">
                <div className="grupo-formulario">
                  <label>Apellido Materno:</label>
                  <input
                    type="text"
                    name="apellidoMaternoEmpleado"
                    value={empleadoEditando.apellidoMaternoEmpleado}
                    onChange={manejarCambioEdicion}
                  />
                </div>
                
                <div className="grupo-formulario">
                  <label>Correo Electrónico:</label>
                  <input
                    type="email"
                    name="correoEmpleado"
                    value={empleadoEditando.correoEmpleado}
                    onChange={manejarCambioEdicion}
                    required
                  />
                </div>
              </div>
              
              <div className="fila-formulario">
                <div className="grupo-formulario">
                  <label>Rol:</label>
                  <select
                    name="idRol"
                    value={empleadoEditando.idRol}
                    onChange={manejarCambioEdicion}
                    required
                  >
                    <option value="">Seleccionar rol...</option>
                    {roles.map(rol => (
                      <option key={rol.idRol} value={rol.idRol}>
                        {rol.nombreRol}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grupo-formulario">
                  <label>Área:</label>
                  <select
                    name="idArea"
                    value={empleadoEditando.idArea || ''}
                    onChange={manejarCambioEdicion}
                  >
                    <option value="">Sin área asignada</option>
                    {areas.map(area => (
                      <option key={area.idArea} value={area.idArea}>
                        {area.nombreArea}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="acciones-modal">
                <button 
                  type="button" 
                  className="boton-cancelar"
                  onClick={() => setEmpleadoEditando(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="boton-confirmar">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      {cargando ? (
        <div className="contenedor-carga">
          <div className="animacion-carga"></div>
          <p>Cargando empleados...</p>
        </div>
      ) : empleadosFiltrados.length === 0 ? (
        <div className="sin-resultados">
          <FaInfoCircle className="icono-info" />
          <p>{terminoBusqueda ? 'No hay resultados para tu búsqueda' : 'No hay empleados registrados'}</p>
        </div>
      ) : (
        <div className="rejilla-empleados">
          {empleadosFiltrados.map((empleado) => (
            <div 
              key={empleado.idEmpleado} 
              className={`tarjeta-empleado ${empleadoExpandido === empleado.idEmpleado ? 'expandida' : ''}`}
            >
              <div className="encabezado-tarjeta" onClick={() => alternarExpandido(empleado.idEmpleado)}>
                <div className="avatar-empleado">
                  {empleado.idRol === 1 ? <FaUserShield /> : <FaUserTie />}
                </div>
                <h3>{empleado.nombreEmpleado} {empleado.apellidoPaternoEmpleado}</h3>
                <span className="icono-expandir">
                  {empleadoExpandido === empleado.idEmpleado ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>
              
              <div className="contenido-tarjeta">
                <div className="info-empleado">
                  <p><strong>Correo:</strong> {empleado.correoEmpleado}</p>
                  <p><strong>Rol:</strong> {empleado.nombreRol || 'Sin rol asignado'}</p>
                  <p><strong>Área:</strong> {empleado.nombreArea || 'Sin área asignada'}</p>
                </div>

                {empleadoExpandido === empleado.idEmpleado && (
                  <div className="contenido-expandido">
                    <div className="acciones-empleado">
                      <button
                        onClick={() => setEmpleadoEditando(empleado)}
                        className="boton-editar"
                      >
                        <FaEdit /> Editar
                      </button>
                      <button 
                        onClick={() => eliminarEmpleado(empleado.idEmpleado)}
                        className="boton-eliminar"
                      >
                        <FaTrash /> Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para nuevo empleado */}
      {mostrarModal && (
        <div className="fondo-modal">
          <div className="contenido-modal">
            <h2><FaUserTie /> Agregar Nuevo Empleado</h2>
            
            <form onSubmit={crearEmpleado}>
              <div className="fila-formulario">
                <div className="grupo-formulario">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    name="nombre"
                    value={nuevoEmpleado.nombre}
                    onChange={manejarCambioInput}
                    required
                  />
                </div>
                
                <div className="grupo-formulario">
                  <label>Apellido Paterno:</label>
                  <input
                    type="text"
                    name="apellidoPaterno"
                    value={nuevoEmpleado.apellidoPaterno}
                    onChange={manejarCambioInput}
                    required
                  />
                </div>
              </div>
              
              <div className="fila-formulario">
                <div className="grupo-formulario">
                  <label>Apellido Materno:</label>
                  <input
                    type="text"
                    name="apellidoMaterno"
                    value={nuevoEmpleado.apellidoMaterno}
                    onChange={manejarCambioInput}
                  />
                </div>
                
                <div className="grupo-formulario">
                  <label>Correo Electrónico:</label>
                  <input
                    type="email"
                    name="correo"
                    value={nuevoEmpleado.correo}
                    onChange={manejarCambioInput}
                    required
                  />
                </div>
              </div>
              
              <div className="fila-formulario">
                <div className="grupo-formulario">
                  <label>Rol:</label>
                  <select
                    name="idRol"
                    value={nuevoEmpleado.idRol}
                    onChange={manejarCambioInput}
                    required
                  >
                    <option value="">Seleccionar rol...</option>
                    {roles.map(rol => (
                      <option key={rol.idRol} value={rol.idRol}>
                        {rol.nombreRol}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grupo-formulario">
                  <label>Área:</label>
                  <select
                    name="idArea"
                    value={nuevoEmpleado.idArea || ''}
                    onChange={manejarCambioInput}
                  >
                    <option value="">Sin área asignada</option>
                    {areas.map(area => (
                      <option key={area.idArea} value={area.idArea}>
                        {area.nombreArea}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="acciones-modal">
                <button 
                  type="button" 
                  className="boton-cancelar"
                  onClick={() => {
                    setMostrarModal(false);
                    setError('');
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="boton-confirmar">
                  Crear Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpleadosPage;