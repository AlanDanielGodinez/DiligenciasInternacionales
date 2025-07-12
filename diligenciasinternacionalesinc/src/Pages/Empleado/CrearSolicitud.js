import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CrearCliente from './CrearCliente';

const CrearSolicitud = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [selectedClientes, setSelectedClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
    navigate('/crear-solicitud/tramite');
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
        
        <button 
          onClick={handleNextStep}
          disabled={selectedClientes.length === 0}
          className={`btn-next ${selectedClientes.length === 0 ? 'disabled' : ''}`}
        >
          Siguiente → Seleccionar Trámite
        </button>
      </div>

      {showCreateModal && (
        <CrearCliente
          mostrar={showCreateModal}
          cerrar={() => setShowCreateModal(false)}
          onClienteCreado={handleClienteCreado}
        />
      )}
    </div>
  );
};

export default CrearSolicitud;