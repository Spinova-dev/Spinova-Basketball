# Spinova Basketball — Brand Guidelines
> Version 1.0 · April 2026 · Use this file as the single source of truth for all visual and UI decisions when building the HTML demo in Cursor.

---

## 1. Fonts

Import from Google Fonts — always include both:

```html
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
```

| Font | Role | When to Use |
|------|------|-------------|
| **Outfit** | Display + UI font | All headings (h1–h4), navigation labels, button text, stat numbers, badge labels, logo wordmark |
| **Cairo** | Content + Form font | Body text, paragraphs, form labels, form inputs, Arabic text (fully bilingual-ready) |

### Type Scale

| Token | Size | Weight | Font | Use |
|-------|------|--------|------|-----|
| `display-xl` | 62–72px | 900 | Outfit | Hero headlines only |
| `display-lg` | 40–52px | 900 | Outfit | Page section titles |
| `display-md` | 26–38px | 800 | Outfit | Card headers, section h2 |
| `display-sm` | 18–22px | 700 | Outfit | Sub-headers, sidebar labels |
| `body-lg` | 15px | 400–500 | Cairo | Lead paragraphs, descriptions |
| `body-md` | 13.5–14px | 400 | Cairo | Standard body text, card content |
| `body-sm` | 12–13px | 400 | Cairo | Secondary text, meta info |
| `label-lg` | 12px | 700–800 | Cairo or Outfit | Form labels, table cell primary |
| `label-sm` | 9.5–11px | 700–800 | Outfit | Eyebrow text, badges, uppercase tags |
| `mono` | 11–12px | 400–600 | monospace | Hex values, code, status strings |

### Typography Rules
- Letter-spacing for all `label-sm` / eyebrow text: `2px–4px` with `text-transform: uppercase`
- Line-height for body text: `1.7–1.9`
- Line-height for display text: `1.0–1.1`
- Arabic text uses Cairo at all sizes — no special overrides needed; Cairo handles RTL natively
- Never use Outfit for Arabic characters — always fall back to Cairo

---

## 2. Color System

### CSS Custom Properties — paste into every `:root`

```css
:root {
  /* Core Brand */
  --navy:    #0D1B2A;   /* Primary dark bg, text on light, authority */
  --navy2:   #162234;   /* Slightly lighter navy — sidebar bg, nav bg */
  --navy3:   #1F3550;   /* Elevated navy — table headers, dark cards */

  /* Court Orange — Primary Action Color */
  --court:   #E87722;   /* CTAs, active states, key highlights */
  --court2:  #C55F10;   /* Hover state for court, darker accent */
  --court3:  #F99849;   /* Light court tint — light badges, icons */

  /* Lime — Success / Achievement */
  --lime:    #B5E33A;   /* Topbar accent line, success indicators */
  --lime2:   #94C22A;   /* Achievement badges, positive deltas */
  --lime3:   #CEF06A;   /* Light lime tint on dark bg only */

  /* Analytics Blue — Data / Info */
  --blue:    #3A9BD5;   /* Data labels, info callouts, secondary links */
  --blue2:   #2478B0;   /* Hover state for blue, darker data */
  --blue3:   #1A5F8A;   /* Deep blue — used rarely, headers */

  /* Semantic */
  --green:   #1FAB6E;   /* Success, approved, published states */
  --red:     #D94F3D;   /* Error, rejected, destructive actions */

  /* Neutrals */
  --ink:     #0D1B2A;   /* Primary text on light bg */
  --ink2:    #2E3F52;   /* Secondary text */
  --ink3:    #4A5C70;   /* Tertiary text, descriptions */
  --mid:     #4A5C70;   /* Mid-tone — body text, table cells */
  --light:   #7D8FA0;   /* Muted text, placeholders, meta */

  /* Surfaces */
  --bg:      #F4F7FA;   /* Page background */
  --bg2:     #EBF0F5;   /* Slightly darker bg — alternating rows, hover */
  --white:   #FFFFFF;   /* Card backgrounds, input backgrounds */

  /* Borders */
  --border:  #DDE6EE;   /* Default border */
  --border2: #C8D5E0;   /* Stronger border — focus rings, separators */

  /* Border Radius */
  --r:       12px;      /* Cards, modals, tables */
  --r-sm:    7px;       /* Inputs, small tags, inner elements */
  --r-pill:  999px;     /* Badges, pills */
}
```

### Color Usage Rules

| Color | Allowed Uses | Never Use For |
|-------|-------------|---------------|
| `--navy` | Dark backgrounds, body text on light | CTA buttons on light bg alone |
| `--court` | **One** primary CTA per screen, active nav state, key stat highlights | Success states, informational tags |
| `--lime` | Achievement badges, success state borders, positive deltas | CTA buttons — lime is never a button color |
| `--blue` | Data labels, informational callouts, secondary links, AI-related elements | Primary actions |
| `--green` | "Published", "Approved", "Active" status indicators | Branding elements |
| `--red` | "Rejected", "Error", "Delete" — destructive only | Warnings (use `--court` for warnings) |

### Approved Gradients

```css
/* Gradient 01 — Court Depth (hero backgrounds, dark panels) */
background: linear-gradient(135deg, #0D1B2A 0%, #1a2e46 100%);

/* Gradient 02 — Ignite (CTA hover states, highlights) */
background: linear-gradient(135deg, #E87722 0%, #C55F10 100%);

/* Gradient 03 — Hero Ambient (main hero section bg with radial glow) */
background: #0D1B2A;
/* + overlay: */
background:
  radial-gradient(ellipse 65% 70% at 80% 40%, rgba(232,119,34,0.14) 0%, transparent 65%),
  radial-gradient(ellipse 50% 60% at 5% 90%, rgba(58,155,213,0.10) 0%, transparent 60%);
```

---

## 3. Logo & Brand Mark

- **Wordmark:** "SPINOVA" in Outfit 900, letter-spacing 2px, uppercase
- **Sport sub-label:** "Basketball" or "Basketball Analytics" in Outfit 500, muted color
- **On dark backgrounds:** white wordmark + `--court` accent (e.g., "Spin**ova**" with em in court orange)
- **On light backgrounds:** `--navy` wordmark
- **On court-orange backgrounds:** white wordmark only
- **Minimum size:** Never render wordmark below 14px equivalent
- **Clear space:** Minimum 1× the cap-height of the "S" on all sides — never crowd the logo

### Logo Don'ts
- Do not rotate, skew, or apply drop shadows to the wordmark
- Do not use lime or blue as the wordmark color
- Do not place the wordmark on a busy photographic background without a dark overlay
- Do not use any other font for the wordmark

---

## 4. Topbar / Navigation Header

```css
/* Standard Topbar — used on all authenticated pages */
.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--navy);
  border-bottom: 3px solid var(--lime);   /* ← lime accent line is signature */
  height: 56–58px;
  padding: 0 32–40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 28px rgba(0,0,0,0.35);
}
```

- Topbar always dark navy — never white or light
- The `3px solid --lime` bottom border is a brand signature — always present
- Logo/brand on the left, actions/user menu on the right
- Active navigation tab: `background: rgba(232,119,34,0.15); color: var(--court3)`
- Inactive nav tabs: `color: rgba(255,255,255,0.35)`

### Light Topbar Variant (Brand/Marketing pages only)
```css
background: rgba(255,255,255,0.92);
backdrop-filter: blur(16px);
border-bottom: 1px solid var(--border);
box-shadow: 0 1px 12px rgba(13,27,42,0.06);
```

---

## 5. Sidebar Navigation (Admin & Dashboard pages)

```css
.sidenav {
  width: 220px;
  position: sticky;
  top: 56px;
  height: calc(100vh - 56px);
  background: var(--white);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 32px 0;
}

/* Section labels */
.sidenav-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--light);
  padding: 0 24px;
  margin: 18px 0 6px;
}

/* Nav links */
.sidenav a {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--light);
  padding: 9px 24px;
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: all 0.2s;
}

/* Active / hover state */
.sidenav a:hover,
.sidenav a.active {
  color: var(--navy);
  background: rgba(232,119,34,0.05);
  border-left-color: var(--court);
}
```

---

## 6. Hero Sections

Every main page starts with a dark navy hero:

```css
.hero {
  background: var(--navy);
  padding: 72–80px 40–60px;
  position: relative;
  overflow: hidden;
}

/* Always add the ambient radial glow overlay */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 65% 70% at 80% 40%, rgba(232,119,34,0.14) 0%, transparent 65%),
    radial-gradient(ellipse 50% 60% at 5% 90%, rgba(58,155,213,0.10) 0%, transparent 60%);
}
```

- Hero h1: Outfit 900, white, `clamp(36px, 5.5vw, 62px)`
- Key word in h1 highlighted in `--court`
- Sub-text: Cairo 15px, `rgba(255,255,255,0.58)`, max-width 500–520px
- Eyebrow text above h1: `--court` color, 10px, 700 weight, 3px letter-spacing, uppercase, with a 30px `--court` line before it

---

## 7. Button System

```css
/* Base */
.btn {
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 22px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* Variants */
.btn-primary   { background: var(--court); color: #fff; }
.btn-primary:hover { background: var(--court2); }

.btn-secondary { background: transparent; border: 1.5px solid var(--court); color: var(--court2); }
.btn-secondary:hover { background: rgba(232,119,34,0.06); }

.btn-ghost     { background: var(--bg); color: var(--ink3); border: 1px solid var(--border); }
.btn-ghost:hover { background: var(--bg2); }

.btn-lime      { background: var(--lime); color: var(--navy); font-weight: 800; }
.btn-lime:hover { background: var(--lime2); }

.btn-danger    { background: rgba(217,79,61,0.08); color: var(--red); border: 1px solid rgba(217,79,61,0.25); }
.btn-danger:hover { background: rgba(217,79,61,0.14); }

/* Sizes */
.btn-sm  { padding: 7px 14px; font-size: 11px; }
.btn-lg  { padding: 14px 32px; font-size: 15px; }
```

**Rules:**
- Maximum **one** `.btn-primary` (court orange) per screen section
- Use `.btn-lime` only for "Approve" or high-success actions
- Use `.btn-danger` for destructive actions only (Delete, Reject, Deactivate)
- Buttons inside dark sections: use `.btn-primary` or `.btn-lime`; avoid `.btn-ghost` on dark bg

---

## 8. Badge & Tag System

```css
/* All badges */
.badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 3px 11px;
  border-radius: var(--r-pill);
  display: inline-block;
}

.badge-orange { background: rgba(232,119,34,0.10); color: var(--court2);  border: 1px solid rgba(232,119,34,0.25); }
.badge-lime   { background: rgba(148,194,42,0.12); color: #6a8c1e;        border: 1px solid rgba(148,194,42,0.35); }
.badge-blue   { background: rgba(58,155,213,0.10); color: var(--blue2);   border: 1px solid rgba(58,155,213,0.25); }
.badge-navy   { background: rgba(13,27,42,0.07);   color: var(--mid);     border: 1px solid var(--border); }
.badge-green  { background: rgba(31,171,110,0.10); color: #147a4e;        border: 1px solid rgba(31,171,110,0.25); }
.badge-red    { background: rgba(217,79,61,0.08);  color: #a83228;        border: 1px solid rgba(217,79,61,0.20); }
```

### Badge Usage by Context

| Badge Color | Use for Status |
|-------------|----------------|
| `badge-green` | Published, Approved, Active, Complete |
| `badge-orange` | Pending, In Review, Draft |
| `badge-red` | Rejected, Error, Inactive |
| `badge-blue` | AI Generated, Processing, Info |
| `badge-lime` | Achievement, New, Featured |
| `badge-navy` | Neutral labels, roles, position names |

---

## 9. Card Patterns

```css
/* Standard card */
.card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 20–24px;
  box-shadow: 0 2px 8px rgba(13,27,42,0.05);
}

/* Accent-top card (used for role cards, stat cards) */
.card-accent-top {
  border-top: 3px solid var(--court); /* or --lime2, --blue */
}

/* Dark card (on navy hero or navy section) */
.card-dark {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: var(--r);
}
```

- Card title: Outfit 700, 14–16px, `--navy`
- Card body text: Cairo 13.5px, `--ink3`
- Card hover (interactive cards): `transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.09);`
- Use `border-top: 3px solid` with different colors to visually distinguish card categories

---

## 10. Form & Input Styling

```css
/* Label */
.input-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--mid);
  margin-bottom: 5px;
  text-transform: uppercase;
  font-family: 'Cairo', sans-serif;
}

/* Input / Select / Textarea */
.input {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  font-family: 'Cairo', sans-serif;
  font-size: 14px;
  color: var(--navy);
  width: 100%;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--court);
  box-shadow: 0 0 0 3px rgba(232,119,34,0.10);
}

.input::placeholder { color: var(--light); }

/* Error state */
.input.error {
  border-color: var(--red);
  box-shadow: 0 0 0 3px rgba(217,79,61,0.10);
}

/* Textarea */
textarea.input {
  min-height: 80px;
  resize: vertical;
}
```

### Bilingual Form Rules (English + Arabic)
- Forms support language toggle: **EN | AR** toggle in the form header
- When AR is active: add `dir="rtl"` to the `<form>` element
- Labels and placeholder text switch to Arabic
- Input text alignment: `text-align: right` for RTL
- Font remains Cairo (supports both scripts natively)
- Language toggle button style: pill-shaped, inactive side = ghost, active side = `--court` fill

### Form Section Cards
```css
.form-section-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r);
  overflow: hidden;
  margin-bottom: 10px;
}
.form-section-head {
  padding: 12px 17px;
  background: #F9FBFD;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
}
.form-section-num {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--navy);
  color: var(--court);
  font-size: 12px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
```

---

## 11. Table Styling

```css
.sp-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: var(--r);
  overflow: hidden;
  border: 1px solid var(--border);
  font-size: 13.5px;
}

.sp-table thead tr { background: var(--navy); }
.sp-table thead th {
  padding: 12px 15px;
  text-align: left;
  font-size: 10.5px;
  font-weight: 700;
  color: rgba(255,255,255,0.70);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.sp-table tbody tr:nth-child(even) { background: #F8FAFB; }
.sp-table tbody tr:hover           { background: #EBF5FB; }
.sp-table td {
  padding: 11px 15px;
  color: var(--mid);
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}
.sp-table td:first-child { color: var(--dark); font-weight: 600; }

/* Wrap in this for x-scroll on small screens */
.table-wrap { overflow-x: auto; border-radius: var(--r); }
```

---

## 12. Callout / Alert Boxes

```css
.callout {
  border-left: 3px solid var(--blue);
  background: #EBF5FB;
  border-radius: 0 var(--r-sm) var(--r-sm) 0;
  padding: 14px 18px;
  margin-bottom: 8px;
}
.callout.orange { border-color: var(--court); background: #FEF3EA; }
.callout.lime   { border-color: var(--lime2);  background: #F4FBEA; }
.callout.red    { border-color: var(--red);    background: #FEEEEC; }
.callout.green  { border-color: var(--green);  background: #E8FAF2; }

.callout-tag {
  font-size: 9px; font-weight: 800;
  letter-spacing: 2px; text-transform: uppercase;
  color: var(--blue2); margin-bottom: 3px;
}
.callout.orange .callout-tag { color: var(--court2); }
.callout.lime   .callout-tag { color: var(--lime2); }
.callout.red    .callout-tag { color: var(--red); }
.callout.green  .callout-tag { color: var(--green); }
.callout p { font-size: 13px; color: var(--mid); }
```

---

## 13. Status Indicators & Flow Steps

```css
/* Numbered flow step circle */
.flow-step-num {
  width: 50px; height: 50px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Cairo', sans-serif;
  font-size: 20px; font-weight: 800;
  color: #fff;
  box-shadow: 0 4px 14px rgba(0,0,0,0.18);
  flex-shrink: 0;
  position: relative; z-index: 1;
}

/* Vertical connector line between steps */
.flow-step:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 24px; top: 50px;
  width: 2px;
  height: calc(100% - 8px);
  background: var(--border);
  z-index: 0;
}
```

### Step Color Conventions
| Step Role | Color |
|-----------|-------|
| Initial / Start | `--navy` |
| User Action | `--blue` |
| System / AI Processing | `--court` |
| Review / Decision | `--green` |
| Completion / Published | `--lime2` |
| Admin Gate | `#6C63FF` (purple — used once in flows) |

---

## 14. Stat / KPI Display

```css
/* Large stat number */
.stat-num {
  font-family: 'Outfit', sans-serif;
  font-size: 38–52px;
  font-weight: 900;
  color: var(--court);
  line-height: 1;
}
.stat-num.blue { color: var(--blue); }
.stat-num.lime { color: var(--lime2); }
.stat-num.green { color: var(--green); }

.stat-label {
  font-size: 10–11px;
  font-weight: 600;
  color: var(--light);
  letter-spacing: 1–1.5px;
  text-transform: uppercase;
  margin-top: 5px;
}

/* Stat row (horizontal strip of KPIs) */
.stat-row {
  display: flex;
  border-radius: var(--r);
  overflow: hidden;
  border: 1px solid var(--border);
}
.stat-box {
  flex: 1;
  background: var(--white);
  padding: 24px 20px;
  text-align: center;
  border-left: 1px solid var(--border);
}
.stat-box:first-child { border-left: none; }
```

---

## 15. Layout Grid System

```css
/* Two-column */
.two-col   { display: grid; grid-template-columns: 1fr 1fr; gap: 16–18px; }

/* Three-column */
.three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16–18px; }

/* Main layout with sidebar */
.layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
}

/* Responsive — stack everything below 768px */
@media (max-width: 768px) {
  .layout        { grid-template-columns: 1fr; }
  .two-col       { grid-template-columns: 1fr; }
  .three-col     { grid-template-columns: 1fr; }
  .sidenav       { display: none; } /* or convert to hamburger */
}
```

---

## 16. Scrollbar Styling

```css
::-webkit-scrollbar       { width: 5px; }
::-webkit-scrollbar-track { background: var(--navy); }
::-webkit-scrollbar-thumb { background: var(--court); border-radius: 3px; }
```

---

## 17. Footer

```css
.site-footer {
  background: var(--navy);
  border-top: 3px solid var(--lime);
  text-align: center;
  padding: 40px 24px;
}
.footer-brand {
  font-family: 'Outfit', sans-serif;
  font-size: 16px; font-weight: 800;
  color: #fff; letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.footer-brand em { color: var(--lime); font-style: normal; }
.footer-sub  { font-size: 12px; color: rgba(255,255,255,0.70); letter-spacing: 1.5px; text-transform: uppercase; }
.footer-conf { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 6px; }
```

---

## 18. Voice & Tone

| Trait | Description | Example |
|-------|-------------|---------|
| **Precise** | Use exact numbers, positions, stats | "28.4 PPG · 7 assists · PG" not "great stats" |
| **Professional** | Platform-level authority, not casual | "Profile published" not "You're all set!" |
| **Motivating** | Speak to player ambition | "Built for the pro game." |
| **Arab-world aware** | Respectful, clear — no slang | Names like Ahmed, Omar, Youssef are intentional |
| **Spare** | Short, direct labels | "New Report" not "Submit a New Report Request" |

**Do write:** "Your profile is live. Share your Spinova link." 
**Don't write:** "Congrats! Your profile has been successfully published to the platform!"

---

## 19. Icon System

- Use **Lucide Icons** or **Heroicons** (stroke style, not filled) — 20–24px, `stroke-width: 1.5–2`
- Default icon color: `var(--court)` on light bg, `rgba(255,255,255,0.6)` on dark bg
- Never use emoji as functional UI icons
- Icons in navigation: 16–18px
- Icons in buttons: 14–16px, placed left of label text

---

## 20. Animation & Transitions

```css
/* Standard transition for interactive elements */
transition: all 0.2s ease;

/* Card hover lift */
transform: translateY(-2px);
box-shadow: 0 8px 24px rgba(0,0,0,0.09);

/* Sidebar link active slide */
border-left: 2px solid var(--court); /* replaces transparent */

/* Loading / skeleton */
background: linear-gradient(90deg, var(--bg) 25%, var(--bg2) 50%, var(--bg) 75%);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 21. Email Template Rules

- Header band: `--navy` background with `Spin<em style="color:--court">ova</em>` wordmark
- Body: white background, Cairo 15px, `--ink` text, max-width 540px centered
- CTA button: `.btn-primary` style (court orange, Outfit 700)
- Footer band: `--navy`, white small text, `--lime` for "Basketball" accent
- Never use white-background hero images in emails — always navy

---

## 22. Do / Don't Summary

| ✅ Do | ❌ Don't |
|-------|---------|
| One court-orange CTA per screen section | Multiple orange CTAs competing |
| Lime for achievement/success only | Lime as a general button color |
| Navy topbar on all app pages | White or light topbar on authenticated pages |
| Outfit for all headings and numbers | Mix fonts in the same heading |
| 3px lime line on topbar bottom | Remove the lime topbar line |
| Cairo for all form inputs and Arabic text | Use Outfit for Arabic text |
| Dark navy hero on every main page | Start pages with a white hero |
| Keep badge text under 2 words | Write long sentences in badges |
| WCAG AA contrast (4.5:1) on all text | Use `--light` (#7D8FA0) as body text on white |
