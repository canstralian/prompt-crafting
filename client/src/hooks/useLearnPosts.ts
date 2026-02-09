import { useQuery } from "@tanstack/react-query";

export interface LearnCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface LearnPost {
  id: number;
  title: string;
  slug: string;
  categoryId: number | null;
  tags: string[];
  summary: string | null;
  bodyMarkdown: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  category?: LearnCategory;
}

export function useLearnCategories() {
  return useQuery<LearnCategory[]>({
    queryKey: ["/api/learn/categories"],
  });
}

export function useLearnPosts(categorySlug?: string) {
  return useQuery<LearnPost[]>({
    queryKey: ["/api/learn/posts", categorySlug ? `?categorySlug=${categorySlug}` : ""],
    queryFn: async () => {
      let url = "/api/learn/posts";
      if (categorySlug && categorySlug !== "all") {
        url += `?categorySlug=${categorySlug}`;
      }
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });
}

export function useLearnPost(slug: string) {
  return useQuery<LearnPost>({
    queryKey: ["/api/learn/posts", slug],
    queryFn: async () => {
      const res = await fetch(`/api/learn/posts/${slug}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch post");
      return res.json();
    },
    enabled: !!slug,
  });
}
