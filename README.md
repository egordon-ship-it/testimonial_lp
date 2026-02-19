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

## HubSpot Integration

- **Option A — HubSpot-hosted landing page:** Paste the HTML (or key sections) into a HubSpot landing page or custom HTML module. Create a form in HubSpot with fields for: star rating, feedback text, and (for 5-star) permission. Use HubSpot’s form API or hidden fields that your script populates before submit.
- **Option B — External page with HubSpot form:** Host `index.html` on your domain. In the `survey-container` (see comment in HTML), add the HubSpot embed script and create the form with:
  - Hidden: `rating` (1–5)
  - Hidden: `path` (recovery | improvement | testimonial)
  - Text: feedback (recovery required; improvement/testimonial optional)
  - For testimonial path: `permission` (yes | no)

Example embed (replace with your portal and form IDs):

```html
<script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/v2.js"></script>
<script>
  hbspt.forms.create({
    portalId: "YOUR_PORTAL_ID",
    formId: "YOUR_FORM_ID",
    target: "#hubspot-form-container"
  });
</script>
```

Before calling form submit (or when showing thank-you), set hidden field values from the current rating, path, and permission choices so HubSpot receives the full survey data.

## Usage

- Send the page URL in post-support emails.
- Works on mobile and desktop; no dependencies except the optional Google Fonts link.
