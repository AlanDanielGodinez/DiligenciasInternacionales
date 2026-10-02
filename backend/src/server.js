const http = require('http');
const dotenv = require('dotenv');

dotenv.config();

const { assertSecurityConfig } = require('./config/security');

try {
  assertSecurityConfig();
} catch (error) {
  console.error(`[seguridad] ${error.message}`);
  process.exit(1);
}

const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
