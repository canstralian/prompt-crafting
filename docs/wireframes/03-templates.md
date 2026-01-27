# Templates Page Wireframe

## Overview
The Templates page enables fast discovery and reuse of prompt templates. Focus: search, filter, preview without page loads, and quick access to Builder.

---

## ASCII Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER (sticky)                                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Logo]     Templates  Builder  Library  Learn  Pricing              [Sign in]  [Start crafting]        │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PAGE HEADER (py-12, bg-muted/30)                                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│                              Prompt Templates                                                           │
│                              ────────────────                                                           │
│                   Browse proven templates crafted by the community                                      │
│                                                                                                         │
│             ┌──────────────────────────────────────────────────────────────────┐                        │
│             │ 🔍  Search templates...                                          │                        │
│             └──────────────────────────────────────────────────────────────────┘                        │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ FILTERS BAR (sticky below header, py-4, border-b)                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│  Use-case              Tone               Output type          Difficulty           Sort by             │
│  ┌────────────────┐    ┌──────────────┐   ┌──────────────┐    ┌──────────────┐     ┌──────────────┐     │
│  │ All         ▼  │    │ All       ▼  │   │ All       ▼  │    │ All       ▼  │     │ Popular   ▼  │     │
│  └────────────────┘    └──────────────┘   └──────────────┘    └──────────────┘     └──────────────┘     │
│                                                                                                         │
│  Active filters: [Writing ×] [Professional ×]                            [Clear all]                    │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TEMPLATES GRID (container, py-8)                                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│  Showing 24 of 156 templates                                                                            │
│                                                                                                         │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐                  │
│  │                         │  │                         │  │                         │                  │
│  │  📝                     │  │  💻                     │  │  📧                     │                  │
│  │                         │  │                         │  │                         │                  │
│  │  Blog Post Writer       │  │  Code Review Assistant  │  │  Cold Email Generator   │                  │
│  │  ─────────────────────  │  │  ─────────────────────  │  │  ─────────────────────  │                  │
│  │  Generate engaging      │  │  Get thorough code      │  │  Write personalized     │                  │
│  │  blog posts with SEO    │  │  reviews with best      │  │  outreach emails that   │                  │
│  │  optimization           │  │  practice suggestions   │  │  convert                │                  │
│  │                         │  │                         │  │                         │                  │
│  │  [Writing] [Marketing]  │  │  [Code] [Technical]     │  │  [Sales] [Email]        │                  │
│  │                         │  │                         │  │                         │                  │
│  │  ⭐ 4.8  •  1.2k uses   │  │  ⭐ 4.9  •  890 uses    │  │  ⭐ 4.7  •  2.1k uses   │                  │
│  │                         │  │                         │  │                         │                  │
│  │  [Preview]     [Use →]  │  │  [Preview]     [Use →]  │  │  [Preview]     [Use →]  │                  │
│  └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘                  │
│                                                                                                         │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐                  │
│  │                         │  │                         │  │                         │                  │
│  │  🎨                     │  │  📊                     │  │  🤖                     │                  │
│  │                         │  │                         │  │                         │                  │
│  │  Image Prompt Crafter   │  │  Data Analysis Helper   │  │  Chatbot Persona        │                  │
│  │  ─────────────────────  │  │  ─────────────────────  │  │  ─────────────────────  │                  │
│  │  Create detailed image  │  │  Analyze datasets and   │  │  Define consistent      │                  │
│  │  generation prompts     │  │  extract insights       │  │  AI personas            │                  │
│  │                         │  │                         │  │                         │                  │
│  │  [Image] [Creative]     │  │  [Data] [Analysis]      │  │  [Chatbot] [Role]       │                  │
│  │                         │  │                         │  │                         │                  │
│  │  ⭐ 4.6  •  756 uses    │  │  ⭐ 4.8  •  543 uses    │  │  ⭐ 4.9  •  1.8k uses   │                  │
│  │                         │  │                         │  │                         │                  │
│  │  [Preview]     [Use →]  │  │  [Preview]     [Use →]  │  │  [Preview]     [Use →]  │                  │
│  └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘                  │
│                                                                                                         │
│  ... (more cards)                                                                                       │
│                                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                                                 │    │
│  │                    ← Previous    [1] [2] [3] ... [13]    Next →                                 │    │
│  │                                                                                                 │    │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Template Preview Drawer

When user clicks "Preview", a right-side drawer slides in (no full page load):

```
┌───────────────────────────────────────────────┬──────────────────────────────────────────────────────────┐
│ MAIN PAGE (dimmed/blurred)                    │ PREVIEW DRAWER (w-[480px], slide-in 200ms)              │
│                                               ├──────────────────────────────────────────────────────────┤
│                                               │                                                          │
│                                               │  Blog Post Writer                              [×]       │
│                                               │  ═══════════════════════════════════════════════════════ │
│                                               │                                                          │
│                                               │  WHAT IT'S GOOD FOR                                      │
│                                               │  ─────────────────────────────────────────────────────── │
│                                               │  Generate engaging, SEO-optimized blog posts for any     │
│                                               │  topic. Perfect for content marketers and bloggers       │
│                                               │  who need consistent, high-quality content.              │
│                                               │                                                          │
│                                               │  REQUIRED INPUTS                                         │
│                                               │  ─────────────────────────────────────────────────────── │
│                                               │  • Topic or title                                        │
│                                               │  • Target audience                                       │
│                                               │  • Desired word count                                    │
│                                               │  • Tone (optional, defaults to professional)             │
│                                               │  • Keywords for SEO (optional)                           │
│                                               │                                                          │
│                                               │  PROMPT STRUCTURE                                        │
│                                               │  ─────────────────────────────────────────────────────── │
│                                               │  ┌────────────────────────────────────────────────────┐  │
│                                               │  │ Role: Expert content writer                        │  │
│                                               │  │ Objective: Write engaging blog post                │  │
│                                               │  │ Context: {topic}, {audience}, {keywords}           │  │
│                                               │  │ Constraints: SEO-optimized, scannable              │  │
│                                               │  │ Output: Markdown with H2s, bullets, CTA            │  │
│                                               │  └────────────────────────────────────────────────────┘  │
│                                               │                                                          │
│                                               │  EXAMPLE OUTPUT                                          │
│                                               │  ─────────────────────────────────────────────────────── │
│                                               │  ┌────────────────────────────────────────────────────┐  │
│                                               │  │ # 10 Tips for Better Remote Work                   │  │
│                                               │  │                                                    │  │
│                                               │  │ Remote work has transformed how we approach...     │  │
│                                               │  │                                                    │  │
│                                               │  │ ## 1. Create a Dedicated Workspace                 │  │
│                                               │  │ Having a designated area for work helps...         │  │
│                                               │  │                                                    │  │
│                                               │  │ [truncated for preview]                            │  │
│                                               │  └────────────────────────────────────────────────────┘  │
│                                               │                                                          │
│                                               │  ─────────────────────────────────────────────────────── │
│                                               │                                                          │
│                                               │  ┌─────────────────────┐  ┌─────────────────────────┐   │
│                                               │  │  Save to my library │  │  Use template     →    │   │
│                                               │  │  (ghost button)     │  │  (primary button)      │   │
│                                               │  └─────────────────────┘  └─────────────────────────┘   │
│                                               │                                                          │
└───────────────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Template Card

```tsx
// Component: components/templates/TemplateCard.tsx

interface TemplateCardProps {
  template: Template;
  onPreview: () => void;
  onUse: () => void;
}

export function TemplateCard({ template, onPreview, onUse }: TemplateCardProps) {
  return (
    <Card className="card-elevated group hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
          <span className="text-xl">{template.icon}</span>
        </div>

        {/* Title & Description */}
        <CardTitle className="text-lg">{template.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 border-t">
        {/* Stats */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {template.rating}
          </span>
          <span>•</span>
          <span>{formatNumber(template.uses)} uses</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onPreview}>
            Preview
          </Button>
          <Button size="sm" onClick={onUse}>
            Use
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
```

### Filters Bar

```tsx
// Component: components/templates/FiltersBar.tsx

const FILTER_OPTIONS = {
  useCase: ['All', 'Writing', 'Code', 'Marketing', 'Sales', 'Data', 'Creative', 'Support'],
  tone: ['All', 'Professional', 'Casual', 'Technical', 'Friendly', 'Formal'],
  outputType: ['All', 'Text', 'Markdown', 'JSON', 'Code', 'Email', 'Table'],
  difficulty: ['All', 'Beginner', 'Intermediate', 'Advanced'],
};

export function FiltersBar({
  filters,
  onFilterChange,
  onClearAll,
}: FiltersBarProps) {
  const activeFilters = Object.entries(filters)
    .filter(([_, value]) => value !== 'All')
    .map(([key, value]) => ({ key, value }));

  return (
    <div className="sticky top-16 z-40 py-4 border-b bg-background">
      <div className="container space-y-3">
        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(FILTER_OPTIONS).map(([key, options]) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Label>
              <Select
                value={filters[key]}
                onValueChange={(v) => onFilterChange(key, v)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Sort */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Sort by</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(v) => onFilterChange('sortBy', v)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most popular</SelectItem>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="rating">Highest rated</SelectItem>
                <SelectItem value="name">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filters chips */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active:</span>
            {activeFilters.map(({ key, value }) => (
              <Badge
                key={key}
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-destructive/10"
                onClick={() => onFilterChange(key, 'All')}
              >
                {value}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            <Button
              variant="link"
              size="sm"
              className="text-muted-foreground"
              onClick={onClearAll}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Preview Drawer

```tsx
// Component: components/templates/TemplatePreviewDrawer.tsx

export function TemplatePreviewDrawer({
  template,
  isOpen,
  onClose,
  onUse,
  onSave,
}: TemplatePreviewDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[480px] sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <span className="text-2xl">{template.icon}</span>
            {template.title}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] mt-6">
          <div className="space-y-6 pr-4">
            {/* What it's good for */}
            <section>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                What it's good for
              </h4>
              <p className="text-muted-foreground">
                {template.goodFor}
              </p>
            </section>

            {/* Required inputs */}
            <section>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-accent" />
                Required inputs
              </h4>
              <ul className="space-y-1">
                {template.requiredInputs.map((input, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-accent">•</span>
                    {input.name}
                    {input.optional && (
                      <span className="text-xs text-muted-foreground/60">(optional)</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            {/* Prompt structure */}
            <section>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                Prompt structure
              </h4>
              <div className="p-3 bg-muted rounded-lg text-sm font-mono space-y-1">
                {template.structure.map((item, i) => (
                  <div key={i}>
                    <span className="text-accent">{item.label}:</span>{' '}
                    <span className="text-muted-foreground">{item.preview}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Example output */}
            <section>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FileOutput className="h-4 w-4 text-accent" />
                Example output
              </h4>
              <div className="p-3 bg-muted rounded-lg text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap">{template.exampleOutput}</pre>
              </div>
            </section>
          </div>
        </ScrollArea>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={onSave}>
            <Bookmark className="h-4 w-4 mr-2" />
            Save to my library
          </Button>
          <Button onClick={onUse}>
            Use template
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

---

## Filter Combinations

| Use Case | Suggested Filters |
|----------|-------------------|
| Copywriter | Writing + Marketing + Professional |
| Developer | Code + Technical + JSON/Markdown |
| Sales Rep | Sales + Email + Persuasive |
| Data Analyst | Data + Analysis + Table |
| Designer | Image + Creative + Any |

---

## Empty States

### No results found
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│            [search illustration]                            │
│                                                             │
│            No templates found                               │
│                                                             │
│            Try adjusting your filters or search             │
│            for something different.                         │
│                                                             │
│            [Clear filters]   [Browse all templates]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Responsive Behavior

| Breakpoint | Grid Columns | Cards per row |
|------------|--------------|---------------|
| Mobile (<640px) | 1 | 1 |
| Tablet (640-1023px) | 2 | 2 |
| Desktop (≥1024px) | 3 | 3 |
| Wide (≥1400px) | 3-4 | 3-4 |

### Mobile Adaptations
- Filters become a collapsible accordion or bottom sheet
- Preview drawer becomes full-screen sheet
- Card actions stack vertically
