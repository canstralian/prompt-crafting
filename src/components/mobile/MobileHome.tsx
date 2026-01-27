import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  List,
  Table,
  Code,
  Mail,
  Sparkles,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Output format options
type OutputFormat = "bullets" | "table" | "json" | "email";

const outputFormats: { id: OutputFormat; label: string; icon: React.ElementType }[] = [
  { id: "bullets", label: "Bullets", icon: List },
  { id: "table", label: "Table", icon: Table },
  { id: "json", label: "JSON", icon: Code },
  { id: "email", label: "Email", icon: Mail },
];

// Example prompts data
const examples = [
  {
    id: 1,
    title: "Customer Support Bot",
    outcome: "Generate empathetic responses with clear next steps",
  },
  {
    id: 2,
    title: "Code Review Assistant",
    outcome: "Provide constructive feedback with actionable suggestions",
  },
  {
    id: 3,
    title: "Content Summarizer",
    outcome: "Extract key points in concise bullet format",
  },
  {
    id: 4,
    title: "Data Analyst Helper",
    outcome: "Transform queries into structured SQL with explanations",
  },
  {
    id: 5,
    title: "Meeting Notes Generator",
    outcome: "Capture action items, decisions, and follow-ups",
  },
];

// Trust strip companies/logos
const trustBadges = [
  { icon: Shield, label: "Enterprise-grade security" },
  { icon: Users, label: "10k+ users" },
  { icon: Zap, label: "99.9% uptime" },
];

export default function MobileHome() {
  const [goal, setGoal] = React.useState("");
  const [context, setContext] = React.useState("");
  const [outputFormat, setOutputFormat] = React.useState<OutputFormat>("bullets");
  const [showOutput, setShowOutput] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [showCTAPill, setShowCTAPill] = React.useState(false);
  const heroRef = React.useRef<HTMLDivElement>(null);

  // Generate a sample prompt based on inputs
  const generatedPrompt = React.useMemo(() => {
    if (!goal && !context) return null;

    const formatInstructions: Record<OutputFormat, string> = {
      bullets: "bulleted list",
      table: "markdown table",
      json: "JSON object",
      email: "professional email format",
    };

    return {
      role: "You are a helpful assistant specialized in prompt engineering.",
      objective: goal || "Help the user achieve their goal efficiently.",
      constraints: context || "Be concise and actionable.",
      outputFormat: `Respond in ${formatInstructions[outputFormat]}.`,
    };
  }, [goal, context, outputFormat]);

  // Handle generate prompt
  const handleGenerate = () => {
    if (goal || context) {
      setShowOutput(true);
    }
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    if (!generatedPrompt) return;

    const promptText = `Role: ${generatedPrompt.role}\nObjective: ${generatedPrompt.objective}\nConstraints: ${generatedPrompt.constraints}\nOutput format: ${generatedPrompt.outputFormat}`;

    await navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Scroll-based CTA pill visibility
  React.useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setShowCTAPill(heroBottom < 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky CTA Pill - appears after scroll */}
      <div
        className={cn(
          "fixed top-16 left-1/2 -translate-x-1/2 z-40 transition-all duration-300",
          showCTAPill
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <Button
          variant="hero"
          size="sm"
          className="rounded-full shadow-lg px-6"
          asChild
        >
          <Link to="/auth?mode=signup">
            Start crafting
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-hero-gradient pt-8 pb-6 px-4"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative text-center">
          <h1 className="text-2xl font-bold text-white mb-2 animate-fade-up">
            Design prompts
            <br />
            <span className="text-amber-400">you can trust.</span>
          </h1>
          <p className="text-sm text-white/70 mb-4 animate-fade-up delay-100">
            Build, test, version, and share prompts for real workflows.
          </p>
        </div>
      </section>

      {/* Mini Builder Card */}
      <section className="px-4 -mt-2 relative z-10">
        <Card className="shadow-lg border-0 animate-fade-up delay-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Mini Builder</span>
            </div>

            {/* Goal Input */}
            <div className="mb-3">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Goal
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What do you want to achieve?"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              />
            </div>

            {/* Context Input */}
            <div className="mb-3">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Context
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Add relevant background info..."
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              />
            </div>

            {/* Output Format Toggle */}
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Output format
              </label>
              <div className="grid grid-cols-4 gap-2">
                {outputFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.id}
                      onClick={() => setOutputFormat(format.id)}
                      className={cn(
                        "flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs transition-all",
                        outputFormat === format.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      <span>{format.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              className="w-full"
              variant="hero"
              disabled={!goal && !context}
            >
              Generate Prompt
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Output Reveal - Shows below card when generated */}
        {showOutput && generatedPrompt && (
          <Card className="mt-3 shadow-md border-0 bg-slate-50 dark:bg-slate-900 animate-fade-up">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">
                  Generated prompt
                </span>
                <Badge variant="secondary" className="text-xs">
                  Preview
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium text-amber-600">Role:</span>{" "}
                  <span className="text-muted-foreground">
                    {generatedPrompt.role}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-amber-600">Objective:</span>{" "}
                  <span className="text-muted-foreground">
                    {generatedPrompt.objective}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-amber-600">Constraints:</span>{" "}
                  <span className="text-muted-foreground">
                    {generatedPrompt.constraints}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-amber-600">Output format:</span>{" "}
                  <span className="text-muted-foreground">
                    {generatedPrompt.outputFormat}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
                <Button variant="default" size="sm" className="flex-1" asChild>
                  <Link to="/app/prompts/new">
                    Open Builder
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* See Examples Button + Bottom Sheet */}
      <section className="px-4 mt-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-muted-foreground"
            >
              <span>See examples</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
            <SheetHeader className="text-left pb-4">
              <SheetTitle>Examples</SheetTitle>
            </SheetHeader>
            <div className="space-y-3 overflow-y-auto">
              {examples.map((example) => (
                <Link
                  key={example.id}
                  to={`/app/prompts/new?template=${example.id}`}
                  className="block p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors"
                >
                  <div className="font-medium mb-1">{example.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {example.outcome}
                  </div>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </section>

      {/* Trust Strip */}
      <section className="px-4 py-6 mt-4 border-t border-border">
        <div className="flex justify-center gap-6">
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.label}
                className="flex flex-col items-center text-center"
              >
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground max-w-[80px]">
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 pb-8 mt-auto">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            Free to start. No credit card required.
          </p>
        </div>
        <Button variant="hero" size="lg" className="w-full" asChild>
          <Link to="/auth?mode=signup">
            Start crafting
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
