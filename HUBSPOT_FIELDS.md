# HubSpot field reference – testimonial survey

Use this table to create and map form fields in HubSpot and to reference fields in emails or workflows.

---

## Field names (must match exactly in HubSpot)

| HubSpot internal name   | Description                     | Source in survey                    | Example values                          | Sent when        | Form mapping / Email use |
|-------------------------|---------------------------------|-------------------------------------|-----------------------------------------|------------------|---------------------------|
| **feedback_title**      | Required for Customer Feedback  | Generated or from request           | e.g. `Survey – testimonial – 5 stars`   | Every submission | Required by HubSpot for Customer Feedback record. Backend defaults if not sent. |
| **email**               | Contact identifier              | URL query param (from email link)  | e.g. `user@example.com`                | When in link     | Required for HubSpot to associate submission with the correct contact. |
| **contact_id**          | HubSpot contact ID              | URL query param (from email link)  | e.g. `12345`                           | When in link     | Optional; store on Customer Feedback record if needed. |
| **survey_id**           | Survey record ID                | URL `survey_id` (see architecture) | e.g. HubSpot record id                  | When in link     | Aligns with `doc/hubspot-survey-field-mapping.md`. |
| **survey_type**         | Segment                         | URL `type` or `survey_type`; default `support` | `support`, `sales`, … | Every submission | Dropdown per mapping doc. |
| **survey_template_key** | Which survey template           | URL `template` (default `default`); resolved from Firestore | e.g. `default`, `support-post-call` | Every submission | Single-line text; add this property to the same HubSpot form. Filters which admin-defined survey the submission came from. |
| **survey_rating**       | 1–5 star rating                 | Step 1: “How did we do today?”      | `1`, `2`, `3`, `4`, `5`                 | Every submission | Map to `survey_rating` on DM Customer Feedback (`doc/hubspot-survey-field-mapping.md`). |
| **feedback_path**       | Which follow-up path they saw  | Derived from rating                 | `recovery`, `improvement`, `testimonial`| Every submission | Map to dropdown or single-select. |
| **survey_feedback**     | Free-text response             | Textarea on path 1–3, 4, or 5      | Any string (or empty for 4/5)           | Every submission | Map to multi-line text. |
| **survey_status**       | Lifecycle                       | Server                              | `completed`                             | Every submission | Set on submit. |
| **submitted_at**        | Timestamp                       | Server (ISO 8601)                   | e.g. `2026-03-27T12:00:00.000Z`        | Every submission | Map to datetime. |
| **submission_url**      | Page URL                        | `window.location.href`              | Full survey URL                         | Every submission | Map to URL field. |
| **testimonial_permission** | OK to use quote in marketing | 5-star path: “Yes” / “No”          | `yes`, `no`                             | 5-star path only | Map to dropdown/radio (`testimonial_permission` per mapping doc). |

---

## Quick reference for HubSpot setup

**Form field internal names (copy into HubSpot):**

- `feedback_title` — single-line text (required for Customer Feedback object; backend sends a default if not provided)
- `email` — single-line text (from email link; used to associate submission with contact)
- `contact_id` — single-line text (optional; from email link)
- `survey_id` — single-line text (optional; from `?survey_id=` in link)
- `survey_type` — dropdown (optional in URL; defaults to `support` in the API)
- `survey_template_key` — single-line text (from `?template=`; defaults to `default`; identifies the survey template in HubSpot)
- `survey_rating` — number or single-select (1–5)
- `feedback_path` — single-select: `recovery` \| `improvement` \| `testimonial`
- `survey_feedback` — multi-line text
- `survey_status` — `completed` on submit
- `submitted_at` — datetime (ISO string from server)
- `submission_url` — URL (current page)
- `testimonial_permission` — single-select: `yes` \| `no` (only used when path = testimonial)

**Path by rating:**

| Rating | feedback_path   | testimonial_permission |
|--------|-----------------|------------------------|
| 1–3    | `recovery`      | *(not sent)*           |
| 4      | `improvement`   | *(not sent)*           |
| 5      | `testimonial`   | `yes` or `no`          |

---

## Email link setup

To attach survey submissions to the correct contact, the survey link in your HubSpot email must include the contact’s identity as query parameters. The landing page reads these and sends them with the form so HubSpot can associate the feedback with that contact.

**Example CTA URL in the email (use your HubSpot merge tag syntax):**

- `https://your-survey-site.com/?email={{ contact.email }}`
- With contact ID: `https://your-survey-site.com/?email={{ contact.email }}&contact_id={{ contact.hubspot_id }}`
- With survey record (per `doc/hubspot-survey-architecture.md`): `https://your-survey-site.com/?survey_id=RECORD_ID&type=support&email={{ contact.email }}`

Use the merge tag names your account supports (e.g. `contact.email`, `contact.hubspot_id` or `contact.vid`). Ensure the form in HubSpot has an **email** field so submissions are associated with the contact.

---

## Email / workflow ideas

- **Segment:** Contacts where `feedback_path` = `testimonial` and `testimonial_permission` = `yes` → testimonial/advocate list.
- **Personalization:** “You said: {{ survey_feedback }}” (use only when appropriate and short).
- **Conditional content:** If `survey_rating` &lt; 4 → “We’d love to make it right”; if 4 or 5 → “Thanks for the kind words.”
- **Reporting:** Use `survey_rating` and `feedback_path` in HubSpot reports or map into DM Customer Feedback per `doc/hubspot-survey-field-mapping.md`.

---

*Backend sends these in `functions/index.js` via `buildHubSpotFields()`. Keep internal names in sync with this table.*
