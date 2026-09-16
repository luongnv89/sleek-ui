import { COLLECTION_LABELS, getCollectionLabel } from '../collections';

describe('collections labels (#181)', () => {
  it('maps every collection to a capitalized label', () => {
    expect(COLLECTION_LABELS).toEqual({ web: 'Web', terminal: 'Terminal', coding: 'Coding' });
  });

  it('resolves labels through the getter', () => {
    expect(getCollectionLabel('web')).toBe('Web');
    expect(getCollectionLabel('terminal')).toBe('Terminal');
    expect(getCollectionLabel('coding')).toBe('Coding');
  });
});
