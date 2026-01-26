import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Clock,
  ArrowRight,
  Mail,
} from "lucide-react";
import { useLearnPosts, useLearnCategories } from "@/hooks/useLearnPosts";

function estimateReadTime(markdown: string): number {
  const words = markdown.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories, isLoading: categoriesLoading } = useLearnCategories();
  const { data: posts, isLoading: postsLoading } = useLearnPosts(selectedCategory);

  const filteredPosts = posts?.filter((post) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.summary?.toLowerCase().includes(query) ||
      post.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="py-20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Resources</Badge>
          <h1 className="text-4xl font-bold mb-4">Learn Prompt Engineering</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Practical guides, frameworks, and techniques to help you craft better prompts.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Button>
            {categoriesLoading ? (
              <>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
              </>
            ) : (
              categories?.map((category) => (
                <Button
                  key={category.slug}
                  variant={selectedCategory === category.slug ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.slug)}
                >
                  {category.name}
                </Button>
              ))
            )}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {postsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-card">
                <Skeleton className="h-5 w-20 mb-3" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))
          ) : filteredPosts?.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No articles found matching your criteria.</p>
            </div>
          ) : (
            filteredPosts?.map((post) => (
              <Link
                key={post.id}
                to={`/learn/${post.slug}`}
                className="group p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-200"
              >
                {post.category && (
                  <Badge variant="secondary" className="mb-3">
                    {post.category.name}
                  </Badge>
                )}
                <h3 className="text-lg font-semibold mb-2 group-hover:text-amber-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {post.summary}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {estimateReadTime(post.body_markdown)} min read
                  </span>
                  <span className="flex items-center gap-1 group-hover:text-amber-600 transition-colors">
                    Read more
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Newsletter */}
        <div className="mt-20 max-w-2xl mx-auto text-center p-8 rounded-2xl bg-muted/50 border border-border">
          <div className="inline-flex h-12 w-12 rounded-full bg-amber-100 items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Stay up to date</h2>
          <p className="text-muted-foreground mb-6">
            Get the latest prompt engineering tips and techniques delivered to your inbox.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input placeholder="you@example.com" type="email" className="flex-1" />
            <Button>Subscribe</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            No spam, unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
