const HUBSPOT_SUBMIT_URL = "https://api.hsforms.com/submissions/v3/integration/secure/submit";

function getHubSpotConfig() {
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const formGuid = process.env.HUBSPOT_FORM_GUID;
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!portalId || !formGuid || !accessToken) {
    return null;
  }
  return { portalId, formGuid, accessToken };
}

/**
 * Build HubSpot form fields array from our survey payload.
 */
function buildHubSpotFields(payload) {
  const {
    rating,
    path,
    feedback,
    permission,
    feedback_title: titleFromPayload,
    email,
    contact_id,
    survey_id,
    survey_type,
    survey_template_key,
    pageUri,
  } = payload;
  const feedbackTitle =
    titleFromPayload && String(titleFromPayload).trim()
      ? String(titleFromPayload).trim()
      : `Survey – ${path} – ${rating} star${rating !== 1 ? "s" : ""}`;
  const fields = [
    { name: "feedback_title", value: feedbackTitle },
    { name: "survey_rating", value: String(rating) },
    { name: "feedback_path", value: path },
    { name: "survey_feedback", value: feedback || "" },
    { name: "survey_status", value: "completed" },
    { name: "submitted_at", value: new Date().toISOString() },
  ];
  if (email) {
    fields.push({ name: "email", value: email });
  }
  if (contact_id) {
    fields.push({ name: "contact_id", value: contact_id });
  }
  if (survey_id) {
    fields.push({ name: "survey_id", value: survey_id });
  }
  if (survey_type) {
    fields.push({ name: "survey_type", value: survey_type });
  }
  if (survey_template_key) {
    fields.push({ name: "survey_template_key", value: survey_template_key });
  }
  if (pageUri) {
    fields.push({ name: "submission_url", value: pageUri });
  }
  if (path === "testimonial" && permission != null) {
    fields.push({ name: "testimonial_permission", value: permission });
  }
  return fields;
}

module.exports = { HUBSPOT_SUBMIT_URL, getHubSpotConfig, buildHubSpotFields };
