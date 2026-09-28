const SATISFACTION_SURVEY_VERSION = 1;

const SATISFACTION_SURVEY_FIELDS = [
  { key: 'satisfaccion_general', label: 'En general, ¿cómo calificaría su experiencia con nuestro servicio?', type: 'scale', min: 1, max: 5 },
  { key: 'claridad_informacion', label: '¿Qué tan clara fue la información que recibió durante su proceso?', type: 'scale', min: 1, max: 5 },
  { key: 'calidad_atencion', label: '¿Cómo calificaría la atención y el trato de nuestro equipo?', type: 'scale', min: 1, max: 5 },
  { key: 'tiempo_respuesta', label: '¿Qué tan oportuno fue nuestro seguimiento y la respuesta a sus dudas?', type: 'scale', min: 1, max: 5 },
  { key: 'utilidad_asesoria', label: '¿Considera que nuestra asesoría le brindó herramientas claras para su entrevista?', type: 'scale', min: 1, max: 5 },
  { key: 'fortalezas_servicio', label: '¿Qué parte de nuestro servicio considera que hicimos mejor?', type: 'long_text' },
  { key: 'punto_mejora', label: '¿Qué podemos mejorar en nuestro servicio?', type: 'long_text' },
  { key: 'probabilidad_recomendacion', label: '¿Qué tan probable es que recomiende a Diligencias Internacionales a un familiar o amigo?', type: 'scale', min: 0, max: 10 },
  { key: 'aprobado_negado', label: 'Resultado del trámite', type: 'enum', options: ['Negado', 'Aprobado'] },
];

module.exports = { SATISFACTION_SURVEY_VERSION, SATISFACTION_SURVEY_FIELDS };
