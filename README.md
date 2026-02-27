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
   In HubSpot, create a form and add these **internal names** (you can set labels in HubSpot as you like):
   - `star_rating` (number 1–5)
   - `feedback_path` (recovery | improvement | testimonial)
   - `feedback_text` (long text)
   - `marketing_permission` (yes | no), only sent for the 5-star testimonial path

2. **HubSpot private app**  
   Create a private app with **Forms** scope, copy the **access token**, and note your **portal ID** and the form’s **form GUID** (from the form URL or API).

3. **Environment variables**  
   Set these for the Cloud Function (e.g. Firebase Console → Project → Functions → Environment variables, or `firebase functions:config:set` for legacy config):
   - `HUBSPOT_PORTAL_ID` — your HubSpot portal ID
   - `HUBSPOT_FORM_GUID` — the form GUID
   - `HUBSPOT_ACCESS_TOKEN` — private app access token

   For **local emulator** only, you can put the same vars in `functions/.env` (do not commit; `.env` is in `.gitignore`).

4. **Deploy**  
   From the project root: `npm install` in `functions/`, then `firebase deploy --only functions,hosting`. The hosting rewrite sends `/api/submit-survey` to the function.

### Running locally

- **Full stack (hosting + API):**  
  `firebase emulators:start --only "hosting,functions"`  
  Then open http://localhost:5050 for the survey (Emulator UI at http://localhost:4040). Use quotes around `hosting,functions` so PowerShell passes one argument. The functions emulator requires Node 20 (see `functions/package.json` engines). Set HubSpot env vars in `functions/.env` for local submit.

- **Hosting only (UI only, submit will 503):**  
  `firebase serve --only hosting`  
  Use if you only need to test the survey UI. Submitting will show an error until the function is deployed or run via the emulator above.

- If `firebase serve` (without `--only hosting`) fails with “An unexpected error has occurred,” use the emulators command instead. If you see "No emulators to start," run with the list in quotes: `--only "hosting,functions"` (required in PowerShell).

## HubSpot Integration (reference)

The backend sends one HubSpot form submission per survey submit with fields: `star_rating`, `feedback_path`, `feedback_text`, and (for 5-star) `marketing_permission`. No embed or client-side HubSpot script is required.

## Usage

- Send the page URL in post-support emails.
- Works on mobile and desktop; no dependencies except the optional Google Fonts link.
