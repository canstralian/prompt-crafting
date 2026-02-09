import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Star, Save, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePromptTesting } from "@/hooks/usePromptTesting";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface TestRunDetail {
  id: number;
  promptTitle: string;
  systemPrompt: string | null;
  userPrompt: string;
  outputs: string[];
  status: string;
  overallScore: number | null;
  ratingClarity: number | null;
  ratingCompleteness: number | null;
  ratingCorrectness: number | null;
  ratingStyleMatch: number | null;
  notes: string | null;
  createdAt: string;
}

const ratingLabels = {
  clarity: "Clarity",
  completeness: "Completeness",
  correctness: "Correctness",
  styleMatch: "Style Match",
};

function computeStatus(run: any): string {
  if (run.ratingClarity == null) return "pending";
  const avg = ((run.ratingClarity || 0) + (run.ratingCompleteness || 0) + (run.ratingCorrectness || 0) + (run.ratingStyleMatch || 0)) / 4;
  if (avg >= 4) return "passed";
  if (avg >= 3) return "warning";
  return "failed";
}

function computeOverallScore(run: any): number | null {
  if (run.ratingClarity == null) return null;
  return ((run.ratingClarity || 0) + (run.ratingCompleteness || 0) + (run.ratingCorrectness || 0) + (run.ratingStyleMatch || 0)) / 4;
}

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, "success" | "destructive" | "accent" | "secondary"> = {
    passed: "success",
    failed: "destructive",
    warning: "accent",
    pending: "secondary",
  };

  return (
    <Badge variant={variants[status] || "secondary"} className="capitalize">
      {status}
    </Badge>
  );
};

export default function TestRunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateRatings, isSaving } = usePromptTesting();

  const [testRun, setTestRun] = useState<TestRunDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ratings, setRatings] = useState({
    clarity: 0,
    completeness: 0,
    correctness: 0,
    styleMatch: 0,
  });
  const [notes, setNotes] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchTestRun = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const res = await fetch(`/api/test-runs/${id}`, { credentials: "include" });
        if (!res.ok) {
          toast.error("Failed to load test run");
          navigate("/app/tests");
          return;
        }

        const data = await res.json();

        const mapped: TestRunDetail = {
          id: data.id,
          promptTitle: data.promptTitle,
          systemPrompt: data.systemPrompt,
          userPrompt: data.userPrompt,
          outputs: data.outputs as string[],
          status: computeStatus(data),
          overallScore: computeOverallScore(data),
          ratingClarity: data.ratingClarity,
          ratingCompleteness: data.ratingCompleteness,
          ratingCorrectness: data.ratingCorrectness,
          ratingStyleMatch: data.ratingStyleMatch,
          notes: data.notes,
          createdAt: data.createdAt,
        };

        setTestRun(mapped);
        setRatings({
          clarity: mapped.ratingClarity || 0,
          completeness: mapped.ratingCompleteness || 0,
          correctness: mapped.ratingCorrectness || 0,
          styleMatch: mapped.ratingStyleMatch || 0,
        });
        setNotes(mapped.notes || "");
      } catch {
        toast.error("Failed to load test run");
        navigate("/app/tests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestRun();
  }, [id, navigate]);

  const handleRatingChange = (key: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!testRun) return;

    const allRated = Object.values(ratings).every((r) => r > 0);
    if (!allRated) {
      toast.error("Please rate all dimensions before saving");
      return;
    }

    const success = await updateRatings(testRun.id, ratings, notes || undefined);
    if (success) {
      setHasChanges(false);
      const avg = (ratings.clarity + ratings.completeness + ratings.correctness + ratings.styleMatch) / 4;
      let status = "pending";
      if (avg >= 4) status = "passed";
      else if (avg >= 3) status = "warning";
      else status = "failed";
      setTestRun((prev) =>
        prev ? { ...prev, status, overallScore: avg } : prev
      );
    }
  };

  const RatingStars = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (val: number) => void;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0.5 hover:scale-110 transition-transform"
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
              star <= value
                ? "fill-accent text-accent"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!testRun) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/tests")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{testRun.promptTitle}</h1>
              <StatusBadge status={testRun.status} />
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(testRun.createdAt), { addSuffix: true })}
              {testRun.overallScore !== null && (
                <span className="ml-3">Score: {testRun.overallScore.toFixed(1)}/5</span>
              )}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Ratings
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {testRun.systemPrompt && (
          <div className="p-4 border border-border bg-card">
            <Label className="text-xs uppercase text-muted-foreground">System Prompt</Label>
            <p className="mt-2 text-sm whitespace-pre-wrap">{testRun.systemPrompt}</p>
          </div>
        )}
        <div className={cn("p-4 border border-border bg-card", !testRun.systemPrompt && "md:col-span-2")}>
          <Label className="text-xs uppercase text-muted-foreground">User Prompt</Label>
          <p className="mt-2 text-sm whitespace-pre-wrap">{testRun.userPrompt}</p>
        </div>
      </div>

      <div>
        <Label className="text-xs uppercase text-muted-foreground mb-3 block">Generated Variants</Label>
        <div className="grid gap-4 md:grid-cols-3">
          {testRun.outputs.map((output, idx) => (
            <div
              key={idx}
              className="p-4 border border-border bg-muted/30 min-h-[200px] max-h-[400px] overflow-y-auto"
            >
              <Badge variant="secondary" className="mb-3">
                Variant {idx + 1}
              </Badge>
              <pre className="whitespace-pre-wrap text-sm font-mono">{output}</pre>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Label className="text-xs uppercase text-muted-foreground">Evaluation Ratings</Label>
          <div className="grid gap-3">
            {(Object.keys(ratingLabels) as Array<keyof typeof ratingLabels>).map((key) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 border border-border bg-card"
              >
                <span className="font-medium">{ratingLabels[key]}</span>
                <RatingStars
                  value={ratings[key]}
                  onChange={(val) => handleRatingChange(key, val)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label htmlFor="notes" className="text-xs uppercase text-muted-foreground">
            Notes
          </Label>
          <Textarea
            id="notes"
            placeholder="Add observations or notes about this test run..."
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>
      </div>
    </div>
  );
}
