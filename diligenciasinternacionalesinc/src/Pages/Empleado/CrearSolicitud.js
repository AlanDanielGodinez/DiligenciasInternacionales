import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CrearCliente from './CrearCliente';
import CrearTramite from './NuevoTramite';
import SeleccionarTramiteModal from './SeleccionarTramiteModal';


const CrearSolicitud = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [selectedClientes, setSelectedClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Para el modal de trámite
  const [showCreateModal, setShowCreateModal] = useState(false);
const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);

  const [showTramiteModal, setShowTramiteModal] = useState(false);

  const [tramiteCreado, setTramiteCreado] = useState(null);
  const [estadoSolicitud, setEstadoSolicitud] = useState('Iniciado');
  const [fechaSolicitud, setFechaSolicitud] = useState(new Date().toISOString().slice(0, 10));
  const [observaciones, setObservaciones] = useState('');
  const [showSeleccionarTramiteModal, setShowSeleccionarTramiteModal] = useState(false);



  // Obtener lista de clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/clientes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Asegurarnos de que los datos tengan la estructura correcta
        const formattedClientes = response.data.map(cliente => ({
          idCliente: cliente.idCliente || cliente.idcliente,
          nombreCliente: cliente.nombreCliente || cliente.nombrecliente,
          apellidoPaternoCliente: cliente.apellidoPaternoCliente || cliente.apellidopaternocliente,
          apellidoMaternoCliente: cliente.apellidoMaternoCliente || cliente.apellidomaternocliente,
          telefono: cliente.telefono,
          identificacionunicanacional: cliente.identificacionunicanacional
        }));
        
        setClientes(formattedClientes);
        setIsLoading(false);
      } catch (err) {
        console.error('Error al obtener clientes:', err);
        setError('Error al cargar clientes. Intente nuevamente.');
        setIsLoading(false);
      }
    };
    fetchClientes();

    const token = localStorage.getItem('authToken');
    axios.get('http://localhost:5000/api/empleados/coordinadores', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setEmpleadosDisponibles(res.data))
  .catch(err => console.error('Error al obtener empleados:', err));
  }, []);

  // Manejar selección/deselección de clientes
  const toggleClienteSelection = (cliente) => {
    setSelectedClientes(prev => {
      // Usar el ID correcto (idCliente o idcliente)
      const clienteId = cliente.idCliente || cliente.idcliente;
      const isSelected = prev.some(c => (c.idCliente || c.idcliente) === clienteId);
      
      if (isSelected) {
        return prev.filter(c => (c.idCliente || c.idcliente) !== clienteId);
      } else {
        return [...prev, cliente];
      }
    });
  };

  // Manejar creación de nuevo cliente
  const handleClienteCreado = (nuevoCliente) => {
    setClientes(prev => [...prev, nuevoCliente]);
    setSelectedClientes(prev => [...prev, nuevoCliente]);
    setShowCreateModal(false);
  };

  // Filtrar clientes basado en el término de búsqueda
  const filteredClientes = clientes.filter(cliente => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Acceder a las propiedades con ambos formatos (camelCase y snake_case)
    const nombre = (cliente.nombreCliente || cliente.nombrecliente || '').toLowerCase();
    const apellidoP = (cliente.apellidoPaternoCliente || cliente.apellidopaternocliente || '').toLowerCase();
    const apellidoM = (cliente.apellidoMaternoCliente || cliente.apellidomaternocliente || '').toLowerCase();
    const identificacion = (cliente.identificacionunicanacional || '').toLowerCase();
    
    return (
      nombre.includes(searchLower) ||
      apellidoP.includes(searchLower) ||
      apellidoM.includes(searchLower) ||
      identificacion.includes(searchLower)
    );
  });

  // Ir al siguiente paso (selección de trámite)
  const handleNextStep = () => {
  if (selectedClientes.length === 0) {
    alert('Debe seleccionar al menos un cliente');
    return;
  }

  localStorage.setItem('solicitudClientes', JSON.stringify(selectedClientes));
  setShowTramiteModal(true);
};

  if (isLoading) {
    return (
      <div className="crear-solicitud-container">
        <div className="loading-spinner"></div>
        <p>Cargando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="crear-solicitud-container">
        <div className="error-message">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-reload"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="crear-solicitud-container">
      <h1 className="crear-solicitud-title">Crear solicitud - Clientes</h1>
      
      <div className="crear-solicitud-header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <i className="search-icon">🔍</i>
        </div>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-create-client"
        >
          + Crear Cliente
        </button>
      </div>

      <div className="selected-clients-info">
        {selectedClientes.length > 0 ? (
          <p>
            {selectedClientes.length} cliente(s) seleccionado(s):{' '}
            {selectedClientes.map(c => (c.nombreCliente || c.nombrecliente || 'Cliente sin nombre')).join(', ')}
          </p>
        ) : (
          <p>No hay clientes seleccionados</p>
        )}
      </div>

      <div className="clientes-grid">
        {filteredClientes.length > 0 ? (
          filteredClientes.map(cliente => {
            // Obtener el ID del cliente (manejar ambos formatos)
            const clienteId = cliente.idCliente || cliente.idcliente;
            // Verificar si está seleccionado
            const isSelected = selectedClientes.some(c => (c.idCliente || c.idcliente) === clienteId);
            
            return (
              <div 
                key={clienteId}
                className={`cliente-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleClienteSelection(cliente)}
              >
                <div className="cliente-card-header">
                  <h3>
                    {(cliente.nombreCliente || cliente.nombrecliente || 'Nombre no disponible')} {(cliente.apellidoPaternoCliente || cliente.apellidopaternocliente || '')}
                  </h3>
                  {isSelected && <span className="selected-check">✓</span>}
                </div>
                
                <div className="cliente-card-body">
                  <p><strong>Identificación:</strong> {cliente.identificacionunicanacional || 'No disponible'}</p>
                  <p><strong>Teléfono:</strong> {cliente.telefono || 'No disponible'}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-results">
            {searchTerm ? (
              <p>No se encontraron clientes que coincidan con "{searchTerm}"</p>
            ) : (
              <p>No hay clientes registrados</p>
            )}
          </div>
        )}
      </div>

      <div className="crear-solicitud-footer">
        <button 
          onClick={() => navigate('/solicitudes')}
          className="btn-cancel"
        >
          Cancelar
        </button>

        {/* BOTÓN: CREAR NUEVO TRÁMITE */}
        <button 
          onClick={() => {
            if (selectedClientes.length === 0) {
              alert('Debe seleccionar al menos un cliente');
              return;
            }
            localStorage.setItem('solicitudClientes', JSON.stringify(selectedClientes));
            setShowTramiteModal(true);
          }}
          className={`btn-next ${selectedClientes.length === 0 ? 'disabled' : ''}`}
          disabled={selectedClientes.length === 0}
        >
          Crear Trámite
        </button>

        {/* BOTÓN: SELECCIONAR TRÁMITE EXISTENTE */}
        <button
          onClick={() => {
            if (selectedClientes.length === 0) {
              alert('Debe seleccionar al menos un cliente');
              return;
            }
            // Abrirá modal para seleccionar trámite (esto lo implementaremos en el paso B)
            setShowSeleccionarTramiteModal(true);
          }}
          className={`btn-next btn-secondary ${selectedClientes.length === 0 ? 'disabled' : ''}`}
          disabled={selectedClientes.length === 0}
        >
          Seleccionar Trámite
        </button>
      </div>
      



            {showCreateModal && (
        <div className="modal">
          <div className="modal-content modal-content-crear-cliente">
            <CrearCliente
              mostrar={showCreateModal}
              onClienteCreado={handleClienteCreado}
              cerrar={() => setShowCreateModal(false)} // ✅ ahora sí coinciden los nombres
            />

          </div>
        </div>
      )}

     

      {showTramiteModal && (
        <CrearTramite
          mostrar={showTramiteModal}
          cerrar={() => setShowTramiteModal(false)}
          clientesSeleccionados={selectedClientes}
          onTramiteCreado={(nuevoTramite) => {
            setTramiteCreado(nuevoTramite);
            setShowTramiteModal(false);
          }}
        />
      )}

      {showSeleccionarTramiteModal && (
        <SeleccionarTramiteModal
          isOpen={showSeleccionarTramiteModal}
          onClose={() => setShowSeleccionarTramiteModal(false)}
          clientesSeleccionados={selectedClientes}
          onTramiteActualizado={(idTramite) => {
            // aquí podrías hacer un GET para traer los detalles del trámite completo
            setTramiteCreado({ idTramite });
            setShowSeleccionarTramiteModal(false);
          }}
        />

      )}



      {tramiteCreado && (
      <div className="tramite-creado-info">
        <h2>Trámite creado correctamente</h2>
        <p><strong>Tipo:</strong> {tramiteCreado.tipo_tramite || tramiteCreado.tipoTramite}</p>
        <p><strong>Descripción:</strong> {tramiteCreado.descripcion}</p>
        <p><strong>Fechas:</strong> {tramiteCreado.fecha_inicio} - {tramiteCreado.fecha_fin}</p>
        <p><strong>Plazo estimado:</strong> {tramiteCreado.plazo_estimado} días</p>
        <p><strong>Costo:</strong> ${tramiteCreado.costo}</p>

        <h3>Clientes vinculados</h3>
        <ul>
          {selectedClientes.map(cliente => (
            <li key={cliente.idCliente}>
              ✅ {cliente.nombreCliente} {cliente.apellidoPaternoCliente}
            </li>
          ))}
        </ul>

        <h3>Finalizar Solicitud</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            const token = localStorage.getItem('authToken');
            const body = {
              idTramite: tramiteCreado.idTramite,
              estado: estadoSolicitud,
              fecha: fechaSolicitud,
              observaciones
            };

            try {
              await axios.post('http://localhost:5000/api/solicitudes', body, {
                headers: { Authorization: `Bearer ${token}` }
              });

              alert('Solicitud creada correctamente');
              navigate('/solicitudes');
            } catch (error) {
              console.error('Error al crear la solicitud:', error);
              alert('Error al crear la solicitud');
            }
          }}
        >
          <label>
            Estado:
            <input
              type="text"
              value={estadoSolicitud}
              onChange={e => setEstadoSolicitud(e.target.value)}
              readOnly
            />
          </label>

          <label>
            Fecha:
            <input
              type="date"
              value={fechaSolicitud}
              onChange={e => setFechaSolicitud(e.target.value)}
            />
          </label>

          <label>
            Observaciones:
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
            />
          </label>

          <button type="submit">Finalizar Solicitud</button>
        </form>
      </div>
    )}

    </div>

  );
};

export default CrearSolicitud;