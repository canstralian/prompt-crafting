# Builder (Prompt IDE) Wireframe

## Overview
The Builder is the core product screen. Goal: fewer blank-page moments, more guided structure, faster iteration. Uses a 3-column "Prompt IDE" layout.

---

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR (h-14, border-b)                                                                                 │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│  ← Back    📁 My Prompts / [Prompt Name     ▼]     [v1] [v2] [v3 ★]     [Share]  [⋮]                    │
│                                              │          version dropdown          │                       │
│                                              └─ editable inline                   │                       │
│                                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────┬─────────────────────────────────────────────────────┬─────────────────────────────┐
│ LEFT RAIL          │ CENTER: PROMPT CANVAS                               │ RIGHT PANEL                 │
│ (w-64, border-r)   │ (flex-1)                                            │ (w-96, border-l)            │
├────────────────────┼─────────────────────────────────────────────────────┼─────────────────────────────┤
│                    │                                                     │                             │
│ ┌────────────────┐ │ ┌─────────────────────────────────────────────────┐ │ TEST & EVALUATE             │
│ │ 🔍 Search...   │ │ │ ROLE                                  [⋮]      │ │ ─────────────────────────── │
│ └────────────────┘ │ │ ─────────────────────────────────────────────── │ │                             │
│                    │ │ You are an expert technical writer with 10      │ │ Model                       │
│ ▼ MY TEMPLATES     │ │ years of experience in SaaS documentation.      │ │ ┌───────────────────────┐   │
│                    │ │                                                 │ │ │ GPT-4        ▼        │   │
│   📄 Product Desc  │ │         [✨ Improve]  [🔒 Lock]  [↕ Collapse]   │ │ └───────────────────────┘   │
│   📄 Code Review   │ └─────────────────────────────────────────────────┘ │                             │
│   📄 Email Outrea  │                                                     │ ▶ Advanced options          │
│   📄 Blog Post     │ ┌─────────────────────────────────────────────────┐ │   Temperature: 0.7          │
│                    │ │ OBJECTIVE                             [⋮]      │ │   Max length: 2000          │
│ ▼ COMMUNITY        │ │ ─────────────────────────────────────────────── │ │                             │
│                    │ │ Create comprehensive API documentation that     │ │ ─────────────────────────── │
│   ⭐ Top rated     │ │ developers can understand in under 5 minutes.   │ │                             │
│   🆕 Recent        │ │                                                 │ │ INPUT SANDBOX               │
│   🏷️ By category   │ │         [✨ Improve]  [🔒 Lock]  [↕ Collapse]   │ │ ┌───────────────────────┐   │
│                    │ └─────────────────────────────────────────────────┘ │ │ Paste user query or   │   │
│ ─────────────────  │                                                     │ │ test scenario here... │   │
│                    │ ┌─────────────────────────────────────────────────┐ │ │                       │   │
│ COMPONENT BLOCKS   │ │ CONTEXT                               [⋮]      │ │ │                       │   │
│ (drag to canvas)   │ │ ─────────────────────────────────────────────── │ │ └───────────────────────┘   │
│                    │ │ Our product is a developer tool that...         │ │                             │
│ ┌────────────────┐ │ │ Target audience: Senior engineers              │ │ [▶ Run test]                │
│ │ 👤 Role        │ │ │ Existing docs: [link]                          │ │                             │
│ └────────────────┘ │ │                                                 │ │ ─────────────────────────── │
│ ┌────────────────┐ │ │         [✨ Improve]  [🔒 Lock]  [↕ Collapse]   │ │                             │
│ │ 🎯 Objective   │ │ └─────────────────────────────────────────────────┘ │ OUTPUT PREVIEW              │
│ └────────────────┘ │                                                     │ ┌───────────────────────┐   │
│ ┌────────────────┐ │ ┌─────────────────────────────────────────────────┐ │ │                       │   │
│ │ 📋 Context     │ │ │ CONSTRAINTS                           [⋮]      │ │ │ Generated output      │   │
│ └────────────────┘ │ │ ─────────────────────────────────────────────── │ │ │ will appear here...   │   │
│ ┌────────────────┐ │ │                                                 │ │ │                       │   │
│ │ ⚠️ Constraints │ │ │ [Technical] [Concise] [No jargon] [+]          │ │ │                       │   │
│ └────────────────┘ │ │                                                 │ │ │                       │   │
│ ┌────────────────┐ │ │         [✨ Improve]  [🔒 Lock]  [↕ Collapse]   │ │ └───────────────────────┘   │
│ │ 📝 Examples    │ │ └─────────────────────────────────────────────────┘ │                             │
│ └────────────────┘ │                                                     │ QUICK GRADERS               │
│ ┌────────────────┐ │ ┌─────────────────────────────────────────────────┐ │ ┌─────────────────────────┐ │
│ │ 📊 Output      │ │ │ EXAMPLES (Few-shot)                   [⋮]      │ │ │ ✓ Meets format          │ │
│ │    Schema      │ │ │ ─────────────────────────────────────────────── │ │ │ ✓ Follows constraints   │ │
│ └────────────────┘ │ │                                                 │ │ │ ⚠ Useful/complete       │ │
│ ┌────────────────┐ │ │ Input: "How do I authenticate?"                 │ │ └─────────────────────────┘ │
│ │ ✅ Evaluation  │ │ │ Output: "Authentication uses OAuth 2.0..."      │ │                             │
│ │    Checklist   │ │ │                                                 │ │ [Compare runs]  [A/B mode]  │
│ └────────────────┘ │ │ [+ Add example]                                 │ │                             │
│                    │ │                                                 │ │ ─────────────────────────── │
│                    │ │         [✨ Improve]  [🔒 Lock]  [↕ Collapse]   │ │                             │
│                    │ └─────────────────────────────────────────────────┘ │ [Save as variant]           │
│                    │                                                     │                             │
│                    │ ┌─────────────────────────────────────────────────┐ │                             │
│                    │ │ OUTPUT SCHEMA                          [⋮]     │ │                             │
│                    │ │ ─────────────────────────────────────────────── │ │                             │
│                    │ │ Format: Markdown                                │ │                             │
│                    │ │ Structure:                                      │ │                             │
│                    │ │   - Overview (2-3 sentences)                    │ │                             │
│                    │ │   - Prerequisites (bulleted list)               │ │                             │
│                    │ │   - Step-by-step guide                          │ │                             │
│                    │ │                                                 │ │                             │
│                    │ │         [✨ Improve]  [🔒 Lock]  [↕ Collapse]   │ │                             │
│                    │ └─────────────────────────────────────────────────┘ │                             │
│                    │                                                     │                             │
│                    │ ┌─────────────────────────────────────────────────┐ │                             │
│                    │ │ ⚠️ PROMPT LINT                                  │ │                             │
│                    │ │ ─────────────────────────────────────────────── │ │                             │
│                    │ │ ⚠ Missing: No evaluation criteria specified    │ │                             │
│                    │ │           [Fix: Add checklist →]                │ │                             │
│                    │ │                                                 │ │                             │
│                    │ │ ℹ Tip: Consider adding 2-3 examples for        │ │                             │
│                    │ │        better output consistency                │ │                             │
│                    │ └─────────────────────────────────────────────────┘ │                             │
│                    │                                                     │                             │
└────────────────────┴─────────────────────────────────────────────────────┴─────────────────────────────┘
```

---

## Component Specifications

### Top Bar

```tsx
// Component: components/builder/BuilderTopBar.tsx

export function BuilderTopBar({
  promptName,
  folder,
  versions,
  currentVersion,
  onVersionChange,
  onShare,
}: BuilderTopBarProps) {
  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-4">
      {/* Left: Back + Breadcrumb */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/app/library">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Folder className="h-4 w-4 mr-1" />
              {folder || 'My Prompts'}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <InlineEdit
                value={promptName}
                onSave={onNameChange}
                className="font-medium"
              />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Center: Version selector */}
      <div className="flex items-center gap-2">
        <ToggleGroup type="single" value={currentVersion} onValueChange={onVersionChange}>
          {versions.map((v) => (
            <ToggleGroupItem
              key={v.id}
              value={v.id}
              className={cn(
                "text-sm",
                v.isStarred && "text-accent"
              )}
            >
              {v.label}
              {v.isStarred && <Star className="h-3 w-3 ml-1 fill-accent text-accent" />}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Export</DropdownMenuItem>
            <DropdownMenuItem>Move to folder</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
```

---

### Left Rail: Templates & Components

```tsx
// Component: components/builder/LeftRail.tsx

export function LeftRail({
  myTemplates,
  communityTemplates,
  onTemplateSelect,
  onComponentDrag,
}: LeftRailProps) {
  return (
    <aside className="w-64 border-r bg-muted/30 flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Templates sections */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* My Templates */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <span className="text-sm font-medium">My Templates</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-1">
              {myTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onTemplateSelect(template)}
                  className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent/10 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{template.name}</span>
                </button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Community */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <span className="text-sm font-medium">Community</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-1">
              <button className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent/10 flex items-center gap-2">
                <Star className="h-4 w-4 text-accent" />
                <span>Top rated</span>
              </button>
              <button className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent/10 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Recent</span>
              </button>
              <button className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent/10 flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span>By category</span>
              </button>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Component Blocks */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Component Blocks
            </span>
            <p className="text-xs text-muted-foreground">
              Drag to add to canvas
            </p>
            <div className="space-y-1">
              {COMPONENT_BLOCKS.map((block) => (
                <DraggableBlock
                  key={block.id}
                  block={block}
                  onDragStart={() => onComponentDrag(block)}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}

const COMPONENT_BLOCKS = [
  { id: 'role', label: 'Role', icon: User, description: 'Define the AI persona' },
  { id: 'objective', label: 'Objective', icon: Target, description: 'The main goal' },
  { id: 'context', label: 'Context', icon: FileText, description: 'Background information' },
  { id: 'constraints', label: 'Constraints', icon: AlertTriangle, description: 'Rules and limitations' },
  { id: 'examples', label: 'Examples', icon: BookOpen, description: 'Few-shot examples' },
  { id: 'output-schema', label: 'Output Schema', icon: Code, description: 'Expected format' },
  { id: 'evaluation', label: 'Evaluation Checklist', icon: CheckSquare, description: 'Success criteria' },
];
```

---

### Center: Prompt Canvas

```tsx
// Component: components/builder/PromptCanvas.tsx

export function PromptCanvas({
  sections,
  onSectionUpdate,
  onSectionImprove,
  onSectionLock,
  lintWarnings,
}: PromptCanvasProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Draggable sections */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="canvas">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps}>
                        <PromptSection
                          section={section}
                          dragHandleProps={provided.dragHandleProps}
                          onUpdate={(content) => onSectionUpdate(section.id, content)}
                          onImprove={() => onSectionImprove(section.id)}
                          onLock={() => onSectionLock(section.id)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Prompt Lint */}
        {lintWarnings.length > 0 && (
          <PromptLint warnings={lintWarnings} />
        )}
      </div>
    </div>
  );
}
```

### Prompt Section Card

```tsx
// Component: components/builder/PromptSection.tsx

interface PromptSectionProps {
  section: Section;
  dragHandleProps: DraggableProvidedDragHandleProps;
  onUpdate: (content: string) => void;
  onImprove: () => void;
  onLock: () => void;
}

export function PromptSection({
  section,
  dragHandleProps,
  onUpdate,
  onImprove,
  onLock,
}: PromptSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  return (
    <Card className={cn(
      "transition-all",
      section.isLocked && "border-accent/50 bg-accent/5",
      isCollapsed && "py-0"
    )}>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <div className="flex items-center gap-3">
          {/* Drag handle */}
          <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Section icon & label */}
          <div className="flex items-center gap-2">
            {section.icon}
            <span className="font-medium">{section.label}</span>
            {section.isLocked && (
              <Lock className="h-3 w-3 text-accent" />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onImprove}
                  disabled={section.isLocked || isImproving}
                >
                  {isImproving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Improve with AI</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8", section.isLocked && "text-accent")}
                  onClick={onLock}
                >
                  {section.isLocked ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {section.isLocked ? 'Unlock section' : 'Lock to prevent auto-edits'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Move up</DropdownMenuItem>
              <DropdownMenuItem>Move down</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <Collapsible open={!isCollapsed}>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            {/* Helper text */}
            {section.helperText && (
              <p className="text-sm text-muted-foreground mb-3">
                {section.helperText}
              </p>
            )}

            {/* Content editor */}
            {section.type === 'text' && (
              <Textarea
                value={section.content}
                onChange={(e) => onUpdate(e.target.value)}
                placeholder={section.placeholder}
                className="min-h-[100px] resize-y"
                disabled={section.isLocked}
              />
            )}

            {section.type === 'chips' && (
              <ConstraintChips
                selected={section.content}
                onChange={onUpdate}
                options={section.options}
                disabled={section.isLocked}
              />
            )}

            {section.type === 'examples' && (
              <ExamplesEditor
                examples={section.content}
                onChange={onUpdate}
                disabled={section.isLocked}
              />
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
```

---

### Prompt Lint Component

```tsx
// Component: components/builder/PromptLint.tsx

interface LintWarning {
  id: string;
  type: 'warning' | 'info' | 'error';
  message: string;
  fixAction?: {
    label: string;
    handler: () => void;
  };
}

export function PromptLint({ warnings }: { warnings: LintWarning[] }) {
  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          Prompt Lint
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {warnings.map((warning) => (
          <div
            key={warning.id}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <div className="flex items-start gap-2">
              {warning.type === 'warning' && (
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              {warning.type === 'info' && (
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              )}
              {warning.type === 'error' && (
                <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              )}
              <span className="text-muted-foreground">{warning.message}</span>
            </div>

            {warning.fixAction && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-accent"
                onClick={warning.fixAction.handler}
              >
                {warning.fixAction.label}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

### Lint Warning Types

| Warning | Condition | Fix Action |
|---------|-----------|------------|
| Missing constraints | No constraints section or empty | "Add constraints" → adds section with suggestions |
| Conflicting instructions | Detected contradictions | "Review conflicts" → highlights conflicting text |
| No output format | No schema section | "Add format" → adds output schema section |
| Too vague objective | Objective < 20 chars | "Make specific" → opens improve dialog |
| No examples | Complex task without few-shot | "Add examples" → adds examples section |

---

### Right Panel: Test & Evaluate

```tsx
// Component: components/builder/RightPanel.tsx

export function RightPanel({
  onRunTest,
  testResult,
  isRunning,
}: RightPanelProps) {
  const [inputSandbox, setInputSandbox] = useState('');
  const [model, setModel] = useState('gpt-4');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxLength, setMaxLength] = useState(2000);
  const [isCompareMode, setIsCompareMode] = useState(false);

  return (
    <aside className="w-96 border-l bg-muted/30 flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Test & Evaluate</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Model Selector */}
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3">Claude 3</SelectItem>
                <SelectItem value="claude-2">Claude 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Options */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ChevronRight className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-90")} />
              Advanced options
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Temperature</Label>
                  <span className="text-sm text-muted-foreground">{temperature}</span>
                </div>
                <Slider
                  value={[temperature]}
                  onValueChange={([v]) => setTemperature(v)}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Max length</Label>
                  <span className="text-sm text-muted-foreground">{maxLength}</span>
                </div>
                <Slider
                  value={[maxLength]}
                  onValueChange={([v]) => setMaxLength(v)}
                  min={100}
                  max={4000}
                  step={100}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Input Sandbox */}
          <div className="space-y-2">
            <Label>Input Sandbox</Label>
            <Textarea
              placeholder="Paste user query or test scenario here..."
              value={inputSandbox}
              onChange={(e) => setInputSandbox(e.target.value)}
              rows={4}
            />
          </div>

          {/* Run Button */}
          <Button
            className="w-full"
            onClick={() => onRunTest(inputSandbox)}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run test
              </>
            )}
          </Button>

          <Separator />

          {/* Output Preview */}
          {testResult && (
            <div className="space-y-3">
              <Label>Output Preview</Label>
              <div className="p-4 bg-background rounded-lg border">
                <pre className="text-sm whitespace-pre-wrap">
                  {testResult.output}
                </pre>
              </div>

              {/* Quick Graders */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Quick Graders
                </Label>
                <div className="space-y-1">
                  <GraderItem
                    label="Meets format"
                    status={testResult.grades.format}
                  />
                  <GraderItem
                    label="Follows constraints"
                    status={testResult.grades.constraints}
                  />
                  <GraderItem
                    label="Useful/complete"
                    status={testResult.grades.usefulness}
                  />
                </div>
              </div>

              {/* Compare & Save */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsCompareMode(true)}
                >
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare runs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  A/B mode
                </Button>
              </div>

              <Button variant="accent" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save as variant
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

function GraderItem({ label, status }: { label: string; status: 'pass' | 'warn' | 'fail' }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {status === 'pass' && <CheckCircle className="h-4 w-4 text-success" />}
      {status === 'warn' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
      {status === 'fail' && <XCircle className="h-4 w-4 text-destructive" />}
      <span>{label}</span>
    </div>
  );
}
```

---

## A/B Compare Mode

When user clicks "Compare runs", the right panel expands or a modal shows:

```
┌──────────────────────────────────────────────────────────────────────────┐
│ COMPARE RUNS                                                    [×]     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐       │
│  │ VERSION A (v2)              │  │ VERSION B (v3)              │       │
│  │ ─────────────────────────── │  │ ─────────────────────────── │       │
│  │                             │  │                             │       │
│  │ [Output content...]         │  │ [Output content...]         │       │
│  │                             │  │                             │       │
│  │                             │  │                             │       │
│  │ ─────────────────────────── │  │ ─────────────────────────── │       │
│  │ ✓ Format                    │  │ ✓ Format                    │       │
│  │ ✓ Constraints               │  │ ✓ Constraints               │       │
│  │ ⚠ Usefulness                │  │ ✓ Usefulness                │       │
│  │                             │  │                             │       │
│  │ [Use this version]          │  │ [Use this version]          │       │
│  └─────────────────────────────┘  └─────────────────────────────┘       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Desktop (≥1280px) | 3-column layout as shown |
| Tablet (1024-1279px) | Left rail collapsible, 2-column |
| Mobile (<1024px) | Single column with bottom sheet panels |

### Mobile Adaptations
- Left rail becomes a sheet triggered by hamburger
- Right panel becomes a bottom sheet
- Canvas takes full width
- Top bar actions move to dropdown

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + S` | Save prompt |
| `Cmd/Ctrl + Enter` | Run test |
| `Cmd/Ctrl + I` | Improve current section |
| `Cmd/Ctrl + L` | Lock/unlock current section |
| `Cmd/Ctrl + /` | Toggle lint panel |
| `Cmd/Ctrl + 1-7` | Focus section by number |

---

## Empty States

### No sections added
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│          [illustration of building blocks]                  │
│                                                             │
│          Start building your prompt                         │
│                                                             │
│          Drag component blocks from the left                │
│          rail or choose a template to begin.                │
│                                                             │
│          [Choose a template]   [Add first block]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### No test result
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│          [play icon]                                        │
│                                                             │
│          Run your first test                                │
│                                                             │
│          Enter a test input above and click                 │
│          "Run test" to see how your prompt performs.        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
