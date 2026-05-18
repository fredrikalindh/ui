import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';

// Fumadocs content loader for the /docs route.
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});