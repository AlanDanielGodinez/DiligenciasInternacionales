import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ModalCliente = ({ mostrar, cerrar, cliente = {}, guardarCliente }) => {
  const [formulario, setFormulario] = useState({});
  const [errores, setErrores] = useState({});
  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [mostrarNuevoPais, setMostrarNuevoPais] = useState(false);
  const [mostrarNuevaCiudad, setMostrarNuevaCiudad] = useState(false);
  const [nuevoPais, setNuevoPais] = useState('');
  const [nuevaCiudad, setNuevaCiudad] = useState('');

  useEffect(() => {
    if (mostrar) {
      setFormulario(cliente || {});
      setErrores({});
      cargarPaises();
      cargarCiudades();
    }
  }, [mostrar, cliente]);

  const cargarPaises = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/paises');
      setPaises(res.data);
    } catch (err) {
      console.error('Error cargando países:', err);
    }
  };

  const cargarCiudades = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/ciudades');
      setCiudades(res.data);
    } catch (err) {
      console.error('Error cargando ciudades:', err);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const agregarPais = async () => {
    if (!nuevoPais.trim()) return;
    try {
      const res = await axios.post('http://localhost:5000/api/paises', { nombrePais: nuevoPais });
      setPaises(prev => [...prev, res.data]);
      setFormulario(prev => ({ ...prev, idPais: res.data.idPais }));
      setNuevoPais('');
      setMostrarNuevoPais(false);
    } catch (err) {
      console.error('Error al agregar país:', err);
    }
  };

  const agregarCiudad = async () => {
    if (!nuevaCiudad.trim()) return;
    try {
      const res = await axios.post('http://localhost:5000/api/ciudades', { nombreCiudad: nuevaCiudad });
      setCiudades(prev => [...prev, res.data]);
      setFormulario(prev => ({ ...prev, idCiudad: res.data.idCiudad }));
      setNuevaCiudad('');
      setMostrarNuevaCiudad(false);
    } catch (err) {
      console.error('Error al agregar ciudad:', err);
    }
  };

  // 👀 VALIDACIÓN GENERAL
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formulario.nombreCliente?.trim() || formulario.nombreCliente.length < 2) {
      nuevosErrores.nombreCliente = 'El nombre es obligatorio (mínimo 2 letras)';
    }
    if (!formulario.apellidoPaternoCliente?.trim() || formulario.apellidoPaternoCliente.length < 2) {
      nuevosErrores.apellidoPaternoCliente = 'El apellido paterno es obligatorio';
    }
    if (!formulario.identificacionunicanacional?.trim() || formulario.identificacionunicanacional.length < 6) {
      nuevosErrores.identificacionunicanacional = 'La identificación debe tener al menos 6 caracteres';
    }
    if (!formulario.telefono?.match(/^\d{10,}$/)) {
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
            <input type="text" name="nombreCliente" placeholder="Nombre" value={formulario.nombreCliente || ''} onChange={handleChange} />
            {errores.nombreCliente && <span className="error">{errores.nombreCliente}</span>}

            <input type="text" name="apellidoPaternoCliente" placeholder="Apellido Paterno" value={formulario.apellidoPaternoCliente || ''} onChange={handleChange} />
            {errores.apellidoPaternoCliente && <span className="error">{errores.apellidoPaternoCliente}</span>}

            <input type="text" name="apellidoMaternoCliente" placeholder="Apellido Materno" value={formulario.apellidoMaternoCliente || ''} onChange={handleChange} />
            <input type="text" name="sexo" placeholder="Sexo" value={formulario.sexo || ''} onChange={handleChange} />
            <input type="number" name="edad" placeholder="Edad" value={formulario.edad || ''} onChange={handleChange} />
            {errores.edad && <span className="error">{errores.edad}</span>}

            <input type="text" name="telefono" placeholder="Teléfono" value={formulario.telefono || ''} onChange={handleChange} />
            {errores.telefono && <span className="error">{errores.telefono}</span>}

            <input type="text" name="estado_civil" placeholder="Estado Civil" value={formulario.estado_civil || ''} onChange={handleChange} />
            <input type="text" name="identificacionunicanacional" placeholder="Identificación Nacional" value={formulario.identificacionunicanacional || ''} onChange={handleChange} />
            {errores.identificacionunicanacional && <span className="error">{errores.identificacionunicanacional}</span>}

            <input type="text" name="Domicilio" placeholder="Domicilio" value={formulario.Domicilio || ''} onChange={handleChange} />
            <input type="text" name="condicionesEspeciales" placeholder="Condiciones Especiales" value={formulario.condicionesEspeciales || ''} onChange={handleChange} />
            <input type="date" name="fechaNacimiento" value={formulario.fechaNacimiento || ''} onChange={handleChange} />
            {errores.fechaNacimiento && <span className="error">{errores.fechaNacimiento}</span>}

            <input type="text" name="municipioNacimiento" placeholder="Municipio de Nacimiento" value={formulario.municipioNacimiento || ''} onChange={handleChange} />
            <input type="text" name="EstadoNacimiento" placeholder="Estado de Nacimiento" value={formulario.EstadoNacimiento || ''} onChange={handleChange} />
            <input type="text" name="PaisNacimiento" placeholder="País de Nacimiento" value={formulario.PaisNacimiento || ''} onChange={handleChange} />

            <div className="combo-container">
              <select name="idPais" value={formulario.idPais || ''} onChange={handleChange}>
                <option value="">Seleccionar País</option>
                {paises.map(p => <option key={p.idPais} value={p.idPais}>{p.nombrePais}</option>)}
              </select>
              <button type="button" onClick={() => setMostrarNuevoPais(!mostrarNuevoPais)}>+</button>
            </div>
            {errores.idPais && <span className="error">{errores.idPais}</span>}
            {mostrarNuevoPais && (
              <div className="mini-form">
                <input type="text" value={nuevoPais} onChange={e => setNuevoPais(e.target.value)} placeholder="Nuevo país" />
                <button type="button" onClick={agregarPais}>Guardar</button>
              </div>
            )}

            <div className="combo-container">
              <select name="idCiudad" value={formulario.idCiudad || ''} onChange={handleChange}>
                <option value="">Seleccionar Ciudad</option>
                {ciudades.map(c => <option key={c.idCiudad} value={c.idCiudad}>{c.nombreCiudad}</option>)}
              </select>
              <button type="button" onClick={() => setMostrarNuevaCiudad(!mostrarNuevaCiudad)}>+</button>
            </div>
            {errores.idCiudad && <span className="error">{errores.idCiudad}</span>}
            {mostrarNuevaCiudad && (
              <div className="mini-form">
                <input type="text" value={nuevaCiudad} onChange={e => setNuevaCiudad(e.target.value)} placeholder="Nueva ciudad" />
                <button type="button" onClick={agregarCiudad}>Guardar</button>
              </div>
            )}
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
