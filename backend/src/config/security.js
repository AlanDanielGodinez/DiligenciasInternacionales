/**
 * Configuración de seguridad centralizada.
 *
 * Reglas:
 *  - JWT_SECRET (o AUTH_TOKEN_SECRET) es obligatorio y debe tener >= 32 caracteres.
 *    No existe ningún secreto de respaldo escrito en el código.
 *  - Genere uno nuevo con:  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
 */
const MIN_SECRET_LENGTH = 32;

const PLACEHOLDER_PATTERN = /^(change[-_ ]?me|cambiar|secret|secret_key|fallback_secret|your[-_].*|tu[-_].*|diligencias-local-session-secret)$/i;

class SecurityConfigError extends Error {}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.AUTH_TOKEN_SECRET || '';
  if (!secret) {
    throw new SecurityConfigError(
      'JWT_SECRET no está configurado. Defina un secreto aleatorio de al menos 32 caracteres en el entorno.'
    );
  }
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new SecurityConfigError(`JWT_SECRET debe tener al menos ${MIN_SECRET_LENGTH} caracteres.`);
  }
  if (PLACEHOLDER_PATTERN.test(secret)) {
    throw new SecurityConfigError('JWT_SECRET contiene un valor de ejemplo; genere uno aleatorio.');
  }
  return secret;
}

function getTokenTtlSeconds() {
  const hours = Number(process.env.AUTH_TOKEN_TTL_HOURS || 12);
  const safeHours = Number.isFinite(hours) && hours > 0 && hours <= 72 ? hours : 12;
  return Math.round(safeHours * 3600);
}

function getAllowedOrigins() {
  const raw = [process.env.CORS_ORIGINS, process.env.FRONTEND_URL].filter(Boolean).join(',');
  return raw.split(',').map((value) => value.trim().replace(/\/+$/, '')).filter(Boolean);
}

/** Se ejecuta al arrancar el servidor: falla rápido si la configuración es insegura. */
function assertSecurityConfig() {
  getJwtSecret();
  if (process.env.NODE_ENV === 'production' && getAllowedOrigins().length === 0) {
    throw new SecurityConfigError('En producción defina CORS_ORIGINS o FRONTEND_URL.');
  }
}

module.exports = {
  MIN_SECRET_LENGTH,
  SecurityConfigError,
  getJwtSecret,
  getTokenTtlSeconds,
  getAllowedOrigins,
  assertSecurityConfig,
};
