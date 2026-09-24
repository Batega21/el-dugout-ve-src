/**
 * Admin route prefixes for identifying features restricted to administrators.
 */
export const ADMIN_ROUTE_PREFIXES = ['/admin', '/users'] as const;

/**
 * Checks whether a given URL path corresponds to an admin-only feature.
 * Automatically handles query parameters, fragment identifiers, and trailing slashes.
 *
 * @param url The target URL or route string.
 * @returns boolean indicating if the route belongs to an admin feature.
 */
export function isAdminRoute(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }

  // Strip query parameters and fragment identifiers
  const pathWithoutQuery = url.split('?')[0].split('#')[0].trim();
  const normalizedPath = pathWithoutQuery.replace(/\/+$/, '') || '/';

  return ADMIN_ROUTE_PREFIXES.some(
    (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );
}
