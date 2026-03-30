/**
 * Canonical survey template: matches static copy in survey.html (support / service experience).
 * Used when Firestore has no `service` doc yet so admin and /api/survey-config still work.
 */
const SERVICE_SLUG = "service";
/** Legacy URL param; resolved to service for config lookup. */
const LEGACY_DEFAULT_SLUG = "default";

function getServiceTemplateDefaults() {
  return {
    slug: SERVICE_SLUG,
    name: "Service",
    introHeadline: "Your feedback matters.",
    introBody:
      "Please take a moment to rate your recent support experience. This survey is optional and takes about a minute.",
    googleReviewUrl: "",
    thankYouTitle: "Thank you for your feedback!",
    thankYouSubtitle:
      "We're glad you had a great experience. Would you be willing to share your review on Google too?",
    thankYouHint: "Copy your review below, then paste it into Google.",
    updatedAt: null,
  };
}

/**
 * Normalize requested template slug for Firestore lookup (default → service).
 */
function resolveTemplateSlugForLookup(rawSlug) {
  const s = String(rawSlug || "").trim().toLowerCase();
  if (s === LEGACY_DEFAULT_SLUG) return SERVICE_SLUG;
  return s;
}

module.exports = {
  SERVICE_SLUG,
  LEGACY_DEFAULT_SLUG,
  getServiceTemplateDefaults,
  resolveTemplateSlugForLookup,
};
