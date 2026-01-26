import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LearnCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface LearnPost {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  tags: string[];
  summary: string | null;
  body_markdown: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  category?: LearnCategory;
}

export function useLearnCategories() {
  return useQuery({
    queryKey: ["learn-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learn_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as LearnCategory[];
    },
  });
}

export function useLearnPosts(categorySlug?: string) {
  return useQuery({
    queryKey: ["learn-posts", categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("learn_posts")
        .select(`
          *,
          category:learn_categories(*)
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (categorySlug && categorySlug !== "all") {
        // First get the category ID
        const { data: category } = await supabase
          .from("learn_categories")
          .select("id")
          .eq("slug", categorySlug)
          .single();

        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LearnPost[];
    },
  });
}

export function useLearnPost(slug: string) {
  return useQuery({
    queryKey: ["learn-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learn_posts")
        .select(`
          *,
          category:learn_categories(*)
        `)
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      return data as LearnPost;
    },
    enabled: !!slug,
  });
}
