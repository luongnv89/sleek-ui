import { useEffect, useState } from 'react';
import { loadDesigns } from '@/data/designs';
import type { TransformedDesign } from '@/types/design';

export function useDesignCatalog(): {
  designs: TransformedDesign[];
  loading: boolean;
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

  return { designs, loading };
}
