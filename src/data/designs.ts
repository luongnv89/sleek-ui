import type { TransformedDesign, DesignData } from '../types/design';
import { transformDesign } from '../lib/transformDesign';

const designModules = import.meta.glob('./designs/*.json', { eager: true });

const isDev = import.meta.env?.DEV ?? false;

const designs: TransformedDesign[] = Object.keys(designModules)
  .sort()
  .map(moduleKey => {
    try {
      const designJson = designModules[moduleKey] as DesignData;
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
  .filter((d): d is TransformedDesign => d !== null);

export default designs;
