import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';

const CrearTramiteModal = ({ mostrar, cerrar, onTramiteCreado }) => {
  const [formData, setFormData] = useState({
    tipoTramite: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    requisitos: '',
    plazo_estimado: '',
    costo: '',
    idCliente: '',
    idEmpleado: '',
    ciudadDestino: ''
  });

  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mostrar) cargarDatosRelacionados();
  }, [mostrar]);

  const cargarDatosRelacionados = async () => {
    try {
      setCargando(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        setCargando(false);
        return;
      }

      const config = { 
        headers: { 
          Authorization: `Bearer ${token}` 
        } 
      };

      // Cargar clientes
      try {
        const clientesRes = await axios.get('http://localhost:5000/api/clientes', config);
        // Asegurarse de que los datos tengan la estructura correcta
        const clientesFormateados = clientesRes.data.map(cliente => ({
          idCliente: cliente.idCliente,
          nombreCliente: cliente.nombreCliente || '',
          apellidoPaternoCliente: cliente.apellidoPaternoCliente || ''
        }));
        setClientes(clientesFormateados);
      } catch (err) {
        console.error('Error al cargar clientes:', err);
        setError(`Error al cargar clientes: ${err.response?.data?.error || err.message}`);
      }

      // Cargar empleados
      try {
        const empleadosRes = await axios.get('http://localhost:5000/api/empleados', config);
        setEmpleados(empleadosRes.data);
      } catch (err) {
        console.error('Error al cargar empleados:', err);
        setError(`Error al cargar empleados: ${err.response?.data?.error || err.message}`);
      }

      setCargando(false);
    } catch (err) {
      console.error('Error general al cargar datos:', err);
      setError('Error general al cargar datos');
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        setCargando(false);
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/tramites',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      onTramiteCreado(response.data);
      cerrar();
    } catch (err) {
      console.error('Error al crear trámite:', err);
      setError(err.response?.data?.error || 'Error al crear trámite');
    } finally {
      setCargando(false);
    }
  };

  if (!mostrar) return null;

  return (
    <div className="duo-modal-overlay">
      <div className="duo-modal">
        <div className="duo-modal-header">
          <h2 className="duo-modal-title">Nuevo Trámite</h2>
          <button className="duo-modal-close" onClick={cerrar}><FaTimes /></button>
        </div>

        {error && <div className="duo-alert duo-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="duo-modal-form">
          <div className="duo-form-group">
            <label className="duo-form-label">Tipo de Trámite *</label>
            <select
              name="tipoTramite"
              value={formData.tipoTramite}
              onChange={handleChange}
              className="duo-form-select"
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="Pasaporte">Pasaporte</option>
              <option value="Visa Americana">Visa Americana</option>
              <option value="Visa Canadiense">Visa Canadiense</option>
              <option value="Grupo AMA Mexico">Grupo AMA Mexico</option>
              <option value="Grupo AMA Guatemala">Grupo AMA Guatemala</option>
            </select>
          </div>

          <div className="duo-form-group">
            <label className="duo-form-label">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="duo-form-textarea"
              rows="3"
            />
          </div>

          <div className="duo-form-row">
            <div className="duo-form-group">
              <label className="duo-form-label">Fecha Inicio</label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                className="duo-form-input"
              />
            </div>

            <div className="duo-form-group">
              <label className="duo-form-label">Fecha Fin</label>
              <input
                type="date"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                className="duo-form-input"
              />
            </div>
          </div>

          <div className="duo-form-row">
            <div className="duo-form-group">
              <label className="duo-form-label">Requisitos</label>
              <input
                type="text"
                name="requisitos"
                value={formData.requisitos}
                onChange={handleChange}
                className="duo-form-input"
              />
            </div>

            <div className="duo-form-group">
              <label className="duo-form-label">Plazo Estimado</label>
              <input
                type="text"
                name="plazo_estimado"
                value={formData.plazo_estimado}
                onChange={handleChange}
                className="duo-form-input"
              />
            </div>
          </div>

          <div className="duo-form-group">
            <label className="duo-form-label">Costo</label>
            <input
              type="text"
              name="costo"
              value={formData.costo}
              onChange={handleChange}
              className="duo-form-input"
            />
          </div>

          <div className="duo-form-row">
            <div className="duo-form-group">
              <label className="duo-form-label">Cliente</label>
              <select
                name="idCliente"
                value={formData.idCliente}
                onChange={handleChange}
                className="duo-form-select"
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.idCliente} value={cliente.idCliente}>
                    {cliente.nombreCliente} {cliente.apellidoPaternoCliente}
                  </option>
                ))}
              </select>
            </div>

            <div className="duo-form-group">
              <label className="duo-form-label">Empleado Responsable</label>
              <select
                name="idEmpleado"
                value={formData.idEmpleado}
                onChange={handleChange}
                className="duo-form-select"
              >
                <option value="">Seleccionar empleado</option>
                {empleados.map(empleado => (
                  <option key={empleado.idEmpleado} value={empleado.idEmpleado}>
                    {empleado.nombreEmpleado} {empleado.apellidoPaternoEmpleado}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="duo-form-group">
            <label className="duo-form-label">Ciudad Destino</label>
            <input
              type="text"
              name="ciudadDestino"
              value={formData.ciudadDestino}
              onChange={handleChange}
              className="duo-form-input"
              placeholder="Ingrese la ciudad destino"
            />
          </div>

          <div className="duo-modal-footer">
            <button type="button" className="duo-btn duo-btn-secondary" onClick={cerrar} disabled={cargando}>
              Cancelar
            </button>
            <button type="submit" className="duo-btn duo-btn-primary" disabled={cargando}>
              {cargando ? (
                <>
                  <FaSpinner className="duo-spinner" />
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="duo-btn-icon" />
                  Guardar Trámite
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearTramiteModal;