import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Clock,
  Tag,
  ArrowRight,
  Mail,
} from "lucide-react";

const articles = [
  {
    id: "race-framework",
    title: "The RACE Framework for Prompt Engineering",
    description: "Learn the Role, Action, Context, Examples framework for crafting effective prompts.",
    category: "Framework",
    readTime: "5 min",
    tags: ["framework", "best-practices"],
  },
  {
    id: "system-prompts",
    title: "Writing Effective System Prompts",
    description: "Master the art of setting context and constraints with system messages.",
    category: "Guide",
    readTime: "8 min",
    tags: ["system-prompt", "fundamentals"],
  },
  {
    id: "output-schemas",
    title: "Designing Output Schemas",
    description: "Structure your AI outputs with JSON schemas and format instructions.",
    category: "Tutorial",
    readTime: "6 min",
    tags: ["json", "structured-output"],
  },
  {
    id: "few-shot-learning",
    title: "Few-Shot Learning in Practice",
    description: "Use examples to dramatically improve your prompt's performance.",
    category: "Technique",
    readTime: "7 min",
    tags: ["examples", "technique"],
  },
  {
    id: "chain-of-thought",
    title: "Chain of Thought Prompting",
    description: "Guide the AI through step-by-step reasoning for complex tasks.",
    category: "Technique",
    readTime: "6 min",
    tags: ["reasoning", "advanced"],
  },
  {
    id: "evaluation-rubrics",
    title: "Creating Evaluation Rubrics",
    description: "Build consistent criteria for evaluating prompt outputs.",
    category: "Quality",
    readTime: "5 min",
    tags: ["evaluation", "testing"],
  },
  {
    id: "prompt-injection",
    title: "Preventing Prompt Injection",
    description: "Security best practices for production prompts.",
    category: "Security",
    readTime: "8 min",
    tags: ["security", "production"],
  },
  {
    id: "model-comparison",
    title: "Choosing the Right Model",
    description: "Compare GPT-4, Claude, and other models for your use case.",
    category: "Guide",
    readTime: "10 min",
    tags: ["models", "comparison"],
  },
];

const categories = ["All", "Framework", "Guide", "Tutorial", "Technique", "Quality", "Security"];

export default function LearnPage() {
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
              <Input placeholder="Search articles..." className="pl-10" />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/learn/${article.id}`}
              className="group p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-200"
            >
              <Badge variant="muted" className="mb-3">
                {article.category}
              </Badge>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-amber-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {article.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.readTime} read
                </span>
                <span className="flex items-center gap-1 group-hover:text-amber-600 transition-colors">
                  Read more
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
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
