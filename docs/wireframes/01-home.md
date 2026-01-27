# Home Page Wireframe

## Overview
The home page is the primary conversion engine. It combines a clear value proposition with an interactive mini-builder that lets visitors experience the product immediately.

---

## ASCII Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ HEADER (sticky, h-16, bg-background/95 backdrop-blur)                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [Logo]          Templates  Builder  Library  Learn  Pricing      [Sign in]    │
│                                      ↑                            [Start →]    │
│                                   [NEW]                           (primary)    │
│                                   pill                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│ HERO SECTION (min-h-[calc(100vh-4rem)], bg-hero-gradient)                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────┐    ┌─────────────────────────────────────────┐ │
│  │                             │    │ MINI BUILDER                            │ │
│  │  Craft prompts that         │    │ ┌─────────────────────────────────────┐ │ │
│  │  actually work.             │    │ │ [Write] [Code] [Image] [Sales]      │ │ │
│  │                             │    │ ├─────────────────────────────────────┤ │ │
│  │  • Structure beats          │    │ │                                     │ │ │
│  │    free-form every time     │    │ │  Goal                               │ │ │
│  │                             │    │ │  ┌─────────────────────────────┐    │ │ │
│  │  • Test, iterate, and       │    │ │  │ Write a product description │    │ │ │
│  │    version your prompts     │    │ │  └─────────────────────────────┘    │ │ │
│  │                             │    │ │                                     │ │ │
│  │                             │    │ │  Context                            │ │ │
│  │  ┌─────────────────────┐    │    │ │  ┌─────────────────────────────┐    │ │ │
│  │  │  Start crafting  →  │    │    │ │  │ SaaS tool for developers   │    │ │ │
│  │  └─────────────────────┘    │    │ │  │ that automates code review │    │ │ │
│  │  (hero button variant)      │    │ │  └─────────────────────────────┘    │ │ │
│  │                             │    │ │                                     │ │ │
│  │  ┌─────────────────────┐    │    │ │  Constraints                        │ │ │
│  │  │  Watch demo         │    │    │ │  [Professional] [Concise] [+]       │ │ │
│  │  └─────────────────────┘    │    │ │                                     │ │ │
│  │  (hero-outline variant)     │    │ │  Output format                      │ │ │
│  │                             │    │ │  ┌─────────────────────────────┐    │ │ │
│  └─────────────────────────────┘    │ │  │ Bullets            ▼       │    │ │ │
│                                      │ │  └─────────────────────────────┘    │ │ │
│                                      │ │                                     │ │ │
│                                      │ │  ┌─────────────────────────────┐    │ │ │
│                                      │ │  │   Generate prompt    →      │    │ │ │
│                                      │ │  └─────────────────────────────┘    │ │ │
│                                      │ │  (accent button)                    │ │ │
│                                      │ └─────────────────────────────────────┘ │ │
│                                      └─────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│ TRUST ROW (py-8, border-y, bg-muted/30)                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│    [Logo1]    [Logo2]    [Logo3]    [Logo4]    [Logo5]    [Logo6]              │
│                                                                                 │
│    ─── OR ───                                                                   │
│                                                                                 │
│    2,500+           50+              12K+            4.9★                       │
│    Templates        Teams           Prompts         Rating                      │
│    crafted          using daily     generated       on G2                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Header (Sticky)

```tsx
// Component: components/layout/Header.tsx (enhanced)

<header className="sticky top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container flex h-full items-center justify-between">
    {/* Left: Logo */}
    <Logo />

    {/* Center: Navigation */}
    <nav className="hidden md:flex items-center gap-6">
      <NavLink href="/templates">Templates</NavLink>
      <NavLink href="/app/prompts/new" className="relative">
        Builder
        <Badge variant="accent" className="absolute -top-2 -right-6 text-[10px] px-1.5">
          New
        </Badge>
      </NavLink>
      <NavLink href="/library">Library</NavLink>
      <NavLink href="/learn">Learn</NavLink>
      <NavLink href="/pricing">Pricing</NavLink>
    </nav>

    {/* Right: Auth buttons */}
    <div className="flex items-center gap-3">
      <Button variant="ghost" asChild>
        <Link to="/auth">Sign in</Link>
      </Button>
      <Button variant="hero" asChild>
        <Link to="/auth?mode=signup">Start crafting</Link>
      </Button>
    </div>
  </div>
</header>
```

### "New" Pill Badge

```tsx
// Uses existing Badge component with accent variant
<Badge
  variant="accent"
  className="absolute -top-2 -right-6 text-[10px] px-1.5 py-0.5 font-medium"
>
  New
</Badge>
```

---

### Hero Split Layout

```tsx
<section className="min-h-[calc(100vh-4rem)] bg-hero-gradient">
  <div className="container grid lg:grid-cols-2 gap-12 py-20 items-center">
    {/* Left Column: Value Proposition */}
    <div className="space-y-8">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary-foreground">
        Craft prompts that{" "}
        <span className="text-accent-gradient">actually work.</span>
      </h1>

      <ul className="space-y-4 text-lg text-primary-foreground/80">
        <li className="flex items-start gap-3">
          <CheckCircle className="h-6 w-6 text-accent shrink-0 mt-0.5" />
          <span>Structure beats free-form every time</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-6 w-6 text-accent shrink-0 mt-0.5" />
          <span>Test, iterate, and version your prompts</span>
        </li>
      </ul>

      <div className="flex flex-wrap gap-4">
        <Button variant="hero" size="xl" asChild>
          <Link to="/auth">Start crafting <ArrowRight className="ml-2 h-5 w-5" /></Link>
        </Button>
        <Button variant="hero-outline" size="xl">
          Watch demo <Play className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>

    {/* Right Column: Mini Builder */}
    <MiniBuilder />
  </div>
</section>
```

---

### Mini Builder Component (New)

```tsx
// Component: components/home/MiniBuilder.tsx

interface MiniBuilderProps {
  onGenerate?: (prompt: string) => void;
}

export function MiniBuilder({ onGenerate }: MiniBuilderProps) {
  const [category, setCategory] = useState<'write' | 'code' | 'image' | 'sales'>('write');
  const [goal, setGoal] = useState('');
  const [context, setContext] = useState('');
  const [constraints, setConstraints] = useState<string[]>([]);
  const [outputFormat, setOutputFormat] = useState('bullets');
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);

  return (
    <Card className="card-elevated bg-background/95 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Try it now</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category Tabs */}
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="write">
              <FileText className="h-4 w-4 mr-2" />
              Write
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="h-4 w-4 mr-2" />
              Code
            </TabsTrigger>
            <TabsTrigger value="image">
              <Image className="h-4 w-4 mr-2" />
              Image
            </TabsTrigger>
            <TabsTrigger value="sales">
              <Target className="h-4 w-4 mr-2" />
              Sales
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Goal Input */}
        <div className="space-y-2">
          <Label htmlFor="goal">Goal</Label>
          <Input
            id="goal"
            placeholder="What do you want to create?"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>

        {/* Context Input */}
        <div className="space-y-2">
          <Label htmlFor="context">Context</Label>
          <Textarea
            id="context"
            placeholder="Provide background information..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
          />
        </div>

        {/* Constraints (Chips) */}
        <div className="space-y-2">
          <Label>Constraints</Label>
          <ConstraintChips
            selected={constraints}
            onChange={setConstraints}
            options={['Professional', 'Concise', 'Detailed', 'Casual', 'Technical']}
          />
        </div>

        {/* Output Format */}
        <div className="space-y-2">
          <Label htmlFor="format">Output format</Label>
          <Select value={outputFormat} onValueChange={setOutputFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bullets">Bullets</SelectItem>
              <SelectItem value="table">Table</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="paragraph">Paragraph</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button */}
        <Button
          className="w-full"
          variant="accent"
          onClick={handleGenerate}
          disabled={!goal}
        >
          Generate prompt
          <Sparkles className="ml-2 h-4 w-4" />
        </Button>

        {/* Generated Prompt Result */}
        {generatedPrompt && (
          <div className="space-y-3 pt-4 border-t animate-fade-up">
            <Label>Your prompt</Label>
            <div className="relative">
              <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                {generatedPrompt}
              </pre>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button size="sm" variant="ghost" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/app/prompts/new">
                Open in Builder
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### Constraint Chips Component

```tsx
// Component: components/home/ConstraintChips.tsx

interface ConstraintChipsProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  options: string[];
}

export function ConstraintChips({ selected, onChange, options }: ConstraintChipsProps) {
  const toggleChip = (chip: string) => {
    if (selected.includes(chip)) {
      onChange(selected.filter(c => c !== chip));
    } else {
      onChange([...selected, chip]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => toggleChip(option)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            "border hover:border-accent/50",
            selected.includes(option)
              ? "bg-accent text-accent-foreground border-accent"
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          {option}
        </button>
      ))}
      <button
        className="px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-border text-muted-foreground hover:border-accent/50 hover:text-accent"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
```

---

### Trust Row

```tsx
// Component: components/home/TrustRow.tsx

export function TrustRow() {
  return (
    <section className="py-8 border-y bg-muted/30">
      <div className="container">
        {/* Option A: Logo cloud */}
        <div className="flex items-center justify-center gap-12 opacity-60">
          <img src="/logos/company1.svg" alt="Company 1" className="h-8" />
          <img src="/logos/company2.svg" alt="Company 2" className="h-8" />
          {/* ... more logos */}
        </div>

        {/* Option B: Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">2,500+</div>
            <div className="text-sm text-muted-foreground">Templates crafted</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">50+</div>
            <div className="text-sm text-muted-foreground">Teams using daily</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">12K+</div>
            <div className="text-sm text-muted-foreground">Prompts generated</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">4.9★</div>
            <div className="text-sm text-muted-foreground">Rating on G2</div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## Responsive Behavior

| Breakpoint | Header | Hero | Mini Builder |
|------------|--------|------|--------------|
| Mobile (<640px) | Hamburger menu | Stacked, full width | Full width, below hero text |
| Tablet (640-1023px) | Full nav, compact | Stacked, centered | Full width |
| Desktop (≥1024px) | Full nav | Side-by-side grid | Right column |

---

## Interaction States

### Mini Builder Flow
1. User selects category tab
2. Fills in goal (required)
3. Adds context (optional)
4. Clicks constraint chips to toggle
5. Selects output format
6. Clicks "Generate prompt"
7. Prompt appears with slide-up animation
8. Copy button copies to clipboard with toast
9. "Open in Builder" navigates to full builder with pre-filled data

### Animation Timing
- Tab switch: instant (no animation)
- Constraint chip toggle: 150ms scale + color
- Generate button: 200ms press scale
- Result appearance: 300ms fade-up

---

## Accessibility Notes

- All form inputs have associated labels
- Tab navigation works through all interactive elements
- Constraint chips are keyboard-accessible (Enter/Space to toggle)
- Color contrast meets WCAG AA standards
- Screen reader announces generated prompt
