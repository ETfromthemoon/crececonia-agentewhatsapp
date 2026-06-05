import type Anthropic from '@anthropic-ai/sdk';

/**
 * Definiciones de las tools que se exponen a Claude (function calling).
 * La ejecución real está en toolHandlers.ts.
 */
export const TOOLS: Anthropic.Tool[] = [
  {
    name: 'buscar_conocimiento',
    description:
      'Busca en la base de conocimiento de Sergio (blog, web, PDFs) fragmentos relevantes ' +
      'para responder. Úsalo SIEMPRE antes de responder dudas de contenido.',
    input_schema: {
      type: 'object',
      properties: {
        consulta: { type: 'string', description: 'La pregunta o tema a buscar' },
        top_k: { type: 'integer', description: 'Nº de fragmentos (por defecto 5)' },
      },
      required: ['consulta'],
    },
  },
  {
    name: 'guardar_lead',
    description: 'Crea o actualiza los datos del lead (contacto) en la base de datos.',
    input_schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string' },
        email: { type: 'string' },
        empresa: { type: 'string' },
        necesidad: { type: 'string' },
        presupuesto: { type: 'string' },
        plazo: { type: 'string' },
        consentimiento: { type: 'boolean', description: 'Opt-in para email/marketing' },
      },
    },
  },
  {
    name: 'calificar_lead',
    description: 'Fija el score (0-100) y el estado del lead según el interés detectado.',
    input_schema: {
      type: 'object',
      properties: {
        score: { type: 'integer', description: '0-100' },
        estado: {
          type: 'string',
          enum: ['new', 'contacted', 'qualified', 'nurturing', 'lost'],
        },
        motivo: { type: 'string' },
      },
      required: ['score', 'estado'],
    },
  },
  {
    name: 'consultar_disponibilidad_calcom',
    description: 'Devuelve huecos libres reales para una llamada con Sergio (Cal.com).',
    input_schema: {
      type: 'object',
      properties: {
        desde: { type: 'string', description: 'Fecha/hora ISO de inicio del rango' },
        hasta: { type: 'string', description: 'Fecha/hora ISO de fin del rango' },
        timeZone: { type: 'string', description: 'Zona horaria, p.ej. Europe/Madrid' },
      },
      required: ['desde', 'hasta'],
    },
  },
  {
    name: 'crear_reserva_calcom',
    description: 'Crea una reserva de llamada en Cal.com. `start` debe ir en UTC ISO 8601.',
    input_schema: {
      type: 'object',
      properties: {
        start: { type: 'string', description: 'Inicio en UTC ISO 8601' },
        nombre: { type: 'string' },
        email: { type: 'string' },
        timeZone: { type: 'string' },
        notas: { type: 'string' },
      },
      required: ['start', 'nombre', 'email', 'timeZone'],
    },
  },
  {
    name: 'enviar_recurso',
    description: 'Comparte un recurso/contenido relevante con la persona (enlace, guía, PDF).',
    input_schema: {
      type: 'object',
      properties: {
        recurso_id: { type: 'string', description: 'Identificador o categoría del recurso' },
      },
      required: ['recurso_id'],
    },
  },
  {
    name: 'escalar_a_humano',
    description:
      'Notifica a Sergio y pausa el bot. Úsalo si piden un humano, hay enfado, o el caso ' +
      'es sensible o queda fuera de alcance.',
    input_schema: {
      type: 'object',
      properties: {
        motivo: { type: 'string' },
        resumen: { type: 'string', description: 'Resumen breve para que Sergio retome' },
      },
      required: ['motivo', 'resumen'],
    },
  },
];
