import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface TestRun {
  id: number;
  promptTitle: string;
  draftId: number | null;
  systemPrompt: string | null;
  userPrompt: string;
  outputs: string[];
  ratingClarity: number | null;
  ratingCompleteness: number | null;
  ratingCorrectness: number | null;
  ratingStyleMatch: number | null;
  notes: string | null;
  createdAt: string;
}

function computeStatus(run: TestRun): string {
  if (run.ratingClarity == null) return "pending";
  const avg = ((run.ratingClarity || 0) + (run.ratingCompleteness || 0) + (run.ratingCorrectness || 0) + (run.ratingStyleMatch || 0)) / 4;
  if (avg >= 4) return "passed";
  if (avg >= 3) return "warning";
  return "failed";
}

function computeOverallScore(run: TestRun): number | null {
  if (run.ratingClarity == null) return null;
  return ((run.ratingClarity || 0) + (run.ratingCompleteness || 0) + (run.ratingCorrectness || 0) + (run.ratingStyleMatch || 0)) / 4;
}

export function useTestRuns() {
  const { user } = useAuth();
  const [testRuns, setTestRuns] = useState<(TestRun & { status: string; overallScore: number | null })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestRuns = async () => {
    if (!user) {
      setTestRuns([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/test-runs", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch test runs");
      const data = await res.json();
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        promptTitle: row.promptTitle,
        draftId: row.draftId,
        systemPrompt: row.systemPrompt,
        userPrompt: row.userPrompt,
        outputs: row.outputs as string[],
        ratingClarity: row.ratingClarity,
        ratingCompleteness: row.ratingCompleteness,
        ratingCorrectness: row.ratingCorrectness,
        ratingStyleMatch: row.ratingStyleMatch,
        notes: row.notes,
        createdAt: row.createdAt,
        status: computeStatus(row),
        overallScore: computeOverallScore(row),
      }));
      setTestRuns(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch test runs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestRuns();
  }, [user]);

  const stats = {
    total: testRuns.length,
    passRate: testRuns.length > 0
      ? Math.round(
          (testRuns.filter((r) => r.status === "passed").length / testRuns.length) * 100
        )
      : 0,
    avgScore: testRuns.length > 0
      ? (
          testRuns
            .filter((r) => r.overallScore !== null)
            .reduce((sum, r) => sum + (r.overallScore || 0), 0) /
          (testRuns.filter((r) => r.overallScore !== null).length || 1)
        ).toFixed(1)
      : "—",
    thisWeek: testRuns.filter((r) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(r.createdAt) > weekAgo;
    }).length,
  };

  return {
    testRuns,
    isLoading,
    error,
    stats,
    refetch: fetchTestRuns,
  };
}
