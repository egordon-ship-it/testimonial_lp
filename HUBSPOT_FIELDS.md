# HubSpot CRM — testimonial survey

**Source of truth:** `doc/hubspot-survey-field-mapping-cursor-ready.md`

The Firebase function (`functions/lib/hubspotSurveySync.js`) uses the **HubSpot CRM API** to:

1. **PATCH or POST** the **DM Customer Feedback** custom object with response and lifecycle fields.
2. **PATCH** the **Contact** with **latest survey snapshot** fields only.

---

## Email link (HubSpot)

Use Contact merge tokens so `requested_*` on the contact matches what the app sends as `survey_type` / `survey_record_id` / `reference_id`:

```text
https://YOUR-HOST/service?survey_record_id={{contact.requested_survey_record_id}}&reference_id={{contact.requested_survey_reference_id}}&survey_type={{contact.requested_survey_type}}&template=service&email={{contact.email}}
```

Optional: `survey_trigger={{contact.requested_survey_trigger}}` (must match allowed values in `functions/lib/hubspotMappingConstants.js`).

Legacy: `?survey_id=` is still read as **`survey_record_id`** if `survey_record_id` is omitted.

---

## Query parameters the app sends to `/api/submit-survey`

| Param | Maps from URL | Backend use |
|--------|----------------|-------------|
| `email` | `email` | Contact lookup for rollup |
| `contact_id` | `contact_id` / `contactId` | Contact PATCH id |
| `survey_record_id` | `survey_record_id` or `survey_id` | HubSpot DM Customer Feedback **record id** for PATCH |
| `reference_id` | `reference_id` | `crm_reference_id` on DM Customer Feedback |
| `survey_type` | `survey_type` / `type` | Same values as `requested_survey_type` (default `support`) |
| `survey_trigger` | `survey_trigger` | Same values as `requested_survey_trigger` (optional; else `manual_request` on DM CF) |
| `feedback_path` | derived (`/service` path) | `feedback_path` on DM Customer Feedback |
| `survey_template_key` | `template` / path | Stored in `internal_notes` (not a separate property in the mapping doc) |

---

## DM Customer Feedback fields written on submit

Internal names used in code: `survey_type`, `survey_status`, `survey_trigger`, `survey_version`, `survey_source_system`, `crm_reference_id`, `survey_completed_date`, `submitted_at`, `submission_url`, `feedback_path`, `survey_rating`, `survey_feedback`, `testimonial_permission` (5-star path), `follow_up_required`, `internal_notes`. On **create** only, `survey_id` is set to a new UUID.

---

## Contact fields written on submit (rollup)

`latest_survey_type`, `latest_survey_rating`, `latest_survey_completed_date`, `latest_survey_feedback`, `latest_testimonial_permission` (when 5-star path has permission).

---

## Environment variables

See `functions/.env.example`. Required in production:

- `HUBSPOT_ACCESS_TOKEN`
- `HUBSPOT_DM_CUSTOMER_FEEDBACK_OBJECT_TYPE_ID`

Optional: association + category for POST-create when no `survey_record_id`.

---

## Troubleshooting

- **PATCH fails (404):** `survey_record_id` must be the HubSpot **custom object record id**, not the `survey_id` property value unless they are the same in your process.
- **POST fails (400):** Provide `contact_id` or an `email` that matches exactly one contact.
- **POST without association:** Set `HUBSPOT_DM_CF_CONTACT_ASSOCIATION_TYPE_ID` (and category if needed) so the new record links to the contact.
