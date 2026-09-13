"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";

const editableRoles = ["owner", "content_manager"];
const text = (formData: FormData, key: string) =>
  String(formData.get(key) || "").trim();

async function editor() {
  const context = await requireAdmin();
  if (!editableRoles.includes(context.profile.role))
    redirect("/admin/discovery?error=permission");
  return context;
}

async function audit(
  admin: Awaited<ReturnType<typeof requireAdmin>>["admin"],
  actorId: string,
  entityType: string,
  entityId: string,
  action: string,
  afterValue: object,
) {
  await admin.from("admin_audit_log").insert({
    actor_id: actorId,
    entity_type: entityType,
    entity_id: entityId,
    action,
    after_value: afterValue,
  });
}

export async function createQuizVersion(formData: FormData) {
  const { admin, user } = await editor();
  const title = text(formData, "title");
  if (!title) redirect("/admin/discovery?error=title");
  const { data, error } = await admin
    .from("quiz_versions")
    .insert({ title, status: "draft" })
    .select("id,title")
    .single();
  if (error || !data) redirect("/admin/discovery?error=create");
  await audit(admin, user.id, "quiz_version", data.id, "created_draft", data);
  revalidatePath("/admin/discovery");
  redirect(`/admin/discovery/${data.id}?created=1`);
}

export async function createStarterQuiz() {
  const { admin, user } = await editor();
  const { data: version, error: versionError } = await admin
    .from("quiz_versions")
    .insert({ title: "BWA starter discovery", status: "draft" })
    .select("id")
    .single();
  if (versionError || !version) redirect("/admin/discovery?error=create");

  const questions = [
    {
      internal_key: "identity",
      title: "Which one feels most like you?",
      supporting_copy: "Your identity",
      display_order: 1,
    },
    {
      internal_key: "meaning",
      title: "What would you like it to express?",
      supporting_copy: "What it means",
      display_order: 2,
    },
    {
      internal_key: "palette",
      title: "Which palette feels most like you?",
      supporting_copy: "Your palette",
      display_order: 3,
    },
    {
      internal_key: "wear",
      title: "Where will you wear it most?",
      supporting_copy: "Your life",
      display_order: 4,
    },
  ];
  const { data: createdQuestions, error: questionError } = await admin
    .from("quiz_questions")
    .insert(
      questions.map((question) => ({
        ...question,
        quiz_version_id: version.id,
        required: true,
        active: true,
      })),
    )
    .select("id,internal_key");
  if (questionError || !createdQuestions)
    redirect(`/admin/discovery/${version.id}?error=question`);
  const questionByKey = Object.fromEntries(
    createdQuestions.map((question) => [question.internal_key, question.id]),
  );
  const optionDefinitions = [
    ["identity", "Quiet & grounded", "energy_vibe", "grounding", 5],
    ["identity", "Bold & confident", "intention", "courage", 5],
    ["identity", "Clean & refined", "energy_vibe", "calm", 4],
    ["identity", "Free & natural", "style_tags", "raw_rugged", 5],
    ["meaning", "Grounding", "energy_vibe", "grounding", 5],
    ["meaning", "Confidence", "intention", "inner_strength", 5],
    ["meaning", "Clarity", "energy_vibe", "clarity", 5],
    ["meaning", "Transformation", "intention", "transformation", 5],
    ["palette", "Dark & deep", "color_palette", "dark_monochrome", 5],
    ["palette", "Earth & warm", "color_palette", "earth_tones", 5],
    ["palette", "Blue & clear", "color_palette", "deep_blue", 5],
    ["palette", "Raw & natural", "color_palette", "raw_natural", 5],
    ["wear", "Every day", "occasion", "everyday", 4],
    ["wear", "Work & business", "occasion", "work", 4],
    ["wear", "Weekends & movement", "occasion", "weekend", 4],
    ["wear", "Evenings & occasions", "occasion", "evening", 4],
  ] as const;
  const { data: options, error: optionError } = await admin
    .from("quiz_options")
    .insert(
      optionDefinitions.map(([questionKey, label], index) => ({
        question_id: questionByKey[questionKey],
        label,
        display_order: (index % 4) + 1,
        active: true,
      })),
    )
    .select("id");
  if (optionError || !options)
    redirect(`/admin/discovery/${version.id}?error=option`);
  const { error: weightError } = await admin
    .from("quiz_option_tag_weights")
    .insert(
      options.map((option, index) => ({
        option_id: option.id,
        taxonomy_field: optionDefinitions[index][2],
        taxonomy_value: optionDefinitions[index][3],
        weight: optionDefinitions[index][4],
      })),
    );
  if (weightError) redirect(`/admin/discovery/${version.id}?error=weight`);
  await audit(
    admin,
    user.id,
    "quiz_version",
    version.id,
    "created_starter_draft",
    { question_count: questions.length },
  );
  revalidatePath("/admin/discovery");
  redirect(`/admin/discovery/${version.id}?created=starter`);
}

export async function updateQuizVersion(formData: FormData) {
  const { admin, user } = await editor();
  const versionId = text(formData, "version_id");
  const title = text(formData, "title");
  if (!versionId || !title) redirect("/admin/discovery?error=validation");
  const { error } = await admin
    .from("quiz_versions")
    .update({ title })
    .eq("id", versionId);
  if (error) redirect(`/admin/discovery/${versionId}?error=save`);
  await audit(admin, user.id, "quiz_version", versionId, "updated", { title });
  revalidatePath("/admin/discovery");
  revalidatePath(`/admin/discovery/${versionId}`);
  redirect(`/admin/discovery/${versionId}?updated=version`);
}

export async function createQuestion(formData: FormData) {
  const { admin, user } = await editor();
  const versionId = text(formData, "version_id");
  const title = text(formData, "title");
  const internalKey = (text(formData, "internal_key") || title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  const displayOrder = Number(text(formData, "display_order"));
  if (!versionId || !internalKey || !title || !Number.isInteger(displayOrder))
    redirect(`/admin/discovery/${versionId}?error=question`);
  const payload = {
    quiz_version_id: versionId,
    internal_key: internalKey,
    title,
    supporting_copy: text(formData, "supporting_copy") || null,
    display_order: displayOrder,
    required: formData.get("required") === "on",
    active: true,
  };
  const { data, error } = await admin
    .from("quiz_questions")
    .insert(payload)
    .select("id")
    .single();
  if (error || !data) redirect(`/admin/discovery/${versionId}?error=question`);
  await audit(admin, user.id, "quiz_question", data.id, "created", payload);
  revalidatePath(`/admin/discovery/${versionId}`);
  redirect(`/admin/discovery/${versionId}?updated=question`);
}

export async function updateQuestion(formData: FormData) {
  const { admin, user } = await editor();
  const versionId = text(formData, "version_id");
  const questionId = text(formData, "question_id");
  const title = text(formData, "title");
  const displayOrder = Number(text(formData, "display_order"));
  if (!versionId || !questionId || !title || !Number.isInteger(displayOrder))
    redirect(`/admin/discovery/${versionId}?error=question`);
  const payload = {
    title,
    supporting_copy: text(formData, "supporting_copy") || null,
    display_order: displayOrder,
    required: formData.get("required") === "on",
    active: formData.get("active") === "on",
  };
  const { error } = await admin
    .from("quiz_questions")
    .update(payload)
    .eq("id", questionId)
    .eq("quiz_version_id", versionId);
  if (error) redirect(`/admin/discovery/${versionId}?error=question`);
  await audit(admin, user.id, "quiz_question", questionId, "updated", payload);
  revalidatePath(`/admin/discovery/${versionId}`);
  redirect(`/admin/discovery/${versionId}?updated=question`);
}

export async function createOption(formData: FormData) {
  const { admin, user } = await editor();
  const versionId = text(formData, "version_id");
  const questionId = text(formData, "question_id");
  const label = text(formData, "label");
  let displayOrder = Number(text(formData, "display_order"));
  if (!displayOrder) {
    const { data: previousOptions } = await admin
      .from("quiz_options")
      .select("display_order")
      .eq("question_id", questionId)
      .order("display_order", { ascending: false })
      .limit(1);
    displayOrder = (previousOptions?.[0]?.display_order || 0) + 1;
  }
  if (!versionId || !questionId || !label || !Number.isInteger(displayOrder))
    redirect(`/admin/discovery/${versionId}?error=option`);
  const payload = {
    question_id: questionId,
    label,
    description: text(formData, "description") || null,
    display_order: displayOrder,
    active: true,
  };
  const { data, error } = await admin
    .from("quiz_options")
    .insert(payload)
    .select("id")
    .single();
  if (error || !data) redirect(`/admin/discovery/${versionId}?error=option`);
  await audit(admin, user.id, "quiz_option", data.id, "created", payload);
  revalidatePath(`/admin/discovery/${versionId}`);
  redirect(`/admin/discovery/${versionId}?updated=option`);
}

export async function updateOption(formData: FormData) {
  const { admin, user } = await editor();
  const versionId = text(formData, "version_id");
  const optionId = text(formData, "option_id");
  const label = text(formData, "label");
  const displayOrder = Number(text(formData, "display_order"));
  if (!versionId || !optionId || !label || !Number.isInteger(displayOrder))
    redirect(`/admin/discovery/${versionId}?error=option`);
  const payload = {
    label,
    description: text(formData, "description") || null,
    display_order: displayOrder,
    active: formData.get("active") === "on",
  };
  const { error } = await admin
    .from("quiz_options")
    .update(payload)
    .eq("id", optionId);
  if (error) redirect(`/admin/discovery/${versionId}?error=option`);
  await audit(admin, user.id, "quiz_option", optionId, "updated", payload);
  revalidatePath(`/admin/discovery/${versionId}`);
  redirect(`/admin/discovery/${versionId}?updated=option`);
}

export async function addTagWeight(formData: FormData) {
  const { admin, user } = await editor();
  const versionId = text(formData, "version_id");
  const optionId = text(formData, "option_id");
  const [taxonomyField, taxonomyValue] = text(formData, "match").split(":");
  const weight = Number(text(formData, "weight"));
  if (
    !versionId ||
    !optionId ||
    !taxonomyField ||
    !taxonomyValue ||
    !Number.isInteger(weight) ||
    weight < 1 ||
    weight > 10
  )
    redirect(`/admin/discovery/${versionId}?error=weight`);
  const payload = {
    option_id: optionId,
    taxonomy_field: taxonomyField,
    taxonomy_value: taxonomyValue,
    weight,
  };
  const { data, error } = await admin
    .from("quiz_option_tag_weights")
    .insert(payload)
    .select("id")
    .single();
  if (error || !data) redirect(`/admin/discovery/${versionId}?error=weight`);
  await audit(
    admin,
    user.id,
    "quiz_option_tag_weight",
    data.id,
    "created",
    payload,
  );
  revalidatePath(`/admin/discovery/${versionId}`);
  redirect(`/admin/discovery/${versionId}?updated=weight`);
}

export async function deleteTagWeight(formData: FormData) {
  const { admin, user } = await editor();
  const versionId = text(formData, "version_id");
  const weightId = text(formData, "weight_id");
  if (!versionId || !weightId) redirect("/admin/discovery?error=weight");
  const { error } = await admin
    .from("quiz_option_tag_weights")
    .delete()
    .eq("id", weightId);
  if (error) redirect(`/admin/discovery/${versionId}?error=weight`);
  await audit(
    admin,
    user.id,
    "quiz_option_tag_weight",
    weightId,
    "deleted",
    {},
  );
  revalidatePath(`/admin/discovery/${versionId}`);
  redirect(`/admin/discovery/${versionId}?updated=weight`);
}

export async function publishQuizVersion(formData: FormData) {
  const { admin, user } = await editor();
  const versionId = text(formData, "version_id");
  if (!versionId) redirect("/admin/discovery?error=publish");
  const { data: questions } = await admin
    .from("quiz_questions")
    .select("id,quiz_options(id,active,quiz_option_tag_weights(id))")
    .eq("quiz_version_id", versionId)
    .eq("active", true);
  const isReady =
    questions?.length &&
    questions.every((question: any) => {
      const activeOptions = question.quiz_options?.filter(
        (option: any) => option.active,
      );
      return (
        activeOptions?.length &&
        activeOptions.every(
          (option: any) => option.quiz_option_tag_weights?.length,
        )
      );
    });
  if (!isReady) redirect(`/admin/discovery/${versionId}?error=ready`);
  await admin
    .from("quiz_versions")
    .update({ status: "archived" })
    .eq("status", "published")
    .neq("id", versionId);
  const { error } = await admin
    .from("quiz_versions")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", versionId);
  if (error) redirect(`/admin/discovery/${versionId}?error=publish`);
  await audit(admin, user.id, "quiz_version", versionId, "published", {});
  revalidatePath("/admin/discovery");
  revalidatePath(`/admin/discovery/${versionId}`);
  revalidatePath("/find-your-bracelet");
  redirect(`/admin/discovery/${versionId}?published=1`);
}
