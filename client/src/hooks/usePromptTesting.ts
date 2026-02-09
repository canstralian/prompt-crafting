import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";

interface TestRunInput {
  promptTitle: string;
  systemPrompt?: string;
  userPrompt: string;
  inputVariables?: Record<string, string>;
  draftId?: number;
}

interface TestRunOutput {
  id: number;
  outputs: string[];
  status: string;
  overallScore: number | null;
}

export function usePromptTesting() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const runTest = async (input: TestRunInput): Promise<string[] | null> => {
    if (!user) {
      toast.error("You must be logged in to run tests");
      return null;
    }

    setIsGenerating(true);

    try {
      toast.info("AI test generation is not yet connected. Saving prompt for manual review.");
      return [`[Variant 1] Output for: ${input.userPrompt}`, `[Variant 2] Output for: ${input.userPrompt}`, `[Variant 3] Output for: ${input.userPrompt}`];
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate outputs";
      toast.error(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const saveTestRun = async (
    input: TestRunInput,
    outputs: string[],
    ratings?: {
      clarity?: number;
      completeness?: number;
      correctness?: number;
      styleMatch?: number;
    },
    notes?: string
  ): Promise<TestRunOutput | null> => {
    if (!user) {
      toast.error("You must be logged in to save test runs");
      return null;
    }

    setIsSaving(true);

    try {
      const res = await apiRequest("POST", "/api/test-runs", {
        promptTitle: input.promptTitle,
        systemPrompt: input.systemPrompt || null,
        userPrompt: input.userPrompt,
        inputVariables: input.inputVariables || {},
        outputs,
        draftId: input.draftId || null,
        ratingClarity: ratings?.clarity || null,
        ratingCompleteness: ratings?.completeness || null,
        ratingCorrectness: ratings?.correctness || null,
        ratingStyleMatch: ratings?.styleMatch || null,
        notes: notes || null,
      });

      const data = await res.json();
      toast.success("Test run saved successfully");

      return {
        id: data.id,
        outputs: data.outputs as string[],
        status: "pending",
        overallScore: null,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save test run";
      toast.error(message);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updateRatings = async (
    testRunId: number,
    ratings: {
      clarity: number;
      completeness: number;
      correctness: number;
      styleMatch: number;
    },
    notes?: string
  ): Promise<boolean> => {
    setIsSaving(true);

    try {
      await apiRequest("PATCH", `/api/test-runs/${testRunId}/ratings`, {
        clarity: ratings.clarity,
        completeness: ratings.completeness,
        correctness: ratings.correctness,
        styleMatch: ratings.styleMatch,
        notes: notes || null,
      });

      toast.success("Ratings saved");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save ratings";
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    runTest,
    saveTestRun,
    updateRatings,
    isGenerating,
    isSaving,
  };
}
