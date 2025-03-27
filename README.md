# Dilgencias-Int-Inc
 Instalar la base de datos:
 -- Creación de la base de datos
CREATE DATABASE aplicacion_web_dii;

-- Conectarse a la base de datos
\c aplicacion_web_dii;

-- Creación de tablas

-- Tabla Pais
CREATE TABLE Pais (
    idPais SERIAL PRIMARY KEY,
    nombrePais VARCHAR(255) NOT NULL
);

-- Tabla Ciudad
CREATE TABLE Ciudad (
    idCiudad SERIAL PRIMARY KEY,
    nombreCiudad VARCHAR(255) NOT NULL
);

-- Tabla Ciudad_Destino
CREATE TABLE Ciudad_Destino (
    idCiudad SERIAL PRIMARY KEY,
    nombreCiudad VARCHAR(255) NOT NULL,
    cantidadGrupo INT
);

-- Tabla Rol
CREATE TABLE Rol (
    idRol SERIAL PRIMARY KEY,
    nombreRol VARCHAR(255) NOT NULL
);

-- Tabla Categoria_productos
CREATE TABLE Categoria_productos (
    idCategoria SERIAL PRIMARY KEY,
    nombreCategoria VARCHAR(255) NOT NULL
);

-- Tabla Cliente
CREATE TABLE Cliente (
    idCliente SERIAL PRIMARY KEY,
    nombreCliente VARCHAR(255) NOT NULL,
    apellidoPaternoCliente VARCHAR(255) NOT NULL,
    apellidoMaternoCliente VARCHAR(255) NOT NULL,
    sexo VARCHAR(255),
    edad INT,
    telefono VARCHAR(20),
    estado_civil VARCHAR(255),
    identificacionunicanacional VARCHAR(20),
    Domicilio VARCHAR(255),
    condicionesEspeciales VARCHAR(255),
    fechaNacimiento VARCHAR(20),
    municipioNacimiento VARCHAR(20),
    EstadoNacimiento VARCHAR(20),
    PaisNacimiento VARCHAR(20),
    idCiudad INT REFERENCES Ciudad(idCiudad),
    idPais INT REFERENCES Pais(idPais)
);

-- Tabla Empleado
CREATE TABLE Empleado (
    idEmpleado SERIAL PRIMARY KEY,
    nombreEmpleado VARCHAR(255) NOT NULL,
    apellidoPaternoEmpleado VARCHAR(255) NOT NULL,
    apellidoMaternoEmpleado VARCHAR(255) NOT NULL,
    identificacionunicanacional VARCHAR(20),
    Telefono VARCHAR(20),
    correoEmpleado VARCHAR(255),
    idRol INT REFERENCES Rol(idRol)
);

-- Tabla Grupo
CREATE TABLE Grupo (
    idGrupo SERIAL PRIMARY KEY,
    nombreGrupo VARCHAR(255) NOT NULL,
    cantidadGrupo INT
);

-- Tabla Tramite
CREATE TABLE Tramite (
    idTramite SERIAL PRIMARY KEY,
    tipoTramite VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    fecha_inicio VARCHAR(255),
    fecha_fin VARCHAR(20),
    requisitos VARCHAR(255),
    plazo_estimado VARCHAR(255),
    costo VARCHAR(255),
    idCliente INT REFERENCES Cliente(idCliente),
    idEmpleado INT REFERENCES Empleado(idEmpleado),
    idGrupo INT REFERENCES Grupo(idGrupo),
    idCiudad INT REFERENCES Ciudad_Destino(idCiudad)
);

-- Tabla Solicitud
CREATE TABLE Solicitud (
    idSolicitud SERIAL PRIMARY KEY,
    idCliente INT REFERENCES Cliente(idCliente),
    idTramite INT REFERENCES Tramite(idTramite),
    idEmpleado INT REFERENCES Empleado(idEmpleado),
    fechaSolicitud VARCHAR(255),
    estado_actual VARCHAR(255)
);

-- Tabla Estado_empleado
CREATE TABLE Estado_empleado (
    idEstadoempleado SERIAL PRIMARY KEY,
    idEmpleado INT REFERENCES Empleado(idEmpleado),
    estadoEmpleado VARCHAR(20),
    actividadEmpleado VARCHAR(255),
    fecha_actualizacion_empleado VARCHAR(255)
);

-- Tabla Seguimiento
CREATE TABLE Seguimiento (
    idSeguimiento SERIAL PRIMARY KEY,
    idSolicitud INT REFERENCES Solicitud(idSolicitud),
    idEmpleado INT REFERENCES Empleado(idEmpleado),
    descripcion VARCHAR(255),
    fecha_actualizacion VARCHAR(255),
    estado VARCHAR(255)
);

-- Tabla MetodoPago
CREATE TABLE MetodoPago (
    idMetodopago SERIAL PRIMARY KEY,
    nombreMetodo VARCHAR(255) NOT NULL
);

-- Tabla Pago
CREATE TABLE Pago (
    idPago SERIAL PRIMARY KEY,
    idSolicitud INT REFERENCES Solicitud(idSolicitud),
    idMetodopago INT REFERENCES MetodoPago(idMetodopago),
    monto VARCHAR(255),
    fechaPago VARCHAR(255),
    estadoPago VARCHAR(255)
);

-- Tabla Aerolinea
CREATE TABLE Aerolinea (
    idAerolinea SERIAL PRIMARY KEY,
    nombreAerolinea VARCHAR(255) NOT NULL,
    contacto VARCHAR(255)
);

-- Tabla Itinerario
CREATE TABLE Itinerario (
    idItinerario SERIAL PRIMARY KEY,
    idSolicitud INT REFERENCES Solicitud(idSolicitud),
    fecha_salida VARCHAR(255),
    fecha_regreso VARCHAR(255),
    idAerolinea INT REFERENCES Aerolinea(idAerolinea),
    numero_vuelo VARCHAR(255),
    hotel VARCHAR(255),
    direccion_hotel VARCHAR(255),
    contacto_hotel VARCHAR(255)
);

-- Tabla Documento
CREATE TABLE Documento (
    idDocumento SERIAL PRIMARY KEY,
    idSolicitud INT REFERENCES Solicitud(idSolicitud),
    nombreDocumento VARCHAR(20),
    tipoDocumento VARCHAR(255),
    archivo VARCHAR(255),
    fechasubida VARCHAR(255),
    estado VARCHAR(255)
);

-- Tabla Producto
CREATE TABLE Producto (
    idProducto SERIAL PRIMARY KEY,
    idCategoria INT REFERENCES Categoria_productos(idCategoria),
    nombreProducto VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    cantidad VARCHAR(255),
    precio VARCHAR(255)
);

-- Tabla MovimientoInventario
CREATE TABLE MovimientoInventario (
    idMovimiento SERIAL PRIMARY KEY,
    idProducto INT REFERENCES Producto(idProducto),
    idEmpleado INT REFERENCES Empleado(idEmpleado),
    tipoMovimiento VARCHAR(255),
    cantidadMovimiento VARCHAR(255),
    fecha VARCHAR(255),
    comentarios VARCHAR(255)
);

-- Tabla Antecedente
CREATE TABLE Antecedente (
    idAntecedente SERIAL PRIMARY KEY,
    idCliente INT REFERENCES Cliente(idCliente),
    apellidoPaternoCliente VARCHAR(255),
    TipoTramiteA VARCHAR(255),
    descipcion INT,
    telefono VARCHAR(20),
    fechaTramiteAntecendente VARCHAR(255),
    estadoTramiteAntecente VARCHAR(20),
    Domicilio VARCHAR(255),
    observaciones VARCHAR(255)
);
-- Tabla Area
CREATE TABLE Area (
    idArea SERIAL PRIMARY KEY,
    nombreArea VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    responsableArea INT REFERENCES Empleado(idEmpleado)
);
-- Modificar tabla Empleado para agregar relación con Area
ALTER TABLE Empleado ADD COLUMN idArea INT REFERENCES Area(idArea);
ALTER TABLE Area ALTER COLUMN responsableArea DROP NOT NULL;

-- Índices para mejorar el rendimiento
CREATE INDEX idx_cliente_id ON Cliente(idCliente);
CREATE INDEX idx_empleado_id ON Empleado(idEmpleado);
CREATE INDEX idx_solicitud_id ON Solicitud(idSolicitud);
CREATE INDEX idx_tramite_id ON Tramite(idTramite);
CREATE INDEX idx_producto_id ON Producto(idProducto);
CREATE INDEX idx_cliente_identificacion ON Cliente(identificacionunicanacional);
CREATE INDEX idx_empleado_identificacion ON Empleado(identificacionunicanacional);

-- Comentarios sobre las tablas
COMMENT ON TABLE Cliente IS 'Tabla que almacena información de los clientes del sistema';
COMMENT ON TABLE Empleado IS 'Tabla que almacena información de los empleados del sistema';
COMMENT ON TABLE Tramite IS 'Tabla que contiene los diferentes tipos de trámites disponibles';
COMMENT ON TABLE Solicitud IS 'Tabla que registra las solicitudes de trámites realizadas por clientes';
COMMENT ON TABLE Seguimiento IS 'Tabla que registra el seguimiento de las solicitudes';
COMMENT ON TABLE Documento IS 'Tabla que almacena los documentos asociados a las solicitudes';

-- Datos iniciales (opcional)
INSERT INTO Rol (nombreRol) VALUES 
('Administrador'), ('Empleado'), ('Supervisor');

INSERT INTO Categoria_productos (nombreCategoria) VALUES 
('Documentos'), ('Paquetes'), ('Servicios');

INSERT INTO MetodoPago (nombreMetodo) VALUES 
('Efectivo'), ('Tarjeta de Crédito'), ('Transferencia Bancaria');

INSERT INTO Pais (nombrePais) VALUES 
('México'), ('Estados Unidos'), ('Canadá');

INSERT INTO Ciudad (nombreCiudad) VALUES 
('Ciudad de México'), ('Guadalajara'), ('Monterrey');
