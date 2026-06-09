import { describe, it, expect } from 'vitest';
import { timingSafeEqual } from '../src/lib/safeEqual';

describe('timingSafeEqual', () => {
  it('true para strings iguales', () => {
    expect(timingSafeEqual('s3cr3t-token', 's3cr3t-token')).toBe(true);
  });

  it('false para strings distintos de igual longitud', () => {
    expect(timingSafeEqual('abcdef', 'abcdeg')).toBe(false);
  });

  it('false para longitudes distintas', () => {
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
  });

  it('false si uno está vacío', () => {
    expect(timingSafeEqual('', 'token')).toBe(false);
  });
});
