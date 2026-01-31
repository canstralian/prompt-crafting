# Technical Layout Blueprint

**Extraction Date:** 2026-01-31
**Source Files:** `LandingPage.tsx`, `Header.tsx`, `motion.tsx`, `index.css`, `tailwind.config.ts`

---

## High-Level Layout Map

The page is a vertical stack: a single-column flex container (`<div className="flex flex-col">`) with seven major sections:

| Order | Section | Purpose |
|-------|---------|---------|
| 1 | Hero | Brand/CTA |
| 2 | Social Proof | Logos row |
| 3 | Features Grid | 6 feature cards |
| 4 | How it Works | 3-step process |
| 5 | Testimonials | 3 cards |
| 6 | CTA | Second hero-style conversion block |
| 7 | Resources Preview | 3 resource cards + "view all" button |

Also: JSON-LD script injected at top of render.

---

## Global Layout Conventions

### Container Strategy

Source: `tailwind.config.ts:9-15`

```js
container: {
  center: true,
  padding: '2rem',
  screens: {
    '2xl': '1400px'
  }
}
```

Every section uses `<div className="container">` as the outer alignment primitive:
- **Max-width:** 1400px at 2xl breakpoint
- **Horizontal padding:** 2rem (32px)
- **Centering:** Auto-centered via `margin: 0 auto`

Inner content further narrows using:
- `max-w-3xl` (Hero headline)
- `max-w-2xl` (CTA, section descriptions)
- `max-w-4xl` (How it Works grid)
- `max-w-5xl` (Testimonials grid)

### Spacing Rhythm (Vertical)

| Section | Padding | Notes |
|---------|---------|-------|
| Hero | `py-28 md:py-40` | Very large top block |
| Social Proof | `py-12` | Small separator |
| Features | `py-20 md:py-32` | Standard large |
| How it Works | `py-20 md:py-32` | Standard large |
| Testimonials | `py-20 md:py-32` | Standard large |
| CTA | `py-24 md:py-36` | Heavier than standard |
| Resources | `py-20 md:py-32` | Standard large |

**Pattern:** Big-block SaaS cadence with consistent `py-20 md:py-32` for content sections.

### Typography Scale

| Context | Classes | Notes |
|---------|---------|-------|
| Hero heading | `text-4xl md:text-6xl lg:text-7xl leading-[1.1]` | Tight leading |
| Section headings | `text-3xl md:text-4xl` | Standard |
| CTA heading | `text-3xl md:text-5xl` | Slightly larger |
| Body lead | `text-lg md:text-xl` | Hero/CTA |
| Body standard | `text-lg text-muted-foreground` | Sections |

**Font Stack:** Space Grotesk (sans), Lora (serif), Space Mono (mono)

---

## Header Structure

Source: `Header.tsx`

### Layout Pattern

```
sticky top-0 z-50 w-full
├── container (h-16)
│   ├── Logo + Nav (gap-12)
│   │   └── nav links (gap-1, hidden md:flex)
│   └── Desktop Actions (gap-3, hidden md:flex)
│       ├── ThemeToggle
│       ├── Log in (ghost button)
│       └── CTA (accent button)
└── Mobile menu drawer (md:hidden)
```

### Scroll Behavior

```tsx
scrolled
  ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50"
  : "bg-background/80 backdrop-blur-sm border-b border-transparent"
```

- **Height:** Fixed `h-16` (64px)
- **Scroll offset for sections:** `.scroll-section { scroll-mt-20 }` (80px)
- **Sticky with backdrop blur on scroll**

### Nav Styling

- **Links:** `px-4 py-2 text-sm font-medium tracking-wide rounded-lg`
- **Active state:** `text-primary` with custom `ActiveIndicator` (dots + lines)
- **Hover:** `text-foreground hover:bg-secondary/60`

### CTA Button Pattern

Desktop CTA uses inline utility overrides:
```
bg-accent hover:bg-accent/90 text-accent-foreground
rounded-lg font-medium tracking-wide
shadow-sm hover:shadow-md
```

---

## Section-by-Section Format

### 1. Hero Section

**Wrapper:**
```
relative overflow-hidden bg-hero-gradient py-28 md:py-40
```

**Decorative Layers:**
- `NetworkPattern` overlay (opacity 0.08, white)
- 2 blurred blobs: `bg-accent/10 rounded-full blur-3xl` and `bg-primary/20 rounded-full blur-3xl`
- Bottom gradient overlay: `bg-gradient-to-b from-transparent via-transparent to-black/30`

**Content:**
- Container → `mx-auto max-w-3xl text-center`
- Badge: `variant="premium"` with manual overrides `bg-white/10 border-white/20 text-white backdrop-blur-sm`
- Gradient text: `bg-gradient-to-r from-accent via-accent to-orange-300 bg-clip-text text-transparent`

**⚠️ Risk:** `to-orange-300` hardcodes non-token color.

**CTA Row:**
```
flex flex-col sm:flex-row gap-4 justify-center
```
- Primary: `Button variant="accent" size="xl"` + `shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30`
- Secondary: `Button variant="hero-outline" size="xl"` + `backdrop-blur-sm`

---

### 2. Social Proof Section

**Wrapper:**
```
py-12 border-b border-border
```

**Content:**
- Centered muted microtext
- Logos: `flex flex-wrap justify-center gap-8 md:gap-16`
- Each logo: `opacity-50 text-muted-foreground`

**Format:** Clean structural separator using `border-border` token.

---

### 3. Features Grid

**Wrapper:**
```
py-20 md:py-32 relative overflow-hidden
NetworkPattern (opacity 0.03, variant="sparse")
```

**Header:**
- Centered, `max-w-2xl` for description
- Badge: `variant="secondary"`

**Grid:**
```
grid md:grid-cols-2 lg:grid-cols-3 gap-6
```

**Card (MotionCard):**
```
group p-6 shadow-sm h-full
```

**Icon Tile:**
```
h-12 w-12 bg-accent/10 border border-accent/20
group-hover:bg-accent/20 transition-colors
```
Icon uses `text-accent`.

---

### 4. How it Works

**Wrapper:**
```
py-20 md:py-32 bg-muted/50 relative overflow-hidden
NetworkPattern (opacity 0.04, size 80)
```

**Grid:**
```
grid md:grid-cols-3 gap-8 max-w-4xl mx-auto
```

**Step Marker:**
```
inline-flex h-12 w-12 bg-primary text-primary-foreground
items-center justify-center text-lg font-bold shadow-sm
```

**⚠️ Note:** No `rounded` class specified—inherits default (sharp edges unless base styles apply).

---

### 5. Testimonials

**Wrapper:**
```
py-20 md:py-32 relative overflow-hidden
NetworkPattern (opacity 0.025, variant="sparse", size 100)
```

**Grid:**
```
grid md:grid-cols-3 gap-6 max-w-5xl mx-auto
```

**Card:**
```
MotionCard p-6 shadow-sm h-full
```

Quote uses `text-lg`.

---

### 6. CTA Section

**Wrapper:**
```
py-24 md:py-36 bg-hero-gradient relative overflow-hidden
NetworkPattern (opacity 0.06, size 80, variant="dense", colorClass="text-white")
```

**Decorative:**
```
absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
w-[600px] h-[400px] bg-accent/15 rounded-full blur-3xl
```

**Content:**
```
container → mx-auto max-w-2xl text-center
```

Same accent CTA pattern as hero.

---

### 7. Resources Preview

**Wrapper:**
```
py-20 md:py-32 relative overflow-hidden
NetworkPattern (opacity 0.03, variant="sparse", size 70)
```

**Header Row:**
```
flex flex-col md:flex-row items-start md:items-center justify-between mb-12
```

**Grid:**
```
grid md:grid-cols-3 gap-6
```

**Card:**
- Link wrapper: `block h-full`
- MotionCard: `group p-6 shadow-sm h-full`
- Category badge: `variant="muted"`
- Title hover: `group-hover:text-primary transition-colors`

---

## Component Analysis

### MotionCard Base Styles

Source: `motion.tsx:72-88`

```tsx
<motion.div
  className={cn("border bg-card text-card-foreground", className)}
  initial="rest"
  whileHover={hoverEffect ? "hover" : undefined}
  variants={cardHover}
/>
```

**Base classes:**
- `border` (uses `--border` token)
- `bg-card` (uses `--card` token)
- `text-card-foreground`

**Hover animation (cardHover):**
```js
rest: { y: 0, x: 0 }
hover: { y: -4, x: -4 }  // Lift up-left
```

**⚠️ Gap:** MotionCard does NOT include:
- `rounded` (no border-radius)
- Built-in shadow (relies on passed `shadow-sm`)

---

### Design Token Sources

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `--primary` | 174 72% 40% (teal) | 174 72% 50% | CTAs, step markers |
| `--accent` | 24 95% 53% (orange) | 24 95% 58% | Icon tiles, highlights |
| `--radius` | 0.5rem | 0.5rem | Border radius base |
| `--shadow-sm` | Soft drop shadow | Darker drop | Cards |
| `--border` | 200 20% 88% | 200 15% 22% | Dividers, card borders |

---

## Styling Risks & Mismatches

### 1. Hero Gradient Text Hardcodes `orange-300`

**Location:** `LandingPage.tsx:164`
```tsx
<span className="bg-gradient-to-r from-accent via-accent to-orange-300 bg-clip-text text-transparent">
```

**Issue:** Bypasses token system. Will drift if accent changes.

**Fix:** Define `--accent-soft` or `--accent-light` token and use `to-[hsl(var(--accent-soft))]`.

---

### 2. Blur Motif Conflicts with Hard-Edge Direction

**Locations:** Hero and CTA sections use:
- `blur-3xl` on decorative blobs
- `backdrop-blur-sm` on buttons/header

**Issue:** If moving toward brutalist/hard-offset aesthetic, blur is incompatible.

**Fix:** Either:
- Remove blur entirely, OR
- Replace blurred blobs with sharp geometric shapes + offset shadows

---

### 3. Card System Split

**`.card-elevated` defined in CSS (`index.css:214-216`):**
```css
.card-elevated {
  @apply bg-card border shadow-md hover:shadow-lg transition-shadow duration-200;
}
```

**But LandingPage uses:** `MotionCard` with `shadow-sm` passed inline.

**Issue:** Two card styling sources—potential confusion.

**Fix:** Consolidate:
- Option A: MotionCard wraps `Card` component, styling moves to Card
- Option B: MotionCard is the base, remove `.card-elevated`

---

### 4. Missing Border Radius on Step Markers

**Location:** `LandingPage.tsx:283`
```tsx
<div className="inline-flex h-12 w-12 bg-primary text-primary-foreground items-center justify-center">
```

**Issue:** No `rounded` class. Uses default (square).

**Decision needed:** Match card radius or intentionally square for contrast?

---

### 5. Accent Color Hierarchy

**Current:** Accent (orange) dominates:
- Icon tiles
- CTA buttons
- Hero gradient

**Primary (teal):** Only used for:
- Step markers
- Text hovers
- Active nav indicators

**Issue:** Visual hierarchy unclear—accent may overpower primary.

**Fix:** Establish rule:
- **Primary:** CTAs, major headings, step markers
- **Accent:** Highlights, iconography, secondary emphasis

---

## Next Steps by Section

### Hero
- [ ] Replace `to-orange-300` with tokenized gradient stop
- [ ] Decide blur vs hard-edge direction
- [ ] Standardize badge styling (remove manual overrides)

### Social Proof
- [ ] Keep as-is (clean separator)
- [ ] Verify border weight if moving to high-contrast theme

### Features Grid
- [ ] Confirm MotionCard includes border/radius/background
- [ ] If hard-offset: add offset shadows, sharp borders to cards
- [ ] Icon tiles: consider square (no rounding) for brutalist direction

### How it Works
- [ ] Decide step marker rounding (square or rounded?)
- [ ] Ensure step blocks match card grammar

### Testimonials
- [ ] Add subtle border if MotionCard lacks one
- [ ] Good candidate for demonstrating new shadow system

### CTA Section
- [ ] Same as Hero: blur vs hard geometry decision
- [ ] Align CTA button with new primary/accent hierarchy

### Resources Preview
- [ ] Verify `group-hover:text-primary` works with new primary
- [ ] Align outline button with new border/shadow language

---

## File Reference Quick Links

| File | Key Lines | Purpose |
|------|-----------|---------|
| `src/pages/LandingPage.tsx` | 135-392 | Main layout structure |
| `src/components/layout/Header.tsx` | 52-241 | Header/nav pattern |
| `src/components/ui/motion.tsx` | 72-88 | MotionCard base |
| `src/index.css` | 16-170 | Design tokens |
| `tailwind.config.ts` | 9-15 | Container config |
