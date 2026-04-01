/**
 * Before POSTing a DM Customer Feedback record, align with HubSpot schema:
 * primary display property + any required properties (from schema or property definitions).
 */

const { hubspotFetch } = require("./hubspotApi");

const CACHE_TTL_MS = 5 * 60 * 1000;
const schemaCache = new Map();
const propertiesCache = new Map();

function cacheGet(map, key) {
  const e = map.get(key);
  if (!e || Date.now() - e.at > CACHE_TTL_MS) return null;
  return e.data;
}

function cacheSet(map, key, data) {
  map.set(key, { data, at: Date.now() });
}

/**
 * @param {object} prop - HubSpot property definition from /crm/v3/properties
 * @param {string} nowIso
 * @returns {string|null} null = skip (read-only / unknown)
 */
function defaultValueForRequiredProperty(prop, nowIso) {
  if (!prop || !prop.name) return null;
  const meta = prop.modificationMetadata || {};
  if (meta.readOnlyValue === true || meta.readOnlyDefinition === true) return null;

  const ft = prop.fieldType || "";
  const t = prop.type || "";

  if (ft === "booleancheckbox" || t === "bool") return "false";
  if (ft === "checkbox") return "false";
  if (ft === "date") return nowIso.slice(0, 10);
  if (ft === "calculation_equation") return null;

  if (ft === "select" || ft === "radio" || t === "enumeration") {
    const opts = prop.options || [];
    if (opts.length) return String(opts[0].value);
    return null;
  }

  if (ft === "number" || t === "number") return "0";

  return "n/a";
}

function buildDisplayLabel(payload, newSurveyId) {
  const parts = [payload.survey_type || "support", newSurveyId.slice(0, 8)];
  if (payload.email && String(payload.email).trim()) {
    parts.push(String(payload.email).trim());
  }
  return parts.join(" · ");
}

/**
 * @returns {Promise<void>} mutates `createProps`
 */
async function fillDmCustomerFeedbackCreateProperties(objectTypeId, accessToken, createProps, payload, newSurveyId, nowIso) {
  const id = encodeURIComponent(objectTypeId);

  let schema = cacheGet(schemaCache, objectTypeId);
  if (schema === null) {
    const schemaRes = await hubspotFetch(`/crm/v3/schemas/${id}`, accessToken);
    if (schemaRes.ok && schemaRes.data) {
      schema = schemaRes.data;
      cacheSet(schemaCache, objectTypeId, schema);
    } else {
      schema = null;
      if (schemaRes.status === 403 || schemaRes.status === 401) {
        console.warn(
          "hubspotCreateProperties: GET /crm/v3/schemas failed (add crm.schemas.custom.read to the private app, or set HUBSPOT_DM_CF_DISPLAY_NAME_PROPERTY).",
          schemaRes.status
        );
      }
    }
  }

  let propertyList = cacheGet(propertiesCache, objectTypeId);
  if (propertyList === null) {
    const propRes = await hubspotFetch(`/crm/v3/properties/${id}?limit=500`, accessToken);
    if (!propRes.ok || !propRes.data || !Array.isArray(propRes.data.results)) {
      console.warn("hubspotCreateProperties: GET /crm/v3/properties failed", propRes.status, propRes.data);
      propertyList = [];
    } else {
      propertyList = propRes.data.results;
      cacheSet(propertiesCache, objectTypeId, propertyList);
    }
  }

  const byName = new Map(propertyList.map((p) => [p.name, p]));

  let primaryName =
    (schema && schema.primaryDisplayProperty) ||
    process.env.HUBSPOT_DM_CF_DISPLAY_NAME_PROPERTY ||
    "name";

  if (primaryName.includes(",")) {
    const candidates = primaryName.split(",").map((s) => s.trim()).filter(Boolean);
    primaryName = candidates.find((c) => byName.has(c)) || candidates[0] || "name";
  }

  if (byName.size && !byName.has(primaryName) && byName.has("customer_feedback")) {
    primaryName = "customer_feedback";
  }

  if (!Object.prototype.hasOwnProperty.call(createProps, primaryName) || createProps[primaryName] === "") {
    createProps[primaryName] = buildDisplayLabel(payload, newSurveyId);
  }

  const requiredNames = new Set();
  if (schema && Array.isArray(schema.requiredProperties)) {
    schema.requiredProperties.forEach((n) => n && requiredNames.add(n));
  }
  for (const p of propertyList) {
    if (p.required) requiredNames.add(p.name);
  }

  for (const propName of requiredNames) {
    const v = createProps[propName];
    if (v !== undefined && v !== null && String(v).trim() !== "") continue;

    const def = byName.get(propName);
    const fill = def ? defaultValueForRequiredProperty(def, nowIso) : "n/a";
    if (fill != null) {
      createProps[propName] = fill;
    }
  }
}

function formatHubSpotErrorMessage(data) {
  if (!data || typeof data !== "object") return "";
  const base = (data.message || data.error) || "HubSpot request failed";
  if (Array.isArray(data.errors) && data.errors.length) {
    const parts = data.errors
      .map((e) => (e && (e.message || e.error)) || JSON.stringify(e))
      .filter(Boolean)
      .slice(0, 5);
    if (parts.length) return `${base} — ${parts.join("; ")}`;
  }
  return base;
}

module.exports = {
  fillDmCustomerFeedbackCreateProperties,
  formatHubSpotErrorMessage,
};
