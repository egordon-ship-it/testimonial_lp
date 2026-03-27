const admin = require("firebase-admin");
const { isValidSlug, normalizeSlug } = require("./slug");
const { isSafeGoogleReviewUrl } = require("./googleUrl");

const COLLECTION = "survey_templates";

function db() {
  return admin.firestore();
}

function templateRef(slug) {
  return db().collection(COLLECTION).doc(slug);
}

function sanitizeTemplateBody(data) {
  const name = data.name != null ? String(data.name).trim().slice(0, 200) : "";
  const introHeadline =
    data.introHeadline != null ? String(data.introHeadline).trim().slice(0, 500) : "";
  const introBody = data.introBody != null ? String(data.introBody).trim().slice(0, 2000) : "";
  const googleReviewUrl =
    data.googleReviewUrl != null ? String(data.googleReviewUrl).trim().slice(0, 2048) : "";
  const thankYouTitle =
    data.thankYouTitle != null ? String(data.thankYouTitle).trim().slice(0, 300) : "";
  const thankYouSubtitle =
    data.thankYouSubtitle != null ? String(data.thankYouSubtitle).trim().slice(0, 500) : "";
  const thankYouHint =
    data.thankYouHint != null ? String(data.thankYouHint).trim().slice(0, 300) : "";
  return {
    name,
    introHeadline,
    introBody,
    googleReviewUrl,
    thankYouTitle,
    thankYouSubtitle,
    thankYouHint,
  };
}

function validateTemplateFields(data, requireName) {
  const s = sanitizeTemplateBody(data);
  if (requireName && !s.name) {
    return { ok: false, error: "name is required" };
  }
  if (s.googleReviewUrl && !isSafeGoogleReviewUrl(s.googleReviewUrl)) {
    return { ok: false, error: "googleReviewUrl must be a valid https URL (Google review link)" };
  }
  return { ok: true, data: s };
}

function toPublicDoc(slug, doc) {
  if (!doc.exists) return null;
  const d = doc.data();
  return {
    slug,
    name: d.name || slug,
    introHeadline: d.introHeadline || "",
    introBody: d.introBody || "",
    googleReviewUrl: d.googleReviewUrl || "",
    thankYouTitle: d.thankYouTitle || "",
    thankYouSubtitle: d.thankYouSubtitle || "",
    thankYouHint: d.thankYouHint || "",
    updatedAt: d.updatedAt?.toMillis?.() || null,
  };
}

async function getTemplateBySlug(slug) {
  const normalized = normalizeSlug(slug);
  if (!isValidSlug(normalized)) return null;
  const snap = await templateRef(normalized).get();
  return toPublicDoc(normalized, snap);
}

async function listTemplates() {
  const snap = await db().collection(COLLECTION).limit(100).get();
  const out = [];
  snap.forEach((doc) => {
    const d = doc.data();
    out.push({
      slug: doc.id,
      name: d.name || doc.id,
      updatedAt: d.updatedAt?.toMillis?.() || null,
      googleReviewUrl: d.googleReviewUrl ? "(set)" : "",
    });
  });
  out.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return out;
}

async function createTemplate(slug, body, updatedByEmail) {
  const normalized = normalizeSlug(slug);
  if (!isValidSlug(normalized)) {
    return { ok: false, status: 400, error: "Invalid slug" };
  }
  const v = validateTemplateFields(body, true);
  if (!v.ok) return { ok: false, status: 400, error: v.error };
  const ref = templateRef(normalized);
  const existing = await ref.get();
  if (existing.exists) {
    return { ok: false, status: 409, error: "A template with this slug already exists" };
  }
  const now = admin.firestore.FieldValue.serverTimestamp();
  await ref.set({
    ...v.data,
    slug: normalized,
    createdAt: now,
    updatedAt: now,
    updatedByEmail: updatedByEmail || null,
  });
  const created = await ref.get();
  return { ok: true, template: toPublicDoc(normalized, created) };
}

async function updateTemplate(slug, body, updatedByEmail) {
  const normalized = normalizeSlug(slug);
  if (!isValidSlug(normalized)) {
    return { ok: false, status: 400, error: "Invalid slug" };
  }
  const ref = templateRef(normalized);
  const existing = await ref.get();
  if (!existing.exists) {
    return { ok: false, status: 404, error: "Template not found" };
  }
  const patch = {};
  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    patch.name = body.name != null ? String(body.name).trim().slice(0, 200) : "";
    if (!patch.name) {
      return { ok: false, status: 400, error: "name cannot be empty" };
    }
  }
  const textFields = [
    "introHeadline",
    "introBody",
    "googleReviewUrl",
    "thankYouTitle",
    "thankYouSubtitle",
    "thankYouHint",
  ];
  for (const key of textFields) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      const raw = body[key];
      let val = raw != null ? String(raw).trim() : "";
      const max = key === "introBody" ? 2000 : key === "googleReviewUrl" ? 2048 : 500;
      val = val.slice(0, max);
      patch[key] = val;
    }
  }
  if (patch.googleReviewUrl && !isSafeGoogleReviewUrl(patch.googleReviewUrl)) {
    return { ok: false, status: 400, error: "googleReviewUrl must be a valid https URL (Google review link)" };
  }
  if (Object.keys(patch).length === 0) {
    return { ok: false, status: 400, error: "No fields to update" };
  }
  const now = admin.firestore.FieldValue.serverTimestamp();
  patch.updatedAt = now;
  patch.updatedByEmail = updatedByEmail || null;
  await ref.update(patch);
  const updated = await ref.get();
  return { ok: true, template: toPublicDoc(normalized, updated) };
}

async function deleteTemplate(slug) {
  const normalized = normalizeSlug(slug);
  if (!isValidSlug(normalized)) {
    return { ok: false, status: 400, error: "Invalid slug" };
  }
  const ref = templateRef(normalized);
  const existing = await ref.get();
  if (!existing.exists) {
    return { ok: false, status: 404, error: "Template not found" };
  }
  await ref.delete();
  return { ok: true };
}

async function duplicateTemplate(fromSlug, newSlug, newName, updatedByEmail) {
  const from = normalizeSlug(fromSlug);
  const to = normalizeSlug(newSlug);
  if (!isValidSlug(from) || !isValidSlug(to)) {
    return { ok: false, status: 400, error: "Invalid slug" };
  }
  const src = await templateRef(from).get();
  if (!src.exists) {
    return { ok: false, status: 404, error: "Source template not found" };
  }
  const dest = await templateRef(to).get();
  if (dest.exists) {
    return { ok: false, status: 409, error: "Target slug already exists" };
  }
  const d = src.data();
  const name = (newName && String(newName).trim()) || `${d.name || from} (copy)`;
  const now = admin.firestore.FieldValue.serverTimestamp();
  await templateRef(to).set({
    name: name.slice(0, 200),
    introHeadline: d.introHeadline || "",
    introBody: d.introBody || "",
    googleReviewUrl: d.googleReviewUrl || "",
    thankYouTitle: d.thankYouTitle || "",
    thankYouSubtitle: d.thankYouSubtitle || "",
    thankYouHint: d.thankYouHint || "",
    slug: to,
    createdAt: now,
    updatedAt: now,
    updatedByEmail: updatedByEmail || null,
  });
  const created = await templateRef(to).get();
  return { ok: true, template: toPublicDoc(to, created) };
}

module.exports = {
  getTemplateBySlug,
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  isValidSlug,
  normalizeSlug,
};
