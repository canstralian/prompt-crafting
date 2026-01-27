# Pricing Page Wireframe

## Overview
The pricing page reduces ambiguity and improves purchase intent. Focus: clear tier comparison, tangible feature mapping, and FAQ that addresses real concerns.

---

## ASCII Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Logo]     Templates  Builder  Library  Learn  Pricing              [Sign in]  [Start crafting]        │
│                                                    ↑ active                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PAGE HEADER (py-16, text-center)                                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│                         Simple, transparent pricing                                                     │
│                         ═══════════════════════════                                                     │
│                   Start free, upgrade when you need more power.                                         │
│                                                                                                         │
│                         ┌─────────────────────────────┐                                                 │
│                         │  Monthly  │  Yearly (20% off)│                                                │
│                         └─────────────────────────────┘                                                 │
│                                       ↑ toggle                                                          │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PRICING TIERS (container, grid 3 cols)                                                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  ┌─────────────────────────┐              │
│  │                         │  │ ★ BEST VALUE                │  │                         │              │
│  │  FREE                   │  │                             │  │  TEAM                   │              │
│  │  ─────────────────────  │  │  PRO                        │  │  ─────────────────────  │              │
│  │                         │  │  ─────────────────────────  │  │                         │              │
│  │  $0                     │  │                             │  │  $49                    │              │
│  │  forever                │  │  $19                        │  │  per user/month         │              │
│  │                         │  │  per month                  │  │  billed annually        │              │
│  │  ─────────────────────  │  │                             │  │                         │              │
│  │                         │  │  ($15/mo billed yearly)     │  │  ─────────────────────  │              │
│  │  Perfect for trying     │  │                             │  │                         │              │
│  │  out prompt crafting    │  │  ─────────────────────────  │  │  For teams that need    │              │
│  │                         │  │                             │  │  collaboration +        │              │
│  │  ─────────────────────  │  │  For individuals who        │  │  governance             │              │
│  │                         │  │  craft prompts daily        │  │                         │              │
│  │  INCLUDES:              │  │                             │  │  ─────────────────────  │              │
│  │                         │  │  ─────────────────────────  │  │                         │              │
│  │  ✓ 10 prompts           │  │                             │  │  INCLUDES:              │              │
│  │                         │  │  INCLUDES:                  │  │                         │              │
│  │  ✓ Basic templates      │  │                             │  │  Everything in Pro, plus:│             │
│  │                         │  │  Everything in Free, plus:  │  │                         │              │
│  │  ✓ Community access     │  │                             │  │  ✓ Unlimited team       │              │
│  │                         │  │  ✓ Unlimited prompts        │  │    members              │              │
│  │  ✓ 5 test runs/day      │  │                             │  │                         │              │
│  │                         │  │  ✓ All templates            │  │  ✓ Shared workspaces    │              │
│  │                         │  │                             │  │                         │              │
│  │                         │  │  ✓ Version history          │  │  ✓ Role-based access    │              │
│  │                         │  │    (unlimited versions)     │  │                         │              │
│  │                         │  │                             │  │  ✓ Team analytics       │              │
│  │                         │  │  ✓ A/B testing              │  │                         │              │
│  │                         │  │                             │  │  ✓ Audit logs           │              │
│  │                         │  │  ✓ Prompt lint +            │  │                         │              │
│  │                         │  │    evaluation               │  │  ✓ SSO (SAML)           │              │
│  │                         │  │                             │  │                         │              │
│  │                         │  │  ✓ Unlimited test runs      │  │  ✓ Priority support     │              │
│  │                         │  │                             │  │                         │              │
│  │                         │  │  ✓ Export (Markdown,        │  │  ✓ Custom integrations  │              │
│  │                         │  │    JSON, Notion)            │  │                         │              │
│  │                         │  │                             │  │                         │              │
│  │                         │  │  ✓ Library: 100 prompts     │  │  ✓ Library: unlimited   │              │
│  │                         │  │                             │  │                         │              │
│  │  ─────────────────────  │  │  ─────────────────────────  │  │  ─────────────────────  │              │
│  │                         │  │                             │  │                         │              │
│  │  [Get started free]     │  │  [Start free trial]         │  │  [Contact sales]        │              │
│  │  (outline button)       │  │  (accent button, large)     │  │  (outline button)       │              │
│  │                         │  │                             │  │                         │              │
│  │                         │  │  14-day free trial          │  │  Talk to our team       │              │
│  │                         │  │  No credit card required    │  │                         │              │
│  │                         │  │                             │  │                         │              │
│  └─────────────────────────┘  └─────────────────────────────┘  └─────────────────────────┘              │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ FEATURE COMPARISON TABLE (collapsed by default, expandable)                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│  [▼ Compare all features]                                                                               │
│                                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              FREE          PRO           TEAM                                   │   │
│  │  ─────────────────────────────────────────────────────────────────────────────────────────────  │   │
│  │  PROMPT BUILDING                                                                                │   │
│  │  ─────────────────────────────────────────────────────────────────────────────────────────────  │   │
│  │  Prompts                      10            Unlimited     Unlimited                             │   │
│  │  Templates                    Basic         All           All + Custom                          │   │
│  │  Component blocks             ✓             ✓             ✓                                     │   │
│  │  Drag & drop builder          ✓             ✓             ✓                                     │   │
│  │  ─────────────────────────────────────────────────────────────────────────────────────────────  │   │
│  │  TESTING & EVALUATION                                                                           │   │
│  │  ─────────────────────────────────────────────────────────────────────────────────────────────  │   │
│  │  Test runs                    5/day         Unlimited     Unlimited                             │   │
│  │  Prompt lint                  Basic         Advanced      Advanced                              │   │
│  │  A/B testing                  ✗             ✓             ✓                                     │   │
│  │  Quick graders                ✗             ✓             ✓                                     │   │
│  │  Compare runs                 ✗             ✓             ✓                                     │   │
│  │  ─────────────────────────────────────────────────────────────────────────────────────────────  │   │
│  │  ORGANIZATION                                                                                   │   │
│  │  ─────────────────────────────────────────────────────────────────────────────────────────────  │   │
│  │  Library size                 10            100           Unlimited                             │   │
│  │  Folders                      3             Unlimited     Unlimited                             │   │
│  │  Version history              3 versions    Unlimited     Unlimited                             │   │
│  │  ─────────────────────────────────────────────────────────────────────────────────────────────  │   │
│  │  COLLABORATION                                                                                  │   │
│  │  ─────────────────────────────────────────────────────────────────────────────────────────────  │   │
│  │  Share links                  View only     View + Copy   Full access                           │   │
│  │  Team members                 ✗             ✗             Unlimited                             │   │
│  │  Workspaces                   ✗             ✗             Unlimited                             │   │
│  │  Role-based access            ✗             ✗             ✓                                     │   │
│  │  Audit logs                   ✗             ✗             ✓                                     │   │
│  │  ─────────────────────────────────────────────────────────────────────────────────────────────  │   │
│  │  EXPORT & INTEGRATIONS                                                                          │   │
│  │  ─────────────────────────────────────────────────────────────────────────────────────────────  │   │
│  │  Export formats               Markdown      All formats   All formats                           │   │
│  │  API access                   ✗             ✗             ✓                                     │   │
│  │  Custom integrations          ✗             ✗             ✓                                     │   │
│  │  SSO (SAML)                   ✗             ✗             ✓                                     │   │
│  │  ─────────────────────────────────────────────────────────────────────────────────────────────  │   │
│  │  SUPPORT                                                                                        │   │
│  │  ─────────────────────────────────────────────────────────────────────────────────────────────  │   │
│  │  Community support            ✓             ✓             ✓                                     │   │
│  │  Email support                ✗             ✓             ✓                                     │   │
│  │  Priority support             ✗             ✗             ✓                                     │   │
│  │  Dedicated CSM                ✗             ✗             10+ seats                             │   │
│  │                                                                                                 │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ FAQ ACCORDION (focused on usage questions)                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│                         Frequently asked questions                                                      │
│                         ═════════════════════════════                                                   │
│                                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                                 │   │
│  │  [▼] What counts as a "prompt"?                                                                 │   │
│  │  ────────────────────────────────────────────────────────────────────────────────────────────── │   │
│  │  A prompt is a complete template you save to your library. You can have multiple versions      │   │
│  │  of the same prompt without using additional quota. Draft prompts that aren't saved don't      │   │
│  │  count toward your limit.                                                                       │   │
│  │                                                                                                 │   │
│  │  [▶] What's included in "test runs"?                                                            │   │
│  │  ────────────────────────────────────────────────────────────────────────────────────────────── │   │
│  │                                                                                                 │   │
│  │  [▶] Can I upgrade or downgrade anytime?                                                        │   │
│  │  ────────────────────────────────────────────────────────────────────────────────────────────── │   │
│  │                                                                                                 │   │
│  │  [▶] How does team billing work?                                                                │   │
│  │  ────────────────────────────────────────────────────────────────────────────────────────────── │   │
│  │                                                                                                 │   │
│  │  [▶] What happens if I exceed my limits?                                                        │   │
│  │  ────────────────────────────────────────────────────────────────────────────────────────────── │   │
│  │                                                                                                 │   │
│  │  [▶] Do you offer discounts for startups or non-profits?                                        │   │
│  │  ────────────────────────────────────────────────────────────────────────────────────────────── │   │
│  │                                                                                                 │   │
│  │  [▶] What's the refund policy?                                                                  │   │
│  │  ────────────────────────────────────────────────────────────────────────────────────────────── │   │
│  │                                                                                                 │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                         │
│                                                                                                         │
│                         Still have questions?                                                           │
│                         [Contact us] or [Schedule a demo]                                               │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Billing Toggle

```tsx
// Component: components/pricing/BillingToggle.tsx

export function BillingToggle({
  value,
  onChange,
}: {
  value: 'monthly' | 'yearly';
  onChange: (value: 'monthly' | 'yearly') => void;
}) {
  return (
    <div className="inline-flex items-center gap-3 p-1 bg-muted rounded-lg">
      <button
        onClick={() => onChange('monthly')}
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-colors",
          value === 'monthly'
            ? "bg-background shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Monthly
      </button>
      <button
        onClick={() => onChange('yearly')}
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
          value === 'yearly'
            ? "bg-background shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Yearly
        <Badge variant="success" className="text-[10px]">20% off</Badge>
      </button>
    </div>
  );
}
```

### Pricing Card

```tsx
// Component: components/pricing/PricingCard.tsx

interface PricingCardProps {
  tier: PricingTier;
  billingPeriod: 'monthly' | 'yearly';
  isHighlighted?: boolean;
}

export function PricingCard({
  tier,
  billingPeriod,
  isHighlighted,
}: PricingCardProps) {
  const price = billingPeriod === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice;

  return (
    <Card
      className={cn(
        "relative flex flex-col",
        isHighlighted && "border-accent shadow-glow scale-105 z-10"
      )}
    >
      {/* Best Value badge */}
      {isHighlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="accent" className="px-3 py-1">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Best Value
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">{tier.name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">${price}</span>
          {tier.priceUnit && (
            <span className="text-muted-foreground">/{tier.priceUnit}</span>
          )}
        </div>
        {billingPeriod === 'yearly' && tier.monthlySavings && (
          <p className="text-sm text-muted-foreground mt-1">
            ${tier.yearlyMonthlyEquivalent}/mo billed yearly
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground text-center mb-6">
          {tier.description}
        </p>

        <Separator className="my-4" />

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">INCLUDES:</p>
          {tier.inheritFrom && (
            <p className="text-sm text-muted-foreground italic mb-2">
              Everything in {tier.inheritFrom}, plus:
            </p>
          )}
          <ul className="space-y-2">
            {tier.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-6">
        <Button
          className="w-full"
          variant={isHighlighted ? 'accent' : 'outline'}
          size="lg"
        >
          {tier.ctaLabel}
        </Button>
        {tier.ctaSubtext && (
          <p className="text-xs text-muted-foreground text-center">
            {tier.ctaSubtext}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
```

### Feature Comparison Table

```tsx
// Component: components/pricing/FeatureComparisonTable.tsx

export function FeatureComparisonTable({ tiers, features }: FeatureComparisonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium mx-auto">
        <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
        Compare all features
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4 font-medium"></th>
                {tiers.map((tier) => (
                  <th key={tier.name} className="text-center py-4 px-4 font-medium">
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(features).map(([category, items]) => (
                <Fragment key={category}>
                  <tr>
                    <td
                      colSpan={tiers.length + 1}
                      className="py-3 px-4 text-sm font-semibold text-muted-foreground bg-muted/50"
                    >
                      {category}
                    </td>
                  </tr>
                  {items.map((item) => (
                    <tr key={item.name} className="border-b border-border/50">
                      <td className="py-3 px-4 text-sm">{item.name}</td>
                      {tiers.map((tier) => (
                        <td key={tier.name} className="text-center py-3 px-4">
                          <FeatureValue value={item.values[tier.name]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="h-4 w-4 text-success mx-auto" />;
  }
  if (value === false) {
    return <X className="h-4 w-4 text-muted-foreground/50 mx-auto" />;
  }
  return <span className="text-sm">{value}</span>;
}
```

### FAQ Accordion

```tsx
// Component: components/pricing/PricingFAQ.tsx

const FAQ_ITEMS = [
  {
    question: "What counts as a \"prompt\"?",
    answer: "A prompt is a complete template you save to your library. You can have multiple versions of the same prompt without using additional quota. Draft prompts that aren't saved don't count toward your limit."
  },
  {
    question: "What's included in \"test runs\"?",
    answer: "A test run is when you execute your prompt against a model to see the output. Each time you click 'Run test' in the Builder counts as one test run. Viewing previous results doesn't count."
  },
  {
    question: "Can I upgrade or downgrade anytime?",
    answer: "Yes! You can change your plan at any time. Upgrades take effect immediately with prorated billing. Downgrades take effect at the end of your current billing period."
  },
  {
    question: "How does team billing work?",
    answer: "Team plans are billed per seat. You only pay for active team members. You can add or remove seats at any time, with prorated adjustments."
  },
  {
    question: "What happens if I exceed my limits?",
    answer: "We'll notify you when you're approaching limits. On Free, you'll need to upgrade to continue. On Pro, you can purchase additional capacity or upgrade to Team."
  },
  {
    question: "Do you offer discounts for startups or non-profits?",
    answer: "Yes! We offer 50% off for verified startups (under 2 years old, less than $1M funding) and 30% off for registered non-profits. Contact us to apply."
  },
  {
    question: "What's the refund policy?",
    answer: "We offer a full refund within 14 days of purchase if you're not satisfied. After 14 days, we'll provide prorated credit for the remaining period."
  },
];

export function PricingFAQ() {
  return (
    <section className="py-16">
      <div className="container max-w-3xl">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently asked questions
        </h2>

        <Accordion type="single" collapsible className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <div className="flex justify-center gap-4">
            <Button variant="outline">Contact us</Button>
            <Button variant="accent">Schedule a demo</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## Pricing Tiers Data

| Feature | Free | Pro | Team |
|---------|------|-----|------|
| Price | $0 | $19/mo ($15 yearly) | $49/user/mo |
| Prompts | 10 | Unlimited | Unlimited |
| Test runs | 5/day | Unlimited | Unlimited |
| Templates | Basic | All | All + Custom |
| Versions | 3 | Unlimited | Unlimited |
| A/B testing | No | Yes | Yes |
| Prompt lint | Basic | Advanced | Advanced |
| Library size | 10 | 100 | Unlimited |
| Team members | - | - | Unlimited |
| Export | Markdown | All | All |
| SSO | - | - | Yes |
| Support | Community | Email | Priority |

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (<768px) | Cards stack vertically, highlighted card first |
| Tablet (768-1023px) | 3-column but smaller cards |
| Desktop (≥1024px) | Full 3-column with highlighted center |

### Mobile Adaptations
- Billing toggle becomes full-width
- Cards stack with horizontal scroll option
- Feature table becomes comparison cards
- FAQ items have more padding for touch
