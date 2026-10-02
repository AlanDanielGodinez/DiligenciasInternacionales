â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘                  ðŸš€ GUÃA COMPLETA PARA ACTIVAR LOGIN              â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

## âœ… PASO 1: Verificar tu MongoDB Atlas

1. Ve a https://cloud.mongodb.com/
2. Selecciona tu cluster "DiligenciasInt"
3. Haz clic en "Connect" > "Drivers"
4. Copia la URI (deberÃ­a estar en tu .env)
5. Haz clic en "Browse Collections" para ver tus datos

---

## âœ… PASO 2: Configurar el Backend

### 2.1 Verificar .env
Tu archivo debe tener:
```
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>/<base>
JWT_SECRET=<generar: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
PORT=5000
```

### 2.2 Instalar dependencias
```bash
cd backend-mongo
npm install
```

### 2.3 Crear usuarios de prueba
```bash
# Importar desde CSV
node scripts/importFromCSV.js usuarios data/usuarios_ejemplo.csv

# O crear manualmente en MongoDB Atlas:
# Email: admin@example.com
# Password: <contraseña asignada por un administrador>
# Nombre: Admin
# Role: admin
```

### 2.4 Iniciar el servidor
```bash
npm run dev
# o
node server.js
```

DeberÃ­as ver:
```
âœ… MongoDB conectado
ðŸš€ Servidor corriendo en http://localhost:5000
```

---

## âœ… PASO 3: Probar el Login (Backend)

### OpciÃ³n A: Con cURL (Windows PowerShell o Terminal)

```bash
# 1. Verificar que el servidor estÃ¡ corriendo
curl http://localhost:5000/health

# 2. Login de empleado
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"<contraseña>\"}"

# DeberÃ­as recibir:
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "nombre": "Admin",
    "role": "admin",
    "rol": "Administrador"
  }
}

# 3. Verificar token
curl http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### OpciÃ³n B: Con Postman

1. Abre Postman
2. Crea una nueva solicitud POST
3. URL: `http://localhost:5000/api/auth/login`
4. Headers: `Content-Type: application/json`
5. Body (JSON):
```json
{
  "email": "admin@example.com",
Password: <contraseña asignada por un administrador>
}
```
6. Haz clic en "Send"

---

## âœ… PASO 4: Conectar Frontend con Backend

### 4.1 Verificar configuraciÃ³n del Frontend

Archivo: `diligenciasinternacionalesinc/src/config/api.js`

Debe tener:
```javascript
const API_BASE_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  VERIFY: `${API_BASE_URL}/api/auth/verify`,
  CLIENTE_LOGIN: `${API_BASE_URL}/api/auth/cliente-login`,
  HEALTH: `${API_BASE_URL}/health`,
};
```

### 4.2 Iniciar el Frontend

```bash
cd diligenciasinternacionalesinc
npm install
npm start
```

DeberÃ­a abrir en http://localhost:3000

### 4.3 Probar Login en la aplicaciÃ³n

1. Ve al formulario de Login
2. Ingresa:
   - Email: `admin@example.com`
   - Password: <contraseña asignada por un administrador>
3. Haz clic en "Ingresar"
4. DeberÃ­as ser redirigido al dashboard

---

## ðŸ“ FLUJO COMPLETO DE LOGIN

### 1. Frontend (React)
```
Usuario ingresa credenciales en formulario Login.js
     â†“
EnvÃ­a POST a /api/auth/login con email y password
     â†“
Recibe token + datos de usuario
     â†“
Guarda en localStorage (authToken, user)
     â†“
Redirige al dashboard
```

### 2. Backend (Node.js)
```
POST /api/auth/login recibido
     â†“
Valida que email y password existan
     â†“
Busca usuario en MongoDB
     â†“
Compara contraseÃ±a (bcrypt)
     â†“
Genera JWT token
     â†“
Retorna token + datos de usuario
```

### 3. VerificaciÃ³n de Token
```
Frontend envÃ­a GET /api/auth/verify con token en header
     â†“
Backend verifica JWT
     â†“
Si es vÃ¡lido, retorna datos del usuario
     â†“
Si no, retorna error 403
```

---

## ðŸ” USUARIOS DE EJEMPLO

### Empleado/Admin
```
Email: admin@example.com
Password: <contraseña asignada por un administrador>
Role: admin
```

### Usuario Regular
```
Email: usuario1@example.com
Password: <contraseña asignada por un administrador>
Role: user
```

### Cliente
```
Email: cliente@example.com
Password: <contraseña asignada por un administrador>
Role: user (se convierte en cliente en login)
```

---

## ðŸ› ï¸ TROUBLESHOOTING

### Error: "Cannot POST /api/auth/login"
âœ… SoluciÃ³n: AsegÃºrate de que el backend estÃ© corriendo
```bash
cd backend-mongo
npm run dev
```

### Error: "MongoDB connection failed"
âœ… SoluciÃ³n: Verifica tu URI en .env
- Copia la URI correctamente desde Atlas
- Verifica que la contraseÃ±a tenga caracteres especiales codificados (# = %23)
- Agrega tu IP a la lista blanca de MongoDB Atlas

### Error: "User not found"
âœ… SoluciÃ³n: Crea el usuario primero
```bash
node scripts/importFromCSV.js usuarios data/usuarios_ejemplo.csv
```

### Error: "Incorrect password"
âœ… SoluciÃ³n: Verifica la contraseÃ±a
- Las contraseÃ±as son case-sensitive
- AsegÃºrate de escribir correctamente

### El frontend no se conecta al backend
âœ… SoluciÃ³n: Verifica CORS
- Backend debe tener: `app.use(cors())`
- Frontend debe usar: `http://localhost:5000` (no https)

---

## ðŸ“Š ESTRUCTURA DE CARPETAS

```
backend-mongo/
â”œâ”€â”€ .env â† ConfiguraciÃ³n (URI de MongoDB)
â”œâ”€â”€ server.js â† Servidor principal
â”œâ”€â”€ package.json
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ config/
â”‚   â”‚   â”œâ”€â”€ database.js â† ConexiÃ³n MongoDB
â”‚   â”‚   â””â”€â”€ env.js â† Variables de entorno
â”‚   â”œâ”€â”€ controllers/
â”‚   â”‚   â””â”€â”€ authController.js â† LÃ³gica de login
â”‚   â”œâ”€â”€ models/
â”‚   â”‚   â””â”€â”€ user.js â† Modelo de usuario
â”‚   â”œâ”€â”€ routes/
â”‚   â”‚   â””â”€â”€ auth.js â† Rutas de autenticaciÃ³n
â”‚   â””â”€â”€ middleware/
â”‚       â””â”€â”€ auth.js â† VerificaciÃ³n de tokens
â”œâ”€â”€ scripts/
â”‚   â””â”€â”€ importFromCSV.js â† Importar datos
â””â”€â”€ data/
    â””â”€â”€ usuarios_ejemplo.csv â† Datos de ejemplo
```

---

## ðŸš€ RESUMEN RÃPIDO

1. AsegÃºrate de que MongoDB Atlas estÃ¡ configurada
2. Actualiza el .env con la URI correcta
3. Instala dependencias: `npm install`
4. Crea usuarios: `node scripts/importFromCSV.js usuarios data/usuarios_ejemplo.csv`
5. Inicia backend: `npm run dev`
6. Inicia frontend: `npm start`
7. Prueba el login con admin@example.com / <contraseña>

---

## ðŸ’¡ PRÃ“XIMOS PASOS

âœ… Implementar recuperaciÃ³n de contraseÃ±a
âœ… Agregar 2FA (AutenticaciÃ³n de dos factores)
âœ… Crear dashboard con datos reales
âœ… Implementar rutas protegidas para empleados y clientes
âœ… Agregar mÃ¡s funcionalidades (crear diligencias, subir documentos, etc.)

---

Â¿Necesitas ayuda? Revisa los logs del servidor y comparte los errores que veas.
