import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

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

type EnrichedTestRun = TestRun & { status: string; overallScore: number | null };

export function useTestRuns() {
  const { user } = useAuth();

  const { data: rawTestRuns = [], isLoading, error, refetch } = useQuery<TestRun[]>({
    queryKey: ["/api/test-runs"],
    enabled: !!user,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const testRuns: EnrichedTestRun[] = useMemo(
    () =>
      rawTestRuns.map((row) => ({
        ...row,
        status: computeStatus(row),
        overallScore: computeOverallScore(row),
      })),
    [rawTestRuns],
  );

  const stats = useMemo(() => {
    const scoredRuns = testRuns.filter((r) => r.overallScore !== null);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return {
      total: testRuns.length,
      passRate: testRuns.length > 0
        ? Math.round(
            (testRuns.filter((r) => r.status === "passed").length / testRuns.length) * 100,
          )
        : 0,
      avgScore: scoredRuns.length > 0
        ? (
            scoredRuns.reduce((sum, r) => sum + (r.overallScore || 0), 0) / scoredRuns.length
          ).toFixed(1)
        : "—",
      thisWeek: testRuns.filter((r) => new Date(r.createdAt) > weekAgo).length,
    };
  }, [testRuns]);

  return {
    testRuns,
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    stats,
    refetch,
  };
}

export function useCreateTestRun() {
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/test-runs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-runs"] });
    },
  });
}
