# Micro-interactions & Component Behaviors

## Overview
This document specifies the interaction patterns, animations, and micro-behaviors that create a premium, polished feel while maintaining the existing brand aesthetic.

---

## Button Interactions

### Primary CTA (Accent)
Uses the existing warm amber accent color (`hsl(38, 92%, 50%)`).

```css
.button-accent {
  background: linear-gradient(135deg, hsl(38, 92%, 50%), hsl(28, 92%, 45%));
  transition: all 200ms ease-out;
}

.button-accent:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px hsl(38, 92%, 50%, 0.4);
}

.button-accent:active {
  transform: scale(0.98);
  box-shadow: 0 2px 4px -1px hsl(38, 92%, 50%, 0.3);
}

.button-accent:focus-visible {
  outline: 2px solid hsl(38, 92%, 50%);
  outline-offset: 2px;
}
```

### Ghost / Secondary
Subtle transitions for secondary actions.

```css
.button-ghost {
  background: transparent;
  color: hsl(222, 47%, 30%);
  transition: all 150ms ease;
}

.button-ghost:hover {
  background: hsl(220, 14%, 96%);
}

.button-ghost:active {
  transform: scale(0.98);
}
```

### Hero Button (Landing Page)
High-contrast for dark backgrounds.

```css
.button-hero {
  background: white;
  color: hsl(222, 47%, 11%);
  transition: all 200ms ease-out;
}

.button-hero:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.3);
}
```

---

## Animation Timings

| Element | Duration | Easing | Notes |
|---------|----------|--------|-------|
| Button hover | 200ms | ease-out | translateY + shadow |
| Button press | 100ms | ease-in | scale(0.98) |
| Drawer slide | 200ms | ease-out | translateX |
| Modal appear | 200ms | ease-out | scale + opacity |
| Accordion expand | 150ms | ease-in-out | height + opacity |
| Toast appear | 300ms | spring | translateY + opacity |
| Toast dismiss | 200ms | ease-in | translateY + opacity |
| Tooltip appear | 100ms | ease-out | opacity + scale |
| Card hover | 200ms | ease-out | translateY + shadow |
| Tab switch | 0ms | - | Instant content swap |
| Progress bar | 300ms | ease-out | width |
| Skeleton pulse | 1500ms | ease-in-out | opacity loop |

---

## Component Behaviors

### Cards

```tsx
// Elevated card with hover lift
<Card className="card-elevated">
  {/* Hover: translateY(-4px), shadow-lg, border-accent/20 */}
</Card>
```

**States:**
- Default: `shadow-sm`, border-border
- Hover: `shadow-lg`, `-translate-y-1`, border-accent/20
- Focus (keyboard): Focus ring with accent color
- Selected: border-accent, bg-accent/5

### Inputs

**Focus behavior:**
```css
.input:focus {
  border-color: hsl(38, 92%, 50%);
  box-shadow: 0 0 0 3px hsl(38, 92%, 50%, 0.1);
  outline: none;
}
```

**Error state:**
```css
.input-error {
  border-color: hsl(0, 84%, 60%);
  box-shadow: 0 0 0 3px hsl(0, 84%, 60%, 0.1);
}
```

### Tooltips

```tsx
<TooltipProvider delayDuration={300}>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent side="top" sideOffset={4}>
      Helpful text
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

- Delay: 300ms before showing
- Animation: 100ms fade + scale from 95%
- Arrow: Pointing to trigger

### Dropdowns & Selects

**Open animation:**
```css
.dropdown-content {
  animation: dropdown-in 150ms ease-out;
}

@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Progress Indicators

**Linear progress:**
```css
.progress-bar {
  transition: width 300ms ease-out;
}
```

**Circular/loading:**
```css
.spinner {
  animation: spin 1s linear infinite;
}
```

---

## State Colors

Using the existing palette with low-saturation variants for subtlety:

### Success States
```css
--success: hsl(142, 76%, 36%);
--success-bg: hsl(142, 76%, 96%);
--success-border: hsl(142, 76%, 80%);
```

Use for:
- Completed tasks
- Successful saves
- Passing lint checks
- Toast confirmations

### Warning States
```css
--warning: hsl(38, 70%, 50%);
--warning-bg: hsl(38, 70%, 96%);
--warning-border: hsl(38, 70%, 80%);
```

Use for:
- Lint warnings
- Approaching limits
- Non-critical alerts

### Error/Destructive States
```css
--destructive: hsl(0, 84%, 60%);
--destructive-bg: hsl(0, 84%, 96%);
--destructive-border: hsl(0, 84%, 80%);
```

Use for:
- Form errors
- Failed actions
- Delete confirmations

### Info States
```css
--info: hsl(220, 70%, 50%);
--info-bg: hsl(220, 70%, 96%);
--info-border: hsl(220, 70%, 80%);
```

Use for:
- Tips and hints
- Educational callouts
- Non-critical information

---

## Empty States

Every empty state follows this pattern:

```tsx
<EmptyState
  icon={<IconComponent className="h-12 w-12 text-muted-foreground/50" />}
  title="Clear, action-oriented title"
  description="One sentence explaining what to do."
  primaryAction={{ label: "Primary CTA", onClick: handlePrimary }}
  secondaryAction={{ label: "Alternative", href: "/alternative" }}
  exampleLink={{ label: "See example", href: "/example" }}
/>
```

**Visual structure:**
```
┌─────────────────────────────────────────┐
│                                         │
│           [Illustration/Icon]           │
│                                         │
│              Empty Title                │
│                                         │
│     One sentence of helpful guidance    │
│                                         │
│   [Primary CTA]   [Secondary Action]    │
│                                         │
│          or try an example →            │
│                                         │
└─────────────────────────────────────────┘
```

---

## Loading States

### Skeleton Screens
Use for initial page loads and lazy-loaded content.

```tsx
// Card skeleton
<Card className="animate-pulse">
  <CardHeader>
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2 mt-2" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-20 w-full" />
  </CardContent>
</Card>
```

### Inline Loaders
Use for button actions and form submissions.

```tsx
<Button disabled>
  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
  Saving...
</Button>
```

### Full-page Loaders
Rare - only for auth redirects or initial app load.

```tsx
<div className="min-h-screen flex items-center justify-center">
  <div className="text-center">
    <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent" />
    <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
  </div>
</div>
```

---

## Toast Notifications

Using Sonner with brand styling:

```tsx
// Success
toast.success("Prompt saved successfully", {
  description: "Your changes have been saved.",
});

// Error
toast.error("Failed to save", {
  description: "Please try again.",
  action: {
    label: "Retry",
    onClick: handleRetry,
  },
});

// Info
toast.info("Tip: Use keyboard shortcuts", {
  description: "Press Cmd+Enter to run tests.",
});
```

**Positioning:** Bottom-right
**Duration:** 4000ms (success), 6000ms (error), dismissible

---

## Focus Management

### Focus Rings
```css
.focus-ring {
  outline: 2px solid hsl(38, 92%, 50%);
  outline-offset: 2px;
}
```

### Focus Trapping
- Modals trap focus within
- Drawers trap focus within
- Tab through all interactive elements
- Escape closes modals/drawers

### Skip Links
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-background px-4 py-2 rounded-md">
  Skip to main content
</a>
```

---

## Motion Principles

### 1. Purposeful
Every animation serves a purpose:
- Guide attention
- Show cause and effect
- Provide feedback

### 2. Subtle
- Never flashy or distracting
- Respects `prefers-reduced-motion`
- Fast enough to not slow down users

### 3. Consistent
- Same elements animate the same way everywhere
- Timing values from the defined scale only
- Easings appropriate to the action

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Keyboard Shortcuts Reference

### Global
| Shortcut | Action |
|----------|--------|
| `/` | Focus search |
| `Cmd + K` | Command palette |
| `Cmd + N` | New prompt |
| `?` | Show keyboard shortcuts |

### Builder
| Shortcut | Action |
|----------|--------|
| `Cmd + S` | Save |
| `Cmd + Enter` | Run test |
| `Cmd + I` | Improve section |
| `Cmd + L` | Lock/unlock section |
| `Cmd + /` | Toggle lint panel |
| `Escape` | Close panel/modal |

### Navigation
| Shortcut | Action |
|----------|--------|
| `G then D` | Go to Dashboard |
| `G then L` | Go to Library |
| `G then B` | Go to Builder |
| `G then T` | Go to Templates |

---

## Touch Interactions

### Touch Targets
- Minimum 44×44px for all interactive elements
- 8px minimum spacing between targets
- Larger for primary actions (48×48px minimum)

### Gestures
- Swipe left on list items for quick actions (mobile)
- Pull-to-refresh on lists (mobile)
- Pinch-to-zoom disabled in app (standard on landing)

### Haptics (if supported)
- Light tap on button press
- Medium on successful action
- Error pattern on failed action
