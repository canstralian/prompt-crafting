# Team & Sharing Wireframe

## Overview
The sharing system enables collaboration with flexible permission levels, multiple export formats, and activity tracking. These are modals/drawers that appear in context, not standalone pages.

---

## Share Modal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Share "Product Description Generator"                              [×]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INVITE PEOPLE                                                              │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────┐ ┌───────────┐ │
│  │ Email address                                           │ │ Can edit ▼│ │
│  └─────────────────────────────────────────────────────────┘ └───────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Add a message (optional)                                           │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [Send invite]                                                              │
│                                                                             │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  PEOPLE WITH ACCESS                                                         │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 👤 Sarah Chen (you)                              Owner              │   │
│  │    sarah@company.com                                                │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 👤 Mike Johnson                                  Can edit    [×]    │   │
│  │    mike@company.com                              ────────▼          │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 👤 Lisa Park                                     Can view    [×]    │   │
│  │    lisa@company.com                              ────────▼          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  SHARE LINK                                                                 │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  Anyone with the link                                                       │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────┐  │
│  │ Can view                         ▼      │ │ 🔗 Copy link             │  │
│  └─────────────────────────────────────────┘ └──────────────────────────┘  │
│                                                                             │
│  Link: https://promptcrafting.net/s/abc123                                  │
│                                                                             │
│  [ ] Require login to view                                                  │
│  [ ] Allow viewers to copy prompt                                           │
│  [ ] Link expires after ─────────────────┐                                  │
│                         │ Never       ▼  │                                  │
│                         └─────────────────┘                                 │
│                                                                             │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  EXPORT                                                                     │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│  │      📝         │ │      { }        │ │      📋         │               │
│  │   Markdown      │ │      JSON       │ │     Notion      │               │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Activity Log (Team Plan Feature)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Activity Log                                                        [×]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Filter: [All activity ▼]        Date: [Last 7 days ▼]        🔍 Search    │
│                                                                             │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  TODAY                                                                      │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 👤 Sarah Chen edited version v4                          2:34 PM    │   │
│  │    Changed: Constraints section                                      │   │
│  │    [View diff]                                                       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 👤 Mike Johnson ran test                                  11:20 AM   │   │
│  │    Model: GPT-4 • Input: "Product launch email..."                   │   │
│  │    [View result]                                                     │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 👤 Sarah Chen created version v4                         10:15 AM   │   │
│  │    Based on v3                                                       │   │
│  │    [View version]                                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  YESTERDAY                                                                  │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 👤 Lisa Park was given access                            4:30 PM    │   │
│  │    Permission: Can view • By: Sarah Chen                             │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 👤 Mike Johnson saved as variant                          2:15 PM   │   │
│  │    Created "Product Desc - Formal Tone"                              │   │
│  │    [View variant]                                                    │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 👤 Sarah Chen created prompt                             10:00 AM   │   │
│  │    "Product Description Generator"                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [Load more]                                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Version Diff View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Compare versions                                                    [×]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────┐  vs  ┌─────────────────────────┐               │
│  │ v3 (Dec 15)         ▼  │      │ v4 (Dec 16)         ▼  │               │
│  └─────────────────────────┘      └─────────────────────────┘               │
│                                                                             │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ROLE                                                          No changes   │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  OBJECTIVE                                                     No changes   │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  CONSTRAINTS                                                    Modified    │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐      │
│  │ v3                            │  │ v4                            │      │
│  │ ───────────────────────────── │  │ ───────────────────────────── │      │
│  │                               │  │                               │      │
│  │ - Professional tone           │  │ - Professional tone           │      │
│  │ - 150-200 words               │  │ - 150-200 words               │      │
│  │ [-] Avoid jargon              │  │ [+] Technical but accessible  │      │
│  │                               │  │ [+] Include key metrics       │      │
│  │                               │  │                               │      │
│  └───────────────────────────────┘  └───────────────────────────────┘      │
│                                                                             │
│  OUTPUT SCHEMA                                                 No changes   │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  [Restore v3]                                      [Use v4 as current]      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Share Modal

```tsx
// Component: components/sharing/ShareModal.tsx

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt;
}

export function ShareModal({ isOpen, onClose, prompt }: ShareModalProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'edit' | 'view'>('view');
  const [inviteMessage, setInviteMessage] = useState('');
  const [linkPermission, setLinkPermission] = useState<'view' | 'copy' | 'off'>('view');
  const [linkOptions, setLinkOptions] = useState({
    requireLogin: false,
    allowCopy: true,
    expiration: 'never',
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share "{prompt.name}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite by email */}
          <section className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Invite People
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Email address"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Can view</SelectItem>
                  <SelectItem value="edit">Can edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Add a message (optional)"
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              rows={2}
            />
            <Button onClick={handleSendInvite} disabled={!inviteEmail}>
              Send invite
            </Button>
          </section>

          <Separator />

          {/* People with access */}
          <section className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              People with Access
            </Label>
            <div className="border rounded-lg divide-y">
              {collaborators.map((person) => (
                <div
                  key={person.email}
                  className="flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{person.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {person.name}
                        {person.isOwner && (
                          <span className="text-muted-foreground"> (you)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{person.email}</p>
                    </div>
                  </div>
                  {person.isOwner ? (
                    <span className="text-sm text-muted-foreground">Owner</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Select
                        value={person.role}
                        onValueChange={(v) => handleRoleChange(person.email, v)}
                      >
                        <SelectTrigger className="w-[100px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">Can view</SelectItem>
                          <SelectItem value="edit">Can edit</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveAccess(person.email)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Share link */}
          <section className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Share Link
            </Label>
            <div className="flex gap-2">
              <Select value={linkPermission} onValueChange={setLinkPermission}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Anyone with the link" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Disabled</SelectItem>
                  <SelectItem value="view">Can view</SelectItem>
                  <SelectItem value="copy">Can view & copy</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleCopyLink}>
                <Link2 className="h-4 w-4 mr-2" />
                Copy link
              </Button>
            </div>

            {linkPermission !== 'off' && (
              <div className="space-y-2 pl-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="requireLogin"
                    checked={linkOptions.requireLogin}
                    onCheckedChange={(v) =>
                      setLinkOptions({ ...linkOptions, requireLogin: !!v })
                    }
                  />
                  <Label htmlFor="requireLogin" className="text-sm">
                    Require login to view
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="allowCopy"
                    checked={linkOptions.allowCopy}
                    onCheckedChange={(v) =>
                      setLinkOptions({ ...linkOptions, allowCopy: !!v })
                    }
                  />
                  <Label htmlFor="allowCopy" className="text-sm">
                    Allow viewers to copy prompt
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="expiration"
                    checked={linkOptions.expiration !== 'never'}
                    onCheckedChange={(v) =>
                      setLinkOptions({
                        ...linkOptions,
                        expiration: v ? '7days' : 'never',
                      })
                    }
                  />
                  <Label htmlFor="expiration" className="text-sm">
                    Link expires after
                  </Label>
                  {linkOptions.expiration !== 'never' && (
                    <Select
                      value={linkOptions.expiration}
                      onValueChange={(v) =>
                        setLinkOptions({ ...linkOptions, expiration: v })
                      }
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1day">1 day</SelectItem>
                        <SelectItem value="7days">7 days</SelectItem>
                        <SelectItem value="30days">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            )}
          </section>

          <Separator />

          {/* Export options */}
          <section className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Export
            </Label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => handleExport('markdown')}>
                <FileText className="h-4 w-4 mr-2" />
                Markdown
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => handleExport('json')}>
                <Code className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => handleExport('notion')}>
                <FileText className="h-4 w-4 mr-2" />
                Notion
              </Button>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Activity Log Component

```tsx
// Component: components/sharing/ActivityLog.tsx

interface ActivityLogProps {
  promptId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityLog({ promptId, isOpen, onClose }: ActivityLogProps) {
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7days');

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Activity Log</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All activity</SelectItem>
                <SelectItem value="edits">Edits only</SelectItem>
                <SelectItem value="tests">Tests only</SelectItem>
                <SelectItem value="access">Access changes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Last 7 days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity list */}
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6">
              {Object.entries(groupedActivities).map(([date, activities]) => (
                <div key={date}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    {date}
                  </h4>
                  <div className="border rounded-lg divide-y">
                    {activities.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <div className="p-3 space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">{activity.user.initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{activity.user.name}</span>
          <span className="text-sm text-muted-foreground">{activity.action}</span>
        </div>
        <span className="text-xs text-muted-foreground">{activity.time}</span>
      </div>
      {activity.details && (
        <p className="text-xs text-muted-foreground pl-8">{activity.details}</p>
      )}
      {activity.actionLink && (
        <Button variant="link" size="sm" className="h-auto p-0 pl-8 text-xs">
          {activity.actionLink.label}
        </Button>
      )}
    </div>
  );
}
```

### Export Formats

```tsx
// Component: components/sharing/exportFormats.ts

export function exportToMarkdown(prompt: Prompt): string {
  return `# ${prompt.name}

## Role
${prompt.role}

## Objective
${prompt.objective}

## Context
${prompt.context}

## Constraints
${prompt.constraints.map(c => `- ${c}`).join('\n')}

## Output Schema
${prompt.outputSchema}

---
*Exported from PromptCrafting.net*
`;
}

export function exportToJSON(prompt: Prompt): string {
  return JSON.stringify({
    name: prompt.name,
    version: prompt.version,
    sections: {
      role: prompt.role,
      objective: prompt.objective,
      context: prompt.context,
      constraints: prompt.constraints,
      examples: prompt.examples,
      outputSchema: prompt.outputSchema,
    },
    metadata: {
      created: prompt.createdAt,
      modified: prompt.modifiedAt,
      author: prompt.author,
    },
  }, null, 2);
}

export function exportToNotion(prompt: Prompt): string {
  // Notion-compatible markdown with database properties
  return `---
Name: ${prompt.name}
Type: Prompt Template
Tags: ${prompt.tags.join(', ')}
---

# ${prompt.name}

## Role
> ${prompt.role}

## Objective
${prompt.objective}

## Context
${prompt.context}

## Constraints
${prompt.constraints.map(c => `- [ ] ${c}`).join('\n')}

## Output Schema
\`\`\`
${prompt.outputSchema}
\`\`\`
`;
}
```

---

## Permission Levels

| Permission | View | Copy | Edit | Share | Delete |
|------------|------|------|------|-------|--------|
| Owner | ✓ | ✓ | ✓ | ✓ | ✓ |
| Can edit | ✓ | ✓ | ✓ | ✗ | ✗ |
| Can view | ✓ | ✓* | ✗ | ✗ | ✗ |
| Link (view) | ✓ | ✓* | ✗ | ✗ | ✗ |

*Copy permission depends on owner settings

---

## Activity Types

| Activity | Icon | Logged Data |
|----------|------|-------------|
| Created prompt | ➕ | Name, user |
| Edited version | ✏️ | Changed sections, user |
| Created version | 📋 | Version number, base version |
| Ran test | ▶️ | Model, input preview |
| Saved variant | 💾 | Variant name |
| Access granted | 👤 | User, permission, grantor |
| Access revoked | 🚫 | User, revoker |
| Link created | 🔗 | Permission, options |
| Exported | 📤 | Format |

---

## Mobile Adaptations

- Share modal becomes full-screen sheet
- Activity log becomes separate page
- Export buttons stack vertically
- Permission dropdowns use native selects
