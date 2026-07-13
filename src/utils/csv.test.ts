import { describe, expect, it } from 'vitest';
import { toCsvCell } from './csv';

describe('ekspor CSV aman', () => {
  it.each(['=HYPERLINK("https://jahat.test")', '+SUM(1,2)', '-2+3', '@CMD'])('menetralkan formula %s', (value) => {
    expect(toCsvCell(value)).toMatch(/^"'/);
  });

  it('menggandakan tanda kutip dan mempertahankan teks biasa', () => {
    expect(toCsvCell('Budi "HD"')).toBe('"Budi ""HD"""');
    expect(toCsvCell('000123')).toBe('"000123"');
  });
});
