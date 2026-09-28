const { pool } = require('../src/config/db');

const ESTADOS_OPERATIVOS = [
  [201, 'Perfil en proceso', 'individuales'],
  [202, 'Perfil completado', 'individuales'],
  [203, 'Documentos pendientes', 'individuales'],
  [204, 'Documentos completos', 'individuales'],
  [205, 'Cita en proceso', 'individuales'],
  [206, 'Cita programada', 'individuales'],
  [207, 'DS-160 en proceso', 'individuales'],
  [208, 'Entrevista programada', 'individuales'],
  [209, 'Finalizado', 'general'],
  [210, 'Aprobado', 'general'],
  [211, 'Negado', 'general'],

  [221, 'Perfil AMA en proceso', 'ama'],
  [222, 'Perfil AMA completado', 'ama'],
  [223, 'En espera de grupo', 'ama'],
  [224, 'Grupo asignado', 'ama'],
  [225, 'Protocolo pendiente', 'ama'],
  [226, 'Protocolo realizado', 'ama'],

  [241, 'Revisión legal', 'legales'],
  [242, 'Expediente en análisis', 'legales'],
  [243, 'Solicitud preparada', 'legales'],
  [244, 'Enviado a autoridad', 'legales'],
  [245, 'Respuesta recibida', 'legales'],

  [261, 'Cotización pendiente', 'vuelos'],
  [262, 'Cotización enviada', 'vuelos'],
  [263, 'Reserva en proceso', 'vuelos'],
  [264, 'Reserva confirmada', 'vuelos'],
  [265, 'Itinerario enviado', 'vuelos'],
];

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [id, valor, categoria] of ESTADOS_OPERATIVOS) {
      await client.query(
        `INSERT INTO public.catalogo_estatus (id, valor, categoria)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE
         SET valor = EXCLUDED.valor,
             categoria = EXCLUDED.categoria`,
        [id, valor, categoria]
      );
    }
    await client.query('COMMIT');
    console.log(`Estatus operativos asegurados: ${ESTADOS_OPERATIVOS.length}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
