import React from 'react';

const VerClienteModal = ({ cliente, mostrar, cerrar }) => {
  if (!mostrar || !cliente) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Detalles del Cliente</h2>
          <button className="modal-close-btn" onClick={cerrar}>
            &times;
          </button>
        </div>
        
        <div className="modal-body">
          <div className="cliente-details-grid">
            <div className="detail-row">
              <span className="detail-label">Nombre:</span>
              <span className="detail-value">{cliente.nombreCliente || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Apellido Paterno:</span>
              <span className="detail-value">{cliente.apellidoPaternoCliente || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Apellido Materno:</span>
              <span className="detail-value">{cliente.apellidoMaternoCliente || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Identificación:</span>
              <span className="detail-value">{cliente.identificacionunicanacional || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Teléfono:</span>
              <span className="detail-value">{cliente.telefono || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Edad:</span>
              <span className="detail-value">{cliente.edad || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Sexo:</span>
              <span className="detail-value">{cliente.sexo || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Estado Civil:</span>
              <span className="detail-value">{cliente.estado_civil || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Domicilio:</span>
              <span className="detail-value">{cliente.Domicilio || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Condiciones Especiales:</span>
              <span className="detail-value">{cliente.condicionesEspeciales || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Fecha de Nacimiento:</span>
              <span className="detail-value">{cliente.fechaNacimiento || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">País de Nacimiento:</span>
              <span className="detail-value">{cliente.PaisNacimiento || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="modal-btn" onClick={cerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerClienteModal;