/**
 * Catálogo de recursos de regalo / lead magnets que el agente puede compartir
 * (tool enviar_recurso). Las URLs reales se completan al subir el material a R2
 * o al tener el enlace público.
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
    url: '', // TODO: enlace real (R2 o público)
    descripcion: 'Plantillas de prompts listos para usar en una pyme.',
  },
  curso_ia_basico: {
    id: 'curso_ia_basico',
    titulo: 'Curso básico de IA para PYMEs (PDF)',
    url: '', // TODO: enlace de acceso/compra
    descripcion: 'Curso introductorio en PDF para partir con IA en tu pyme.',
  },
};

export function getResource(id: string): Resource | undefined {
  return RESOURCES[id];
}
