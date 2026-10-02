/**
 * Hash de contraseñas con scrypt (módulo crypto nativo de Node, sin dependencias nativas).
 * Formato almacenado: scrypt$<N>$<r>$<p>$<salt base64>$<hash base64>
 */
const crypto = require('crypto');

const PARAMS = { N: 16384, r: 8, p: 1, keylen: 64 };
const MIN_PASSWORD_LENGTH = 10;
const MAX_PASSWORD_LENGTH = 256;

const scrypt = (password, salt, { N, r, p, keylen }) => new Promise((resolve, reject) => {
  crypto.scrypt(password, salt, keylen, { N, r, p, maxmem: 64 * 1024 * 1024 }, (err, key) => {
    if (err) reject(err); else resolve(key);
  });
});

async function hashPassword(password) {
  if (typeof password !== 'string' || !password) throw new Error('password requerido');
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password.normalize('NFKC'), salt, PARAMS);
  return ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, salt.toString('base64'), key.toString('base64')].join('$');
}

function parseHash(stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return null;
  const [, N, r, p, salt, hash] = parts;
  const params = { N: Number(N), r: Number(r), p: Number(p) };
  if (![params.N, params.r, params.p].every(Number.isInteger)) return null;
  const expected = Buffer.from(hash, 'base64');
  if (!expected.length) return null;
  return { ...params, keylen: expected.length, salt: Buffer.from(salt, 'base64'), expected };
}

// Hash ficticio para igualar tiempos cuando el usuario no existe o no tiene contraseña.
let dummyHashPromise = null;
const getDummyHash = () => {
  if (!dummyHashPromise) dummyHashPromise = hashPassword(crypto.randomBytes(24).toString('hex'));
  return dummyHashPromise;
};

async function verifyPassword(password, stored) {
  const parsed = parseHash(stored || await getDummyHash());
  if (!parsed || typeof password !== 'string') {
    await scrypt('x', Buffer.alloc(16), PARAMS).catch(() => null);
    return false;
  }
  const key = await scrypt(password.normalize('NFKC'), parsed.salt, parsed);
  const matches = key.length === parsed.expected.length && crypto.timingSafeEqual(key, parsed.expected);
  return Boolean(stored) && matches;
}

/** Devuelve null si la contraseña es aceptable o un mensaje en español si no lo es. */
function validatePasswordPolicy(password, { email } = {}) {
  if (typeof password !== 'string') return 'La contraseña es obligatoria';
  if (password.length < MIN_PASSWORD_LENGTH) return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
  if (password.length > MAX_PASSWORD_LENGTH) return 'La contraseña es demasiado larga';
  if (!/[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(password) || !/\d/.test(password)) return 'La contraseña debe combinar letras y números';
  const local = String(email || '').split('@')[0].toLowerCase();
  if (local && local.length >= 4 && password.toLowerCase().includes(local)) return 'La contraseña no debe contener el correo';
  return null;
}

function generateTemporaryPassword() {
  // 16 caracteres legibles + garantiza letra y número.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(16);
  let out = '';
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `${out}7a`;
}

module.exports = {
  MIN_PASSWORD_LENGTH,
  hashPassword,
  verifyPassword,
  validatePasswordPolicy,
  generateTemporaryPassword,
  __test: { parseHash },
};
