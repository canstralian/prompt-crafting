# My Library Wireframe

## Overview
The personal library is the user's "knowledge loop" - a place to organize, rate, and quickly access their most-used prompts. Focus: fast retrieval, personal organization, and usage tracking.

---

## ASCII Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ APP SIDEBAR (collapsed: w-16, expanded: w-64)    │  MAIN CONTENT                                       │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
│                                                  │                                                      │
│  [Logo]                                          │  MY LIBRARY                                          │
│                                                  │  ═══════════════════════════════════════════════════ │
│  ─────────────────                               │                                                      │
│                                                  │  ┌────────────────────────────────────────────────┐  │
│  📊 Dashboard                                    │  │ 🔍 Search prompts...           [+ New prompt]  │  │
│                                                  │  └────────────────────────────────────────────────┘  │
│  📚 Library        ← active                      │                                                      │
│                                                  │  ─────────────────────────────────────────────────── │
│  ✨ Builder                                      │                                                      │
│                                                  │  ⭐ PINNED (3)                                       │
│  🧪 Test Runs                                    │  ─────────────────────────────────────────────────── │
│                                                  │                                                      │
│  ─────────────────                               │  ┌─────────────────────────────────────────────────┐ │
│                                                  │  │ 📌 Product Description Generator     ⭐⭐⭐⭐⭐   │ │
│  ⚙️ Settings                                     │  │    Last used: 2 hours ago                       │ │
│                                                  │  │    [Copy] [Open] [Share] [⋮]                    │ │
│                                                  │  └─────────────────────────────────────────────────┘ │
│                                                  │                                                      │
│                                                  │  ┌─────────────────────────────────────────────────┐ │
│                                                  │  │ 📌 Code Review Checklist             ⭐⭐⭐⭐☆   │ │
│                                                  │  │    Last used: Yesterday                         │ │
│                                                  │  │    [Copy] [Open] [Share] [⋮]                    │ │
│                                                  │  └─────────────────────────────────────────────────┘ │
│                                                  │                                                      │
├──────────────────────────────────────────────────┤                                                      │
│ FOLDERS                                          │  ┌─────────────────────────────────────────────────┐ │
│ ─────────────────                                │  │ 📌 Sales Email Template              ⭐⭐⭐⭐⭐   │ │
│                                                  │  │    Last used: 3 days ago                        │ │
│  📁 All prompts (24)                             │  │    [Copy] [Open] [Share] [⋮]                    │ │
│                                                  │  └─────────────────────────────────────────────────┘ │
│  📁 Work (12)                                    │                                                      │
│     └─ 📁 Marketing (5)                          │  ─────────────────────────────────────────────────── │
│     └─ 📁 Engineering (7)                        │                                                      │
│                                                  │  📁 WORK / MARKETING (5 prompts)                     │
│  📁 Personal (8)                                 │  ─────────────────────────────────────────────────── │
│                                                  │                                                      │
│  📁 Archived (4)                                 │  ┌────────────────────────────────────────────────────────────────────────────────────────────┐ │
│                                                  │  │                                                                                            │ │
│  [+ New folder]                                  │  │  NAME                        LAST USED       RATING      ACTIONS                          │ │
│                                                  │  │  ────────────────────────────────────────────────────────────────────────────────────────  │ │
│                                                  │  │                                                                                            │ │
│                                                  │  │  Blog Post Outline           Today           ⭐⭐⭐⭐☆    [Copy] [Open] [Share] [⋮]        │ │
│                                                  │  │                                                                                            │ │
│                                                  │  │  Social Media Caption        2 days ago      ⭐⭐⭐☆☆    [Copy] [Open] [Share] [⋮]        │ │
│                                                  │  │                                                                                            │ │
│                                                  │  │  Landing Page Copy           1 week ago      ⭐⭐⭐⭐⭐    [Copy] [Open] [Share] [⋮]        │ │
│                                                  │  │                                                                                            │ │
│                                                  │  │  Newsletter Draft            2 weeks ago     ⭐⭐⭐⭐☆    [Copy] [Open] [Share] [⋮]        │ │
│                                                  │  │                                                                                            │ │
│                                                  │  │  Ad Copy Generator           3 weeks ago     ⭐⭐⭐☆☆    [Copy] [Open] [Share] [⋮]        │ │
│                                                  │  │                                                                                            │ │
│                                                  │  └────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                  │                                                      │
│                                                  │  ─────────────────────────────────────────────────── │
│                                                  │                                                      │
│                                                  │  📁 WORK / ENGINEERING (7 prompts)                   │
│                                                  │  ─────────────────────────────────────────────────── │
│                                                  │                                                      │
│                                                  │  ... (similar list view)                             │
│                                                  │                                                      │
└──────────────────────────────────────────────────┴──────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Library Page Layout

```tsx
// Page: pages/app/PromptLibraryPage.tsx (enhanced)

export function PromptLibraryPage() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('list');

  return (
    <div className="flex h-full">
      {/* Folders Sidebar */}
      <FoldersSidebar
        folders={folders}
        selectedFolder={selectedFolder}
        onSelectFolder={setSelectedFolder}
        onCreateFolder={handleCreateFolder}
      />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Library</h1>
          <Button asChild>
            <Link to="/app/prompts/new">
              <Plus className="h-4 w-4 mr-2" />
              New prompt
            </Link>
          </Button>
        </div>

        {/* Search & View Toggle */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <ToggleGroup type="single" value={view} onValueChange={setView}>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid3X3 className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Pinned Section */}
        <PinnedPromptsSection prompts={pinnedPrompts} />

        {/* Folder Content */}
        <FolderContent
          folder={selectedFolder}
          prompts={filteredPrompts}
          view={view}
        />
      </div>
    </div>
  );
}
```

### Folders Sidebar

```tsx
// Component: components/library/FoldersSidebar.tsx

export function FoldersSidebar({
  folders,
  selectedFolder,
  onSelectFolder,
  onCreateFolder,
}: FoldersSidebarProps) {
  return (
    <aside className="w-64 border-r bg-muted/30 p-4">
      <h3 className="font-medium text-sm text-muted-foreground mb-3">FOLDERS</h3>

      <nav className="space-y-1">
        {/* All prompts */}
        <button
          onClick={() => onSelectFolder(null)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
            selectedFolder === null
              ? "bg-accent/10 text-accent font-medium"
              : "hover:bg-muted"
          )}
        >
          <FolderOpen className="h-4 w-4" />
          All prompts
          <span className="ml-auto text-muted-foreground">
            {totalCount}
          </span>
        </button>

        {/* Folder tree */}
        {folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            isSelected={selectedFolder === folder.id}
            onSelect={() => onSelectFolder(folder.id)}
          />
        ))}
      </nav>

      {/* Create folder */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-4 justify-start"
        onClick={onCreateFolder}
      >
        <Plus className="h-4 w-4 mr-2" />
        New folder
      </Button>
    </aside>
  );
}

function FolderItem({ folder, isSelected, onSelect, level = 0 }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = folder.children?.length > 0;

  return (
    <div>
      <button
        onClick={onSelect}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
          isSelected ? "bg-accent/10 text-accent font-medium" : "hover:bg-muted"
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-90"
              )}
            />
          </button>
        )}
        <Folder className="h-4 w-4" />
        <span className="truncate">{folder.name}</span>
        <span className="ml-auto text-muted-foreground">{folder.count}</span>
      </button>

      {hasChildren && isExpanded && (
        <div>
          {folder.children.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              isSelected={selectedFolder === child.id}
              onSelect={() => onSelectFolder(child.id)}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Pinned Prompts Section

```tsx
// Component: components/library/PinnedPromptsSection.tsx

export function PinnedPromptsSection({ prompts }: { prompts: Prompt[] }) {
  if (prompts.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Pin className="h-4 w-4 text-accent" />
        <h2 className="font-semibold">Pinned</h2>
        <Badge variant="secondary">{prompts.length}</Badge>
      </div>

      <div className="space-y-2">
        {prompts.map((prompt) => (
          <PinnedPromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </section>
  );
}

function PinnedPromptCard({ prompt }: { prompt: Prompt }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Pin className="h-4 w-4 text-accent" />
          <div>
            <h3 className="font-medium">{prompt.name}</h3>
            <p className="text-sm text-muted-foreground">
              Last used: {formatRelativeTime(prompt.lastUsed)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Rating */}
          <StarRating value={prompt.rating} readonly size="sm" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy prompt</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link to={`/app/prompts/${prompt.id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open in Builder</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Pin className="h-4 w-4 mr-2" />
                  Unpin
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FolderInput className="h-4 w-4 mr-2" />
                  Move to folder
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

### Prompts List View

```tsx
// Component: components/library/PromptsListView.tsx

export function PromptsListView({ prompts, onAction }: PromptsListViewProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Name</TableHead>
            <TableHead>Last used</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prompts.map((prompt) => (
            <TableRow key={prompt.id} className="group">
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{prompt.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatRelativeTime(prompt.lastUsed)}
              </TableCell>
              <TableCell>
                <StarRating
                  value={prompt.rating}
                  onChange={(v) => onAction('rate', prompt.id, v)}
                  size="sm"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => onAction('copy', prompt.id)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/app/prompts/${prompt.id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onAction('share', prompt.id)}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onAction('pin', prompt.id)}>
                        <Pin className="h-4 w-4 mr-2" />
                        Pin to top
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction('move', prompt.id)}>
                        <FolderInput className="h-4 w-4 mr-2" />
                        Move to folder
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction('duplicate', prompt.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction('archive', prompt.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onAction('delete', prompt.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Star Rating Component

```tsx
// Component: components/ui/star-rating.tsx

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div
      className={cn("flex items-center gap-0.5", readonly && "pointer-events-none")}
      onMouseLeave={() => setHoverValue(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverValue ?? value) >= star;
        return (
          <button
            key={star}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => setHoverValue(star)}
            className={cn(
              "transition-colors",
              !readonly && "hover:scale-110 cursor-pointer"
            )}
          >
            <Star
              className={cn(
                sizes[size],
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
```

---

## Empty States

### Empty library
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│            [illustration of empty folder]                   │
│                                                             │
│            Your library is empty                            │
│                                                             │
│            Start by creating your first prompt              │
│            or browsing community templates.                 │
│                                                             │
│            [Create first prompt]   [Browse templates]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Empty folder
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│            [folder icon]                                    │
│                                                             │
│            This folder is empty                             │
│                                                             │
│            Move prompts here to organize your work.         │
│                                                             │
│            [Move prompts here]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### No search results
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│            [search icon]                                    │
│                                                             │
│            No prompts found for "xyz"                       │
│                                                             │
│            Try a different search term.                     │
│                                                             │
│            [Clear search]                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Responsive Behavior

| Breakpoint | Folders Sidebar | Content |
|------------|-----------------|---------|
| Mobile (<768px) | Hidden (sheet trigger) | Full width |
| Tablet (768-1023px) | Collapsed (64px) | Flex-1 |
| Desktop (≥1024px) | Expanded (256px) | Flex-1 |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + N` | New prompt |
| `Cmd/Ctrl + F` | Focus search |
| `Enter` (on row) | Open prompt |
| `C` (on row) | Copy prompt |
| `P` (on row) | Pin/unpin |
| `Delete` (on row) | Delete prompt |
