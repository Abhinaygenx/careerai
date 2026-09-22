/**
 * Site-wide configuration and canonical URL helpers.
 * Ensures the production site URL always resolves to https://careerstart.in
 * and prevents any legacy domain (career.ai) or www discrepancies from leaking
 * into sitemaps, robots.txt, metadata, or canonical URLs.
 */

export const CANONICAL_SITE_URL = 'https://careerstart.in';

/**
 * Returns the sanitized canonical base site URL.
 * Even if an environment variable in production or local is configured
 * with the old domain or www prefix, this safely sanitizes it to https://careerstart.in.
 */
export function getSiteUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_URL;

  if (!envUrl) {
    return CANONICAL_SITE_URL;
  }

  const clean = envUrl.trim().replace(/\/+$/, '');

  // Guard against legacy domain, localhost, or www inconsistencies
  if (
    clean.includes('career.ai') ||
    clean.includes('localhost') ||
    clean.includes('127.0.0.1') ||
    clean.includes('www.careerstart.in')
  ) {
    return CANONICAL_SITE_URL;
  }

  return clean;
}
