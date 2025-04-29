import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ModalCliente = ({ mostrar, cerrar, cliente = {}, guardarCliente }) => {
  // Estado inicial del formulario
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
    idCiudad: ''
  });

  const [errores, setErrores] = useState({});
  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [paisesCache, setPaisesCache] = useState([]);

  // Función para transformar los datos del cliente al cargar el modal
  const transformarDatosCliente = (cliente) => {
    // Si no hay cliente o no tiene idCliente, es un nuevo cliente
    const isNew = !cliente || !cliente.idCliente;
    
    return {
      nombreCliente: isNew ? '' : cliente.nombreCliente || '',
      apellidoPaternoCliente: isNew ? '' : cliente.apellidoPaternoCliente || '',
      apellidoMaternoCliente: isNew ? '' : cliente.apellidoMaternoCliente || '',
      sexo: isNew ? '' : cliente.sexo || '',
      edad: isNew ? '' : cliente.edad || '',
      telefono: isNew ? '' : (cliente.rawTelefono || cliente.telefono || ''),
      estado_civil: isNew ? '' : cliente.estado_civil || '',
      identificacionunicanacional: isNew ? '' : cliente.identificacionunicanacional || '',
      Domicilio: isNew ? '' : cliente.Domicilio || '',
      condicionesEspeciales: isNew ? '' : cliente.condicionesEspeciales || '',
      fechaNacimiento: isNew ? '' : (cliente.fechaNacimiento ? 
        new Date(cliente.fechaNacimiento).toISOString().split('T')[0] : ''),
      municipioNacimiento: isNew ? '' : cliente.municipioNacimiento || '',
      EstadoNacimiento: isNew ? '' : cliente.EstadoNacimiento || '',
      PaisNacimiento: isNew ? '' : cliente.PaisNacimiento || '',
      idPais: isNew ? '' : cliente.idPais || '',
      idCiudad: isNew ? '' : cliente.idCiudad || ''
    };
  };

  // Efecto para cargar datos cuando el modal se muestra
  useEffect(() => {
    if (mostrar) {
      // Inicializar formulario con datos transformados
      setFormulario(transformarDatosCliente(cliente));
      setErrores({});
      
      // Cargar países si no están en caché
      if (paisesCache.length === 0) {
        cargarPaises();
      } else {
        setPaises(paisesCache);
      }
      
      // Si hay un cliente con país, cargar sus ciudades
      if (cliente?.idPais) {
        cargarCiudadesPorPais(cliente.idPais);
      } else if (formulario.idPais) {
        // Si el formulario ya tiene un país (por ejemplo, al reabrir)
        cargarCiudadesPorPais(formulario.idPais);
      }
    }
  }, [mostrar, cliente]);
  // Función para cargar la lista de países
  const cargarPaises = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No hay token de autenticación');
      
      const res = await axios.get('http://localhost:5000/api/paises', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const paisesNormalizados = res.data.map(pais => ({
        idPais: pais.idPais || pais.idpais,
        nombrePais: pais.nombrePais || pais.nombrepais
      }));
      
      setPaises(paisesNormalizados);
      setPaisesCache(paisesNormalizados); // Guardar en caché
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
      if (!token) throw new Error('No hay token de autenticación');
      
      const res = await axios.get(`http://localhost:5000/api/paises/${idPais}/ciudades`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
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

    // Validaciones específicas
    if (formulario.nombreCliente?.trim().length < 2) {
      nuevosErrores.nombreCliente = 'El nombre debe tener al menos 2 caracteres';
    }

    if (formulario.apellidoPaternoCliente?.trim().length < 2) {
      nuevosErrores.apellidoPaternoCliente = 'El apellido debe tener al menos 2 caracteres';
    }

    const telefonoLimpio = formulario.telefono?.replace(/\D/g, '');
    if (!telefonoLimpio || telefonoLimpio.length < 10) {
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

  // Función para formatear fecha al enviar
  const formatearFechaEnvio = (fecha) => {
    if (!fecha) return null;
    return new Date(fecha).toISOString().split('T')[0];
  };

  // Manejador de envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!window.confirm('¿Está seguro de guardar los cambios?')) {
      return;
    }

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);
    
    try {
      const datosEnvio = {
        nombreCliente: formulario.nombreCliente.trim(),
        apellidoPaternoCliente: formulario.apellidoPaternoCliente.trim(),
        apellidoMaternoCliente: formulario.apellidoMaternoCliente?.trim() || null,
        sexo: formulario.sexo || null,
        edad: formulario.edad ? Number(formulario.edad) : null,
        telefono: formulario.telefono.replace(/\D/g, ''), // Eliminar caracteres no numéricos
        estado_civil: formulario.estado_civil || null,
        identificacionunicanacional: formulario.identificacionunicanacional.trim(),
        Domicilio: formulario.Domicilio || null,
        condicionesEspeciales: formulario.condicionesEspeciales || null,
        fechaNacimiento: formatearFechaEnvio(formulario.fechaNacimiento),
        municipioNacimiento: formulario.municipioNacimiento || null,
        EstadoNacimiento: formulario.EstadoNacimiento || null,
        PaisNacimiento: formulario.PaisNacimiento || null,
        idCiudad: formulario.idCiudad,
        idPais: formulario.idPais
      };

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

      let mensaje = 'Error al guardar cliente';
      if (error.response?.data?.error) {
        mensaje = error.response.data.error;
      } else if (error.message) {
        mensaje = error.message;
      }

      alert(`Error: ${mensaje}`);
    } finally {
      setCargando(false);
    }
  };

  if (!mostrar) return null;

  return (
    <div className="cliente-modal-backdrop">
      <div className="cliente-modal">
      <h2>{cliente && cliente.idCliente ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</h2>
        
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
                  <i className="fa fa-spinner fa-spin"></i> Guardando...
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