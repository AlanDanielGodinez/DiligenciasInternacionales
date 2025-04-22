import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClienteModal = ({ mostrar, cliente, cerrar, onGuardar }) => {

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
    idCiudad: '',
    idPais: '',
  });

  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [mostrarNuevoPais, setMostrarNuevoPais] = useState(false);
  const [nuevoPais, setNuevoPais] = useState('');
  const [mostrarNuevaCiudad, setMostrarNuevaCiudad] = useState(false);
  const [nuevaCiudad, setNuevaCiudad] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/paises')
      .then(res => setPaises(res.data))
      .catch(err => console.error('Error cargando países', err));

    axios.get('http://localhost:5000/api/ciudades')
      .then(res => setCiudades(res.data))
      .catch(err => console.error('Error cargando ciudades', err));
  }, []);

  useEffect(() => {
    if (cliente && Object.keys(cliente).length > 0) {
      setFormulario(cliente);
    } else {
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
        idCiudad: '',
        idPais: '',
      });
    }
  }, [cliente]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const agregarPais = () => {
    axios.post('http://localhost:5000/api/paises', { nombrePais: nuevoPais })
      .then(res => {
        setPaises(prev => [...prev, res.data]);
        setFormulario(prev => ({ ...prev, idPais: res.data.idPais }));
        setNuevoPais('');
        setMostrarNuevoPais(false);
      });
  };

  const agregarCiudad = () => {
    axios.post('http://localhost:5000/api/ciudades', { nombreCiudad: nuevaCiudad })
      .then(res => {
        setCiudades(prev => [...prev, res.data]);
        setFormulario(prev => ({ ...prev, idCiudad: res.data.idCiudad }));
        setNuevaCiudad('');
        setMostrarNuevaCiudad(false);
      });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onGuardar(formulario);
  };

  // 👉 Ahora el renderizado condicional va aquí
  if (!mostrar) return null;

  return (
    <div className="cliente-modal-backdrop">
      <div className="cliente-modal">
        <h2>{cliente?.idCliente ? 'Editar Cliente' : 'Agregar Cliente'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid-form">
            <input type="text" name="nombreCliente" placeholder="Nombre" value={formulario.nombreCliente} onChange={handleChange} required />
            <input type="text" name="apellidoPaternoCliente" placeholder="Apellido Paterno" value={formulario.apellidoPaternoCliente} onChange={handleChange} required />
            <input type="text" name="apellidoMaternoCliente" placeholder="Apellido Materno" value={formulario.apellidoMaternoCliente} onChange={handleChange} required />
            <input type="text" name="sexo" placeholder="Sexo" value={formulario.sexo} onChange={handleChange} />
            <input type="number" name="edad" placeholder="Edad" value={formulario.edad} onChange={handleChange} />
            <input type="text" name="telefono" placeholder="Teléfono" value={formulario.telefono} onChange={handleChange} />
            <input type="text" name="estado_civil" placeholder="Estado Civil" value={formulario.estado_civil} onChange={handleChange} />
            <input type="text" name="identificacionunicanacional" placeholder="Identificación Nacional" value={formulario.identificacionunicanacional} onChange={handleChange} />
            <input type="text" name="Domicilio" placeholder="Domicilio" value={formulario.Domicilio} onChange={handleChange} />
            <input type="text" name="condicionesEspeciales" placeholder="Condiciones Especiales" value={formulario.condicionesEspeciales} onChange={handleChange} />
            <input type="date" name="fechaNacimiento" value={formulario.fechaNacimiento} onChange={handleChange} />
            <input type="text" name="municipioNacimiento" placeholder="Municipio de Nacimiento" value={formulario.municipioNacimiento} onChange={handleChange} />
            <input type="text" name="EstadoNacimiento" placeholder="Estado de Nacimiento" value={formulario.EstadoNacimiento} onChange={handleChange} />
            <input type="text" name="PaisNacimiento" placeholder="País de Nacimiento" value={formulario.PaisNacimiento} onChange={handleChange} />

            <div className="combo-container">
              <select name="idPais" value={formulario.idPais} onChange={handleChange}>
                <option value="">Seleccionar País</option>
                {paises.map(p => <option key={p.idPais} value={p.idPais}>{p.nombrePais}</option>)}
              </select>
              <button type="button" onClick={() => setMostrarNuevoPais(!mostrarNuevoPais)}>+</button>
            </div>
            {mostrarNuevoPais && (
              <div className="mini-form">
                <input type="text" value={nuevoPais} onChange={e => setNuevoPais(e.target.value)} placeholder="Nuevo país" />
                <button type="button" onClick={agregarPais}>Guardar</button>
              </div>
            )}

            <div className="combo-container">
              <select name="idCiudad" value={formulario.idCiudad} onChange={handleChange}>
                <option value="">Seleccionar Ciudad</option>
                {ciudades.map(c => <option key={c.idCiudad} value={c.idCiudad}>{c.nombreCiudad}</option>)}
              </select>
              <button type="button" onClick={() => setMostrarNuevaCiudad(!mostrarNuevaCiudad)}>+</button>
            </div>
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

export default ClienteModal;
