# Backend MongoDB - Diligencias Internacionales

## 🚀 Tecnologías Utilizadas
- **Backend**: Node.js + Express.js
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: JWT (JSON Web Tokens)
- **Encriptación**: bcryptjs
- **Containerización**: Docker para MongoDB
- **Desarrollo**: Nodemon

## 📦 Instalación y Configuración

### 1. Instalar dependencias
```bash
cd backend-mongo
npm install
```

### 2. Configurar MongoDB con Docker
```bash
# Crear contenedor MongoDB con persistencia
docker run --name mongodb -d -p 27017:27017 -v mongodb_data:/data/db mongo:latest

# Verificar que esté corriendo
docker ps
```

### 3. Configurar variables de entorno
El archivo `.env` ya está configurado con:
```env
MONGODB_URI=mongodb://localhost:27017/diligenciasinternacionales
JWT_SECRET=tu_jwt_secret_key_super_segura_aqui_2024
PORT=5000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### 4. Ejecutar el servidor
```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

## 🔌 API Endpoints

### Autenticación
| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | `{email, password, name}` |
| POST | `/api/auth/login` | Iniciar sesión | `{email, password}` |

### Utilidad
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Verificar que el servidor funciona |
| GET | `/health` | Estado del servidor y base de datos |

## 📁 Estructura del Proyecto

```
backend-mongo/
├── .env                          # Variables de entorno
├── package.json                  # Dependencias y scripts
├── server.js                     # Punto de entrada
├── src/
│   ├── config/
│   │   ├── database.js          # Configuración de MongoDB
│   │   └── env.js               # Configuración de variables
│   ├── controllers/
│   │   └── authController.js    # Lógica de autenticación
│   ├── middleware/
│   │   └── auth.js              # Middleware de autenticación JWT
│   ├── models/
│   │   ├── User.js              # Modelo de Usuario
│   │   ├── Diligencia.js        # Modelo de Diligencia
│   │   └── Documento.js         # Modelo de Documento
│   ├── routes/
│   │   └── auth.js              # Rutas de autenticación
│   ├── services/                # Servicios de negocio
│   └── utils/                   # Utilidades
└── uploads/
    └── documentos/              # Archivos subidos
```

## 🧪 Pruebas con Insomnia/Postman

### Registro de Usuario
```json
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "123456",
  "name": "Nombre Usuario"
}
```

**Respuesta esperada:**
```json
{
  "message": "Usuario creado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "usuario@example.com",
    "nombre": "Nombre Usuario",
    "role": "user"
  }
}
```

### Login de Usuario
```json
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "123456"
}
```

**Respuesta esperada:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "usuario@example.com",
    "nombre": "Nombre Usuario"
  }
}
```

## 🗄️ Modelos de Datos

### Usuario (User)
- `email`: String, único, requerido
- `password`: String, hasheado, requerido
- `name`: String, requerido
- `role`: String, enum ['admin', 'user'], default 'user'
- `isActive`: Boolean, default true
- `timestamps`: createdAt, updatedAt automáticos

### Diligencia
- `userId`: ObjectId referencia a User
- `titulo`: String, requerido
- `descripcion`: String, requerido
- `status`: String, enum ['pendiente', 'en_proceso', 'completada', 'cancelada']
- `fechaCreacion`: Date, default Date.now
- `fechaVencimiento`: Date
- `documentos`: Array de ObjectIds referencia a Documento

### Documento
- `diligenciaId`: ObjectId referencia a Diligencia
- `nombre`: String, requerido
- `nombreArchivo`: String, requerido
- `ruta`: String, requerido
- `tamaño`: Number, requerido
- `tipoMime`: String, requerido

## 🔧 Características Implementadas

- ✅ Autenticación JWT
- ✅ Hash de passwords con bcryptjs
- ✅ Validación de datos de entrada
- ✅ Logs de requests
- ✅ Manejo global de errores
- ✅ CORS configurado
- ✅ Estructura MVC
- ✅ Compatible con frontend React existente
- ✅ Persistencia de datos con Docker volumes

## 📝 Próximas Implementaciones

- [ ] Middleware de autenticación para rutas protegidas
- [ ] CRUD completo para Diligencias
- [ ] Upload de documentos con Multer
- [ ] Roles y permisos avanzados
- [ ] Validación con express-validator
- [ ] Tests unitarios
- [ ] Migración de datos desde Google Sheets

---

**Estado**: ✅ Backend base funcional con autenticación
**Compatible con**: Frontend React existente