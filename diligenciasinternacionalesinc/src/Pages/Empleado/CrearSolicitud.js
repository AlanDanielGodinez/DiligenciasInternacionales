// src/components/CrearSolicitud.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CrearSolicitud = () => {
  const [tramites, setTramites] = useState([]);
  const [tramiteSeleccionadoId, setTramiteSeleccionadoId] = useState('');
  const [clientesDelTramite, setClientesDelTramite] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [fechaSolicitud, setFechaSolicitud] = useState('');
  const [estadoActual, setEstadoActual] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [mensaje, setMensaje] = useState('');

  const estados = [
    "Iniciado",
    "En espera de documentos",
    "Documentos entregados",
    "En espera de anticipo pago",
    "Anticipo realizado",
    "Pendiente de perfil de aplicación",
    "Falta de información",
    "En espera de pago",
    "Pago completado",
    "En proceso llenado de formulario DS-160",
    "Pendiente de pago de derecho a visa",
    "Cita programada",
    "Confirmación de datos",
    "Capacitación realizada",
    "Documentos entregados",
    "Finalizado"
  ];

  useEffect(() => {
    const fetchTramitesYEmpleados = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const [tramitesRes, empleadosRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tramites', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/empleados', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const tramitesActivos = tramitesRes.data
          .filter(t => !t.fecha_fin)
          .map(t => ({
            id: t.idTramite || t.idtramite,
            nombre: t.tipotramite,
            clientes: t.clientes || []
          }));

        const empleadosList = empleadosRes.data.map(e => ({
          id: e.idEmpleado || e.idempleado,
          nombre: `${e.nombreEmpleado || e.nombreempleado} ${e.apellidoPaternoEmpleado || e.apellidopaternoempleado}`
        }));

        setTramites(tramitesActivos);
        setEmpleados(empleadosList);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    fetchTramitesYEmpleados();
  }, []);

  const handleTramiteSeleccionado = (idSeleccionado) => {
    setTramiteSeleccionadoId(idSeleccionado);
    const tramite = tramites.find(t => t.id.toString() === idSeleccionado);
    if (tramite?.clientes) {
      setClientesDelTramite(tramite.clientes);
    } else {
      setClientesDelTramite([]);
    }
  };

  const handleAgregarSolicitud = async () => {
    setMensaje('');
    if (!tramiteSeleccionadoId || !empleadoSeleccionado || !fechaSolicitud || !estadoActual || clientesDelTramite.length === 0) {
      setMensaje('Por favor completa todos los campos requeridos.');
      return;
    }

    const idCliente = clientesDelTramite[0]?.idCliente || clientesDelTramite[0]?.idcliente || clientesDelTramite[0]?.id;
    const payload = {
      idCliente,
      idTramite: tramiteSeleccionadoId,
      idEmpleado: empleadoSeleccionado,
      fechaSolicitud,
      estado_actual: estadoActual
    };

    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post('http://localhost:5000/api/solicitudes', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMensaje('Solicitud creada correctamente ✅');
      console.log('Solicitud creada:', res.data);

      // Limpiar formulario
      setTramiteSeleccionadoId('');
      setClientesDelTramite([]);
      setEmpleadoSeleccionado('');
      setFechaSolicitud('');
      setEstadoActual('');
      setObservaciones('');
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      setMensaje(error.response?.data?.error || 'Error al crear solicitud');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Crear nueva solicitud</h2>

      <div style={styles.formGroup}>
        <label htmlFor="tramite">Seleccionar trámite activo:</label>
        <select
          id="tramite"
          value={tramiteSeleccionadoId}
          onChange={(e) => handleTramiteSeleccionado(e.target.value)}
          style={styles.select}
        >
          <option value="">-- Selecciona un trámite --</option>
          {tramites.map((tramite) => (
            <option key={tramite.id} value={tramite.id}>
              {tramite.nombre}
            </option>
          ))}
        </select>
      </div>

      {clientesDelTramite.length > 0 && (
        <div style={styles.clientesBox}>
          <h3>Clientes asociados:</h3>
          <ul style={styles.lista}>
            {clientesDelTramite.map((cliente, idx) => (
              <li key={idx}>
                {cliente.nombre || cliente.nombrecliente || cliente.nombreCliente || 'Cliente sin nombre'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={styles.formGroup}>
        <label htmlFor="empleado">Seleccionar empleado responsable:</label>
        <select
          id="empleado"
          value={empleadoSeleccionado}
          onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
          style={styles.select}
        >
          <option value="">-- Selecciona un empleado --</option>
          {empleados.map((empleado) => (
            <option key={empleado.id} value={empleado.id}>
              {empleado.nombre}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="fecha">Fecha de solicitud:</label>
        <input
          type="date"
          id="fecha"
          value={fechaSolicitud}
          onChange={(e) => setFechaSolicitud(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="estado">Estado actual:</label>
        <select
          id="estado"
          value={estadoActual}
          onChange={(e) => setEstadoActual(e.target.value)}
          style={styles.select}
        >
          <option value="">-- Selecciona un estado --</option>
          {estados.map((estado, index) => (
            <option key={index} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="observaciones">Observaciones:</label>
        <textarea
          id="observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={4}
          style={styles.textarea}
          placeholder="Escribe aquí cualquier comentario adicional..."
        />
      </div>

      <div style={styles.formGroup}>
        <button onClick={handleAgregarSolicitud} style={styles.button}>
          Agregar Solicitud
        </button>
      </div>

      {mensaje && (
        <div style={{ marginTop: '1rem', color: mensaje.includes('✅') ? 'green' : 'red' }}>
          {mensaje}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  title: {
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '1.5rem',
  },
  select: {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  input: {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  clientesBox: {
    marginTop: '2rem',
    backgroundColor: '#ffffff',
    padding: '1rem',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
  },
  lista: {
    listStyleType: 'disc',
    paddingLeft: '1.5rem',
    marginTop: '0.5rem',
  },
  textarea: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    resize: 'vertical',
    fontFamily: 'inherit',
    fontSize: '1rem',
  },
  button: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#2c3e50',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
  }
};

export default CrearSolicitud;
