/** Rastreo básico de contenido web para la base de conocimiento. */

/** Descarga una URL y devuelve su texto plano (limpieza simple de HTML). */
export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  const html = await res.text();
  // TODO: extracción de contenido principal (quitar nav/footer/aside).
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extrae URLs de un sitemap.xml. */
export async function discoverUrls(sitemapUrl: string): Promise<string[]> {
  try {
    const res = await fetch(sitemapUrl);
    const xml = await res.text();
    return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  } catch {
    return [];
  }
}
