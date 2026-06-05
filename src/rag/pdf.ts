import { extractText, getDocumentProxy } from 'unpdf';

/** Extrae texto de un PDF (compatible con Workers vía unpdf). */
export async function extractPdfText(data: ArrayBuffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(data));
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join('\n') : text;
}
