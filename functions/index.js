/**
 * Survey backend: HubSpot submit, public survey config, admin CRUD (Firestore).
 */

const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");

const { applyCors, handleOptions } = require("./lib/cors");
const { HUBSPOT_SUBMIT_URL, getHubSpotConfig, buildHubSpotFields } = require("./lib/hubspot");
const { validatePayload } = require("./lib/surveyPayload");
const { isValidSlug, normalizeSlug } = require("./lib/slug");
const templatesStore = require("./lib/templatesStore");

if (!admin.apps.length) {
  admin.initializeApp();
}

async function requireAdmin(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const email = decoded.email || "";
    const allowRaw = process.env.ADMIN_EMAIL_ALLOWLIST || "";
    const set = allowRaw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (!set.length) {
      console.warn("ADMIN_EMAIL_ALLOWLIST empty; denying admin access");
      res.status(403).json({ error: "Admin access not configured" });
      return null;
    }
    if (!email || !set.includes(email.toLowerCase())) {
      res.status(403).json({ error: "Forbidden" });
      return null;
    }
    return { email, uid: decoded.uid };
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
    return null;
  }
}

const submitSurvey = onRequest({ cors: false, invoker: "public" }, async (req, res) => {
  applyCors(req, res);
  if (handleOptions(req, res)) return;
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
});

const getSurveyConfig = onRequest({ cors: false, invoker: "public" }, async (req, res) => {
  applyCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const templateParam = req.query.template != null ? String(req.query.template) : "default";
  const slug = normalizeSlug(templateParam) || "default";

  if (!isValidSlug(slug)) {
    res.status(400).json({ error: "Invalid template parameter" });
    return;
  }

  try {
    const template = await templatesStore.getTemplateBySlug(slug);
    if (!template) {
      res.status(404).json({ error: "not_found", slug });
      return;
    }
    res.set("Cache-Control", "public, max-age=60");
    res.status(200).json({
      slug: template.slug,
      survey_template_key: template.slug,
      introHeadline: template.introHeadline,
      introBody: template.introBody,
      googleReviewUrl: template.googleReviewUrl,
      thankYouTitle: template.thankYouTitle,
      thankYouSubtitle: template.thankYouSubtitle,
      thankYouHint: template.thankYouHint,
    });
  } catch (err) {
    console.error("getSurveyConfig", err);
    res.status(500).json({ error: "Failed to load survey config" });
  }
});

const adminSurveyTemplates = onRequest({ cors: false, invoker: "public" }, async (req, res) => {
  applyCors(req, res);
  if (handleOptions(req, res)) return;

  const user = await requireAdmin(req, res);
  if (!user) return;

  try {
    if (req.method === "GET") {
      const slug = req.query.slug != null ? String(req.query.slug).trim() : "";
      if (slug) {
        if (!isValidSlug(normalizeSlug(slug))) {
          res.status(400).json({ error: "Invalid slug" });
          return;
        }
        const t = await templatesStore.getTemplateBySlug(slug);
        if (!t) {
          res.status(404).json({ error: "not_found" });
          return;
        }
        res.status(200).json(t);
        return;
      }
      const list = await templatesStore.listTemplates();
      res.status(200).json({ templates: list });
      return;
    }

    if (req.method === "POST") {
      const body = req.body || {};
      if (body.action === "duplicate") {
        const fromSlug = body.fromSlug != null ? String(body.fromSlug) : "";
        const newSlug = body.newSlug != null ? String(body.newSlug) : "";
        const newName = body.newName != null ? String(body.newName) : "";
        const result = await templatesStore.duplicateTemplate(fromSlug, newSlug, newName, user.email);
        if (!result.ok) {
          res.status(result.status).json({ error: result.error });
          return;
        }
        res.status(201).json(result.template);
        return;
      }
      const slug = body.slug != null ? String(body.slug) : "";
      const result = await templatesStore.createTemplate(slug, body, user.email);
      if (!result.ok) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.status(201).json(result.template);
      return;
    }

    if (req.method === "PUT") {
      const body = req.body || {};
      const slug = body.slug != null ? String(body.slug) : "";
      const result = await templatesStore.updateTemplate(slug, body, user.email);
      if (!result.ok) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.status(200).json(result.template);
      return;
    }

    if (req.method === "DELETE") {
      const slug = req.query.slug != null ? String(req.query.slug) : "";
      const result = await templatesStore.deleteTemplate(slug);
      if (!result.ok) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.status(204).send("");
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("adminSurveyTemplates", err);
    res.status(500).json({ error: "Server error" });
  }
});

exports.submitSurvey = submitSurvey;
exports.getSurveyConfig = getSurveyConfig;
exports.adminSurveyTemplates = adminSurveyTemplates;
