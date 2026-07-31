/**
 * HTML sanitization utility for user-generated content
 * used in email templates and other HTML contexts.
 */

/**
 * Escapes HTML special characters to prevent XSS in HTML email templates.
 * Always use this function when interpolating user data into HTML strings.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
