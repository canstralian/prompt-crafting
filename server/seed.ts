import { db } from "./db";
import { learnCategories, learnPosts } from "@shared/schema";

async function seed() {
  console.log("Seeding learn categories...");

  const categories = await db.insert(learnCategories).values([
    { name: "Fundamentals", slug: "fundamentals", description: "Core concepts of prompt engineering" },
    { name: "Techniques", slug: "techniques", description: "Advanced prompting techniques and patterns" },
    { name: "Use Cases", slug: "use-cases", description: "Real-world prompt engineering examples" },
    { name: "Best Practices", slug: "best-practices", description: "Guidelines for effective prompt design" },
  ]).returning();

  console.log(`Created ${categories.length} categories`);

  const posts = await db.insert(learnPosts).values([
    {
      title: "Introduction to Prompt Engineering",
      slug: "intro-to-prompt-engineering",
      categoryId: categories[0].id,
      tags: ["beginner", "overview"],
      summary: "Learn the basics of prompt engineering and why it matters for AI applications.",
      bodyMarkdown: `# Introduction to Prompt Engineering

Prompt engineering is the practice of designing and refining inputs (prompts) to AI language models to get the most useful and accurate outputs.

## Why It Matters

As AI models become more powerful, the quality of results depends heavily on how you communicate with them. A well-crafted prompt can mean the difference between a generic response and a highly specific, actionable one.

## Key Concepts

- **Clarity**: Be specific about what you want
- **Context**: Provide relevant background information
- **Constraints**: Define boundaries and requirements
- **Format**: Specify the desired output structure

## Getting Started

The best way to learn prompt engineering is through practice. Start with simple prompts and gradually add complexity as you understand how the model responds.`,
      isPublished: true,
    },
    {
      title: "The Role-Task-Format Framework",
      slug: "role-task-format-framework",
      categoryId: categories[1].id,
      tags: ["framework", "intermediate"],
      summary: "A structured approach to writing effective prompts using Role, Task, and Format.",
      bodyMarkdown: `# The Role-Task-Format Framework

One of the most effective frameworks for prompt engineering is the Role-Task-Format (RTF) approach.

## Role

Define who the AI should act as. This sets the tone, expertise level, and perspective.

**Example**: "You are a senior data scientist with 10 years of experience in machine learning."

## Task

Clearly state what you want the AI to accomplish. Be specific and actionable.

**Example**: "Analyze the following dataset and identify the top 3 trends."

## Format

Specify how you want the output structured.

**Example**: "Present your findings as a numbered list with brief explanations."

## Putting It Together

When combined, these three elements create powerful, focused prompts that consistently produce high-quality outputs.`,
      isPublished: true,
    },
    {
      title: "Chain-of-Thought Prompting",
      slug: "chain-of-thought-prompting",
      categoryId: categories[1].id,
      tags: ["advanced", "technique"],
      summary: "Learn how to use chain-of-thought prompting to improve reasoning in AI outputs.",
      bodyMarkdown: `# Chain-of-Thought Prompting

Chain-of-thought (CoT) prompting encourages the AI to break down complex problems into step-by-step reasoning.

## How It Works

Instead of asking for a direct answer, you prompt the model to "think through" the problem:

- "Let's think about this step by step"
- "Walk me through your reasoning"
- "Break this down into smaller parts"

## Benefits

1. **Improved accuracy** on complex tasks
2. **Transparent reasoning** you can verify
3. **Better handling** of multi-step problems

## When to Use

CoT is most effective for mathematical reasoning, logical deduction, and complex analysis tasks.`,
      isPublished: true,
    },
    {
      title: "Writing Prompts for Code Generation",
      slug: "prompts-for-code-generation",
      categoryId: categories[2].id,
      tags: ["coding", "practical"],
      summary: "Best practices for writing prompts that generate high-quality code.",
      bodyMarkdown: `# Writing Prompts for Code Generation

Code generation is one of the most popular use cases for AI prompts. Here's how to get the best results.

## Specify the Language and Framework

Always mention the programming language and any frameworks you're using.

## Include Context

Describe the broader system and how the generated code should fit in.

## Define Requirements

- Input/output specifications
- Error handling expectations
- Performance requirements
- Testing expectations

## Example

"Write a TypeScript function that validates email addresses. It should return a boolean and handle edge cases like missing @ symbols and invalid domains. Include JSDoc comments."`,
      isPublished: true,
    },
    {
      title: "Common Prompt Engineering Mistakes",
      slug: "common-prompt-mistakes",
      categoryId: categories[3].id,
      tags: ["tips", "beginner"],
      summary: "Avoid these common pitfalls when designing AI prompts.",
      bodyMarkdown: `# Common Prompt Engineering Mistakes

Even experienced prompt engineers make these mistakes. Here's what to avoid.

## 1. Being Too Vague

**Bad**: "Tell me about marketing"
**Good**: "List 5 email marketing strategies for B2B SaaS companies with under 1000 subscribers"

## 2. Overloading a Single Prompt

Break complex tasks into smaller, focused prompts instead of cramming everything into one.

## 3. Ignoring Output Format

Always specify how you want the response structured — bullet points, JSON, table, etc.

## 4. Not Iterating

Your first prompt is rarely your best. Treat prompt design as an iterative process.

## 5. Forgetting Context

The model doesn't know your situation unless you tell it. Provide relevant background.`,
      isPublished: true,
    },
  ]).returning();

  console.log(`Created ${posts.length} posts`);
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
