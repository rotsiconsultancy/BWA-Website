import "server-only";

import type { PublishedQuiz } from "@/lib/commerce/quiz-types";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type WeightRow = {
  taxonomy_field: string;
  taxonomy_value: string;
  weight: number;
};
type OptionRow = {
  id: string;
  label: string;
  active: boolean;
  display_order: number;
  quiz_option_tag_weights: WeightRow[] | null;
};
type QuestionRow = {
  id: string;
  internal_key: string;
  title: string;
  supporting_copy: string | null;
  required: boolean;
  active: boolean;
  display_order: number;
  quiz_options: OptionRow[] | null;
};

export async function getPublishedQuiz(): Promise<PublishedQuiz | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data, error } = await admin
    .from("quiz_versions")
    .select(
      "id,title,quiz_questions(id,internal_key,title,supporting_copy,required,active,display_order,quiz_options(id,label,active,display_order,quiz_option_tag_weights(taxonomy_field,taxonomy_value,weight)))",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  const questions = ((data.quiz_questions || []) as QuestionRow[])
    .filter((question) => question.active)
    .sort((a, b) => a.display_order - b.display_order)
    .map((question) => ({
      key: question.internal_key,
      title: question.title,
      caption: question.supporting_copy || "A considered choice",
      required: question.required,
      options: (question.quiz_options || [])
        .filter((option) => option.active)
        .sort((a, b) => a.display_order - b.display_order)
        .map((option) => ({
          key: option.id,
          value: option.label,
          weights: Object.fromEntries(
            (option.quiz_option_tag_weights || []).map((weight) => [
              `${weight.taxonomy_field}:${weight.taxonomy_value}`,
              weight.weight,
            ]),
          ),
        })),
    }))
    .filter((question) => question.options.length > 0);
  return questions.length
    ? { id: data.id, title: data.title, questions }
    : null;
}
