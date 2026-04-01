/**
 * HubSpot CRM sync for survey completion per doc/hubspot-survey-field-mapping-cursor-ready.md
 * — DM Customer Feedback custom object: response + lifecycle
 * — Contact: latest survey snapshot rollup only
 */

const crypto = require("crypto");
const { ALLOWED_SURVEY_TRIGGERS } = require("./hubspotMappingConstants");
const { hubspotFetch } = require("./hubspotApi");
const {
  fillDmCustomerFeedbackCreateProperties,
  formatHubSpotErrorMessage,
} = require("./hubspotCreateProperties");

function getHubSpotCrmConfig() {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
  const objectTypeId = process.env.HUBSPOT_DM_CUSTOMER_FEEDBACK_OBJECT_TYPE_ID;
  if (!accessToken || !objectTypeId || !String(objectTypeId).trim()) {
    return null;
  }
  return {
    accessToken: String(accessToken).trim(),
    objectTypeId: String(objectTypeId).trim(),
    contactAssociationTypeId: process.env.HUBSPOT_DM_CF_CONTACT_ASSOCIATION_TYPE_ID
      ? Number(process.env.HUBSPOT_DM_CF_CONTACT_ASSOCIATION_TYPE_ID)
      : null,
    surveyVersion: process.env.SURVEY_VERSION || "v1",
    surveySourceSystem: process.env.SURVEY_SOURCE_SYSTEM || "testimonial_lp",
  };
}

/**
 * Resolve HubSpot contact id: explicit contact_id, or search by email.
 */
async function resolveContactId(payload, accessToken) {
  if (payload.contact_id && String(payload.contact_id).trim()) {
    return String(payload.contact_id).trim();
  }
  if (!payload.email) return null;
  const body = {
    filterGroups: [
      {
        filters: [
          {
            propertyName: "email",
            operator: "EQ",
            value: payload.email,
          },
        ],
      },
    ],
    properties: ["id"],
    limit: 1,
  };
  const { ok, data } = await hubspotFetch("/crm/v3/objects/contacts/search", accessToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!ok || !data || !data.results || !data.results.length) return null;
  const id = data.results[0].id;
  return id != null ? String(id) : null;
}

function buildInternalNotes(payload) {
  const parts = [];
  if (payload.survey_template_key) {
    parts.push(`Survey template: ${payload.survey_template_key}`);
  }
  if (payload.feedback_title) {
    parts.push(`Title: ${payload.feedback_title}`);
  }
  return parts.length ? parts.join("\n") : "";
}

/**
 * Properties for DM Customer Feedback (custom object) — names from mapping doc.
 */
function buildDmCustomerFeedbackProperties(payload, nowIso, crmConfig) {
  const trigger =
    payload.survey_trigger && ALLOWED_SURVEY_TRIGGERS.includes(payload.survey_trigger)
      ? payload.survey_trigger
      : "manual_request";

  const feedbackPath =
    payload.feedback_path && String(payload.feedback_path).trim()
      ? String(payload.feedback_path).trim()
      : "/service";

  const notes = buildInternalNotes(payload);

  const props = {
    survey_type: payload.survey_type,
    survey_status: "completed",
    survey_trigger: trigger,
    survey_version: crmConfig ? crmConfig.surveyVersion : "v1",
    survey_source_system: crmConfig ? crmConfig.surveySourceSystem : "testimonial_lp",
    survey_completed_date: nowIso,
    submitted_at: nowIso,
    feedback_path: feedbackPath,
    survey_rating: String(payload.rating),
    survey_feedback: payload.feedback || "",
  };

  if (payload.reference_id) {
    props.crm_reference_id = String(payload.reference_id);
  }

  if (payload.pageUri) {
    props.submission_url = String(payload.pageUri);
  }

  if (payload.path === "testimonial" && payload.permission != null) {
    props.testimonial_permission = payload.permission;
  }

  props.follow_up_required = payload.rating <= 3 ? "true" : "false";

  if (notes) {
    props.internal_notes = notes;
  }

  return props;
}

/**
 * Contact rollup — latest snapshot fields only (mapping doc).
 */
function buildContactRollupProperties(payload, nowIso) {
  const props = {
    latest_survey_type: payload.survey_type,
    latest_survey_rating: String(payload.rating),
    latest_survey_completed_date: nowIso,
    latest_survey_feedback: payload.feedback || "",
  };
  if (payload.path === "testimonial" && payload.permission != null) {
    props.latest_testimonial_permission = payload.permission;
  }
  return props;
}

async function patchCustomObjectRecord(objectTypeId, recordId, properties, accessToken) {
  return hubspotFetch(`/crm/v3/objects/${encodeURIComponent(objectTypeId)}/${encodeURIComponent(recordId)}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
}

async function postCustomObjectRecord(objectTypeId, properties, accessToken, contactId, associationTypeId, associationCategory) {
  const body = { properties };
  const category =
    associationCategory && String(associationCategory).trim()
      ? String(associationCategory).trim()
      : "HUBSPOT_DEFINED";
  if (contactId && associationTypeId != null && !Number.isNaN(associationTypeId)) {
    body.associations = [
      {
        to: { id: String(contactId) },
        types: [
          {
            associationCategory: category,
            associationTypeId,
          },
        ],
      },
    ];
  }
  return hubspotFetch(`/crm/v3/objects/${encodeURIComponent(objectTypeId)}`, accessToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function patchContact(contactId, properties, accessToken) {
  return hubspotFetch(`/crm/v3/objects/contacts/${encodeURIComponent(contactId)}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
}

/**
 * Sync survey completion to HubSpot CRM.
 * @returns {{ ok: boolean, error?: string, status?: number }}
 */
async function syncSurveyHubSpot(payload) {
  const config = getHubSpotCrmConfig();
  if (!config) {
    return { ok: false, error: "HubSpot CRM not configured (HUBSPOT_ACCESS_TOKEN, HUBSPOT_DM_CUSTOMER_FEEDBACK_OBJECT_TYPE_ID)", status: 503 };
  }

  const nowIso = new Date().toISOString();
  const dmProps = buildDmCustomerFeedbackProperties(payload, nowIso, config);
  const contactRollup = buildContactRollupProperties(payload, nowIso);
  const { objectTypeId, accessToken, contactAssociationTypeId } = config;
  const associationCategory =
    process.env.HUBSPOT_DM_CF_CONTACT_ASSOCIATION_CATEGORY || "HUBSPOT_DEFINED";

  const surveyRecordId =
    payload.survey_record_id && String(payload.survey_record_id).trim()
      ? String(payload.survey_record_id).trim()
      : null;

  let contactId = await resolveContactId(payload, accessToken);

  if (surveyRecordId) {
    const patchRes = await patchCustomObjectRecord(objectTypeId, surveyRecordId, dmProps, accessToken);
    if (!patchRes.ok) {
      const msg = formatHubSpotErrorMessage(patchRes.data) || `HubSpot custom object update failed (${patchRes.status})`;
      console.error("HubSpot PATCH DM Customer Feedback", patchRes.status, patchRes.data);
      return { ok: false, error: msg, status: patchRes.status >= 500 ? 502 : 400 };
    }
  } else {
    if (!contactId) {
      const hasEmail = payload.email && String(payload.email).trim();
      const error = hasEmail
        ? "No HubSpot contact found with this link's email as primary email. Fix the contact in HubSpot, or use a link that includes survey_record_id (or contact_id)."
        : "This link is missing survey_record_id and has no email or contact_id. Use the full link from your email (with merge tokens), or add ?email=... or ?contact_id=... that match a HubSpot contact.";
      return {
        ok: false,
        error,
        status: 400,
      };
    }
    const newSurveyId = crypto.randomUUID();
    const createProps = { ...dmProps, survey_id: newSurveyId };
    await fillDmCustomerFeedbackCreateProperties(
      objectTypeId,
      accessToken,
      createProps,
      payload,
      newSurveyId,
      nowIso
    );
    const postRes = await postCustomObjectRecord(
      objectTypeId,
      createProps,
      accessToken,
      contactId,
      contactAssociationTypeId,
      associationCategory
    );
    if (!postRes.ok) {
      const data = postRes.data;
      const msg = formatHubSpotErrorMessage(data) || `HubSpot custom object create failed (${postRes.status})`;
      console.error("HubSpot POST DM Customer Feedback", postRes.status, data);
      return { ok: false, error: msg, status: postRes.status >= 500 ? 502 : 400 };
    }
  }

  if (contactId) {
    const contactPatch = await patchContact(contactId, contactRollup, accessToken);
    if (!contactPatch.ok) {
      console.error("HubSpot PATCH Contact rollup failed", contactPatch.status, contactPatch.data);
      return {
        ok: false,
        error:
          formatHubSpotErrorMessage(contactPatch.data) || "Failed to update contact rollup fields",
        status: 502,
      };
    }
  } else {
    console.warn("syncSurveyHubSpot: contact rollup skipped (no contact_id and email not found)");
  }

  return { ok: true };
}

module.exports = {
  getHubSpotCrmConfig,
  syncSurveyHubSpot,
  buildDmCustomerFeedbackProperties,
  buildContactRollupProperties,
};
