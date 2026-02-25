# AI Starter Design System Specification

**Version:** 2.0
**Last Updated:** February 2026
**Theme:** Precision Dashboard — Dark editorial, finance-grade clarity
**Status:** Active

---

## Design Token Rules (MANDATORY)

1. NEVER use hardcoded color values — use color tokens (`--bg`, `--primary`, `--text-mid`, etc.)
2. NEVER use hardcoded px for spacing — use `--space-*` tokens
3. NEVER use hardcoded px for font-size — use `--text-*` tokens
4. NEVER use hardcoded numeric font-weight — use `--weight-*` tokens
5. NEVER use hardcoded line-height — use `--leading-*` tokens
6. NEVER use hardcoded letter-spacing — use `--tracking-*` tokens
7. NEVER use hardcoded z-index — use `--z-*` tokens
8. NEVER use hardcoded max-width for containers — use `--width-*` tokens
9. Component-specific sizes (icon dimensions, spinner sizes, avatar sizes) MAY use hardcoded px
10. NEVER invent new tokens — use only tokens defined in this document
11. Display font (`--display`) supports weights 400–700. Use `--weight-bold` for headings, `--weight-semibold` for smaller display elements

---

## Foundations

### Color Tokens

#### Backgrounds — Warm Charcoal Base

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0f1115` | Page background, input backgrounds |
| `--bg-subtle` | `#141519` | Component stage backgrounds, subtle sections |
| `--surface` | `#1a1b21` | Cards, sidebar, table wrappers |
| `--surface-raised` | `#212229` | Raised elements, active tabs, skeleton base |
| `--surface-hover` | `#2a2b33` | Hover states, toggle off background |

#### Brand — Amber/Gold (Primary)

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#e8a848` | Primary buttons, active indicators, logo accent |
| `--primary-soft` | `rgba(232, 168, 72, 0.1)` | Soft backgrounds for primary elements |
| `--primary-mid` | `rgba(232, 168, 72, 0.18)` | Mid-opacity primary backgrounds |
| `--primary-deep` | `#d4952e` | Primary button hover state |
| `--primary-on` | `#1c1200` | Text color on primary backgrounds (dark warm brown, WCAG AA) |

#### Brand — Teal (Secondary)

| Token | Value | Usage |
|-------|-------|-------|
| `--secondary` | `#38bec9` | Secondary accents, success-adjacent indicators |
| `--secondary-soft` | `rgba(56, 190, 201, 0.1)` | Soft backgrounds for secondary elements |
| `--secondary-mid` | `rgba(56, 190, 201, 0.18)` | Mid-opacity secondary backgrounds |

#### Accent Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--accent-blue` | `rgba(100, 140, 220, 0.12)` | Soft blue backgrounds |
| `--accent-blue-solid` | `#648cdc` | Blue text, info badges |
| `--accent-violet` | `rgba(140, 120, 210, 0.1)` | Soft violet backgrounds |
| `--accent-violet-solid` | `#8c78d2` | Violet text, "Improved" badges |

#### Semantic Colors

| Token | Value | Soft Variant | Usage |
|-------|-------|-------------|-------|
| `--success` | `#34c88a` | `rgba(52, 200, 138, 0.1)` | Success toasts, alerts, progress bars |
| `--warning` | `#e8a848` | `rgba(232, 168, 72, 0.1)` | Warning toasts, alerts, approaching limits |
| `--danger` | `#e05252` | `rgba(224, 82, 82, 0.1)` | Error toasts, alerts, destructive actions |
| `--info` | `#648cdc` | `rgba(100, 140, 220, 0.1)` | Info toasts, alerts, trial notices |

#### Text — High Contrast for Readability

| Token | Value | Usage |
|-------|-------|-------|
| `--white` | `#ecedF0` | Headings, active text, strong emphasis |
| `--text` | `#d8dae0` | Body text, toast messages |
| `--text-mid` | `#888c9e` | Secondary text, descriptions, labels |
| `--text-light` | `#555868` | Captions, hints, disabled text, separators |

#### Borders

| Token | Value | Usage |
|-------|-------|-------|
| `--border` | `rgba(255, 255, 255, 0.08)` | Default borders |
| `--border-hover` | `rgba(255, 255, 255, 0.14)` | Hover state borders |
| `--border-focus` | `rgba(232, 168, 72, 0.45)` | Input focus borders (amber glow) |

---

### Typography

#### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--display` | `'Space Grotesk', 'Inter', sans-serif` | Headings, titles, logo — supports weights 400–700 |
| `--body` | `'Geist', -apple-system, 'Segoe UI', sans-serif` | Body text, buttons, inputs, labels |
| `--mono` | `'SF Mono', 'Fira Code', 'Courier New', monospace` | Code, token values |

**Google Fonts import:**
```
Space+Grotesk:wght@400;500;600;700
Geist:wght@300;400;500;600;700;800
```

**Note:** Space Grotesk is a modern geometric sans-serif with a tech-forward, precision feel. Supports weights 400–700. Use `--weight-bold` (700) for large headings, `--weight-semibold` (600) for smaller display elements. Pair with negative letter-spacing at larger sizes.

#### Type Scale

| Name | Size | Weight | Font | Line Height | Letter Spacing | Usage |
|------|------|--------|------|-------------|----------------|-------|
| Hero H1 | `clamp(40px, 5vw, 58px)` | 700 | Display | 1.1 | -0.5px | Landing page hero |
| Section H2 | `clamp(32px, 4vw, 44px)` | 700 | Display | 1.2 | -0.25px | Section headings |
| Page H1 | 28px | 700 | Display | 1.25 | -0.25px | Page titles (settings, etc.) |
| Card H3 | 20px | 600 | Display | — | 0 | Card titles, subsections |
| Body | 15px | 400 (text), 500 (buttons) | Body | 1.7 | — | Regular text, buttons |
| Small | 14px | 500 | Body | 1.6 | — | Table cells, descriptions, inputs |
| Caption | 13px | 500 | Body | — | — | Labels, hints, pills, nav links |
| Micro | 11px | 600 | Body | — | 0.3px | Tags, badges, table headers |
| Nano | 10px | 600 | Body | — | 0.6px | Nav group labels, badge text |

#### Font Sizes

| Token | Value | Usage |
|-------|-------|-------|
| `--text-nano` | 10px | Nav group labels, badge text |
| `--text-micro` | 11px | Tags, badges, table headers |
| `--text-xs` | 12px | Hints, small descriptions, chips |
| `--text-caption` | 13px | Labels, captions, pills, nav links |
| `--text-sm` | 14px | Table cells, descriptions, inputs |
| `--text-base` | 15px | Body text, default buttons |
| `--text-md` | 16px | Large buttons, landing body |
| `--text-lg` | 18px | Subsection titles |
| `--text-xl` | 20px | Card titles, logo |
| `--text-2xl` | 22px | Modal titles |
| `--text-3xl` | 24px | Section titles |
| `--text-4xl` | 28px | Large headings, pricing |
| `--text-5xl` | 44px | Splash screen brand |
| `--text-display-sm` | clamp(28px, 3vw, 36px) | Responsive small display |
| `--text-display-md` | clamp(32px, 4vw, 44px) | Section headings |
| `--text-display-lg` | clamp(40px, 5vw, 58px) | Hero headings |

#### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--weight-regular` | 400 | Body text, display font body-weight elements |
| `--weight-medium` | 500 | Descriptions, inputs, buttons |
| `--weight-semibold` | 600 | Labels, captions, nav links, badges, small display headings |
| `--weight-bold` | 700 | Display font headings, body font emphasis |
| `--weight-extrabold` | 800 | Body font strong emphasis (display font max is 700) |

#### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `--leading-none` | 1 | Large display text |
| `--leading-tight` | 1.1 | Hero headings |
| `--leading-snug` | 1.2 | Section headings |
| `--leading-heading` | 1.25 | General headings |
| `--leading-compact` | 1.4 | Dense text |
| `--leading-normal` | 1.5 | Default line height |
| `--leading-relaxed` | 1.6 | Descriptions, textarea |
| `--leading-body` | 1.7 | Body text |
| `--leading-loose` | 1.8 | Spacious text |

#### Letter Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--tracking-tight` | -0.5px | Large body headings |
| `--tracking-snug` | -0.25px | Medium body headings |
| `--tracking-normal` | 0 | Default, all display font headings |
| `--tracking-wide` | 0.3px | Uppercase labels, badges |
| `--tracking-wider` | 0.6px | Emphasized uppercase |
| `--tracking-widest` | 1px | Nav group labels |

#### Z-Index

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Default stacking |
| `--z-raised` | 1 | Slightly raised elements |
| `--z-header` | 40 | Page header |
| `--z-overlay` | 45 | Overlay backdrops |
| `--z-sidebar` | 50 | Sidebar panels |
| `--z-sticky` | 100 | Sticky elements, mobile nav |
| `--z-splash` | 9999 | Splash screens |

#### Container Widths

| Token | Value | Usage |
|-------|-------|-------|
| `--width-sidebar` | 240px | App sidebar |
| `--width-xs` | 320px | Narrow containers, empty states |
| `--width-sm` | 420px | Modal/toast max-width |
| `--width-form` | 440px | Auth forms |
| `--width-md` | 480px | Medium containers |
| `--width-prose` | 640px | Content/prose max-width |
| `--width-lg` | 820px | Settings pages, pricing grids |
| `--width-xl` | 1140px | Page container |
| `--width-max` | 1200px | Maximum width |

---

### Spacing

Base unit: **4px**. All spacing uses `--space-*` CSS custom properties.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0_5` | 2px | Micro gaps |
| `--space-1` | 4px | Tight gaps (tab bar, pill-tag padding) |
| `--space-1_5` | 6px | Small inner padding |
| `--space-2` | 8px | Small gaps (nav group margin, badge padding) |
| `--space-2_5` | 10px | Button small padding, nav items |
| `--space-3` | 12px | Component inner gaps (toast, alert, breadcrumb) |
| `--space-3_5` | 14px | Table cell padding |
| `--space-4` | 16px | Standard gaps (card/button icon gap) |
| `--space-5` | 20px | Table cell/sidebar item padding |
| `--space-6` | 24px | Section padding, card inner |
| `--space-7` | 28px | Container side padding |
| `--space-8` | 32px | Section title margin, card padding vertical |
| `--space-9` | 36px | Card generous padding, modal box padding |
| `--space-10` | 40px | Large spacing |
| `--space-12` | 48px | Section spacing, hero top padding |
| `--space-14` | 56px | Extra section spacing |
| `--space-16` | 64px | Main content side padding |
| `--space-18` | 72px | Large section spacing |
| `--space-20` | 80px | Section bottom margin |

---

### Border Radii

Refined, professional — not bubbly. Smaller radii than typical SaaS for a finance-grade feel.

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | `4px` | Badges, tags, tooltips, small inner elements |
| `--radius-sm` | `6px` | Buttons, inputs, tabs, icon buttons, chips, code blocks |
| `--radius-md` | `8px` | Cards, toasts, alerts, dropdowns, popovers |
| `--radius-lg` | `10px` | Pricing cards, modals, featured containers |
| `--radius-xl` | `12px` | Auth cards, hero sections, large containers |
| `--radius-pill` | `100px` | Pills, badges, status tags (NOT buttons) |

Additional specific radii:
- Toggle switch: `12px`
- Toggle knob: `50%` (circle)
- Tab item inner: `6px`
- Dropdown item: `8px`
- Tooltip: `8px`
- Icon box: `12px`
- Empty state icon: `14px`

---

### Shadows

All shadows are neutral (black-alpha only, no colored glows).

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.24), 0 1px 3px rgba(0,0,0,0.18)` | Cards at rest, primary buttons |
| `--shadow-md` | `0 4px 14px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.18)` | Cards on hover, buttons on hover, tooltips |
| `--shadow-lg` | `0 10px 40px rgba(0,0,0,0.32), 0 4px 10px rgba(0,0,0,0.2)` | Featured cards, toasts, dropdowns |
| `--shadow-xl` | `0 20px 56px rgba(0,0,0,0.4), 0 6px 16px rgba(0,0,0,0.22)` | Modals, auth card |

---

### Animations

| Name | Duration | Easing | Transform | Usage |
|------|----------|--------|-----------|-------|
| `slideUp` | 0.6s | `--ease-smooth` | Y: 20px → 0, opacity: 0 → 1 | Content entrance |
| `popIn` | 0.5s | `--ease-spring` | Scale: 0.95 → 1, Y: 6px → 0 | Pill/badge entrance |
| `floatIn` | 0.8s | `--ease-smooth` | Y: 28px → 0, scale: 0.98 → 1 | Card entrance |
| `shimmer` | 1.5s | linear, infinite | background-position: 200% → -200% | Loading skeletons |

#### Easing Curves

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Buttons, toggles, interactive bounces |
| `--ease-smooth` | `cubic-bezier(0.16, 1, 0.3, 1)` | Content animations, progress bars |

#### Transition Defaults

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | 0.15s ease | Nav links, dropdown items, sidebar items |
| `--transition-base` | 0.2s ease | Inputs, borders, cards, shadows |
| `--transition-spring` | 0.25s `--ease-spring` | Primary/secondary buttons |

---

## Components

### Buttons

#### Variants

| Variant | Background | Text Color | Border | Hover |
|---------|-----------|------------|--------|-------|
| Primary | `--primary` | `--primary-on` | none | bg: `--primary-deep`, Y: -2px, scale: 1.02 |
| Secondary | `--surface-raised` | `--white` | 1px `--border-hover` | bg: `--surface-hover`, border brighter, Y: -2px |
| Ghost | transparent | `--text-mid` | none | color: `--white` |
| Danger | `--danger-soft` | `--danger` | 1px `rgba(224,82,82,0.2)` | bg darker (0.18 alpha), Y: -1px |

#### Sizes

| Size | Font Size | Padding |
|------|-----------|---------|
| Small (`.btn-sm`) | 13px | 10px 22px |
| Default | 15px | 16px 32px |
| Large (`.btn-lg`) | 16px | 18px 40px |

#### Icon Button

- Size: 40x40px
- Radius: `--radius-sm` (8px)
- Background: `--surface-raised`
- Border: 1px `--border`
- Icon: 18x18px, stroke: currentColor, stroke-width: 1.8
- Hover: bg `--surface-hover`, color `--white`, border `--border-hover`

#### Common Properties

- Font: `--body`, weight 500
- Radius: `--radius-sm`
- Transition: `--transition-spring`
- Display: inline-flex, center aligned, gap: 8px

---

### Pills

- Display: inline-flex, center aligned, gap: 8px
- Padding: 6px 6px 6px 16px
- Radius: `--radius-pill`
- Font: 13px, weight 500

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| Primary | `--primary-soft` | `--primary` | `rgba(232,168,72,0.15)` |
| Secondary | `--secondary-soft` | `--secondary` | `rgba(56,190,201,0.12)` |

---

### Badges

- Font: 10px, weight 600, uppercase, letter-spacing: 0.3px
- Padding: 3px 10px
- Radius: `--radius-pill`
- Display: inline-block, nowrap

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| New | `--secondary-soft` | `--secondary` | `rgba(56,190,201,0.15)` |
| Fix | `--primary-soft` | `--primary` | `rgba(232,168,72,0.15)` |
| Improved | `--accent-violet` | `--accent-violet-solid` | `rgba(140,120,210,0.15)` |
| Draft | `rgba(232,168,72,0.1)` | `--warning` | `rgba(232,168,72,0.15)` |

---

### Chips

- Display: inline-flex, center aligned, gap: 5px
- Font: 12px, weight 500
- Padding: 6px 14px
- Radius: `--radius-sm`
- Default: bg `rgba(255,255,255,0.03)`, text `--text-mid`, border `--border`

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| Default | `rgba(255,255,255,0.03)` | `--text-mid` | `--border` |
| Secondary | `--secondary-soft` | `--secondary` | `rgba(56,190,201,0.15)` |
| Primary | `--primary-soft` | `--primary` | `rgba(232,168,72,0.15)` |

---

### Cards

- Background: `--surface`
- Radius: `--radius-lg`
- Padding: 36px 30px
- Border: 1px `--border`
- Shadow: `--shadow-sm`
- Transition: 0.3s with `--ease-spring`
- Hover: Y: -4px, shadow `--shadow-lg`, border `--border-hover`
- Hover overlay: linear-gradient `rgba(232,168,72,0.03)` to `rgba(56,190,201,0.02)`, fades in
- Featured variant: border `rgba(232,168,72,0.35)`, shadow `--shadow-lg`

---

### Icon Containers

- Size: 52x52px
- Radius: 12px
- Icon size: 24x24px

| Variant | Background | Border | Icon Stroke |
|---------|-----------|--------|-------------|
| Primary | `--primary-soft` | `rgba(232,168,72,0.12)` | `--primary` |
| Secondary | `--secondary-soft` | `rgba(56,190,201,0.12)` | `--secondary` |
| Violet | `--accent-violet` | `rgba(140,120,210,0.12)` | `--accent-violet-solid` |
| Blue | `--accent-blue` | `rgba(100,140,220,0.1)` | `--accent-blue-solid` |

---

### Form Inputs

#### Text Input / Textarea

- Width: 100%
- Padding: 12px 16px
- Font: `--body`, 14px, weight 500
- Color: `--white`
- Background: `--bg`
- Border: 1px `--border`
- Radius: `--radius-sm`
- Placeholder: `--text-light`
- Hover: border `--border-hover`
- Focus: border `--border-focus`, box-shadow `0 0 0 3px rgba(255,255,255,0.06)`
- Error: border `rgba(224,82,82,0.4)`, box-shadow `0 0 0 3px rgba(255,255,255,0.04)`
- Textarea: `resize: vertical`, `min-height: 100px`, `line-height: 1.6`

#### Labels & Hints

- Label: 13px, weight 600, color `--text-mid`, margin-bottom 8px
- Hint: 12px, color `--text-light`, margin-top 6px
- Hint error: color `--danger`
- Input group: margin-bottom 20px

#### Select

- Same as text input but with `appearance: none`
- Padding-right: 40px (for arrow)
- Custom arrow: CSS triangle using `::after` pseudo-element, `--text-light`

#### Toggle Switch

- Size: 44x24px
- Background (off): `--surface-hover`
- Background (on): `--primary`
- Border: 1px `--border` (off) / `--primary` (on)
- Radius: 12px
- Knob: 16x16px circle, positioned 3px from edge
- Knob color (off): `--text-mid`
- Knob color (on): white
- Knob travel: left 3px to 23px
- Transition: 0.2s with `--ease-spring`

---

### Tabs

- Container: flex, gap 2px, bg `--bg`, radius `--radius-sm`, padding 4px, border 1px `--border`
- Width: fit-content
- Items: 13px, weight 600, color `--text-light`, padding 8px 20px, radius 6px
- Item hover: color `--text-mid`
- Item active: bg `--surface-raised`, color `--white`, shadow `--shadow-sm`

---

### Tables

- Wrapper: bg `--surface`, border 1px `--border`, radius `--radius-lg`, overflow hidden
- Font: 14px
- Header: bg `--bg`, font 11px weight 600 uppercase, letter-spacing 0.3px, color `--text-light`, padding 14px 20px
- Cells: padding 14px 20px, color `--text-mid`, border-bottom 1px `--border`
- Last row: no bottom border
- Row hover: bg `rgba(255,255,255,0.02)`
- Title cells: color `--white`, weight 600

---

### Modals

- Overlay: `rgba(0,0,0,0.5)`
- Box: bg `--surface`, border 1px `--border`, radius `--radius-xl`, padding 36px, shadow `--shadow-xl`, max-width 420px
- Title: `--display` font, 22px, weight 700, color `--white`, margin-bottom 8px
- Description: 14px, color `--text-mid`, margin-bottom 28px, line-height 1.7
- Actions: flex, gap 10px, justify-content flex-end

---

### Toasts

- Layout: flex, center-aligned, gap 12px
- Padding: 14px 20px
- Radius: `--radius-md`
- Font: 14px, weight 500
- Background: `--surface-raised`
- Border: 1px `--border`
- Shadow: `--shadow-lg`
- Max-width: 400px

#### Icon

- Size: 28x28px
- Radius: 8px
- SVG: 16x16px, stroke-width 2
- Background/stroke determined by variant (uses semantic color soft/solid)

#### Variants

| Variant | Icon Background | Icon Stroke |
|---------|----------------|-------------|
| Success | `--success-soft` | `--success` |
| Error | `--danger-soft` | `--danger` |
| Warning | `--warning-soft` | `--warning` |
| Info | `--info-soft` | `--info` |

#### Text

- Primary: color `--text`
- Secondary (small): 12px, color `--text-light`, margin-top 2px

#### Close Button

- Size: 24x24px
- Radius: `--radius-xs`
- Icon: 14x14px, stroke-width 2
- Default: color `--text-light`
- Hover: bg `rgba(255,255,255,0.06)`, color `--text-mid`

---

### Alerts

- Layout: flex, top-aligned, gap 12px
- Padding: 16px 20px
- Radius: `--radius-md`
- Font: 14px
- Icon SVG: 18x18px, stroke-width 2
- Title: weight 600, margin-bottom 2px
- Description: 13px, opacity 0.8

| Variant | Background | Border | Text/Icon Color |
|---------|-----------|--------|-----------------|
| Info | `--info-soft` | `rgba(100,140,220,0.15)` | `--info` |
| Warning | `--warning-soft` | `rgba(232,168,72,0.15)` | `--warning` |
| Danger | `--danger-soft` | `rgba(224,82,82,0.15)` | `--danger` |
| Success | `--success-soft` | `rgba(52,200,138,0.15)` | `--success` |

---

### Dropdowns

- Menu: bg `--surface-raised`, border 1px `--border`, radius `--radius-md`, padding 6px, shadow `--shadow-lg`, min-width 200px
- Items: flex, center-aligned, gap 10px, padding 10px 14px, radius 8px
- Item font: 13px, weight 500, color `--text-mid`
- Item hover: bg `rgba(255,255,255,0.06)`, color `--white`
- Item icon: 16x16px, stroke-width 1.8
- Danger item: color `--danger`, hover bg `--danger-soft`
- Divider: 1px `--border`, margin 4px 8px

---

### Progress Bars & Usage Meters

#### Progress Track

- Height: 8px
- Background: `--bg`
- Radius: 4px
- Border: 1px `--border`

#### Progress Fill

- Radius: 4px
- Transition: width 0.5s `--ease-smooth`
- Colors: `--primary`, `--secondary`, `--warning`, `--danger`

#### Usage Card

- Background: `--surface`
- Border: 1px `--border`
- Radius: `--radius-md`
- Padding: 20px
- Header: flex space-between, margin-bottom 12px
- Label: 13px, weight 600, color `--text-mid`
- Count: 13px, weight 700, color `--white` (limit in `--text-light`, weight 500)

#### Color Coding Convention

| Usage Level | Fill Color |
|------------|------------|
| Safe (< 60%) | `--secondary` |
| Approaching (60-90%) | `--warning` |
| At limit (100%) | `--danger` |

---

### Empty States

- Text-align: center
- Padding: 60px 40px
- Icon container: 64x64px, radius 14px, bg `--surface-raised`, border 1px `--border`
- Icon SVG: 28x28px, stroke `--text-light`, stroke-width 1.5
- Title: `--display` font, 18px, weight 600, color `--white`, margin-bottom 6px
- Description: 14px, color `--text-light`, max-width 320px, margin-bottom 24px
- CTA: use `.btn .btn-primary .btn-sm`

---

### Loading Skeletons

- Background: linear-gradient sweep from `--surface-raised` to `--surface-hover` to `--surface-raised`
- Background-size: 200% 100%
- Animation: shimmer 1.5s infinite
- Base radius: 8px

| Variant | Height | Width | Additional |
|---------|--------|-------|------------|
| Text | 14px | 100% (last child: 60%) | margin-bottom 10px |
| Heading | 24px | 50% | margin-bottom 16px |
| Avatar | 40x40px | — | border-radius: 50% |
| Block | 120px | 100% | — |

---

### Breadcrumbs

- Layout: flex, center-aligned, gap 8px
- Font: 13px
- Items: color `--text-light`, weight 500, hover `--text-mid`
- Current item: color `--white`, weight 600
- Separator: `/` character, color `--text-light`, 11px

---

### Tooltips

- Background: `--surface-hover`
- Border: 1px `--border`
- Radius: 8px
- Padding: 8px 14px
- Font: 12px, weight 500, color `--text`
- Shadow: `--shadow-md`
- Position: absolute, bottom `calc(100% + 8px)`, centered
- Arrow: CSS triangle (5px border), color matches bg

---

### Avatars

- Shape: circle
- Font: `--display`, weight 600, color white
- Content: initials

| Size | Dimensions | Font Size |
|------|-----------|-----------|
| Small | 28x28px | 11px |
| Medium | 36x36px | 14px |
| Large | 48x48px | 18px |

Background colors: any brand color (`--primary`, `--secondary`, `--accent-violet-solid`).

---

### App Sidebar

- Width: 240px
- Background: `--surface`
- Border-right: 1px `--border`
- Padding: 20px 0

#### Items

- Layout: flex, center-aligned, gap 10px
- Padding: 10px 20px
- Font: 14px, weight 500, color `--text-mid`
- Border-left: 3px solid transparent
- Icon: 18x18px, stroke-width 1.8
- Hover: color `--white`, bg `rgba(255,255,255,0.03)`
- Active: color `--white`, bg `--primary-soft`, border-left `--primary`

#### User Menu (Sidebar Footer)

Positioned at the bottom of the sidebar via `margin-top: auto`. Composes Avatar + Dropdown to show the logged-in user identity and account actions.

##### Trigger

- Layout: flex, center-aligned, gap 12px
- Padding: 12px 20px
- Border-top: 1px `--border`
- Cursor: pointer
- Transition: background 0.15s
- Hover: bg `rgba(255,255,255,0.03)`

##### User Info

- Name: 13px, weight 600, color `--white`
- Email: 11px, weight 500, color `--text-light`, `text-overflow: ellipsis`

##### Expand Icon

- Size: 16x16px, stroke `--text-light`
- Positioned right via `margin-left: auto`

##### Dropdown (opens above trigger)

- Uses standard Dropdown Menu component
- Position: absolute, bottom `calc(100% + 6px)`, left 12px, right 12px
- Contains: plan badge row, divider, settings link, divider, logout (danger item)
- Plan row: flex, space-between, padding 10px 14px, non-interactive
  - Label: 12px, weight 500, color `--text-light`
  - Badge: uses standard Badge component

---

## Layout

### Container

- Max-width: 1140px
- Padding: 0 28px
- Centered with `margin: 0 auto`

### Grid Patterns

| Pattern | Columns | Gap | Usage |
|---------|---------|-----|-------|
| App shell | `240px 1fr` | — | Sidebar + main content |
| Auth | `1fr 1fr` | — | Brand panel + form panel |
| Bento | `repeat(3, 1fr)` | 16px | Feature grid |
| Pricing | `repeat(2, 1fr)` | 20px | Pricing cards, max-width 820px |
| Settings grid | `repeat(2, 1fr)` | 20px | Account info cards |

### Responsive Breakpoint

**@media (max-width: 900px):**

- App shell: single column, sidebar hidden off-screen
- Auth: single column, brand panel hidden
- Sidebar: fixed, slides in from left via translateX
- Main padding: 24px 16px
- All multi-column grids: single column

---

## Icon Guidelines

- Library: Lucide-style SVG icons
- Default size: 24x24px (in icon boxes), 18x18px (in buttons/nav), 16x16px (in dropdowns/toasts)
- Stroke properties: `fill: none`, `stroke-width: 1.8`, `stroke-linecap: round`, `stroke-linejoin: round`
- Color: inherited via `stroke: currentColor` (except icon boxes which use specific colors)

---

## Design Principles

1. **Precision over playfulness** — Finance-grade clarity. Every element serves a purpose.
2. **No glows** — All shadows are neutral black-alpha. No colored box-shadows.
3. **Elevation via shadow** — Use shadow tokens (sm to xl) to communicate depth.
4. **Subtle borders** — Low-alpha white borders (0.08-0.14) define edges without harshness.
5. **Semantic color system** — Success, warning, danger, info each have solid + soft (0.1 alpha) variants.
6. **Warm + cool accent pairing** — Amber/gold (warm primary) and teal (cool secondary) create visual balance inspired by financial dashboards.
7. **Refined radii** — Professional, not bubbly (6-18px range for most elements, pill for buttons/badges).
8. **Geometric precision for hierarchy** — Space Grotesk display font delivers tech-forward confidence; Geist body font ensures readability.
9. **Spring easing for interaction** — Buttons and interactive elements use bouncy spring curve for tactile feel.
10. **Consistent 4px grid** — All spacing values are multiples of 4px.
11. **Readability first** — Optimized text contrast, generous line-heights, and careful font sizing for data-dense interfaces.
