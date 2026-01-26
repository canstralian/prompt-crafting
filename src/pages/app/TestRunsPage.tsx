import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Filter,
} from "lucide-react";

const testRuns = [
  {
    id: "1",
    promptTitle: "Marketing Email Generator",
    promptId: "1",
    status: "passed",
    score: 4.2,
    createdAt: "2 hours ago",
    inputPreview: "Product: AI Writing Assistant, Audience: Content creators...",
  },
  {
    id: "2",
    promptTitle: "Code Review Assistant",
    promptId: "2",
    status: "failed",
    score: 2.1,
    createdAt: "5 hours ago",
    inputPreview: "Code: function processData(arr) { return arr.map(x => x * 2) }...",
  },
  {
    id: "3",
    promptTitle: "Product Description Writer",
    promptId: "3",
    status: "passed",
    score: 4.8,
    createdAt: "1 day ago",
    inputPreview: "Product: Wireless Earbuds, Features: Noise cancellation...",
  },
  {
    id: "4",
    promptTitle: "Blog Post Outline",
    promptId: "5",
    status: "warning",
    score: 3.5,
    createdAt: "1 day ago",
    inputPreview: "Topic: AI in Healthcare, Keywords: machine learning, diagnosis...",
  },
  {
    id: "5",
    promptTitle: "Marketing Email Generator",
    promptId: "1",
    status: "passed",
    score: 4.5,
    createdAt: "2 days ago",
    inputPreview: "Product: Project Management Tool, Audience: Startup founders...",
  },
];

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "passed":
      return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    default:
      return null;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, "success" | "destructive" | "accent" | "muted"> = {
    passed: "success",
    failed: "destructive",
    warning: "accent",
  };

  return (
    <Badge variant={variants[status] || "muted"} className="capitalize">
      {status}
    </Badge>
  );
};

export default function TestRunsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Test Runs</h1>
          <p className="text-muted-foreground">
            View and analyze your prompt test results
          </p>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-2xl font-bold">156</p>
          <p className="text-sm text-muted-foreground">Total runs</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-2xl font-bold text-emerald-500">82%</p>
          <p className="text-sm text-muted-foreground">Pass rate</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-2xl font-bold">4.1</p>
          <p className="text-sm text-muted-foreground">Avg. score</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-2xl font-bold">12</p>
          <p className="text-sm text-muted-foreground">This week</p>
        </div>
      </div>

      {/* Test Runs List */}
      <div className="space-y-3">
        {testRuns.map((run) => (
          <Link
            key={run.id}
            to={`/app/prompts/${run.promptId}`}
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FlaskConical className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium truncate">{run.promptTitle}</p>
                  <StatusIcon status={run.status} />
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {run.inputPreview}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 shrink-0 pl-4">
              <div className="text-right hidden sm:block">
                <p className="font-semibold">{run.score}/5</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {run.createdAt}
                </p>
              </div>
              <StatusBadge status={run.status} />
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {testRuns.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="inline-flex h-16 w-16 rounded-full bg-muted items-center justify-center mb-4">
            <FlaskConical className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No test runs yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Run tests on your prompts to evaluate their performance and track improvements.
          </p>
          <Button asChild>
            <Link to="/app/library">Go to Library</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
