import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ModalCliente = ({ mostrar, cerrar, cliente = {}, guardarCliente }) => {
  // Estado inicial del formulario con todos los campos necesarios
  const [formulario, setFormulario] = useState({
    nombreCliente: '',
    apellidoPaternoCliente: '',
    apellidoMaternoCliente: '',
    sexo: '',
    edad: '',
    telefono: '',
    estado_civil: '',
    identificacionunicanacional: '',
    Domicilio: '',
    condicionesEspeciales: '',
    fechaNacimiento: '',
    municipioNacimiento: '',
    EstadoNacimiento: '',
    PaisNacimiento: '',
    idPais: '',
    idCiudad: '',
    ...cliente
  });

  const [errores, setErrores] = useState({});
  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Efecto para cargar datos cuando el modal se muestra
  useEffect(() => {
    if (mostrar) {
      // Resetear formulario con los datos del cliente (si existe)
      setFormulario({
        nombreCliente: '',
        apellidoPaternoCliente: '',
        apellidoMaternoCliente: '',
        sexo: '',
        edad: '',
        telefono: '',
        estado_civil: '',
        identificacionunicanacional: '',
        Domicilio: '',
        condicionesEspeciales: '',
        fechaNacimiento: '',
        municipioNacimiento: '',
        EstadoNacimiento: '',
        PaisNacimiento: '',
        idPais: '',
        idCiudad: '',
        ...cliente
      });
      
      setErrores({});
      cargarPaises();
      
      // Si el cliente tiene país, cargar sus ciudades
      if (cliente.idPais) {
        cargarCiudadesPorPais(cliente.idPais);
      }
    }
  }, [mostrar, cliente]);

  // Función para cargar la lista de países
  const cargarPaises = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const res = await axios.get('http://localhost:5000/api/paises', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Normalizar datos de la API (por si hay diferencias en mayúsculas/minúsculas)
      setPaises(res.data.map(pais => ({
        idPais: pais.idPais || pais.idpais,
        nombrePais: pais.nombrePais || pais.nombrepais
      })));
    } catch (err) {
      console.error('Error cargando países:', err);
      alert('Error al cargar la lista de países. Verifica tu conexión o intenta más tarde.');
    }
  };

  // Función para cargar ciudades por país
  const cargarCiudadesPorPais = async (idPais) => {
    if (!idPais) {
      setCiudades([]);
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const res = await axios.get(`http://localhost:5000/api/paises/${idPais}/ciudades`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Normalizar datos de la API
      setCiudades(res.data.map(ciudad => ({
        idCiudad: ciudad.idCiudad || ciudad.idciudad,
        nombreCiudad: ciudad.nombreCiudad || ciudad.nombreciudad
      })));
    } catch (err) {
      console.error('Error cargando ciudades:', err);
      setCiudades([]);
      alert('Error al cargar las ciudades. Verifica tu conexión o intenta más tarde.');
    }
  };
  

  // Manejador de cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormulario(prev => {
      const nuevoForm = { ...prev, [name]: value };
      
      // Cuando cambia el país, cargar sus ciudades y resetear ciudad seleccionada
      if (name === 'idPais') {
        cargarCiudadesPorPais(value);
        nuevoForm.idCiudad = '';
      }
      
      return nuevoForm;
    });
    
    // Limpiar error del campo al modificarlo
    if (errores[name]) {
      setErrores(prev => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[name];
        return nuevosErrores;
      });
    }
  };

  

  // Función para validar el formulario
  const validarFormulario = () => {
    const nuevosErrores = {};
    const camposRequeridos = [
      'nombreCliente',
      'apellidoPaternoCliente',
      'telefono',
      'identificacionunicanacional',
      'idPais',
      'idCiudad'
    ];

    // Validar campos requeridos
    camposRequeridos.forEach(campo => {
      if (!formulario[campo]?.toString().trim()) {
        nuevosErrores[campo] = 'Este campo es obligatorio';
      }
    });

    // Validaciones específicas para cada campo
    if (formulario.nombreCliente?.trim().length < 2) {
      nuevosErrores.nombreCliente = 'El nombre debe tener al menos 2 caracteres';
    }

    if (formulario.apellidoPaternoCliente?.trim().length < 2) {
      nuevosErrores.apellidoPaternoCliente = 'El apellido debe tener al menos 2 caracteres';
    }

    if (!formulario.telefono?.match(/^\d{10,}$/)) {
      nuevosErrores.telefono = 'El teléfono debe tener al menos 10 dígitos';
    }

    if (formulario.edad && (formulario.edad < 0 || formulario.edad > 120)) {
      nuevosErrores.edad = 'Edad inválida (debe ser entre 0 y 120)';
    }

    if (formulario.fechaNacimiento && new Date(formulario.fechaNacimiento) > new Date()) {
      nuevosErrores.fechaNacimiento = 'La fecha no puede ser futura';
    }

    // Validación especial para identificación según país
    const identificacion = formulario.identificacionunicanacional?.trim() || '';
    const paisNacimiento = formulario.PaisNacimiento?.toLowerCase() || '';
    
    if (identificacion) {
      const len = identificacion.length;
      if (paisNacimiento.includes('méxico') && len !== 18) {
        nuevosErrores.identificacionunicanacional = 'La CURP debe tener 18 caracteres';
      } else if (paisNacimiento.includes('estados unidos') && len < 9) {
        nuevosErrores.identificacionunicanacional = 'El SSN debe tener mínimo 9 caracteres';
      } else if (len < 6) {
        nuevosErrores.identificacionunicanacional = 'Identificación demasiado corta (mínimo 6 caracteres)';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejador de envío del formulario
  // Manejador de envío del formulario
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validarFormulario()) {
    return;
  }

  setCargando(true);
  
  try {
    // Preparar datos para enviar (versión optimizada)
    const datosEnvio = {
      nombreCliente: formulario.nombreCliente.trim(),
      apellidoPaternoCliente: formulario.apellidoPaternoCliente.trim(),
      apellidoMaternoCliente: formulario.apellidoMaternoCliente?.trim() || null,
      sexo: formulario.sexo || null,
      edad: formulario.edad ? Number(formulario.edad) : null,
      telefono: formulario.telefono.trim(),
      estado_civil: formulario.estado_civil || null,
      identificacionunicanacional: formulario.identificacionunicanacional.trim(),
      Domicilio: formulario.Domicilio || null,
      condicionesEspeciales: formulario.condicionesEspeciales || null,
      fechaNacimiento: formulario.fechaNacimiento || null,
      municipioNacimiento: formulario.municipioNacimiento || null,
      EstadoNacimiento: formulario.EstadoNacimiento || null,
      PaisNacimiento: formulario.PaisNacimiento || null,
      idCiudad: formulario.idCiudad,
      idPais: formulario.idPais
    };

    console.log('Datos a enviar:', datosEnvio);

    await guardarCliente(datosEnvio);
    alert('Cliente guardado con éxito');
    cerrar();
  } catch (error) {
    console.error('Error detallado:', {
      message: error.message,
      response: error.response?.data,
      request: error.request,
      config: error.config
    });

    const mensaje = error.response?.data?.error || 
                   error.message || 
                   'Error desconocido al guardar cliente';
    alert(`Error: ${mensaje}`);
  } finally {
    setCargando(false);
  }
};

  // Si el modal no debe mostrarse, retornar null
  if (!mostrar) return null;

  // Renderizado del modal
  return (
    <div className="cliente-modal-backdrop">
      <div className="cliente-modal">
        <h2>{cliente.idCliente ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid-form">
            {/* Sección: Datos Personales */}
            <h3>Datos Personales</h3>
            
            <div className="form-group">
              <label>Nombre*</label>
              <input 
                type="text" 
                name="nombreCliente" 
                value={formulario.nombreCliente || ''} 
                onChange={handleChange}
                className={errores.nombreCliente ? 'input-error' : ''}
                placeholder="Ej. Juan"
              />
              {errores.nombreCliente && <span className="error">{errores.nombreCliente}</span>}
            </div>
            
            <div className="form-group">
              <label>Apellido Paterno*</label>
              <input 
                type="text" 
                name="apellidoPaternoCliente" 
                value={formulario.apellidoPaternoCliente || ''} 
                onChange={handleChange}
                className={errores.apellidoPaternoCliente ? 'input-error' : ''}
                placeholder="Ej. Pérez"
              />
              {errores.apellidoPaternoCliente && <span className="error">{errores.apellidoPaternoCliente}</span>}
            </div>
            
            <div className="form-group">
              <label>Apellido Materno</label>
              <input 
                type="text" 
                name="apellidoMaternoCliente" 
                value={formulario.apellidoMaternoCliente || ''} 
                onChange={handleChange}
                placeholder="Ej. Gómez"
              />
            </div>
            
            <div className="form-group">
              <label>Teléfono*</label>
              <input 
                type="text" 
                name="telefono" 
                value={formulario.telefono || ''} 
                onChange={handleChange}
                className={errores.telefono ? 'input-error' : ''}
                placeholder="10 dígitos mínimo"
              />
              {errores.telefono && <span className="error">{errores.telefono}</span>}
            </div>
            
            <div className="form-group">
              <label>Edad</label>
              <input 
                type="number" 
                name="edad" 
                value={formulario.edad || ''} 
                onChange={handleChange}
                className={errores.edad ? 'input-error' : ''}
                min="0"
                max="120"
                placeholder="Ej. 30"
              />
              {errores.edad && <span className="error">{errores.edad}</span>}
            </div>
            
            <div className="form-group">
              <label>Sexo</label>
              <select 
                name="sexo" 
                value={formulario.sexo || ''} 
                onChange={handleChange}
              >
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Estado Civil</label>
              <input 
                type="text" 
                name="estado_civil" 
                value={formulario.estado_civil || ''} 
                onChange={handleChange}
                placeholder="Ej. Soltero"
              />
            </div>
            
            <div className="form-group">
              <label>Condiciones Especiales</label>
              <input 
                type="text" 
                name="condicionesEspeciales" 
                value={formulario.condicionesEspeciales || ''} 
                onChange={handleChange}
                placeholder="Ej. Discapacidad visual"
              />
            </div>

            {/* Sección: Datos de Nacimiento */}
            <h3>Datos de Nacimiento</h3>
            
            <div className="form-group">
              <label>Fecha de Nacimiento</label>
              <input 
                type="date" 
                name="fechaNacimiento" 
                value={formulario.fechaNacimiento || ''} 
                onChange={handleChange}
                className={errores.fechaNacimiento ? 'input-error' : ''}
                max={new Date().toISOString().split('T')[0]}
              />
              {errores.fechaNacimiento && <span className="error">{errores.fechaNacimiento}</span>}
            </div>
            
            <div className="form-group">
              <label>Municipio de Nacimiento</label>
              <input 
                type="text" 
                name="municipioNacimiento" 
                value={formulario.municipioNacimiento || ''} 
                onChange={handleChange}
                placeholder="Ej. Guadalajara"
              />
            </div>
            
            <div className="form-group">
              <label>Estado de Nacimiento</label>
              <input 
                type="text" 
                name="EstadoNacimiento" 
                value={formulario.EstadoNacimiento || ''} 
                onChange={handleChange}
                placeholder="Ej. Jalisco"
              />
            </div>
            
            <div className="form-group">
              <label>País de Nacimiento</label>
              <input 
                type="text" 
                name="PaisNacimiento" 
                value={formulario.PaisNacimiento || ''} 
                onChange={handleChange}
                placeholder="Ej. México"
              />
            </div>

            {/* Sección: Ubicación Actual */}
            <h3>Ubicación Actual</h3>
            
            <div className="form-group">
              <label>País*</label>
              <select 
                name="idPais" 
                value={formulario.idPais || ''} 
                onChange={handleChange}
                className={errores.idPais ? 'input-error' : ''}
              >
                <option value="">Seleccionar País</option>
                {paises.map(pais => (
                  <option key={pais.idPais} value={pais.idPais}>
                    {pais.nombrePais}
                  </option>
                ))}
              </select>
              {errores.idPais && <span className="error">{errores.idPais}</span>}
            </div>
            
            <div className="form-group">
              <label>Ciudad*</label>
              <select 
                name="idCiudad" 
                value={formulario.idCiudad || ''} 
                onChange={handleChange}
                disabled={!formulario.idPais}
                className={errores.idCiudad ? 'input-error' : ''}
              >
                <option value="">{formulario.idPais ? 'Seleccionar Ciudad' : 'Seleccione un país primero'}</option>
                {ciudades.map(ciudad => (
                  <option key={ciudad.idCiudad} value={ciudad.idCiudad}>
                    {ciudad.nombreCiudad}
                  </option>
                ))}
              </select>
              {errores.idCiudad && <span className="error">{errores.idCiudad}</span>}
            </div>
            
            <div className="form-group">
              <label>Domicilio</label>
              <input 
                type="text" 
                name="Domicilio" 
                value={formulario.Domicilio || ''} 
                onChange={handleChange}
                placeholder="Ej. Calle Principal #123"
              />
            </div>
            
            <div className="form-group">
              <label>Identificación Nacional*</label>
              <input 
                type="text" 
                name="identificacionunicanacional" 
                value={formulario.identificacionunicanacional || ''} 
                onChange={handleChange}
                className={errores.identificacionunicanacional ? 'input-error' : ''}
                placeholder="Ej. CURP, DNI, SSN"
              />
              {errores.identificacionunicanacional && <span className="error">{errores.identificacionunicanacional}</span>}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="acciones-modal">
            <button 
              type="submit" 
              className="btn-guardar"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <span className="spinner"></span> Guardando...
                </>
              ) : (
                'Guardar Cliente'
              )}
            </button>
            
            <button 
              type="button" 
              onClick={cerrar} 
              className="btn-cancelar"
              disabled={cargando}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCliente;