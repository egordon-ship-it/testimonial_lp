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

The survey submits to a Firebase Function that proxies to the HubSpot Forms API so credentials stay server-side.

### Setup

1. **HubSpot form**  
   In HubSpot, create a form whose **internal names** match `doc/hubspot-survey-field-mapping.md` (DM Customer Feedback) and include at least:
   - `feedback_title` (single-line; required for Customer Feedback)
   - `survey_rating` (number 1–5)
   - `feedback_path` (recovery | improvement | testimonial)
   - `survey_feedback` (multi-line text)
   - `survey_status` (completed on submit)
   - `submitted_at` (datetime)
   - `testimonial_permission` (yes | no), only sent for the 5-star testimonial path
   - Optional from URL: `survey_id`, `survey_type` (defaults to `support` if omitted); `email`, `contact_id` for contact association
   - `survey_template_key` (single-line; from `?template=`; default `default`) — identifies which admin survey template was used
   - `submission_url` (page URL, sent automatically)

2. **HubSpot private app**  
   Create a private app with **Forms** scope, copy the **access token**, and note your **portal ID** and the form’s **form GUID** (from the form URL or API).

3. **Environment variables**  
   Set these for the Cloud Function (e.g. Firebase Console → Project → Functions → Environment variables):
   - `HUBSPOT_PORTAL_ID` — your HubSpot portal ID
   - `HUBSPOT_FORM_GUID` — the form GUID
   - `HUBSPOT_ACCESS_TOKEN` — private app access token
   - `ADMIN_EMAIL_ALLOWLIST` — comma-separated Google account emails allowed to sign in to `/admin` (e.g. `ops@company.com,lead@company.com`)

   For **local emulator** only, you can put the same vars in `functions/.env` (see `functions/.env.example`; do not commit secrets).

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

The backend sends one HubSpot form submission per survey submit with fields aligned to `doc/hubspot-survey-field-mapping.md` (e.g. `survey_rating`, `survey_feedback`, `feedback_path`, `testimonial_permission` on the 5-star path). No embed or client-side HubSpot script is required.

## Usage

- Send the page URL in post-support emails. Include **`?template=your-slug`** to load copy from the matching Firestore template (create templates in `/admin`). Omit `template` to use slug `default` (ensure a `default` template exists for server-driven copy).
- Works on mobile and desktop; no dependencies except the optional Google Fonts link.
