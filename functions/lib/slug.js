/**
 * Survey template slug: lowercase alphanumeric + hyphens, 1–64 chars.
 */

const SLUG_RE = /^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$/;

function isValidSlug(s) {
  if (typeof s !== "string") return false;
  const t = s.trim().toLowerCase();
  return t.length >= 1 && t.length <= 64 && SLUG_RE.test(t);
}

function normalizeSlug(s) {
  if (typeof s !== "string") return "";
  return s.trim().toLowerCase();
}

module.exports = { isValidSlug, normalizeSlug };
