const { normalizeSlug } = require("./slug");

/**
 * Validate incoming survey payload (submit-survey).
 */
function validatePayload(body) {
  if (!body || typeof body !== "object") return { ok: false, error: "Missing body" };
  const rating = body.rating;
  const path = body.path;
  if (rating == null || path == null) {
    return { ok: false, error: "Missing rating or path" };
  }
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    return { ok: false, error: "Invalid rating" };
  }
  const validPaths = ["recovery", "improvement", "testimonial"];
  if (!validPaths.includes(path)) {
    return { ok: false, error: "Invalid path" };
  }
  const feedback = body.feedback != null ? String(body.feedback).trim() : "";
  const permission = body.permission != null ? String(body.permission) : null;
  if (path === "testimonial" && permission != null && !["yes", "no"].includes(permission)) {
    return { ok: false, error: "Invalid permission" };
  }
  const feedback_title = body.feedback_title != null ? String(body.feedback_title).trim() : undefined;
  const email = body.email != null ? String(body.email).trim() : undefined;
  if (email !== undefined && email !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { ok: false, error: "Invalid email" };
    }
  }
  const contact_id =
    body.contact_id != null
      ? String(body.contact_id).trim()
      : body.contactId != null
        ? String(body.contactId).trim()
        : undefined;
  const survey_id = body.survey_id != null ? String(body.survey_id).trim() : undefined;
  if (survey_id !== undefined && survey_id.length > 256) {
    return { ok: false, error: "Invalid survey_id" };
  }
  const surveyTypeRaw =
    body.survey_type != null
      ? String(body.survey_type).trim().toLowerCase()
      : body.type != null
        ? String(body.type).trim().toLowerCase()
        : undefined;
  const allowedSurveyTypes = ["support", "sales", "termination", "onboarding", "install"];
  let survey_type = surveyTypeRaw;
  if (survey_type !== undefined && survey_type !== "" && !allowedSurveyTypes.includes(survey_type)) {
    return { ok: false, error: "Invalid survey_type" };
  }
  if (survey_type === undefined || survey_type === "") {
    survey_type = "support";
  }

  let survey_template_key = "default";
  if (body.survey_template_key != null && String(body.survey_template_key).trim() !== "") {
    const k = normalizeSlug(String(body.survey_template_key));
    if (k.length < 1 || k.length > 64) {
      return { ok: false, error: "Invalid survey_template_key" };
    }
    survey_template_key = k;
  }

  const pageUri = body.pageUri != null ? String(body.pageUri).trim() : undefined;
  if (pageUri !== undefined && pageUri.length > 2048) {
    return { ok: false, error: "Invalid pageUri" };
  }
  return {
    ok: true,
    payload: {
      rating: r,
      path,
      feedback,
      permission: permission || undefined,
      feedback_title,
      email: email || undefined,
      contact_id: contact_id || undefined,
      survey_id: survey_id || undefined,
      survey_type,
      survey_template_key,
      pageUri: pageUri || undefined,
    },
  };
}

module.exports = { validatePayload };
