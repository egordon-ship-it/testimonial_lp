/**
 * Allow only https URLs for Google review links (open-redirect hardening).
 */

function isSafeGoogleReviewUrl(url) {
  if (url == null || url === "") return true;
  if (typeof url !== "string") return false;
  const t = url.trim();
  if (t.length > 2048) return false;
  try {
    const u = new URL(t);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (
      host === "g.page" ||
      host === "maps.app.goo.gl" ||
      host.endsWith(".google.com") ||
      host.endsWith(".goo.gl") ||
      host === "search.google.com" ||
      host === "www.google.com"
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

module.exports = { isSafeGoogleReviewUrl };
