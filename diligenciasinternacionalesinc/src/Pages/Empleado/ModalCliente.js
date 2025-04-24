import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ModalCliente = ({ mostrar, cerrar, cliente = {}, guardarCliente }) => {
  const [formulario, setFormulario] = useState({});
  const [errores, setErrores] = useState({});
  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  useEffect(() => {
    if (mostrar) {
      setFormulario(cliente || {});
      setErrores({});
      cargarPaises();
    }
  }, [mostrar, cliente]);

  const cargarPaises = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/paises', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setPaises(res.data);
    } catch (err) {
      console.error('Error cargando países:', err);
    }
  };

  const cargarCiudadesPorPais = async (idPais) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/paises/${idPais}/ciudades`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setCiudades(res.data);
    } catch (err) {
      console.error('Error cargando ciudades:', err);
      setCiudades([]);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));

    if (name === 'idPais') {
      cargarCiudadesPorPais(value);
      setFormulario(prev => ({ ...prev, idCiudad: '' }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validaciones básicas
    if (!formulario.nombreCliente?.trim() || formulario.nombreCliente.length < 2) {
      nuevosErrores.nombreCliente = 'El nombre es obligatorio (mínimo 2 letras)';
    }
    if (!formulario.apellidoPaternoCliente?.trim() || formulario.apellidoPaternoCliente.length < 2) {
      nuevosErrores.apellidoPaternoCliente = 'El apellido paterno es obligatorio';
    }
    if (!formulario.telefono?.match(/^[0-9]{10,}$/)) {
      nuevosErrores.telefono = 'El teléfono debe tener al menos 10 dígitos numéricos';
    }
    if (formulario.edad && (formulario.edad < 0 || formulario.edad > 120)) {
      nuevosErrores.edad = 'Edad inválida';
    }
    if (formulario.fechaNacimiento && new Date(formulario.fechaNacimiento) > new Date()) {
      nuevosErrores.fechaNacimiento = 'La fecha no puede ser futura';
    }
    if (!formulario.idPais) {
      nuevosErrores.idPais = 'Debes seleccionar un país';
    }
    if (!formulario.idCiudad) {
      nuevosErrores.idCiudad = 'Debes seleccionar una ciudad';
    }

    // Validar identificación según el país de nacimiento
    const identificacion = formulario.identificacionunicanacional?.trim() || '';
    const paisNacimiento = formulario.PaisNacimiento?.toLowerCase() || '';
    if (!identificacion) {
      nuevosErrores.identificacionunicanacional = 'La identificación es obligatoria';
    } else {
      const len = identificacion.length;
      if (paisNacimiento.includes('mexico') && len !== 13) {
        nuevosErrores.identificacionunicanacional = 'La CURP debe tener 13 caracteres';
      } else if (
        ['el salvador', 'guatemala', 'honduras'].some(p => paisNacimiento.includes(p)) &&
        len < 6
      ) {
        nuevosErrores.identificacionunicanacional = 'La identificación debe tener mínimo 6 caracteres';
      } else if (paisNacimiento.includes('estados unidos') && len < 9) {
        nuevosErrores.identificacionunicanacional = 'El SSN debe tener mínimo 9 caracteres';
      } else if (len < 6) {
        nuevosErrores.identificacionunicanacional = 'Identificación demasiado corta';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validarFormulario()) {
      guardarCliente(formulario);
    }
  };

  if (!mostrar) return null;

  return (
    <div className="cliente-modal-backdrop">
      <div className="cliente-modal">
        <h2>Agregar / Editar Cliente</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid-form">
            {/* Sección: Datos Personales */}
            <h3>Datos Personales</h3>
            <input type="text" name="nombreCliente" placeholder="Nombre" value={formulario.nombreCliente || ''} onChange={handleChange} />
            {errores.nombreCliente && <span className="error">{errores.nombreCliente}</span>}

            <input type="text" name="apellidoPaternoCliente" placeholder="Apellido Paterno" value={formulario.apellidoPaternoCliente || ''} onChange={handleChange} />
            {errores.apellidoPaternoCliente && <span className="error">{errores.apellidoPaternoCliente}</span>}

            <input type="text" name="apellidoMaternoCliente" placeholder="Apellido Materno" value={formulario.apellidoMaternoCliente || ''} onChange={handleChange} />

            <input type="number" name="edad" placeholder="Edad" value={formulario.edad || ''} onChange={handleChange} />
            {errores.edad && <span className="error">{errores.edad}</span>}

            <input type="text" name="sexo" placeholder="Sexo" value={formulario.sexo || ''} onChange={handleChange} />
            <input type="text" name="estado_civil" placeholder="Estado Civil" value={formulario.estado_civil || ''} onChange={handleChange} />
            <input type="text" name="condicionesEspeciales" placeholder="Condiciones Especiales" value={formulario.condicionesEspeciales || ''} onChange={handleChange} />

            {/* Sección: Datos de Nacimiento */}
            <h3>Datos de Nacimiento</h3>
            <input type="date" name="fechaNacimiento" value={formulario.fechaNacimiento || ''} onChange={handleChange} />
            {errores.fechaNacimiento && <span className="error">{errores.fechaNacimiento}</span>}

            <input type="text" name="municipioNacimiento" placeholder="Municipio de Nacimiento" value={formulario.municipioNacimiento || ''} onChange={handleChange} />
            <input type="text" name="EstadoNacimiento" placeholder="Estado de Nacimiento" value={formulario.EstadoNacimiento || ''} onChange={handleChange} />
            <input type="text" name="PaisNacimiento" placeholder="País de Nacimiento" value={formulario.PaisNacimiento || ''} onChange={handleChange} />

            {/* Sección: Ubicación Actual */}
            <h3>Ubicación Actual</h3>
            <select name="idPais" value={formulario.idPais || ''} onChange={handleChange}>
              <option value="">Seleccionar País</option>
              {paises.map(p => (
                <option key={p.idPais || p.idpais} value={p.idPais || p.idpais}>
                  {p.nombrePais || p.nombrepais}
                </option>
              ))}
            </select>
            {errores.idPais && <span className="error">{errores.idPais}</span>}

            <select name="idCiudad" value={formulario.idCiudad || ''} onChange={handleChange}>
              <option value="">Seleccionar Ciudad</option>
              {ciudades.map(c => (
                <option key={c.idCiudad || c.idciudad} value={c.idCiudad || c.idciudad}>
                  {c.nombreCiudad || c.nombreciudad}
                </option>
              ))}
            </select>
            {errores.idCiudad && <span className="error">{errores.idCiudad}</span>}

            <input type="text" name="Domicilio" placeholder="Domicilio" value={formulario.Domicilio || ''} onChange={handleChange} />

            <input type="text" name="identificacionunicanacional" placeholder="Identificación Nacional" value={formulario.identificacionunicanacional || ''} onChange={handleChange} />
            {errores.identificacionunicanacional && <span className="error">{errores.identificacionunicanacional}</span>}
          </div>

          <div className="acciones-modal">
            <button type="submit" className="btn-guardar">Guardar</button>
            <button type="button" onClick={cerrar} className="btn-cancelar">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCliente;
