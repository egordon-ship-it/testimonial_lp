# Admin Style System

Portable reference for recreating the **DM Commercial Audio admin panel** look and layout in another project. This document captures the **visual language, layout shell, and component patterns** implemented here—not product-specific features.

---

## Design intent

- **Dark, utilitarian backend** — reads as a tool, not marketing.
- **Sharp corners everywhere** — `border-radius: 0` on admin UI (intentionally distinct from the public site, which uses `6px` / `var(--radius)`).
- **Mono labels, sans headlines** — navigation, section labels, and table headers use uppercase monospace; page titles and body use Inter.
- **Same brand tokens as the public app** — reuse DM color and spacing CSS variables so the admin feels like part of the same system.

---

## Layout shell

### Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (fixed width)  │  Main content (flex-1)           │
│  ─────────────────────   │  ───────────────────────────────  │
│  Logo header             │  Page title + description         │
│  Nav links               │  Primary content                  │
│  ─────────────────────   │                                   │
│  Sign out                │                                   │
└─────────────────────────────────────────────────────────────┘
```

- **Outer wrapper:** `flex min-h-screen` (`.admin-shell`).
- **Sidebar:** `w-[260px] shrink-0`, `border-r` using `--border`, background `#080e14`.
- **Main column:** `flex-1 min-h-screen`, background `#0d1117`, padding `var(--space-5)` horizontal `var(--space-6)` (see `AdminLayout`).

### Sidebar (navigation)

- **Logo block:** top border-bottom on sidebar; logo max width ~180px, left-aligned.
- **Links:** full-width rows; `font-mono`, ~`0.8rem`, **uppercase**, `tracking-wide`, `--text-secondary` default.
- **Hover:** background `#121820`, `--text-primary`.
- **Footer:** `mt-auto` + top border; **Sign out** as text button, same mono/uppercase treatment.
- **Active state:** implement in the new project as needed (e.g. left border or background) — this repo uses hover-only styling on links.

### Body / page background

- `body` uses `--bg-primary` (`#0D1117`) when the admin layout flag is applied.

---

## Color & tokens

Reuse these CSS custom properties (defined in global styles for this project):

| Token | Typical use |
|-------|-------------|
| `--dm-blue` | Primary actions, link accents, focus border on inputs |
| `--dm-blue-hover` | Primary button hover |
| `--bg-primary` | Page background (`#0D1117`) |
| `--bg-secondary` | Cards / panels (`#121820`) |
| `--bg-input` | Inputs (`#0F1923`) |
| `--border` | Dividers, table borders (`#1E2D3D`) |
| `--text-primary` | Headings, strong labels |
| `--text-secondary` | Body / descriptions |
| `--text-muted` | Table header text, meta labels |
| `--error` | Form errors |
| `--warning` | Warning banner left border (`#F5A623`) |

**Hardcoded surfaces** used in admin for clarity:

| Hex | Use |
|-----|-----|
| `#080e14` | Sidebar background, table header row |
| `#121820` | Card surfaces, table hover rows, dashboard shortcut tiles |
| `#0d1117` | Main content column (matches `--bg-primary`) |

---

## Border radius

**Admin rule:** `border-radius: 0` on:

- Shell, sidebar links, cards, inputs, buttons, tables, toasts (where styled in this project).

Apply via scoped CSS (e.g. `.admin-input`, `.admin-login__card`, `.admin-nav__link`) or utility overrides so public pages can keep `var(--radius)` unchanged.

---

## Typography

- **Fonts:** Inter (UI), JetBrains Mono (labels, nav, table headers, buttons).
- **Page title (H1):** often `font-mono`, `uppercase`, ~`1rem`, `--text-primary` (list/dashboard pages).
- **Dashboard welcome:** sans `font-semibold`, ~`1.5rem`, `--text-primary`.
- **Section headings (e.g. “Recent lead submissions”):** `font-mono`, ~`0.85rem`, `uppercase`, `--text-primary`.
- **Labels:** `font-mono`, ~`0.75rem`, `uppercase`, `tracking-wide`, `--text-muted`.
- **Descriptions:** `--text-secondary`, default sans sizes (`0.875rem`–`1rem`).

---

## Components

### Dashboard shortcut cards

- Grid: `gap-[var(--space-4)]`, `sm:grid-cols-3`.
- Card: `border border-[var(--border)]`, bg `#121820`, padding `var(--space-5)`.
- Hover: `hover:border-[var(--dm-blue)]`, transition on border.
- Eyebrow: `font-mono`, `0.8rem`, `uppercase`, `--dm-blue`.
- Subtext: `0.875rem`, `--text-secondary`.

### Tables

- Wrapper: `overflow-x-auto border border-[var(--border)]`.
- **Header row:** `bg-[#080e14]`, `border-b border-[var(--border)]`, `font-mono` ~`0.7rem`, `uppercase`, `--text-muted`, cell padding `px-4 py-3`.
- **Body rows:** implement alternating or subtle backgrounds in the new app if desired; spec reference: `#1A2332` / `#121820` alternating.

### Forms (inline admin)

- Field stack: `flex flex-col gap-2` (or `space-y` with consistent spacing).
- Inputs/selects: `border border-[var(--border)]`, `bg-[var(--bg-input)]`, `px-3 py-2`, `--text-primary`, `outline-none`, **focus:** `focus:border-[var(--dm-blue)]`.
- Primary submit: `bg-[var(--dm-blue)]`, `font-mono` ~`0.75rem`–`0.8rem`, `uppercase`, `tracking-wide`, text on dark can use `text-[var(--bg-primary)]` for contrast; hover `--dm-blue-hover`.

### Warning / info strip

Example (pricing page): left accent bar — `border-l-4 border-[var(--warning)]`, `bg-[#121820]`, `p-[var(--space-4)]`, `font-mono` ~`0.8rem`, `--text-secondary`.

### Login screen

- Centered column: `min-h-screen`, `items-center`, `justify-center`, horizontal padding.
- Card: `max-w-[400px]`, `border border-[var(--border)]`, `bg-[var(--bg-secondary)]`, `p-[var(--space-6)]`, **square corners**.
- Logo + “Admin Portal” title centered; form fields follow label/input patterns above.
- Primary button full width, DM Blue, mono uppercase.

### Toast

- Fixed `bottom-6 right-6`, `z-50`, `max-w-sm`.
- Style: `rounded-none`, `border border-[var(--border)]`, `bg-[#121820]`, `px-4 py-3`, `font-mono` ~`0.8rem`, `--text-primary`, light shadow optional.
- Typical duration ~3.5s auto-dismiss.

---

## Spacing

Use the same scale as the main design system:

- `--space-2` (8px) — tight gaps
- `--space-4` (16px) — default gaps
- `--space-5` (24px) — section padding, card padding
- `--space-6` (32px) — larger section margins
- `--space-8` (64px) — major vertical rhythm on login / empty areas

---

## Motion

- Link hovers: `transition-colors duration-[var(--t-fast)]` (e.g. 0.15s).
- Avoid playful easing; keep transitions short and functional.

---

## Accessibility & content rules

- No emojis in UI (matches brand rules).
- Sufficient contrast on dark backgrounds; primary actions clearly distinguishable (DM Blue on dark).
- Sidebar: `aria-label` on `<aside>` for “Admin navigation”.

---

## Checklist for a new project

1. Import or duplicate **CSS variables** (colors, spacing, transitions) from the main design system.
2. Set **admin pages** to use **square corners** on chrome, cards, inputs, and primary buttons.
3. Build **sidebar + main** flex shell with widths and colors above.
4. Standardize **table** and **form** patterns (borders, header row, mono labels).
5. Add **fixed toast** container for save/error feedback.
6. Keep **login** as a minimal centered card on full-viewport dark background.

---

## Source files in this repo (reference)

| Area | Location |
|------|----------|
| Admin layout shell | `src/layouts/AdminLayout.astro`, `src/layouts/BaseLayout.astro` (`admin` prop) |
| Sidebar | `src/components/admin/AdminNav.astro` |
| Login | `src/pages/admin/login.astro` |
| Dashboard / tables / cards | `src/pages/admin/dashboard.astro`, `src/pages/admin/verticals/index.astro` |
| Forms + warning strip | `src/pages/admin/pricing.astro` |
| Toast helper | `src/scripts/admin/toast.ts` |

Extended product requirements (features, not visuals) are summarized in `doc/06-admin-dashboard-spec.md`.
