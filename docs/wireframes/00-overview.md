# PromptCrafting.net - UI/UX Wireframes

## Design System Foundation

### Brand Colors (existing palette maintained)
| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| **Primary** | Deep Slate `hsl(222, 47%, 11%)` | Nearly White `hsl(210, 40%, 98%)` | Primary text, buttons |
| **Accent** | Warm Amber `hsl(38, 92%, 50%)` | Warm Amber `hsl(38, 92%, 50%)` | CTAs, highlights, hero elements |
| **Success** | Green `hsl(142, 76%, 36%)` | Green `hsl(142, 76%, 36%)` | Positive states, confirmations |
| **Warning** | Amber/Neutral (low saturation) | Amber/Neutral | Warnings, lint issues |
| **Destructive** | Red `hsl(0, 84%, 60%)` | Red `hsl(0, 62%, 50%)` | Dangerous actions |

### Typography
- **Font Family:** Inter (with cv02, cv03, cv04, cv11 OpenType features)
- **Scale:** Tailwind default with brand refinements

### Motion Principles
- Drawer slides: 200ms ease-out
- Section expand/collapse: 150ms ease-in-out
- Fade transitions: 200ms
- Button press: scale(0.98) on active

---

## Wireframe Index

1. [Home Page](./01-home.md) - Landing with mini-builder
2. [Builder (Prompt IDE)](./02-builder.md) - 3-column structured editor
3. [Templates Page](./03-templates.md) - Discovery and preview
4. [My Library](./04-library.md) - Personal knowledge loop
5. [Onboarding Wizard](./05-onboarding.md) - Guided first experience
6. [Learn Hub](./06-learn.md) - Education to product usage
7. [Pricing Page](./07-pricing.md) - Clear tier comparison
8. [Team & Sharing](./08-team-sharing.md) - Collaboration modals
9. [Micro-interactions](./09-micro-interactions.md) - Component behaviors
10. [Navigation Architecture](./10-navigation.md) - IA and nav patterns

---

## Key UX Principles

### 1. Reduce Blank-Page Moments
Every empty state includes:
- 1 sentence of guidance
- 1 primary action button
- 1 example template link

### 2. Progressive Disclosure
- Advanced options collapsed by default
- "Show more" patterns for complex features
- Contextual help on hover

### 3. Guided Structure Over Free-form
- Structured prompt sections vs. single textarea
- Collapsible cards with labels and helper text
- Drag-and-drop component blocks

### 4. Fast Iteration Loops
- One-click "Improve" on each section
- A/B comparison mode
- Version history with quick restore

---

## Implementation Notes

- All wireframes use existing shadcn/ui components
- Color tokens reference CSS custom properties in `index.css`
- Responsive breakpoints: sm(640), md(768), lg(1024), 2xl(1400)
- Dark mode support via `.dark` class selector
