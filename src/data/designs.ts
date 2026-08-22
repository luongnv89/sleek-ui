import type { TransformedDesign, DesignData } from '../types/design';
import { transformDesign } from '../lib/transformDesign';

const designModules = import.meta.glob<{ default: DesignData }>('./designs/*.json');

const isDev = import.meta.env?.DEV ?? false;

let designsPromise: Promise<TransformedDesign[]> | null = null;

export function loadDesigns(): Promise<TransformedDesign[]> {
  if (!designsPromise) {
    designsPromise = Promise.all(
      Object.keys(designModules)
        .sort()
        .map(async moduleKey => {
          try {
            const designJson = (await designModules[moduleKey]()).default;
            if (!designJson || !designJson.name) {
              throw new Error('missing or invalid design JSON');
            }
            return transformDesign(designJson);
          } catch (err) {
            if (isDev) {
              console.warn(
                `[designs] Dropping ${moduleKey}: ${err instanceof Error ? err.message : String(err)}`
              );
            }
            return null;
          }
        })
    ).then(list => list.filter((d): d is TransformedDesign => d !== null));
  }
  return designsPromise;
}

export async function loadDesignData(slug: string): Promise<DesignData | null> {
  const loader = designModules[`./designs/${slug}.json`];
  if (!loader) return null;
  try {
    return (await loader()).default;
  } catch {
    return null;
  }
}
