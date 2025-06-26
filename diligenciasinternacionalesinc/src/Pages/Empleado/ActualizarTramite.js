import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaSpinner, FaPlus, FaMinus } from 'react-icons/fa';

const EditarTramite = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tipoTramite: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    requisitos: '',
    plazo_estimado: '',
    costo: '',
    clientes: [],
    empleados: []
  });

  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const requisitosPorTramite = {
    'Pasaporte Primera vez': `CURP certificada\nActa de nacimiento actualizada\nCredencial de elector\nComprobante de domicilio`,
    'Pasaporte Renovación': `Pasaporte vencido/vigente\nCURP certificada\nActa de nacimiento\nINE\nComprobante de domicilio\nCOMPARENCIA DE AMBOS PADRES (IDENTIFICACIÓN OFICIAL DE AMBOS), si es que es menor de edad`,
    'Visa Americana': `Acta de Nacimiento\nINE vigente\nPasaporte vigente\nComprobante de domicilio`,
    'FOIA': `Pasaporte y/o identificación oficial\nActa de nacimiento\nComprobante de domicilio`,
    'Grupo AMA Mexico': `Tener la edad de 57 años o más...\nActa de nacimiento\nINE\nPasaporte vigente\nComprobante de domicilio`,
    'Grupo AMA Guatemala': `Tener la edad de 57 años o más...\nCertificado de nacimiento\nDPI\nPasaporte vigente\nComprobante de domicilio`,
    'Apostilla': `Certificado o acta de nacimiento.\nIdentificación oficial con fotografía.`,
    'Visa Canadiense': `Comprobante de domicilio\nPasaporte vigente\nINE vigente\nActa de Nacimiento`,
    'CRBA Registro de hijos nacidos en el extranjero': `COPIAS\nActa de nacimiento del menor...\n(otros requisitos largos...)`,
    'Residencia Americana': `REQUISITOS PARA EL APLICANTE...\nREQUISITOS PARA EL PETICIONARIO...`,
    'Global Entry': `Pasaporte vigente\nIdentificación adicional...\nCuenta CBP (si ya existe)`,
    'SENTRI': `Pasaporte vigente\nIdentificación adicional...\nCuenta CBP (si ya existe)`,
    'Residencia Americana Requisitos': `Residencia estatal...\nBuena conducta moral...\nEdad...\n(otros requisitos...)`
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true);
        const token = localStorage.getItem('authToken');
        
        // Obtener datos en paralelo
        const [tramiteRes, clientesRes, empleadosRes] = await Promise.all([
          axios.get(`/api/tramites/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/clientes', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/empleados', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const tramite = tramiteRes.data;
        
        // Formatear clientes y empleados disponibles
        const clientes = clientesRes.data.map(c => ({
          id: c.idcliente || c.idCliente,
          nombre: `${c.nombrecliente || c.nombreCliente} ${c.apellidopaternocliente || c.apellidoPaternoCliente}`
        }));

        const empleados = empleadosRes.data.map(e => ({
          id: e.idempleado || e.idEmpleado,
          nombre: `${e.nombreempleado || e.nombreEmpleado} ${e.apellidopaternoempleado || e.apellidoPaternoEmpleado}`
        }));

        // Actualizar estados
        setClientesDisponibles(clientes);
        setEmpleadosDisponibles(empleados);

        // Formatear datos del trámite
        setFormData({
          tipoTramite: tramite.tipotramite || '',
          descripcion: tramite.descripcion || '',
          requisitos: tramite.requisitos || '',
          fecha_inicio: tramite.fecha_inicio ? tramite.fecha_inicio.split('T')[0] : '',
          fecha_fin: tramite.fecha_fin ? tramite.fecha_fin.split('T')[0] : '',
          plazo_estimado: tramite.plazo_estimado || '',
          costo: tramite.costo || '',
          clientes: tramite.clientes?.map(c => c.idCliente.toString()) || [],
          empleados: tramite.empleados?.map(e => e.idEmpleado.toString()) || []
        });

      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err.response?.data?.error || 'Error al cargar los datos del trámite');
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (formData.tipoTramite && requisitosPorTramite[formData.tipoTramite] && !formData.requisitos) {
      setFormData(prev => ({
        ...prev,
        requisitos: requisitosPorTramite[formData.tipoTramite]
      }));
    }
  }, [formData.tipoTramite]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (key, index, value) => {
    const updated = [...formData[key]];
    updated[index] = value;
    setFormData(prev => ({ ...prev, [key]: updated }));
  };

  const addItem = (key) => {
    setFormData(prev => ({ ...prev, [key]: [...prev[key], ''] }));
  };

  const removeItem = (key, index) => {
    const updated = [...formData[key]];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, [key]: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.tipoTramite) {
      setError('El tipo de trámite es requerido');
      return;
    }
    if (!formData.plazo_estimado) {
      setError('El plazo estimado es requerido');
      return;
    }
    if (!formData.costo) {
      setError('El costo es requerido');
      return;
    }
    if (formData.clientes.length === 0 || formData.clientes.some(c => !c)) {
      setError('Debe seleccionar al menos un cliente válido');
      return;
    }
    if (formData.empleados.length === 0 || formData.empleados.some(e => !e)) {
      setError('Debe seleccionar al menos un empleado válido');
      return;
    }

    try {
      setGuardando(true);
      const token = localStorage.getItem('authToken');

      const payload = {
        tipoTramite: formData.tipoTramite,
        descripcion: formData.descripcion,
        requisitos: formData.requisitos,
        fecha_inicio: formData.fecha_inicio || null,
        fecha_fin: formData.fecha_fin || null,
        plazo_estimado: formData.plazo_estimado,
        costo: formData.costo,
        clientes: formData.clientes.filter(Boolean).map(Number),
        empleados: formData.empleados.filter(Boolean).map(Number)
      };

      await axios.put(`/api/tramites/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/empleado/tramiteslista');
    } catch (err) {
      console.error('Error al actualizar trámite:', err);
      setError(err.response?.data?.error || 'Error al actualizar el trámite');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="pagina-editar-tramite">
        <h2>Editar Trámite</h2>
        <p>Cargando datos del trámite...</p>
      </div>
    );
  }

  return (
    <div className="pagina-editar-tramite">
      <h2>Editar Trámite</h2>
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="tramite-form">
        <div className="form-group">
          <label>Tipo de Trámite *</label>
          <select 
            name="tipoTramite" 
            value={formData.tipoTramite} 
            onChange={handleChange}
            required
            className="form-control"
          >
            <option value="">Seleccionar tipo</option>
            {Object.keys(requisitosPorTramite).map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea 
            name="descripcion" 
            value={formData.descripcion} 
            onChange={handleChange} 
            rows="3" 
            className="form-control"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Fecha de inicio</label>
            <input 
              type="date" 
              name="fecha_inicio" 
              value={formData.fecha_inicio} 
              onChange={handleChange} 
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Fecha de fin</label>
            <input 
              type="date" 
              name="fecha_fin" 
              value={formData.fecha_fin} 
              onChange={handleChange} 
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Requisitos</label>
          <textarea 
            name="requisitos" 
            value={formData.requisitos} 
            onChange={handleChange} 
            rows="6" 
            className="form-control"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Plazo estimado *</label>
            <input 
              type="text" 
              name="plazo_estimado" 
              value={formData.plazo_estimado} 
              onChange={handleChange} 
              placeholder="Plazo estimado" 
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Costo *</label>
            <input 
              type="text" 
              name="costo" 
              value={formData.costo} 
              onChange={handleChange} 
              placeholder="Costo" 
              required
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Clientes *</label>
          {formData.clientes.map((id, idx) => (
            <div key={`cliente-${idx}`} className="array-input-group">
              <select
                value={id}
                onChange={e => handleArrayChange('clientes', idx, e.target.value)}
                required
                className="form-control"
              >
                <option value="">Seleccionar cliente</option>
                {clientesDisponibles.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <button 
                type="button" 
                onClick={() => removeItem('clientes', idx)} 
                disabled={formData.clientes.length === 1}
                className="btn btn-danger"
              >
                <FaMinus />
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => addItem('clientes')}
            className="btn btn-secondary"
          >
            <FaPlus /> Agregar Cliente
          </button>
        </div>

        <div className="form-group">
          <label>Responsables *</label>
          {formData.empleados.map((id, idx) => (
            <div key={`empleado-${idx}`} className="array-input-group">
              <select
                value={id}
                onChange={e => handleArrayChange('empleados', idx, e.target.value)}
                required
                className="form-control"
              >
                <option value="">Seleccionar empleado</option>
                {empleadosDisponibles.map(e => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
              <button 
                type="button" 
                onClick={() => removeItem('empleados', idx)} 
                disabled={formData.empleados.length === 1}
                className="btn btn-danger"
              >
                <FaMinus />
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => addItem('empleados')}
            className="btn btn-secondary"
          >
            <FaPlus /> Agregar Empleado
          </button>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={guardando}
            className="btn btn-primary"
          >
            {guardando ? (
              <>
                <FaSpinner className="spinner" /> Guardando...
              </>
            ) : (
              <>
                <FaSave /> Guardar Cambios
              </>
            )}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/empleado/tramiteslista')}
            className="btn btn-outline-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarTramite;