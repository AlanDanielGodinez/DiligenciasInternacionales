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
      nombreEmpleado: '',
      apellidoPaternoEmpleado: '',
      apellidoMaternoEmpleado: '',
      correoEmpleado: '',
      password: '',
      confirmPassword: '', // Para validación
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

    useEffect(() => {
      const cargarAreas = async () => {
        try {
          const respuesta = await api.get('/areas');
          console.log("Respuesta de áreas:", respuesta.data); // Verifica esto en la consola
          setAreas(respuesta.data);
        } catch (err) {
          console.error("Error cargando áreas:", err);
        }
      };
      cargarAreas();
    }, []);

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
        (emp.nombreEmpleado?.toLowerCase() || '').includes(termino) || 
        (emp.apellidoPaternoEmpleado?.toLowerCase() || '').includes(termino) ||
        (emp.correoEmpleado?.toLowerCase() || '').includes(termino) ||
        (emp.nombreArea?.toLowerCase() || '').includes(termino) // 👉 AÑADIR ESTO
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
      
      // Validaciones
      if (nuevoEmpleado.password !== nuevoEmpleado.confirmPassword) {
        return setError('Las contraseñas no coinciden');
      }
      
      if (nuevoEmpleado.password.length < 6) {
        return setError('La contraseña debe tener al menos 6 caracteres');
      }
    
      try {
        const empleadoParaEnviar = {
          nombreEmpleado: nuevoEmpleado.nombreEmpleado,
          apellidoPaternoEmpleado: nuevoEmpleado.apellidoPaternoEmpleado,
          apellidoMaternoEmpleado: nuevoEmpleado.apellidoMaternoEmpleado,
          correoEmpleado: nuevoEmpleado.correoEmpleado,
          password: nuevoEmpleado.password, // <== Agrega esto
          idRol: nuevoEmpleado.idRol,
          idArea: nuevoEmpleado.idArea || null
        };
        
    
        const respuesta = await api.post('/empleados', empleadoParaEnviar);
    
        // Verificación más flexible de la respuesta
        if (!respuesta.data) {
          throw new Error('No se recibieron datos en la respuesta');
        }
    
        // Si la respuesta contiene el empleado completo
        if (respuesta.data.idEmpleado) {
          setListaEmpleados(prev => [...prev, respuesta.data]);
          setEmpleadosFiltrados(prev => [...prev, respuesta.data]);
        } 
        // Si solo contiene el ID (caso de fallback)
        else if (respuesta.data.message) {
          // Recargar la lista completa
          const { data } = await api.get('/empleados');
          setListaEmpleados(data);
          setEmpleadosFiltrados(data);
        }
    
        // Resetear formulario
        setNuevoEmpleado({ 
          nombreEmpleado: '',
          apellidoPaternoEmpleado: '',
          apellidoMaternoEmpleado: '',
          correoEmpleado: '',
          password: '',
          confirmPassword: '',
          idRol: '',
          idArea: ''
        });
        
        setTimeout(() => window.location.reload(), 1000);

        
      } catch (err) {
        console.error('Error al crear empleado:', err);
        let mensajeError = 'Error al crear empleado';
        
        if (err.response) {
          if (err.response.data?.details) {
            mensajeError = err.response.data.details;
          } else if (err.response.data?.error) {
            mensajeError = err.response.data.error;
          }
        } else if (err.message) {
          mensajeError = err.message;
        }
        
        setError(mensajeError);
      }
    };

    const actualizarEmpleado = async (e) => {
      e.preventDefault();
      setError('');
    
      if (!empleadoEditando) return;
    
      // Validación de contraseña si se desea cambiar
      if (empleadoEditando.password && empleadoEditando.password !== empleadoEditando.confirmPassword) {
        return setError('Las contraseñas no coinciden');
      }
    
      try {
        const datosActualizados = {
          nombreEmpleado: empleadoEditando.nombreEmpleado,
          apellidoPaternoEmpleado: empleadoEditando.apellidoPaternoEmpleado,
          apellidoMaternoEmpleado: empleadoEditando.apellidoMaternoEmpleado,
          correoEmpleado: empleadoEditando.correoEmpleado,
          idRol: empleadoEditando.idRol,
          idArea: empleadoEditando.idArea || null
        };
    
        // Solo si se quiere cambiar la contraseña
        if (empleadoEditando.password?.trim()) {
          datosActualizados.password = empleadoEditando.password.trim();
        }
    
        
        
        const payload = {
          ...datosActualizados
        };
        
        
    
        const { data } = await api.put(`/empleados/${empleadoEditando.idEmpleado}`, payload);
    
        // Oculta el modal de edición
        setEmpleadoEditando(null);
    
        // ✅ Refrescar desde el backend
        const empleadosActualizados = await api.get('/empleados');
        setListaEmpleados(empleadosActualizados.data);
        setEmpleadosFiltrados(empleadosActualizados.data);
    
        setError('Empleado actualizado correctamente ✅');
        setTimeout(() => setError(''), 3000);
      } catch (err) {
        const mensajeError = err.response?.data?.error || 'Error al actualizar empleado ❌';
        setError(mensajeError);
        setTimeout(() => setError(''), 4000);
      }
    };
    

    const eliminarEmpleado = async (id) => {
      setError('');
    
      const confirmacion = window.confirm('¿Seguro que deseas eliminar este empleado? Esta acción no se puede deshacer.');
    
      if (!confirmacion) return;
    
      try {
        const { data } = await api.delete(`/empleados/${id}`);
    
        setListaEmpleados(prev => prev.filter(emp => emp.idEmpleado !== id));
        setEmpleadosFiltrados(prev => prev.filter(emp => emp.idEmpleado !== id));
    
        setError('Empleado eliminado correctamente ✅');
        setTimeout(() => setError(''), 3000);
      } catch (err) {
        const mensajeError = err.response?.data?.error || 'Error al eliminar empleado ❌';
        setError(mensajeError);
        setTimeout(() => setError(''), 4000);
      }
    };
    const alternarExpandido = (id) => {
      setEmpleadoExpandido(prev => prev === id ? null : id);
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

        {error && (
          <div className={`mensaje-feedback ${error.includes('✅') ? 'exito' : 'error'}`}>
            {error}
          </div>
        )}


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

        {empleadoEditando && (
          <div className="fondo-modal">
            <div className="contenido-modal">
              <h2><FaEdit /> Editar Empleado</h2>

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
                      value={empleadoEditando.apellidoMaternoEmpleado || ''}
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

                <div className="fila-formulario">
                  <div className="grupo-formulario">
                    <label>Nueva Contraseña:</label>
                    <input
                      type="password"
                      name="password"
                      value={empleadoEditando.password || ''}
                      onChange={manejarCambioEdicion}
                      placeholder="Dejar en blanco si no deseas cambiarla"
                    />
                  </div>

                  <div className="grupo-formulario">
                    <label>Confirmar Contraseña:</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={empleadoEditando.confirmPassword || ''}
                      onChange={manejarCambioEdicion}
                    />
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
                                    Actualizar Empleado
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
                          onClick={() =>
                            setEmpleadoEditando({
                              ...empleado,
                              idRol: roles.find(r => r.nombreRol === empleado.nombreRol)?.idRol || '',
                              idArea: areas.find(a => a.nombreArea === empleado.nombreArea)?.idArea || '',
                            
                              password: '',
                              confirmPassword: ''

                            })
                          }
                          
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
                      name="nombreEmpleado"  // Cambiado de "nombre"
                      value={nuevoEmpleado.nombreEmpleado}
                      onChange={manejarCambioInput}
                      required
                    />
                  </div>
                  
                  <div className="grupo-formulario">
                    <label>Apellido Paterno:</label>
                    <input
                      type="text"
                      name="apellidoPaternoEmpleado"  // Cambiado de "apellidoPaterno"
                      value={nuevoEmpleado.apellidoPaternoEmpleado}
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
                      name="apellidoMaternoEmpleado"  // Cambiado de "apellidoMaterno"
                      value={nuevoEmpleado.apellidoMaternoEmpleado}
                      onChange={manejarCambioInput}
                    />
                  </div>
                  
                  <div className="grupo-formulario">
                    <label>Correo Electrónico:</label>
                    <input
                      type="email"
                      name="correoEmpleado"  // Cambiado de "correo"
                      value={nuevoEmpleado.correoEmpleado}
                      onChange={manejarCambioInput}
                      required
                    />
                  </div>
                  
                </div>
                <div className="fila-formulario">
                  <div className="grupo-formulario">
                    <label>Contraseña:</label>
                    <input
                      type="password"
                      name="password"
                      value={nuevoEmpleado.password}
                      onChange={manejarCambioInput}
                      required
                      minLength="6"
                    />
                  </div>
                
                <div className="grupo-formulario">
                  <label>Confirmar Contraseña:</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={nuevoEmpleado.confirmPassword}
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
                          {area.nombreArea || 'Área sin nombre'} {/* Manejo seguro */}
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
                      window.location.reload();
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