import { build } from 'esbuild';

const { POSTHOG_PROJECT_TOKEN: token, POSTHOG_HOST: host } = process.env;
if (!token?.startsWith('phc_') || !host || new URL(host).protocol !== 'https:') {
  throw new Error('Renseigner POSTHOG_PROJECT_TOKEN et POSTHOG_HOST dans .env.');
}

await build({
  entryPoints: ['js/analytics.js'],
  outdir: 'assets/analytics',
  bundle: true,
  splitting: true,
  format: 'esm',
  target: 'es2020',
  minify: true,
  legalComments: 'eof',
  define: {
    'process.env.POSTHOG_PROJECT_TOKEN': JSON.stringify(token),
    'process.env.POSTHOG_HOST': JSON.stringify(host),
  },
});
console.log('Intégration PostHog générée dans assets/analytics/.');
