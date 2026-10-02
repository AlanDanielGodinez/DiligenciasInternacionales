#!/usr/bin/env node
/**
 * Alta / restablecimiento de contraseñas de empleados (lo ejecuta un administrador).
 *
 * Uso:
 *   node scripts/auth-set-password.js --email persona@empresa.com --generar
 *       Genera una contraseña temporal aleatoria, la muestra UNA vez y obliga a cambiarla
 *       en el primer inicio de sesión. Entréguela por un canal seguro (nunca por correo).
 *   node scripts/auth-set-password.js --email persona@empresa.com
 *       Pide la nueva contraseña por consola (sin mostrarla).
 *   node scripts/auth-set-password.js --pendientes
 *       Lista empleados activos que aún no tienen contraseña (sólo correo y área).
 *
 * Opcional: --sin-cambio-obligatorio (no forzar cambio en el primer inicio de sesión).
 * Restablecer la contraseña invalida todas las sesiones abiertas de ese empleado.
 */
require('dotenv').config();
const readline = require('readline');
const { pool } = require('../src/config/db');
const passwords = require('../src/services/password.service');
const authService = require('../src/services/auth.service');

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};

function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (text) => { if (text.includes(question)) process.stdout.write(text); };
    rl.question(question, (answer) => { rl.close(); process.stdout.write('\n'); resolve(answer); });
  });
}

async function listPending() {
  const { rows } = await pool.query(
    `SELECT correo, area, rol FROM public.empleados
     WHERE COALESCE(activo, true) = true AND password_hash IS NULL
     ORDER BY area NULLS LAST, correo`
  );
  if (!rows.length) console.log('Todos los empleados activos tienen contraseña.');
  rows.forEach((row) => console.log(`${row.correo || '(sin correo)'}\t${row.area || ''}\t${row.rol || ''}`));
}

async function main() {
  if (flag('--pendientes')) return listPending();

  const email = option('--email');
  if (!email) {
    console.error('Indique --email <correo> (o --pendientes). Vea el encabezado del script.');
    process.exitCode = 2;
    return undefined;
  }

  const empleado = await authService.findEmpleadoByEmail(email);
  if (!empleado) {
    console.error('No existe un empleado con ese correo.');
    process.exitCode = 1;
    return undefined;
  }

  let password;
  const generate = flag('--generar');
  if (generate) {
    password = passwords.generateTemporaryPassword();
  } else {
    password = await promptHidden('Nueva contraseña: ');
    const confirmation = await promptHidden('Confirmar contraseña: ');
    if (password !== confirmation) {
      console.error('Las contraseñas no coinciden.');
      process.exitCode = 1;
      return undefined;
    }
  }

  const policyError = passwords.validatePasswordPolicy(password, { email: empleado.correo });
  if (policyError) {
    console.error(policyError);
    process.exitCode = 1;
    return undefined;
  }

  const mustChange = !flag('--sin-cambio-obligatorio');
  await authService.setPassword(empleado.id_empleado, password, { mustChange });
  await pool.query(
    `INSERT INTO public.auditoria_accesos (evento, id_empleado, correo, exito, recurso)
     VALUES ('PASSWORD_ASIGNADA_ADMIN', $1, $2, true, 'scripts/auth-set-password.js')`,
    [empleado.id_empleado, empleado.correo]
  ).catch(() => null);

  console.log(`Contraseña asignada a ${empleado.correo}${mustChange ? ' (deberá cambiarla al iniciar sesión)' : ''}.`);
  if (generate) console.log(`Contraseña temporal (se muestra una sola vez): ${password}`);
  return undefined;
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
