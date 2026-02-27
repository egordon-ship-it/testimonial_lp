# HubSpot field reference – testimonial survey

Use this table to create and map form fields in HubSpot and to reference fields in emails or workflows.

---

## Field names (must match exactly in HubSpot)

| HubSpot internal name   | Description                     | Source in survey                    | Example values                          | Sent when        | Form mapping / Email use |
|-------------------------|---------------------------------|-------------------------------------|-----------------------------------------|------------------|---------------------------|
| **feedback_title**      | Required for Customer Feedback  | Generated or from request           | e.g. `Survey – testimonial – 5 stars`   | Every submission | Required by HubSpot for Customer Feedback record. Backend defaults if not sent. |
| **email**               | Contact identifier              | URL query param (from email link)  | e.g. `user@example.com`                | When in link     | Required for HubSpot to associate submission with the correct contact. |
| **contact_id**          | HubSpot contact ID              | URL query param (from email link)  | e.g. `12345`                           | When in link     | Optional; store on Customer Feedback record if needed. |
| **star_rating**         | 1–5 star rating                 | Step 1: “How did we do today?”      | `1`, `2`, `3`, `4`, `5`                 | Every submission | Map to a number or single-select. In email: `{{ star_rating }}` or “You rated us X/5 stars.” |
| **feedback_path**       | Which follow-up path they saw  | Derived from rating                 | `recovery`, `improvement`, `testimonial`| Every submission | Map to dropdown or single-select. In email: branch by path (e.g. “Thanks for the feedback” vs “Thanks for the testimonial”). |
| **feedback_text**      | Free-text response             | Textarea on path 1–3, 4, or 5      | Any string (or empty for 4/5)           | Every submission | Map to multi-line text. In email: `{{ feedback_text }}` for quotes or follow-up. |
| **marketing_permission**| OK to use quote in marketing   | 5-star path: “Yes” / “No”          | `yes`, `no`                             | 5-star path only | Map to dropdown/radio. In email: use to show “Share your story” CTA only when `yes`. |

---

## Quick reference for HubSpot setup

**Form field internal names (copy into HubSpot):**

- `feedback_title` — single-line text (required for Customer Feedback object; backend sends a default if not provided)
- `email` — single-line text (from email link; used to associate submission with contact)
- `contact_id` — single-line text (optional; from email link)
- `star_rating` — number or single-select (1–5)
- `feedback_path` — single-select: `recovery` \| `improvement` \| `testimonial`
- `feedback_text` — multi-line text
- `marketing_permission` — single-select: `yes` \| `no` (only used when path = testimonial)

**Path by rating:**

| Rating | feedback_path   | marketing_permission |
|--------|-----------------|----------------------|
| 1–3    | `recovery`      | *(not sent)*         |
| 4      | `improvement`   | *(not sent)*         |
| 5      | `testimonial`   | `yes` or `no`        |

---

## Email link setup

To attach survey submissions to the correct contact, the survey link in your HubSpot email must include the contact’s identity as query parameters. The landing page reads these and sends them with the form so HubSpot can associate the feedback with that contact.

**Example CTA URL in the email (use your HubSpot merge tag syntax):**

- `https://your-survey-site.com/?email={{ contact.email }}`
- With contact ID: `https://your-survey-site.com/?email={{ contact.email }}&contact_id={{ contact.hubspot_id }}`

Use the merge tag names your account supports (e.g. `contact.email`, `contact.hubspot_id` or `contact.vid`). Ensure the form in HubSpot has an **email** field so submissions are associated with the contact.

---

## Email / workflow ideas

- **Segment:** Contacts where `feedback_path` = `testimonial` and `marketing_permission` = `yes` → testimonial/advocate list.
- **Personalization:** “You said: {{ feedback_text }}” (use only when appropriate and short).
- **Conditional content:** If `star_rating` &lt; 4 → “We’d love to make it right”; if 4 or 5 → “Thanks for the kind words.”
- **Reporting:** Use `star_rating` and `feedback_path` in HubSpot reports or custom objects.

---

*Backend sends these in `functions/index.js` via `buildHubSpotFields()`. Keep internal names in sync with this table.*
