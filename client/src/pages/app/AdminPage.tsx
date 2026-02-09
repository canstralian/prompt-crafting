import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  FileText,
  Star,
  Tag,
  Plus,
  Search,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStats } from "@/hooks/useAdminStats";

const recentUsers = [
  { id: "1", name: "John Doe", email: "john@example.com", plan: "Pro", createdAt: "2 hours ago" },
  { id: "2", name: "Jane Smith", email: "jane@company.com", plan: "Team", createdAt: "5 hours ago" },
  { id: "3", name: "Mike Johnson", email: "mike@startup.io", plan: "Free", createdAt: "1 day ago" },
];

const featuredPrompts = [
  { id: "1", title: "Ultimate Code Reviewer", category: "Coding", author: "PromptCrafting Team", uses: 1243 },
  { id: "2", title: "SEO Blog Writer", category: "Writing", author: "Content Pro", uses: 892 },
  { id: "3", title: "Product Launch Email", category: "Marketing", author: "PromptCrafting Team", uses: 1089 },
];

export default function AdminPage() {
  const { data: stats, isLoading } = useAdminStats();

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users },
    { label: "Content Posts", value: stats?.totalPosts ?? 0, icon: FileText },
    { label: "Categories", value: stats?.totalCategories ?? 0, icon: Tag },
    { label: "Admins", value: stats?.totalAdmins ?? 0, icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Admin Console</h1>
          <p className="text-muted-foreground">
            Manage users, content, and platform settings.
          </p>
        </div>
        <Badge variant="accent">
          <Star className="mr-1 h-3 w-3" />
          Site Admin
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
            )}
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="prompts">Featured Prompts</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-10" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">User</th>
                  <th className="text-left p-4 text-sm font-medium">Plan</th>
                  <th className="text-left p-4 text-sm font-medium">Joined</th>
                  <th className="text-right p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-t border-border">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={user.plan === "Team" ? "accent" : user.plan === "Pro" ? "default" : "muted"}>
                        {user.plan}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{user.createdAt}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm">
                        View
                        <ArrowUpRight className="ml-1 h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Featured Prompts Tab */}
        <TabsContent value="prompts" className="space-y-4">
          <div className="flex justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search prompts..." className="pl-10" />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Feature Prompt
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Prompt</th>
                  <th className="text-left p-4 text-sm font-medium">Category</th>
                  <th className="text-left p-4 text-sm font-medium">Author</th>
                  <th className="text-left p-4 text-sm font-medium">Uses</th>
                  <th className="text-right p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {featuredPrompts.map((prompt) => (
                  <tr key={prompt.id} className="border-t border-border">
                    <td className="p-4 font-medium">{prompt.title}</td>
                    <td className="p-4">
                      <Badge variant="muted">{prompt.category}</Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{prompt.author}</td>
                    <td className="p-4 text-sm">{prompt.uses.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm">Remove</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="flex justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search articles..." className="pl-10" />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Article
            </Button>
          </div>
          <div className="p-8 rounded-xl border border-dashed border-border text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Content Management</h3>
            <p className="text-muted-foreground text-sm">
              Create and manage learning resources, articles, and guides.
            </p>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search categories..." className="pl-10" />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Marketing", "Coding", "Product", "Research", "Writing", "Career"].map((category) => (
              <div key={category} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{category}</span>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
