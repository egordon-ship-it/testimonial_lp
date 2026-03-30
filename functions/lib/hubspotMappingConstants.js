/**
 * Aligned with doc/hubspot-survey-field-mapping-cursor-ready.md (Contact trigger + DM CF survey_trigger).
 */
const ALLOWED_SURVEY_TRIGGERS = [
  "ticket_closed",
  "sale_closed",
  "cancellation_requested",
  "onboarding_completed",
  "installation_completed",
  "manual_request",
];

module.exports = { ALLOWED_SURVEY_TRIGGERS };
