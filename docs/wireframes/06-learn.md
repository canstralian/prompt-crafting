# Learn Hub Wireframe

## Overview
The Learn hub turns education into product usage. Each lesson leads to practical application in the Builder. Focus: structured learning tracks, prompt patterns, and immediate hands-on practice.

---

## ASCII Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Logo]     Templates  Builder  Library  Learn  Pricing              [Sign in]  [Start crafting]        │
│                                           ↑ active                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PAGE HEADER (py-12, bg-hero-gradient)                                                                   │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│                              Learn Prompt Engineering                                                   │
│                              ═══════════════════════════                                                │
│                   Master the art and science of crafting effective prompts.                             │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────┬─────────────────────────────────────────────────────────────────────────────┐
│ LEFT: LEARNING TRACKS     │ CENTER: LESSONS                                                             │
│ (w-64, sticky)            │                                                                             │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────┤
│                           │                                                                             │
│ TRACKS                    │ 🌱 BEGINNER TRACK                                                           │
│ ────────────────────────  │ ═══════════════════════════════════════════════════════════════════════════ │
│                           │ Build a strong foundation in prompt engineering fundamentals.               │
│ 🌱 Beginner               │                                                                             │
│    ████████░░ 80%         │ ┌─────────────────────────────────────────────────────────────────────────┐ │
│    8 lessons              │ │                                                                         │ │
│                           │ │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │ │
│ 🌿 Intermediate           │ │  │ ✓ COMPLETED      │  │ ✓ COMPLETED      │  │ ● IN PROGRESS   │       │ │
│    ░░░░░░░░░░ 0%          │ │  │                  │  │                  │  │                  │       │ │
│    12 lessons             │ │  │  What Makes a    │  │  The Anatomy     │  │  Role-Based     │       │ │
│                           │ │  │  Good Prompt     │  │  of a Prompt     │  │  Prompting      │       │ │
│ 🌳 Advanced               │ │  │                  │  │                  │  │                  │       │ │
│    ░░░░░░░░░░ 0%          │ │  │  10 min read     │  │  15 min read     │  │  12 min read    │       │ │
│    8 lessons              │ │  │                  │  │                  │  │                  │       │ │
│                           │ │  │  [Review]        │  │  [Review]        │  │  [Continue →]   │       │ │
│ ────────────────────────  │ │  └──────────────────┘  └──────────────────┘  └──────────────────┘       │ │
│                           │ │                                                                         │ │
│ PROMPT PATTERNS           │ │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │ │
│ ────────────────────────  │ │  │ ○ LOCKED         │  │ ○ LOCKED         │  │ ○ LOCKED         │       │ │
│                           │ │  │                  │  │                  │  │                  │       │ │
│ 📐 Decomposition          │ │  │  Adding Context  │  │  Constraints     │  │  Output          │       │ │
│                           │ │  │  Effectively     │  │  That Work       │  │  Formatting      │       │ │
│ 🎭 Role + Rubric          │ │  │                  │  │                  │  │                  │       │ │
│                           │ │  │  8 min read      │  │  10 min read     │  │  12 min read     │       │ │
│ 📋 Schema-First           │ │  │                  │  │                  │  │                  │       │ │
│                           │ │  │  Complete        │  │  Complete        │  │  Complete        │       │ │
│ 📚 Few-Shot Strategy      │ │  │  previous first  │  │  previous first  │  │  previous first  │       │ │
│                           │ │  └──────────────────┘  └──────────────────┘  └──────────────────┘       │ │
│                           │ │                                                                         │ │
│                           │ │  ... (more lesson cards)                                                │ │
│                           │ │                                                                         │ │
│                           │ └─────────────────────────────────────────────────────────────────────────┘ │
│                           │                                                                             │
│                           │ ─────────────────────────────────────────────────────────────────────────── │
│                           │                                                                             │
│                           │ 📐 PROMPT PATTERNS                                                          │
│                           │ ═══════════════════════════════════════════════════════════════════════════ │
│                           │ Learn battle-tested patterns for common prompting challenges.               │
│                           │                                                                             │
│                           │ ┌─────────────────────────────────────────────────────────────────────────┐ │
│                           │ │                                                                         │ │
│                           │ │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │ │
│                           │ │  │ [pattern icon]   │  │ [pattern icon]   │  │ [pattern icon]   │       │ │
│                           │ │  │                  │  │                  │  │                  │       │ │
│                           │ │  │  Decomposition   │  │  Role + Rubric   │  │  Schema-First    │       │ │
│                           │ │  │  Pattern         │  │  Pattern         │  │  Prompting       │       │ │
│                           │ │  │                  │  │                  │  │                  │       │ │
│                           │ │  │  Break complex   │  │  Define persona  │  │  Start with the  │       │ │
│                           │ │  │  tasks into      │  │  + evaluation    │  │  output format   │       │ │
│                           │ │  │  smaller steps   │  │  criteria        │  │  you want        │       │ │
│                           │ │  │                  │  │                  │  │                  │       │ │
│                           │ │  │  [Learn] [Try →] │  │  [Learn] [Try →] │  │  [Learn] [Try →] │       │ │
│                           │ │  └──────────────────┘  └──────────────────┘  └──────────────────┘       │ │
│                           │ │                                                                         │ │
│                           │ └─────────────────────────────────────────────────────────────────────────┘ │
│                           │                                                                             │
└───────────────────────────┴─────────────────────────────────────────────────────────────────────────────┘
```

---

## Lesson Detail Page

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ LESSON PAGE                                                                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│  ← Back to Learn                                                                                        │
│                                                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                                  │   │
│  │  🌱 Beginner Track  •  Lesson 3 of 8  •  12 min read                                             │   │
│  │                                                                                                  │   │
│  │  Role-Based Prompting                                                                            │   │
│  │  ════════════════════════════════════════════════════════════════════════════════════════════   │   │
│  │                                                                                                  │   │
│  │  One of the most powerful techniques in prompt engineering is assigning a specific              │   │
│  │  role or persona to the AI. This creates context and constraints that dramatically              │   │
│  │  improve output quality.                                                                        │   │
│  │                                                                                                  │   │
│  │  ## Why Roles Work                                                                               │   │
│  │                                                                                                  │   │
│  │  When you tell an AI "You are an expert technical writer," you're doing several things:         │   │
│  │                                                                                                  │   │
│  │  1. **Setting expectations** - The AI knows what quality level to aim for                       │   │
│  │  2. **Providing context** - Technical writers have specific conventions                         │   │
│  │  3. **Establishing constraints** - The response should be clear, accurate, well-structured      │   │
│  │                                                                                                  │   │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────────┐     │   │
│  │  │ 💡 PRO TIP                                                                              │     │   │
│  │  │                                                                                        │     │   │
│  │  │ The more specific the role, the better the output. "Expert React developer with        │     │   │
│  │  │ 10 years of experience" works better than just "developer."                            │     │   │
│  │  └────────────────────────────────────────────────────────────────────────────────────────┘     │   │
│  │                                                                                                  │   │
│  │  ## Examples                                                                                     │   │
│  │                                                                                                  │   │
│  │  **Without role:**                                                                               │   │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────────┐     │   │
│  │  │ Write documentation for this API endpoint.                                             │     │   │
│  │  └────────────────────────────────────────────────────────────────────────────────────────┘     │   │
│  │                                                                                                  │   │
│  │  **With role:**                                                                                  │   │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────────┐     │   │
│  │  │ You are a senior technical writer at a developer tools company.                        │     │   │
│  │  │ Write clear, scannable API documentation that follows the Diátaxis framework.          │     │   │
│  │  └────────────────────────────────────────────────────────────────────────────────────────┘     │   │
│  │                                                                                                  │   │
│  │  ────────────────────────────────────────────────────────────────────────────────────────────   │   │
│  │                                                                                                  │   │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────────┐     │   │
│  │  │                                                                                        │     │   │
│  │  │  ✨ TRY THIS IN BUILDER                                                                │     │   │
│  │  │                                                                                        │     │   │
│  │  │  Practice role-based prompting with a pre-configured template                          │     │   │
│  │  │  that includes the techniques from this lesson.                                        │     │   │
│  │  │                                                                                        │     │   │
│  │  │  [Open in Builder →]                                                                   │     │   │
│  │  │                                                                                        │     │   │
│  │  └────────────────────────────────────────────────────────────────────────────────────────┘     │   │
│  │                                                                                                  │   │
│  │  ────────────────────────────────────────────────────────────────────────────────────────────   │   │
│  │                                                                                                  │   │
│  │  [← Previous: The Anatomy of a Prompt]              [Next: Adding Context Effectively →]        │   │
│  │                                                                                                  │   │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Learning Tracks Sidebar

```tsx
// Component: components/learn/LearningTracksSidebar.tsx

const TRACKS = [
  {
    id: 'beginner',
    icon: '🌱',
    title: 'Beginner',
    lessons: 8,
    progress: 80,
  },
  {
    id: 'intermediate',
    icon: '🌿',
    title: 'Intermediate',
    lessons: 12,
    progress: 0,
  },
  {
    id: 'advanced',
    icon: '🌳',
    title: 'Advanced',
    lessons: 8,
    progress: 0,
  },
];

const PATTERNS = [
  { id: 'decomposition', icon: '📐', title: 'Decomposition' },
  { id: 'role-rubric', icon: '🎭', title: 'Role + Rubric' },
  { id: 'schema-first', icon: '📋', title: 'Schema-First' },
  { id: 'few-shot', icon: '📚', title: 'Few-Shot Strategy' },
];

export function LearningTracksSidebar({
  selectedTrack,
  onSelectTrack,
}: LearningTracksSidebarProps) {
  return (
    <aside className="w-64 sticky top-20 space-y-8">
      {/* Tracks */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Tracks
        </h3>
        <nav className="space-y-1">
          {TRACKS.map((track) => (
            <button
              key={track.id}
              onClick={() => onSelectTrack(track.id)}
              className={cn(
                "w-full p-3 rounded-lg text-left transition-colors",
                selectedTrack === track.id
                  ? "bg-accent/10"
                  : "hover:bg-muted"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">{track.icon}</span>
                <span className="font-medium">{track.title}</span>
              </div>
              <div className="space-y-1">
                <Progress value={track.progress} className="h-1.5" />
                <span className="text-xs text-muted-foreground">
                  {track.lessons} lessons
                </span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      <Separator />

      {/* Prompt Patterns */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Prompt Patterns
        </h3>
        <nav className="space-y-1">
          {PATTERNS.map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => onSelectTrack(pattern.id)}
              className="w-full p-2 rounded-lg text-left hover:bg-muted transition-colors flex items-center gap-2"
            >
              <span>{pattern.icon}</span>
              <span className="text-sm">{pattern.title}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
```

### Lesson Card

```tsx
// Component: components/learn/LessonCard.tsx

interface LessonCardProps {
  lesson: Lesson;
  status: 'completed' | 'in-progress' | 'locked';
  onAction: () => void;
}

export function LessonCard({ lesson, status, onAction }: LessonCardProps) {
  return (
    <Card
      className={cn(
        "transition-all",
        status === 'locked' && "opacity-60",
        status !== 'locked' && "hover:shadow-md hover:-translate-y-1"
      )}
    >
      <CardHeader className="pb-2">
        {/* Status badge */}
        <div className="flex items-center gap-2 mb-2">
          {status === 'completed' && (
            <Badge variant="success" className="gap-1">
              <Check className="h-3 w-3" /> Completed
            </Badge>
          )}
          {status === 'in-progress' && (
            <Badge variant="accent" className="gap-1">
              <Circle className="h-3 w-3 fill-current" /> In Progress
            </Badge>
          )}
          {status === 'locked' && (
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" /> Locked
            </Badge>
          )}
        </div>

        <CardTitle className="text-lg">{lesson.title}</CardTitle>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground mb-3">
          {lesson.readTime} read
        </p>

        {status === 'locked' ? (
          <p className="text-sm text-muted-foreground">
            Complete previous lessons first
          </p>
        ) : (
          <Button
            variant={status === 'completed' ? 'outline' : 'default'}
            size="sm"
            onClick={onAction}
          >
            {status === 'completed' ? 'Review' : 'Continue'}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

### Pattern Card

```tsx
// Component: components/learn/PatternCard.tsx

interface PatternCardProps {
  pattern: Pattern;
  onLearn: () => void;
  onTry: () => void;
}

export function PatternCard({ pattern, onLearn, onTry }: PatternCardProps) {
  return (
    <Card className="hover:shadow-md transition-all">
      <CardHeader>
        <div className="text-3xl mb-2">{pattern.icon}</div>
        <CardTitle className="text-lg">{pattern.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {pattern.description}
        </p>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onLearn}>
            Learn
          </Button>
          <Button variant="accent" size="sm" onClick={onTry}>
            Try
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Try in Builder CTA

```tsx
// Component: components/learn/TryInBuilderCTA.tsx

export function TryInBuilderCTA({
  lessonId,
  templateId,
}: {
  lessonId: string;
  templateId: string;
}) {
  return (
    <Card className="bg-accent/5 border-accent/20">
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h4 className="font-semibold">Try this in Builder</h4>
            <p className="text-sm text-muted-foreground">
              Practice with a pre-configured template using these techniques
            </p>
          </div>
        </div>
        <Button variant="accent" asChild>
          <Link to={`/app/prompts/new?template=${templateId}`}>
            Open in Builder
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Prompt Patterns Content

### 1. Decomposition Pattern
Break complex tasks into smaller, manageable steps.

```
Instead of:
"Write a complete marketing strategy"

Use:
1. First, identify our target audience characteristics
2. Next, list 5 key pain points they experience
3. Then, suggest messaging for each pain point
4. Finally, prioritize by potential impact
```

### 2. Role + Rubric Pattern
Define both who the AI should be AND how to evaluate the output.

```
Role: You are a senior product manager at a B2B SaaS company

Evaluation criteria:
- Addresses business goals clearly
- Considers technical feasibility
- Includes measurable success metrics
- Prioritizes user impact
```

### 3. Schema-First Prompting
Start by defining the exact output structure you want.

```
Output this analysis as JSON:
{
  "summary": "2-3 sentence overview",
  "key_findings": ["finding 1", "finding 2"],
  "recommendations": [
    {
      "action": "string",
      "priority": "high|medium|low",
      "effort": "string"
    }
  ]
}
```

### 4. Few-Shot Strategy
Provide 2-3 examples of the exact output style you want.

```
Format responses like these examples:

Input: "How do I reset my password?"
Output: "To reset your password: Settings → Security → Reset Password. Need help? Contact support."

Input: "What's your pricing?"
Output: "We offer three plans: Starter ($9/mo), Pro ($29/mo), Team ($99/mo). See full comparison: pricing page."

Now answer: [user question]
```

---

## Empty States

### No progress yet
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│            [graduation cap icon]                            │
│                                                             │
│            Start your learning journey                      │
│                                                             │
│            Begin with the fundamentals in our               │
│            beginner track to build a strong foundation.     │
│                                                             │
│            [Start Beginner Track]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Gamification Elements

| Element | Description |
|---------|-------------|
| Progress bars | Visual completion % per track |
| Badges | Earned for completing tracks |
| Streak counter | Days of consecutive learning |
| XP points | Earned per lesson + practice |
| Leaderboard | Optional team/global ranking |

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (<768px) | Sidebar becomes tabs at top |
| Tablet (768-1023px) | Sidebar collapses to icons |
| Desktop (≥1024px) | Full sidebar visible |
