-- Create learn categories table
CREATE TABLE public.learn_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create learn posts table
CREATE TABLE public.learn_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.learn_categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  summary TEXT,
  body_markdown TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learn_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_posts ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view published posts)
CREATE POLICY "Anyone can view learn categories"
ON public.learn_categories FOR SELECT
USING (true);

CREATE POLICY "Anyone can view published learn posts"
ON public.learn_posts FOR SELECT
USING (is_published = true);

-- Create indexes
CREATE INDEX idx_learn_posts_slug ON public.learn_posts(slug);
CREATE INDEX idx_learn_posts_category ON public.learn_posts(category_id);
CREATE INDEX idx_learn_categories_slug ON public.learn_categories(slug);

-- Add updated_at triggers
CREATE TRIGGER update_learn_categories_updated_at
  BEFORE UPDATE ON public.learn_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learn_posts_updated_at
  BEFORE UPDATE ON public.learn_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed categories
INSERT INTO public.learn_categories (name, slug, description) VALUES
  ('Foundations', 'foundations', 'Core concepts and fundamentals of prompt engineering'),
  ('Frameworks', 'frameworks', 'Structured approaches and methodologies'),
  ('Evaluation', 'evaluation', 'Testing, scoring, and quality assessment'),
  ('Safety', 'safety', 'Security, guardrails, and responsible AI practices')
ON CONFLICT (slug) DO NOTHING;

-- Seed learn posts
INSERT INTO public.learn_posts (title, slug, category_id, tags, summary, body_markdown)
SELECT 
  'Prompt Anatomy: System, User, Assistant',
  'prompt-anatomy-system-user-assistant',
  c.id,
  ARRAY['structure', 'prompt-patterns', 'clarity'],
  'A practical mental model for separating rules, task payload, and output behavior.',
  E'# Prompt Anatomy: System, User, Assistant\n\nA reliable prompt is a small program: it has a runtime (the model), inputs (your variables), and control flow (constraints + formats).\n\n## System\nSystem text sets global rules: role, boundaries, and non-negotiables.\n\nKeep it:\n- short\n- stable\n- testable\n\n## User\nUser text carries the task payload: context, data, and instructions. Put variables here.\n\n## Assistant\nIn tools, assistant text is usually blank. If you use it, use it for:\n- a formatting example\n- a tiny reference output\n\n## A practical pattern\n- System: who the model is + rules\n- User: task + inputs + output format\n- Output: schema (JSON) or a strict checklist\n\n## Common failure modes\n- Rules scattered across user text\n- No explicit output format\n- Multiple goals competing in one prompt'
FROM public.learn_categories c WHERE c.slug = 'foundations'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.learn_posts (title, slug, category_id, tags, summary, body_markdown)
SELECT 
  'Variables and Schemas: Making Prompts Reusable',
  'variables-and-schemas-making-prompts-reusable',
  c.id,
  ARRAY['json', 'constraints', 'structure'],
  'Treat variables like an API: typed, documented, and constrained.',
  E'# Variables and Schemas: Making Prompts Reusable\n\nVariables are your API. If they''re ambiguous, outputs will be unstable.\n\n## Naming\nPrefer `target_audience` over `aud`.\n\n## Add a schema\nFor each variable:\n- type (string/number/boolean)\n- required\n- default\n- help text\n\n## Guardrails\nIf a variable can pull unsafe content (e.g., personal data), constrain it explicitly.\n\n## Output schemas\nIf you need machine-readability, ask for JSON and provide a schema.\n\n## Minimal example\n- Input variables: `product_name`, `audience`, `constraints`\n- Output schema: `{ \"headline\": \"\", \"value_props\": [] }`'
FROM public.learn_categories c WHERE c.slug = 'foundations'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.learn_posts (title, slug, category_id, tags, summary, body_markdown)
SELECT 
  'The RACE Framework for Prompting',
  'the-race-framework-for-prompting',
  c.id,
  ARRAY['prompt-patterns', 'structure', 'constraints'],
  'A compact workflow that forces clarity and predictable output.',
  E'# The RACE Framework for Prompting\n\nRACE is a compact structure for prompts that ship:\n\n- **Role**: who the model is\n- **Aim**: the single goal\n- **Context**: inputs, audience, constraints\n- **Exactness**: output format + checks\n\n## Why it works\nIt reduces hidden assumptions and turns prompting into a deterministic interface.\n\n## Template\n1) Role\n2) Aim\n3) Context (inputs + constraints)\n4) Output format (schema/checklist)\n5) Self-check questions (rubric)'
FROM public.learn_categories c WHERE c.slug = 'frameworks'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.learn_posts (title, slug, category_id, tags, summary, body_markdown)
SELECT 
  'Constraint Ladder: Tighten Outputs Without Overprompting',
  'constraint-ladder-tighten-outputs-without-overprompting',
  c.id,
  ARRAY['constraints', 'clarity', 'prompt-patterns'],
  'Add constraints in layers, only when they fix real failures.',
  E'# Constraint Ladder: Tighten Outputs Without Overprompting\n\nAdd constraints in layers. Stop as soon as behavior becomes reliable.\n\n1) Output format (table/JSON/bullets)\n2) Length limits\n3) Tone rules\n4) Inclusion/exclusion lists\n5) Rubric-based self-check\n\n## Anti-pattern\nA giant wall of instructions that contradict each other.\n\n## Practical move\nStart with format + 3 constraints. Evaluate. Add only what fixes a real failure.'
FROM public.learn_categories c WHERE c.slug = 'frameworks'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.learn_posts (title, slug, category_id, tags, summary, body_markdown)
SELECT 
  'Rubrics: How to Score Prompt Quality',
  'rubrics-how-to-score-prompt-quality',
  c.id,
  ARRAY['rubric', 'clarity', 'structure'],
  'If you can''t score a prompt, you can''t improve it.',
  E'# Rubrics: How to Score Prompt Quality\n\nIf you can''t score it, you can''t improve it.\n\n## A simple rubric (1–5)\n- Clarity: is the task unambiguous?\n- Completeness: are constraints + context sufficient?\n- Correctness: does it follow instructions and avoid errors?\n- Style match: is tone/format consistent?\n\n## Turn it into checks\nConvert criteria into yes/no checks where possible.\n\n## Store test runs\nKeep inputs + outputs + scores. Treat prompts like code.'
FROM public.learn_categories c WHERE c.slug = 'evaluation'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.learn_posts (title, slug, category_id, tags, summary, body_markdown)
SELECT 
  'A/B Testing Prompts: Variants, Not Vibes',
  'ab-testing-prompts-variants-not-vibes',
  c.id,
  ARRAY['structure', 'constraints', 'rubric'],
  'Change one variable at a time and score against a rubric.',
  E'# A/B Testing Prompts: Variants, Not Vibes\n\nA/B testing works when you change one thing at a time.\n\n## Good variants\n- Different output format\n- Different constraints\n- Different role framing\n\n## Bad variants\n- Multiple changes at once\n- Undefined evaluation criteria\n\n## Process\n1) Define the rubric\n2) Generate 3 variants\n3) Test on 5–10 representative inputs\n4) Pick the winner and version it'
FROM public.learn_categories c WHERE c.slug = 'evaluation'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.learn_posts (title, slug, category_id, tags, summary, body_markdown)
SELECT 
  'Sensitive Data Guardrails',
  'sensitive-data-guardrails',
  c.id,
  ARRAY['constraints', 'prompt-patterns', 'clarity'],
  'Design prompts like data paths: minimize, constrain, and redact.',
  E'# Sensitive Data Guardrails\n\nA prompt is a data path. Design it like one.\n\n## Rules to bake into system text\n- Don''t request secrets (passwords, API keys)\n- Don''t output personal data\n- If user provides sensitive info, ask them to remove it\n\n## Redaction pattern\n"Replace sensitive values with placeholders like `REDACTED`."\n\n## Storage policy\nDon''t store raw sensitive inputs in test runs.\nStore sanitized versions when possible.'
FROM public.learn_categories c WHERE c.slug = 'safety'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.learn_posts (title, slug, category_id, tags, summary, body_markdown)
SELECT 
  'Refusals and Safe Completion Patterns',
  'refusals-and-safe-completion-patterns',
  c.id,
  ARRAY['prompt-patterns', 'constraints', 'tone'],
  'Refuse the unsafe part, then offer a safe path forward.',
  E'# Refusals and Safe Completion Patterns\n\nA refusal that blocks progress is still a failure mode.\n\n## Safer pattern\n1) State what you can''t do\n2) Explain why (briefly)\n3) Offer a safe alternative\n4) Ask for a safe reformulation\n\n## Example\n"I can''t help with X. I can help with Y instead. Here''s a template…"\n\n## Why this matters\nIt keeps user intent moving forward without crossing boundaries.'
FROM public.learn_categories c WHERE c.slug = 'safety'
ON CONFLICT (slug) DO NOTHING;