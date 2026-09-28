const crypto = require('crypto');

function getEncryptionKey() {
  const configured = String(process.env.QUICKBOOKS_TOKEN_ENCRYPTION_KEY || '').trim();
  if (!configured) throw new Error('QUICKBOOKS_TOKEN_ENCRYPTION_KEY is not configured');

  let key;
  if (/^[a-f\d]{64}$/i.test(configured)) key = Buffer.from(configured, 'hex');
  else key = Buffer.from(configured, 'base64');

  if (key.length !== 32) {
    throw new Error('QUICKBOOKS_TOKEN_ENCRYPTION_KEY must be 32 bytes encoded as base64 or 64 hex characters');
  }
  return key;
}

function encryptToken(token) {
  if (!token) throw new Error('Token is required');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(String(token), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString('base64')}.${tag.toString('base64')}.${ciphertext.toString('base64')}`;
}

function decryptToken(protectedToken) {
  const [version, ivValue, tagValue, ciphertextValue] = String(protectedToken || '').split('.');
  if (version !== 'v1' || !ivValue || !tagValue || !ciphertextValue) {
    throw new Error('Encrypted token has an invalid format');
  }
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(ivValue, 'base64')
  );
  decipher.setAuthTag(Buffer.from(tagValue, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

module.exports = { encryptToken, decryptToken };
