/**
 * Catálogo de recursos de regalo / lead magnets que el agente puede compartir
 * (tool enviar_recurso). Los recursos se alojan en crececonia.cl; apuntamos al sitio.
 * Si hay un deep-link específico para cada recurso, reemplaza la `url`.
 */
export interface Resource {
  id: string;
  titulo: string;
  url: string;
  descripcion?: string;
}

export const RESOURCES: Record<string, Resource> = {
  pack_prompts_pymes: {
    id: 'pack_prompts_pymes',
    titulo: 'Pack de prompts para PYMEs',
    url: 'https://www.crececonia.cl', // alojado en crececonia.cl; confirmar deep-link exacto si lo hay
    descripcion: 'Plantillas de prompts listos para usar en una pyme.',
  },
  curso_ia_basico: {
    id: 'curso_ia_basico',
    titulo: 'Curso básico de IA para PYMEs (PDF)',
    url: 'https://www.crececonia.cl', // alojado en crececonia.cl; confirmar deep-link exacto si lo hay
    descripcion: 'Curso introductorio en PDF para partir con IA en tu pyme.',
  },
};

export function getResource(id: string): Resource | undefined {
  return RESOURCES[id];
}
