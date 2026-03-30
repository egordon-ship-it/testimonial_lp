# Feedback / Testimonial Landing Page

A single-page survey that can be linked from post-support emails and integrated with HubSpot. Customers rate their experience (1–5 stars), then see conditional follow-up copy and optional text fields.

## Flow

1. **Intro:** Headline “Your feedback matters.” + subhead.
2. **Rating:** “How did we do today?” with 1–5 stars (centered).
3. **Conditional paths:**
   - **1–3 stars:** Service recovery — required feedback box → thank-you.
   - **4 stars:** Improvement insight — optional feedback box → thank-you.
   - **5 stars:** Testimonial path — optional feedback + permission (Yes/No to use in marketing) → thank-you (different message for Yes vs No).

## Files

- **index.html** — Full page (HTML, CSS, JS). No build step; open in a browser or host as-is.
- **admin/** — Survey template admin (list/edit/duplicate, intro copy, Google review URL). Styled per `doc/admin-style-system.md`. Requires Firebase Auth + `ADMIN_EMAIL_ALLOWLIST`.

## Brand Colors (Dynamic Media Music)

Colors are set with CSS variables at the top of the `<style>` block in `index.html`. To match [dynamicmediamusic.com](https://dynamicmediamusic.com/) exactly:

1. Open the site and use DevTools (or a color picker) to get hex values for:
   - Primary/dark (e.g. header, headings)
   - Accent/CTA (buttons, links)
   - Background and text if desired
2. In `index.html`, update the `:root` block, for example:

```css
:root {
  --brand-primary: #YOUR_PRIMARY_HEX;
  --brand-accent: #YOUR_ACCENT_HEX;
  /* optional: --text-primary, --text-muted, --bg-page */
}
```

## Backend (Phase 1)

The survey submits to a Firebase Function that calls the **HubSpot CRM API** (not the Forms API). Behavior is defined in **`doc/hubspot-survey-field-mapping-cursor-ready.md`**:

- **DM Customer Feedback** custom object: survey responses, lifecycle (`survey_status`, timestamps, `submission_url`, `feedback_path`, `crm_reference_id`, etc.).
- **Contact**: rollup snapshot only (`latest_survey_type`, `latest_survey_rating`, `latest_survey_completed_date`, `latest_survey_feedback`, `latest_testimonial_permission`).

If **`survey_record_id`** is present (HubSpot DM Customer Feedback **record id** from the email link), the function **PATCH**es that record. Otherwise it **POST**s a new custom object record (requires a resolvable `contact_id` or `email`, and optionally `HUBSPOT_DM_CF_CONTACT_ASSOCIATION_TYPE_ID` to associate the record to the contact).

### Setup

1. **HubSpot CRM properties**  
   Ensure the **DM Customer Feedback** custom object and **Contact** properties exist with internal names from `doc/hubspot-survey-field-mapping-cursor-ready.md`. Survey email links should use Contact merge tokens as in that doc (e.g. `survey_record_id` ← `requested_survey_record_id`, `survey_type` ← `requested_survey_type`, `reference_id` ← `requested_survey_reference_id`).

2. **HubSpot private app**  
   Create a private app with scopes to read/write **contacts** and **DM Customer Feedback** (custom objects), then copy the access token.

3. **Environment variables**  
   Set for the Cloud Function (Firebase Console → Functions → Environment variables):
   - `HUBSPOT_ACCESS_TOKEN` — private app token
   - `HUBSPOT_DM_CUSTOMER_FEEDBACK_OBJECT_TYPE_ID` — custom object type ID (e.g. `2-12345678`)
   - `ADMIN_EMAIL_ALLOWLIST` — comma-separated emails allowed for `/admin`
   - Optional: `HUBSPOT_DM_CF_CONTACT_ASSOCIATION_TYPE_ID` — association type ID when **creating** a new survey record without `survey_record_id`
   - Optional: `HUBSPOT_DM_CF_CONTACT_ASSOCIATION_CATEGORY` — default `HUBSPOT_DEFINED` (use `USER_DEFINED` if your portal requires it)
   - Optional: `SURVEY_VERSION`, `SURVEY_SOURCE_SYSTEM`

   For **local emulator**, use `functions/.env` (see `functions/.env.example`; do not commit secrets). If HubSpot vars are missing, the emulator still returns success for submits in demo mode.

4. **Firestore**  
   Deploy rules with `firebase deploy --only firestore` (rules deny all client access; templates are read/written only by Cloud Functions). Create survey templates in **Admin** (or in the Firestore console under `survey_templates`). Use slug `default` for the default landing experience when `?template=` is omitted.

5. **Admin & Firebase Web config**  
   - In Firebase Console → Authentication → Sign-in method, enable **Google**.  
   - In Project settings → Your apps, add a Web app if needed and copy the config into `admin/firebase-config.js` (replace `REPLACE_WITH_WEB_API_KEY` and confirm `projectId` / `authDomain`).

6. **Deploy**  
   From the project root: `npm install` in `functions/`, then `firebase deploy --only functions,hosting,firestore`. Hosting rewrites send `/api/submit-survey`, `/api/survey-config`, and `/api/admin/survey-templates` to functions; `/admin` serves the admin UI.

### Running locally

- **Full stack (hosting + API + Firestore):**  
  `firebase emulators:start --only "hosting,functions,firestore"`  
  Then open http://localhost:5050 for the survey and http://localhost:5050/admin for the admin UI (Emulator UI at http://localhost:4040). Use quotes so PowerShell passes one argument. Set HubSpot vars and `ADMIN_EMAIL_ALLOWLIST` in `functions/.env` for local submit and admin API access.

- **Hosting only (UI only, submit will 503):**  
  `firebase serve --only hosting`  
  Use if you only need to test the survey UI. Submitting will show an error until the function is deployed or run via the emulator above.

- If `firebase serve` (without `--only hosting`) fails with “An unexpected error has occurred,” use the emulators command instead. If you see "No emulators to start," run with the list in quotes: `--only "hosting,functions"` (required in PowerShell).

## HubSpot Integration (reference)

See **`doc/hubspot-survey-field-mapping-cursor-ready.md`** and **`HUBSPOT_FIELDS.md`**. The function updates CRM directly; no HubSpot form embed is required on the client.

## Usage

- Send the page URL in post-support emails. Include **`?template=your-slug`** to load copy from the matching Firestore template (create templates in `/admin`). Omit `template` to use slug `default` (ensure a `default` template exists for server-driven copy).
- Works on mobile and desktop; no dependencies except the optional Google Fonts link.
