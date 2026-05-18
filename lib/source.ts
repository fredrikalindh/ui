import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';

// Fumadocs content source for documentation pages served under /docs.
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});