import { describe, it, expect } from 'vitest';
import { chunkText } from '../src/rag/chunk';

describe('chunkText', () => {
  it('devuelve [] con texto vacío', () => {
    expect(chunkText('   ', 'x')).toEqual([]);
  });

  it('trocea texto largo con ids estables (idempotente)', () => {
    const text = 'palabra '.repeat(800); // ~6400 chars
    const a = chunkText(text, 'src');
    const b = chunkText(text, 'src');
    expect(a.length).toBeGreaterThan(1);
    expect(a.map((c) => c.id)).toEqual(b.map((c) => c.id));
    expect(a.every((c) => c.text.length > 0)).toBe(true);
  });

  it('cambia los ids si cambia la fuente', () => {
    const text = 'hola '.repeat(800);
    const a = chunkText(text, 'src-a');
    const b = chunkText(text, 'src-b');
    expect(a[0].id).not.toEqual(b[0].id);
  });
});
