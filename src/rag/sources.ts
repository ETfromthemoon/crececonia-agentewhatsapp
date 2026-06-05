/**
 * Fuentes de la base de conocimiento (RAG) para la ingesta (Workflow rag-ingest).
 * Las URLs concretas se completarán tras revisar el sitemap.
 */
export const KNOWLEDGE_SOURCES = {
  website: 'https://www.crececonia.cl',
  sitemap: 'https://www.crececonia.cl/sitemap.xml',
  instagram: '@crececoniacl',
  urls: [
    'https://www.crececonia.cl',
    // TODO: añadir páginas de servicios, cursos, FAQ y mejores posts del blog.
  ],
};

/**
 * NOTA: crececonia.cl devuelve HTTP 403 a fetchers genéricos (protección anti-bot).
 * Para la ingesta, el Worker debe enviar un User-Agent realista o usar Cloudflare
 * Browser Rendering; alternativamente, cargar el contenido manualmente a R2.
 * Instagram (@crececoniacl) requiere export/copia manual del contenido.
 */
