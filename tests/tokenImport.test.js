import { describe, it, expect } from 'vitest';
import { parseTokenImport, rowsToTokens } from '../src/data/tokenImport.js';

const existing = [{ id: 'a', name: 'color.brand.primary', value: '#315FCE', type: 'color' }];

describe('parseTokenImport', () => {
  it('reports invalid JSON', () => {
    expect(parseTokenImport('{nope', existing).fileError).toBeTruthy();
  });

  it('reports an empty list and unsupported top-level values', () => {
    expect(parseTokenImport('[]', existing).fileError).toBeTruthy();
    expect(parseTokenImport('12', existing).fileError).toBeTruthy();
  });

  it('accepts an array, a tokens wrapper and a name-keyed object', () => {
    const arr = parseTokenImport('[{"name":"a.b","value":"1px","type":"dimension"}]', []);
    const wrapped = parseTokenImport('{"tokens":[{"name":"a.b","value":"1px","type":"dimension"}]}', []);
    const keyed = parseTokenImport('{"a.b":{"value":"1px","type":"dimension"},"c.d":"red"}', []);
    expect(arr.rows[0].status).toBe('new');
    expect(wrapped.rows[0].status).toBe('new');
    expect(keyed.rows.map((r) => r.status)).toEqual(['new', 'new']);
    expect(keyed.rows[1].type).toBe('string');
  });

  it('marks duplicates of existing tokens as skipped, ignoring case', () => {
    const { rows } = parseTokenImport('[{"name":"Color.Brand.Primary","value":"#000","type":"color"}]', existing);
    expect(rows[0].status).toBe('duplicate');
  });

  it('marks repeats inside the file as skipped after the first', () => {
    const { rows } = parseTokenImport('[{"name":"x","value":"1"},{"name":"X","value":"2"}]', []);
    expect(rows.map((r) => r.status)).toEqual(['new', 'duplicate']);
  });

  it('flags missing fields, bad names and unsupported types', () => {
    const { rows } = parseTokenImport(
      '[{"value":"1"},{"name":"has space","value":"1"},{"name":"ok"},{"name":"t","value":"1","type":"gradient"}]',
      [],
    );
    expect(rows.map((r) => r.status)).toEqual(['invalid', 'invalid', 'invalid', 'invalid']);
    expect(rows[3].error).toContain('gradient');
  });

  it('only turns new rows into tokens and never touches existing data', () => {
    const { rows } = parseTokenImport(
      '[{"name":"new.one","value":"1px","type":"dimension"},{"name":"color.brand.primary","value":"#000","type":"color"},{"name":"bad name","value":"1"}]',
      existing,
    );
    const tokens = rowsToTokens(rows, () => 'id-1');
    expect(tokens).toEqual([
      { id: 'id-1', name: 'new.one', value: '1px', type: 'dimension', description: '', group: 'Primitive' },
    ]);
  });
});
