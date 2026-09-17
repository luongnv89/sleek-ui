import { useEffect, useMemo, useState } from 'react';
import { loadDesigns } from '@/data/designs';
import type { Collection, TransformedDesign } from '@/types/design';

export type CollectionFilter = Collection | 'all';

function belongsToCollection(design: TransformedDesign, collection: Collection): boolean {
  if (collection === 'web') return (design.collection ?? 'web') === 'web';
  return design.collection === collection || design.categories.includes(collection);
}

export function groupByCollection(designs: TransformedDesign[]): Record<Collection, TransformedDesign[]> {
  return {
    web: designs.filter(d => belongsToCollection(d, 'web')),
    terminal: designs.filter(d => belongsToCollection(d, 'terminal')),
    coding: designs.filter(d => belongsToCollection(d, 'coding')),
  };
}

export function filterByCollection(
  designs: TransformedDesign[],
  collection: CollectionFilter,
): TransformedDesign[] {
  if (collection === 'all') return designs;
  return designs.filter(d => belongsToCollection(d, collection));
}

export function useDesignCatalog(collectionFilter: CollectionFilter = 'all'): {
  designs: TransformedDesign[];
  loading: boolean;
  counts: Record<Collection, number>;
  total: number;
} {
  const [designs, setDesigns] = useState<TransformedDesign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    loadDesigns().then(list => {
      if (!alive) return;
      setDesigns(list);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const counts = useMemo(() => {
    const grouped = groupByCollection(designs);
    return {
      web: grouped.web.length,
      terminal: grouped.terminal.length,
      coding: grouped.coding.length,
    };
  }, [designs]);

  const filtered = useMemo(
    () => filterByCollection(designs, collectionFilter),
    [designs, collectionFilter],
  );

  return { designs: filtered, loading, counts, total: designs.length };
}
