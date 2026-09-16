import type { Collection } from '../types/design';

export const COLLECTION_LABELS: Record<Collection, string> = {
  web: 'Web',
  terminal: 'Terminal',
  coding: 'Coding',
};

export function getCollectionLabel(collection: Collection): string {
  return COLLECTION_LABELS[collection];
}
