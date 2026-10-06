// TEMPORARY sandbox test config (owned by auth-fixer): the project's
// vite.config.ts pulls in @tailwindcss/vite, whose config bundling triggers a
// blocked piped-stdio spawn (EPERM) under the DSH Windows sandbox.
// Loaded with `--configLoader runner` so the config is never bundled by rolldown.
export default {
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
};
