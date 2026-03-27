# Dynamic Media — Brand & Style System (Master Reference)

**Purpose:** Single reference for AI-assisted and human development so new work stays aligned with DM's official brand system. **Point Cursor at this file** (for example via `@doc/DM-brand-style-system.md` or a project rule) when building UI, copy, or marketing surfaces.

**Canonical source:** `DM-Brand-Style-Guide-v2.html` (and mirrored `public/index.html` if present) — the HTML guide remains the full visual spec. This document extracts enforceable rules and tokens.

**Version:** v2.2 (March 2026) — adds Light Canvas two-panel system, vertical-specific CTA allowance, dual-logo guidance, token consistency audit corrections, font weight and line-height tokens, and universal typography/spacing rule.

---

## 1. Strategic direction

| Rule | Detail |
|------|--------|
| **Default aesthetic** | **Dark mode first.** Deep charcoal backgrounds; electric DM Blue (`#00AEEF`) accents. |
| **Light Canvas exceptions** | Approved for specific section types — see Section 6. Light sections must still use all DM design tokens (radius, type scale, colors). |

---

## 2. Brand identity (summary)

- **Position:** Consultative B2B specialist for licensed background music — not a consumer app or generic vendor.
- **Pillars:** Precision engineering (drafted, not decorated), dark-mode UI, high contrast (DM Blue on near-black).
- **Audience:** Business owners and operators; tone is professional, credible, and consultative.

---

## 3. Voice and tone

- **Expert but accessible** — authority without condescension; plain language, not legalese.
- **Consultative** — lead with customer needs and solutions, not product pushing.
- **Confident and credible** — claims backed by numbers (see proof points).
- **Outcome-focused** — music as compliance and experience, not a "nice to have."

---

## 4. Proof points (use exact figures)

| Stat | Copy |
|------|------|
| Scale | **55,000+** locations across **45** countries |
| Tenure | **20+** years — founded **2003** |
| Network | **8,800+** certified technicians |
| Differentiator | **#1** — **only US reseller** of **both** SiriusXM for Business and Soundtrack |

**Trust bar (typical headline):** *Trusted by 55,000+ Locations Nationwide* — partner logos **grayscale/white on dark** where shown.

> **Enforcement note:** Always include the `+` after 55,000. Always include 45 countries where space allows. Do not omit or round proof-point figures.

---

## 5. Design tokens (CSS)

Use these names consistently in CSS or design tools. Values match `:root` in the style guide. **Never substitute ad-hoc hex values** (e.g. `#111827`, Tailwind gray classes) where a token exists.

### Universal consistency rule — typography and spacing

> **Font sizes, font weights, line-heights, spacing, and border-radius are color-scheme-agnostic. They apply identically on dark sections, Light Canvas white panels, Light Canvas gray panels, and every other surface. Changing the background color of a section never justifies changing its type scale, spacing, or radius. The only things that change between dark and light surfaces are color tokens (backgrounds, text colors, borders). Everything else stays the same.**

This means:
- A Section H2 is `2.25rem` desktop / `1.75rem` mobile whether it sits on `--bg-primary` or `--lc-bg-white`.
- Section padding is `96px` top and bottom regardless of panel color.
- `border-radius` is `var(--radius)` (6px) on every element regardless of context.
- Inter and JetBrains Mono are the only typefaces on every surface.

> If a component looks wrong on a light background, fix the color tokens — never fix it by adjusting size, spacing, or typeface.

### 5.1 Brand (accent)

| Token | Value | Use |
|-------|--------|-----|
| `--dm-blue` | `#00AEEF` | CTAs, links, highlights, icons (accent) |
| `--dm-blue-hover` | `#0099D6` | Primary button hover |
| `--dm-blue-active` | `#007BAD` | Primary button pressed |
| `--dm-blue-glow` | `rgba(0,174,239,0.15)` | Subtle fills, badges |
| `--dm-blue-border` | `rgba(0,174,239,0.3)` | Accent borders |

### 5.2 Backgrounds (dark palette)

| Token | Value | Use |
|-------|--------|-----|
| `--bg-primary` | `#0D1117` | Main page background |
| `--bg-secondary` | `#121820` | Alternate sections, drawers |
| `--bg-card` | `#1A2332` | Cards, panels |
| `--bg-input` | `#0F1923` | Inputs, result/visualizer cards |
| `--bg-darkest` | `#080E14` | Hero/blueprint areas |
| `--bg-proof` | `#0A0F15` | Social proof ribbon (dark mode) |

> **Token enforcement:** Hero backgrounds must use `--bg-darkest` or `--bg-primary`. Do not use inline hex `#111827` — it is not a design token and differs from `--bg-primary`.

### 5.3 Borders

| Token | Value |
|-------|--------|
| `--border` | `#1E2D3D` |
| `--border-active` | `#2A3F56` |

### 5.4 Text

| Token | Value | Use |
|-------|--------|-----|
| `--text-primary` | `#FFFFFF` | Headlines, key labels |
| `--text-secondary` | `#B0BEC5` | **Default body copy** |
| `--text-muted` | `#607080` | Meta, placeholders, captions |
| `--text-accent` | `#00AEEF` | Inline emphasis/links |

### 5.5 Status

| Token | Value |
|-------|--------|
| `--success` | `#00E676` |
| `--warning` | `#F5A623` |
| `--error` | `#FF5252` |

### 5.6 Typography families

| Role | Stack |
|------|--------|
| **Primary** | `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` |
| **Mono** | `'JetBrains Mono', 'Courier New', monospace` |

**Google Fonts import (reference):** Inter (300–700) + JetBrains Mono (400–500).

### 5.7 Type scale (semantic names)

| Token / role | Desktop (`md` and up) | Mobile (below `md`) | Notes |
|--------------|----------------------|---------------------|-------|
| Display / Hero H1 | See **Hero H1** below (`md` + `lg`) | `1.5rem` (24px) | Weight 700, `--text-primary`, `--leading-tight` — implemented in `HeroSection.astro` |
| Section H1 | `3rem` (48px) | `2rem` (32px) | Weight 700 |
| Section H2 | `2.25rem` (36px) | `1.75rem` (28px) | Weight 700 |
| Card / feature title (H3) | `1.5rem` (24px) | `1.25rem` (20px) | Weight 600 |
| Eyebrow / label | `0.75rem` | `0.75rem` | ALL CAPS, `--dm-blue`, letter-spacing `0.15em`, weight 500 |
| Body | `1rem` (16px) | `1rem` (16px) | `--text-secondary`, line-height `1.7` |
| Mono (pricing, specs) | `0.875rem` | `0.875rem` | `font-family: var(--font-mono)` — use `font-mono` class consistently |

**Hero H1 (`HeroSection.astro`) — responsive sizes**

| Breakpoint | Tailwind | Size (16px root) |
|------------|----------|------------------|
| Default (below `md`) | `text-[1.5rem]` | 24px |
| `md` and up | `md:text-[3.25rem]` | 52px |
| `lg` and up | `lg:text-[2.8rem]` | 44.8px |

At `lg` and wider, `lg:text-[2.8rem]` overrides the `md` size so the headline is slightly smaller on large viewports than at tablet widths. This three-breakpoint pattern applies **only** to the hero display H1; all other section headings use the two-step scale in the table above.

> **Scale enforcement:** Default section headings (H1–H3, body, etc.) use a **two-step** scale — one size below `md` and one from `md` up. The **hero H1** is the exception: it uses the three breakpoints in the **Hero H1** table above and must stay in sync with `HeroSection.astro`.

### Font weight tokens

| Token | Value | Use |
|-------|-------|-----|
| `--font-weight-normal` | `400` | Body copy, captions |
| `--font-weight-medium` | `500` | Eyebrows, labels, UI controls |
| `--font-weight-semibold` | `600` | H3 / card titles |
| `--font-weight-bold` | `700` | H1, H2, display headings |

> **Weight enforcement:** Use these token names (or their numeric equivalents via CSS variables) — do not use Tailwind weight classes (`font-semibold`, `font-bold`) unless they map exactly to the values above. Never use weights outside this set (e.g. `300`, `800`, `900`) on any surface, dark or light.

### Line-height tokens

| Token | Value | Use |
|-------|-------|-----|
| `--leading-tight` | `1.15` | Display / Hero H1, large headings — prevents excessive gap between lines at large sizes |
| `--leading-snug` | `1.3` | Section H1, H2 |
| `--leading-normal` | `1.5` | H3, card titles, UI labels |
| `--leading-body` | `1.7` | Body copy, all paragraph text |
| `--leading-loose` | `1.9` | Eyebrow / label — improves readability at small sizes |

> **Line-height enforcement:** These values apply on every surface — dark and light. Do not override line-height to compensate for a background color change. If text looks cramped or too airy on a light panel, the issue is padding or font-size, not line-height.

**Typography rules**

- Body copy is **`#B0BEC5`** (`--text-secondary`) on dark, **`#3D4F5C`** (`--lc-text-body`) on light — never pure white or pure black.
- Hero H1: bold white on dark, `--lc-text-primary` on light — **no color accent inside the headline on either surface.**
- **No italic** in UI.
- **Only Inter and JetBrains Mono** — no other typefaces on any surface.
- **No emojis** in UI.
- Pricing and measurements: **JetBrains Mono** (`var(--font-mono)`), not just `tabular-nums`.

### 5.8 Spacing scale

| Token | Value | Typical use |
|-------|--------|-------------|
| `--space-1` … `--space-10` | 4px … 128px | See guide; **section vertical padding: 96px** (`--space-9`) top AND bottom |
| Container max-width | `1200px` | Centered |
| Container padding | `32px` desktop / `16px` mobile | |

> **Padding enforcement:** Section padding must be symmetric — 96px top and 96px bottom. Asymmetric padding (e.g. `pt-[100px] pb-[50px]`) is not permitted except where a section intentionally bleeds into an adjacent one (document the reason as a code comment).

### 5.9 Radius, borders, motion

| Token | Value |
|-------|--------|
| `--radius` | **6px** — buttons, cards, inputs, modals, drawers, all interactive elements |

> **Radius enforcement:** `6px` (`var(--radius)`) is the single permitted radius for UI elements. Do not use `7px`, `8px`, `rounded-lg`, or any Tailwind radius class that does not resolve to exactly 6px. The only allowed exception is **pill/tag badges** which may use `border-radius: 9999px` (fully rounded) when the design explicitly calls for a pill shape — document this in a code comment.

| Token | Value |
|-------|--------|
| `--t-fast` | `0.15s ease` |
| `--t-base` | `0.2s ease` |
| `--t-slow` | `0.3s ease` |

**Motion:** No bounce/spring/playful easing. No animations faster than **0.15s** or slower than **0.4s** except the blueprint loading pulse (~1.5s infinite). Drawer: `translateX` at **0.3s ease**.

### 5.10 Responsive breakpoints

| Token | Value |
|-------|--------|
| `--breakpoint-sm` | 640px |
| `--breakpoint-md` | 768px |
| `--breakpoint-lg` | 1024px |
| `--breakpoint-xl` | 1280px |

**Mobile:** Multi-column layouts stack; blueprint canvas full width; drawers full width; hero H1 uses `1.5rem` (see Section 5.7 Hero H1); CTA buttons stack full width.

---

## 6. Light Canvas (approved exceptions)

Light Canvas is **explicitly approved** for the section types listed below. It is not a global override — all other sections default to the dark palette.

**Approved Light Canvas contexts:**
- Social proof ribbon / trust strip
- Visualizer / calculator shell (the marketing band wrapping the interactive tool)
- PRO explainer strips
- Intermittent acquisition landing sections

**Non-negotiable rule:** Even within Light Canvas sections, **all design tokens still apply** — radius is still `6px`, type scale is unchanged, DM Blue is the accent color, and Inter/JetBrains Mono are the only typefaces.

---

### 6.1 Two-panel system

Light Canvas sections come in two variants. Use them to create visual rhythm and section separation on light pages — never use both the same background in adjacent sections.

| Variant | CSS Token | Value | Use |
|---------|-----------|-------|-----|
| **White panel** | `--lc-bg-white` | `#FFFFFF` | Primary light section background; hero columns, main content areas |
| **Soft gray panel** | `--lc-bg-soft` | `#F3F4F6` | Secondary light section; sits between white panels to create contrast |
| **Medium gray panel** | `--lc-bg-mid` | `#E5E7EB` | Strongest light surface; trust strips, zebra rows, featured cards on light |

> **Contrast rule:** Adjacent light sections must never share the same background value. The intended progression when stacking light sections is: white → soft gray → medium gray (or any non-repeating step of the three). This ensures every section boundary is visible without needing a border or shadow.

---

### 6.2 Light Canvas color tokens

These tokens apply across **all** Light Canvas panel variants unless noted.

| Role | CSS Token | Value | Notes |
|------|-----------|-------|-------|
| Text primary | `--lc-text-primary` | `#1A2B3C` | Headlines, labels — all panels |
| Text body | `--lc-text-body` | `#3D4F5C` | Body copy — all panels; slightly warmer than muted for readability |
| Text muted | `--lc-text-muted` | `#5C6B7A` | Captions, meta, placeholders — all panels |
| Hairline border | `--lc-border` | `#CFD8DC` | Card borders, dividers, input borders |
| Card background (on white panel) | `--lc-card-white` | `#F3F4F6` | Cards sitting on a white section use soft gray |
| Card background (on soft/mid panel) | `--lc-card-mid` | `#FFFFFF` | Cards sitting on gray panels use white — creates lift |
| Primary CTA | `--dm-blue` | `#00AEEF` | Same DM Blue as dark palette — never substitute another blue |
| Accent / link | `--dm-blue` | `#00AEEF` | Inline links, icon accents |
| Radius | `--radius` | `6px` | Identical to global — no exceptions |

> **Text color rule:** All three panel backgrounds (`#FFFFFF`, `#F3F4F6`, `#E5E7EB`) use the same text token set above. Do not darken or lighten text values per panel — the background contrast difference is sufficient to signal the section change. Consistent text tokens keep the brand voice uniform across light surfaces.

> **Token enforcement:** Replace all Tailwind gray classes (`gray-100`, `gray-200`, `text-gray-500`, etc.) and ad-hoc hex values in light sections with the tokens above. Tailwind grays are not brand values and will drift over time.

---

### 6.3 Light Canvas card elevation rule

On light surfaces, cards use **background color change** to imply elevation — not shadows.

- Card on white panel (`--lc-bg-white`) → background `--lc-card-white` (`#F3F4F6`) + 1px `--lc-border` border
- Card on soft/mid panel (`--lc-bg-soft` / `--lc-bg-mid`) → background `--lc-card-mid` (`#FFFFFF`) + 1px `--lc-border` border
- Maximum permitted shadow on light cards: `0 1px 4px rgba(0,0,0,0.08)` — nothing heavier

---

**Logo on light backgrounds:** Use dark-ink logo: `DM_logo_2016.png` (see Section 7).

---

## 7. Logos (file names and usage)

Paths are relative to site root / `public/` as deployed.

### Dynamic Media (parent brand)

| Context | File |
|---------|------|
| Dark UI | `public/logos/DM_logo_2016_whiteblue.png` |
| Light UI | `public/logos/DM_logo_2016.png` |
| Icon only (favicon, tight spaces) | `public/logos/DM_logo_Icon_2016.png` |

### DM Commercial Audio (sub-brand)

| Context | File |
|---------|------|
| Dark UI | `public/logos/DM Commercial logo2-white.png` (URL-encode spaces: `DM%20Commercial%20logo2-white.png`) |
| Light / full color | `public/logos/DM-Commercial-logo-color.png` |

### Logo selection rule

Both parent and sub-brand logos are valid for Commercial Audio product pages. Apply as follows:

- **Sub-brand logo** (`DM Commercial Audio`) — preferred on product-specific landing pages, campaign pages, and any surface that is exclusively about the Commercial Audio product.
- **Parent logo** (`Dynamic Media`) — use on shared infrastructure pages (contact, about, multi-product) or when explicitly approved by marketing for a cross-brand impression.
- **Document the choice** in a code comment when using the parent logo on a Commercial Audio property, so the decision is auditable.

> **Path note:** The site currently uses `/images/brand/` as a path prefix. Either path is acceptable as long as it is applied consistently within a codebase — do not mix path prefixes on the same site.

---

## 8. Components (rules of thumb)

### Buttons

- **Primary:** Solid `--dm-blue`; hover `--dm-blue-hover`; active `--dm-blue-active`; min-width **180px**; `border-radius: var(--radius)`.
- **Secondary (ghost):** White outline on dark; sits **to the right** of primary when paired; on light canvas use `--lc-text-primary` outline.
- **Blue outline:** Calculators/tools only (e.g. Update / Recalculate).
- **Max two** buttons in the same visual group.

### Forms

- Input bg `--bg-input` (`#0F1923`), border `--border`, focus ring `--dm-blue` + `--dm-blue-glow`.
- Error: `--error` border; success: `--success`.
- Selects: same styling; custom chevron in DM Blue (no default browser arrow).
- `border-radius: var(--radius)` on all inputs and selects — no exceptions.

### Cards

- Standard: `--bg-card`, 1px `--border`, `var(--radius)`, generous padding (32px).
- Feature: add **3px left** border `--dm-blue`.
- Result/visualizer: `--bg-input`, border `--dm-blue-border`.
- **No heavy drop shadows** (`box-shadow`) on cards in the dark palette. Light Canvas cards may use a single subtle shadow: `0 1px 4px rgba(0,0,0,0.08)` — nothing heavier.

### Blueprint grid

- Canvas bg: **`--bg-darkest`** (`#080E14`) with layered linear gradients (major **100px**, minor **20px**), cyan lines at low opacity.
- Speaker dot: `--dm-blue` circle, subtle glow.
- Coverage: dashed circle, `rgba(0,174,239,0.12)` fill.

> **Note:** The `globals.css` `.dm-blueprint-grid` currently uses a 32px grid. Update to 100px major / 20px minor to match this spec.

### Overlays

**When to use a modal vs. a drawer:**

| Scenario | Use |
|----------|-----|
| Form submission CTA (Free Consultation, Talk to a Specialist, any lead capture) | **Modal** |
| Scheduling, booking, or calendar flow | **Modal** |
| Any action that requires the user to complete a focused task and move on | **Modal** |
| Supplementary content — extended product details, specs, FAQs, help text | **Drawer** |
| Secondary navigation or filtering panels | **Drawer** |

> **Rule:** If the user is submitting something — a form, a request, a booking — it opens in a modal. If the user needs to read more or explore additional context without leaving their current place, it opens in a drawer. When in doubt, use a modal.

**Modal specs:**
- Backdrop: dark with blur (~80% black).
- Max-width **~560px**, 90% viewport width on smaller screens.
- `border-radius: var(--radius)` — no `shadow-2xl` or heavier than the standard backdrop.
- Contains a clear close/dismiss control (×) in the top-right corner.

**Drawer specs:**
- Backdrop: dark with blur (~70% black).
- Slides in from the **right only** — no left, top, or bottom variants.
- Width: **480px** desktop / **100%** mobile.
- Background: `--bg-secondary`; padding ~48px; `border-radius: var(--radius)`.
- Contains a clear close/dismiss control (×) in the top-right corner.
- Animation: `translateX` at `var(--t-slow)` (0.3s ease).

### Icons

- **Lucide-style stroke icons only** — outline SVGs consistent with the Lucide 24px set. In codebases using the Lucide package, use Lucide components. In vanilla Astro/HTML, use inline SVGs that match Lucide stroke style and dimensions.
- Sizes: **20px** inline, **24px** standalone.
- Accent: `--dm-blue`; neutral: `--text-secondary`.
- **Stroke/outline only** — not filled.
- Social proof checkmarks: use **`✔`** character in `--dm-blue`, not an icon component.

---

## 9. Content and copy rules

### CTA taxonomy

**Default primary CTA:** `Free Consultation` — use on all general pages, ads, and surfaces where no vertical context exists.

**Vertical-specific primary CTAs (approved overrides):** A product or campaign funnel may substitute a more specific CTA that matches the user's journey stage, for example:

- `Get My Free Audio Design` — Commercial Audio visualizer / design-tool funnel
- Add additional vertical CTAs here as approved by marketing

When a vertical CTA is used, `Free Consultation` remains the fallback for any surface outside that funnel's scope.

**Secondary CTA (modal / specialist flow):** `Talk to a Specialist` — exact phrasing, no substitutions. Do not use "Talk to your salesman" or other informal variants.

### Always

- Drive CTAs toward **Free Consultation** (or approved vertical CTA) — do not surface full pricing in ads.
- Define **PROs** on first use (e.g. Performing Rights Organizations — ASCAP, BMI, SESAC).
- Emphasize **exclusive US dual-reseller** status (SiriusXM for Business + Soundtrack).
- Support claims with Section 4 proof points — exact figures, including the `+`.
- Frame music as **compliance and experience**.
- State that **Spotify, Apple Music, YouTube are not licensed for business use** where relevant.

### Never

- Generic fluff ("next level," "seamless," "game-changing").
- Jargon without first-use context (PRO, ASCAP, etc.).
- Implication that consumer streaming is OK for business.
- Hidden pricing as a substitute for consultation CTA.
- Off-brand full-page light themes outside approved Light Canvas sections.
- Stock "smiling people" clichés.
- **Gradients on backgrounds** (photographic scrim overlays in hero sections are an accepted exception — document in code).
- Heavy **drop shadows on cards** (dark palette).
- Playful motion or bounce easing.
- Informal CTA variants (e.g. "Talk to your salesman").

---

## 10. Design consistency checklist (for code review)

Before merging UI work, verify:

- [ ] All border-radius values are `var(--radius)` (6px) — no `7px`, `8px`, `rounded-lg`, or Tailwind radius classes
- [ ] All colors reference CSS tokens — no ad-hoc hex values or Tailwind color classes in place of tokens
- [ ] Type sizes follow Section 5.7 — two-step scale for section headings/body; hero H1 follows the three-breakpoint Hero H1 table — same sizes on dark and light sections
- [ ] Font weights use only the four values defined in Section 5.7 (`400`, `500`, `600`, `700`)
- [ ] Line-heights use tokens from Section 5.7 — not overridden to compensate for background color changes
- [ ] Section padding is symmetric 96px top and bottom (`var(--space-9)`) — dark and light sections alike
- [ ] Light Canvas sections use Light Canvas color tokens (Section 6) — not Tailwind grays or ad-hoc values
- [ ] Light Canvas sections do NOT use different font sizes, weights, line-heights, or spacing from dark sections
- [ ] Adjacent light sections use different background values (no two consecutive sections share the same panel color)
- [ ] Proof points use exact figures from Section 4 (including `+`)
- [ ] Secondary CTA reads "Talk to a Specialist" exactly
- [ ] Mono font (`var(--font-mono)`) is used for all pricing and measurements, not just `tabular-nums`
- [ ] Blueprint grid uses 100px major / 20px minor (not 32px)
- [ ] Logo file and path are consistent with Section 7 and documented if parent logo is used on a sub-brand page
- [ ] Form/lead-capture CTAs open in a modal; supplementary content opens in a drawer

---

## 11. How to use this file in Cursor

1. **Reference in chat:** `@doc/DM-brand-style-system.md` when asking for UI, Tailwind/CSS, or copy.
2. **Project rules:** Add a rule that new front-end work must follow this document and the HTML guide for visuals.
3. **When in doubt:** Match dark UI tokens above; keep legacy WordPress aesthetics out of net-new builds.
4. **Light sections:** Follow Section 6 exactly — use Light Canvas tokens, keep radius and type scale identical to the dark palette.

---

*End of master reference — Dynamic Media Brand Style System v2.2, March 2026.*
