/**
 * Phase 1: Backend proxy for testimonial survey → HubSpot Forms API.
 * Keeps HubSpot credentials server-side and validates payloads.
 * CommonJS for compatibility with firebase serve (legacy emulator).
 */

const { onRequest } = require("firebase-functions/v2/https");

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
 * Map to whatever field names you create in your HubSpot form.
 * feedback_title is required by HubSpot for Customer Feedback records.
 */
function buildHubSpotFields(payload) {
  const { rating, path, feedback, permission, feedback_title: titleFromPayload, email, contact_id } = payload;
  const feedbackTitle =
    titleFromPayload && String(titleFromPayload).trim()
      ? String(titleFromPayload).trim()
      : `Survey – ${path} – ${rating} star${rating !== 1 ? "s" : ""}`;
  const fields = [
    { name: "feedback_title", value: feedbackTitle },
    { name: "star_rating", value: String(rating) },
    { name: "feedback_path", value: path },
    { name: "feedback_text", value: feedback || "" },
  ];
  if (email) {
    fields.push({ name: "email", value: email });
  }
  if (contact_id) {
    fields.push({ name: "contact_id", value: contact_id });
  }
  if (path === "testimonial" && permission != null) {
    fields.push({ name: "marketing_permission", value: permission });
  }
  return fields;
}

/**
 * Validate incoming survey payload.
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
  const contact_id = body.contact_id != null ? String(body.contact_id).trim() : (body.contactId != null ? String(body.contactId).trim() : undefined);
  return {
    ok: true,
    payload: { rating: r, path, feedback, permission: permission || undefined, feedback_title, email: email || undefined, contact_id: contact_id || undefined },
  };
}

/**
 * POST /api/submit-survey
 * Body: { rating: 1-5, path: "recovery"|"improvement"|"testimonial", feedback?: string, permission?: "yes"|"no", feedback_title?: string, email?: string, contact_id?: string }
 */
const submitSurvey = onRequest(
  { cors: false },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const validation = validatePayload(req.body);
    if (!validation.ok) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const config = getHubSpotConfig();
    if (!config) {
      if (process.env.FUNCTIONS_EMULATOR === "true") {
        console.log("[demo] Survey submitted (HubSpot not configured):", JSON.stringify(validation.payload));
        res.status(200).json({ success: true });
        return;
      }
      console.error("HubSpot config missing: HUBSPOT_PORTAL_ID, HUBSPOT_FORM_GUID, HUBSPOT_ACCESS_TOKEN");
      res.status(503).json({ error: "Survey submission is not configured" });
      return;
    }

    const { portalId, formGuid, accessToken } = config;
    const fields = buildHubSpotFields(validation.payload);
    const submitBody = {
      fields,
      submittedAt: Date.now(),
      context: {
        pageUri: req.body.pageUri || "",
        pageName: req.body.pageName || "Testimonial Survey",
      },
    };

    const url = `${HUBSPOT_SUBMIT_URL}/${portalId}/${formGuid}`;
    try {
      const hubRes = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(submitBody),
      });

      if (!hubRes.ok) {
        const text = await hubRes.text();
        console.error("HubSpot submit failed", hubRes.status, text);
        res.status(502).json({ error: "Failed to submit to HubSpot" });
        return;
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("HubSpot request error", err);
      res.status(502).json({ error: "Failed to submit to HubSpot" });
    }
  }
);

exports.submitSurvey = submitSurvey;
