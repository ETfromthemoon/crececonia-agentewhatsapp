import { describe, it, expect } from 'vitest';
import { toMessages } from '../src/brain/memory';

describe('toMessages (normalización de roles para Claude)', () => {
  it('sin historial: solo el mensaje actual del usuario', () => {
    expect(toMessages([], 'hola')).toEqual([{ role: 'user', content: 'hola' }]);
  });

  it('descarta mensajes assistant al inicio (debe empezar en user)', () => {
    const out = toMessages(
      [
        { direction: 'outbound', body: 'A1' },
        { direction: 'inbound', body: 'U1' },
      ],
      'U2',
    );
    // A1 (assistant inicial) se descarta; U1 y U2 (consecutivos user) se fusionan.
    expect(out).toEqual([{ role: 'user', content: 'U1\nU2' }]);
  });

  it('mantiene la alternancia user/assistant', () => {
    const out = toMessages(
      [
        { direction: 'inbound', body: 'U1' },
        { direction: 'outbound', body: 'A1' },
      ],
      'U2',
    );
    expect(out).toEqual([
      { role: 'user', content: 'U1' },
      { role: 'assistant', content: 'A1' },
      { role: 'user', content: 'U2' },
    ]);
  });

  it('filtra cuerpos vacíos y fusiona roles consecutivos', () => {
    const out = toMessages(
      [
        { direction: 'inbound', body: '   ' },
        { direction: 'inbound', body: 'U1' },
      ],
      'U2',
    );
    expect(out).toEqual([{ role: 'user', content: 'U1\nU2' }]);
  });
});
