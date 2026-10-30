/**
 * Service Worker Registration Helper for Unako SACCOS PWA
 */

export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      // In development mode, Vite handles its own HMR service workers; we can still register or let it run
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          if (registration.installing) {
            // Service worker installing
          } else if (registration.active) {
            // Service worker active
          }
        })
        .catch(() => {
          // Non-blocking fail-safe
        });
    });
  }
}

