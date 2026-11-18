// lib/paths.ts — Base-aware URLs for public assets.
//
// The app can be served from a sub-path (e.g. a GitHub Pages project site at
// /Rapidsteps-Mehlaman-and-uworld-combined/). Vite's BASE_URL is '/' for a
// root deployment and '/<repo>/' for a sub-path build (see vite.config.ts and
// the PAGES_BASE env var). Prefix every root-absolute public path with it so
// data fetches, images, and videos resolve in both cases. External,
// data:, and blob: URLs pass through untouched.

export function publicUrl(p: string): string {
  if (!p) return p;
  if (/^(https?:|data:|blob:)/i.test(p)) return p;
  const base = import.meta.env.BASE_URL; // always ends with '/'
  if (p.startsWith('/')) return base + p.slice(1);
  return base + p;
}
