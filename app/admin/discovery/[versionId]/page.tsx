import Link from "next/link";
import DiscoveryWizard from "@/components/admin/DiscoveryWizard";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import {
  addTagWeight,
  createOption,
  createQuestion,
  deleteTagWeight,
  publishQuizVersion,
  updateOption,
  updateQuestion,
  updateQuizVersion,
} from "../actions";

const productMatches = [
  ["energy_vibe:grounding", "A grounded feeling"],
  ["energy_vibe:protection", "A protected feeling"],
  ["energy_vibe:vitality", "Energy & vitality"],
  ["energy_vibe:focus", "Focus"],
  ["energy_vibe:calm", "Calm"],
  ["energy_vibe:clarity", "Clarity"],
  ["intention:inner_strength", "Inner strength"],
  ["intention:wealth_abundance", "Wealth & abundance"],
  ["intention:peace_mind", "Peace of mind"],
  ["intention:courage", "Courage"],
  ["intention:transformation", "Transformation"],
  ["stone_type:tiger_eye", "Tiger Eye"],
  ["stone_type:lava_stone", "Lava stone"],
  ["stone_type:ukalite", "Ukalite"],
  ["stone_type:matte_onyx", "Matte Onyx"],
  ["stone_type:lapis_lazuli", "Lapis Lazuli"],
  ["stone_type:african_turquoise", "African Turquoise"],
  ["stone_type:red_jasper", "Red Jasper"],
  ["stone_type:non_stone", "Non-stone / Other material"],
  ["color_palette:earth_tones", "Earth tones"],
  ["color_palette:dark_monochrome", "Dark & monochrome"],
  ["color_palette:vibrant", "Vibrant"],
  ["color_palette:deep_blue", "Deep blue"],
  ["color_palette:raw_natural", "Raw & natural"],
  ["style_tags:everyday_minimal", "Everyday minimal style"],
  ["style_tags:bold_statement", "Bold statement style"],
  ["style_tags:stacked_layers", "Stacked layers style"],
  ["style_tags:raw_rugged", "Raw & rugged style"],
  ["occasion:everyday", "Everyday wear"],
  ["occasion:work", "Work & business"],
  ["occasion:weekend", "Weekend wear"],
  ["occasion:evening", "Evening occasions"],
  ["recipient:self", "A bracelet for self"],
  ["recipient:gift_for_woman", "Gift for a woman"],
  ["recipient:gift_for_man", "Gift for a man"],
];

const humanMatch = (field: string, value: string) =>
  productMatches.find(([token]) => token === `${field}:${value}`)?.[1] ||
  value.replaceAll("_", " ");

export default async function QuizVersionPage({
  params,
  searchParams,
}: {
  params: Promise<{ versionId: string }>;
  searchParams: Promise<{
    created?: string;
    updated?: string;
    published?: string;
    error?: string;
  }>;
}) {
  const [{ versionId }, query] = await Promise.all([params, searchParams]);
  const { admin } = await requireAdmin();
  const { data: version } = await admin
    .from("quiz_versions")
    .select("id,title,status,published_at")
    .eq("id", versionId)
    .maybeSingle();
  if (!version)
    return (
      <div className="admin-page">
        <PageHeader
          eyebrow="Discovery"
          title="Quiz not found"
          description="This version may have been removed."
        />
        <Link className="admin-back-link" href="/admin/discovery">
          ← Back to discovery
        </Link>
      </div>
    );
  const { data: questions } = await admin
    .from("quiz_questions")
    .select(
      "id,internal_key,title,supporting_copy,display_order,required,active,quiz_options(id,label,description,display_order,active,quiz_option_tag_weights(id,taxonomy_field,taxonomy_value,weight))",
    )
    .eq("quiz_version_id", versionId)
    .order("display_order");
  const initialStep = query.published
    ? "review"
    : query.updated || query.error
      ? "build"
      : "setup";

  return (
    <div className="admin-page">
      <Link className="admin-back-link" href="/admin/discovery">
        ← All quiz versions
      </Link>
      <PageHeader
        eyebrow="Find Your Bracelet"
        title={version.title}
        description="Build the customer-facing questions and hidden product signals. Only published versions can affect the storefront."
      />
      {query.published && (
        <p className="admin-form-notice is-success">
          This version is now live on Find Your Bracelet.
        </p>
      )}
      {query.error && (
        <p className="admin-form-notice is-error">
          That change could not be saved. Make sure every published answer has
          at least one valid product signal.
        </p>
      )}
      <DiscoveryWizard initialStep={initialStep} />
      <section
        className="admin-form-section admin-discovery-meta"
        data-discovery-step="setup"
        hidden={initialStep !== "setup"}
      >
        <div className="admin-form-heading">
          <div>
            <h2>Version settings</h2>
            <p>Draft safely. Publishing retires the previously live version.</p>
          </div>
          <span className={`admin-status admin-status-${version.status}`}>
            {version.status}
          </span>
        </div>
        <form action={updateQuizVersion} className="admin-form-grid">
          <input type="hidden" name="version_id" value={versionId} />
          <label className="admin-form-wide">
            Internal version name
            <input name="title" required defaultValue={version.title} />
          </label>
          <div className="admin-form-actions admin-form-wide">
            <button className="admin-primary-action" type="submit">
              Save version name
            </button>
          </div>
        </form>
      </section>
      <section
        className="admin-discovery-guide"
        data-discovery-step="setup"
        hidden={initialStep !== "setup"}
      >
        <strong>How to use this page</strong>
        <ol>
          <li>Write the question your customer will see.</li>
          <li>Add the answers they can choose.</li>
          <li>
            For each answer, choose what kind of bracelet it should lead to.
          </li>
        </ol>
        <p>
          Customers never see the matching choices in step 3—they only improve
          the recommendation.
        </p>
      </section>
      <section
        className="admin-form-section"
        data-discovery-step="build"
        hidden={initialStep !== "build"}
      >
        <div className="admin-form-heading">
          <div>
            <h2>Add a question</h2>
            <p>
              Start with the question your customer will see. We create the
              behind-the-scenes key for you.
            </p>
          </div>
        </div>
        <form action={createQuestion} className="admin-form-grid">
          <input type="hidden" name="version_id" value={versionId} />
          <label>
            Where does this appear?
            <input
              name="display_order"
              required
              type="number"
              min="1"
              defaultValue={(questions?.length || 0) + 1}
            />
          </label>
          <label className="admin-form-wide">
            Customer question
            <input
              name="title"
              required
              placeholder="e.g. Which one feels most like you?"
            />
          </label>
          <label className="admin-form-wide">
            Small label above the question
            <input name="supporting_copy" placeholder="e.g. Your identity" />
          </label>
          <label className="admin-publish-switch">
            <input name="required" type="checkbox" defaultChecked /> Required
            question
          </label>
          <div className="admin-form-actions admin-form-wide">
            <button className="admin-primary-action" type="submit">
              Add question
            </button>
          </div>
        </form>
      </section>
      <section
        className="admin-discovery-questions"
        data-discovery-step="build"
        hidden={initialStep !== "build"}
      >
        {(questions || []).map((question: any) => (
          <article className="admin-discovery-question" key={question.id}>
            <form action={updateQuestion} className="admin-form-grid">
              <input type="hidden" name="version_id" value={versionId} />
              <input type="hidden" name="question_id" value={question.id} />
              <label>
                Customer question
                <input name="title" required defaultValue={question.title} />
              </label>
              <label>
                Question position
                <input
                  name="display_order"
                  required
                  type="number"
                  min="1"
                  defaultValue={question.display_order}
                />
              </label>
              <label className="admin-form-wide">
                Small label above it
                <input
                  name="supporting_copy"
                  defaultValue={question.supporting_copy || ""}
                />
              </label>
              <label className="admin-publish-switch">
                <input
                  name="required"
                  type="checkbox"
                  defaultChecked={question.required}
                />{" "}
                Required
              </label>
              <label className="admin-publish-switch">
                <input
                  name="active"
                  type="checkbox"
                  defaultChecked={question.active}
                />{" "}
                Active
              </label>
              <div className="admin-form-actions admin-form-wide">
                <button className="admin-primary-action" type="submit">
                  Save question
                </button>
              </div>
            </form>
            <div className="admin-discovery-options">
              <h3>Customer answers</h3>
              {(question.quiz_options || [])
                .sort((a: any, b: any) => a.display_order - b.display_order)
                .map((option: any) => (
                  <div className="admin-discovery-option" key={option.id}>
                    <form action={updateOption} className="admin-form-grid">
                      <input
                        type="hidden"
                        name="version_id"
                        value={versionId}
                      />
                      <input type="hidden" name="option_id" value={option.id} />
                      <label>
                        What the customer sees
                        <input
                          name="label"
                          required
                          defaultValue={option.label}
                        />
                      </label>
                      <label>
                        Answer position
                        <input
                          name="display_order"
                          required
                          type="number"
                          min="1"
                          defaultValue={option.display_order}
                        />
                      </label>
                      <label className="admin-form-wide">
                        Optional supporting note
                        <input
                          name="description"
                          defaultValue={option.description || ""}
                        />
                      </label>
                      <label className="admin-publish-switch">
                        <input
                          name="active"
                          type="checkbox"
                          defaultChecked={option.active}
                        />{" "}
                        Active
                      </label>
                      <div className="admin-form-actions admin-form-wide">
                        <button
                          className="admin-secondary-action"
                          type="submit"
                        >
                          Save answer
                        </button>
                      </div>
                    </form>
                    <div className="admin-weight-list">
                      <strong>This answer should lead towards</strong>
                      {(option.quiz_option_tag_weights || []).length ? (
                        (option.quiz_option_tag_weights || []).map(
                          (weight: any) => (
                            <form action={deleteTagWeight} key={weight.id}>
                              <input
                                type="hidden"
                                name="version_id"
                                value={versionId}
                              />
                              <input
                                type="hidden"
                                name="weight_id"
                                value={weight.id}
                              />
                              <button
                                type="submit"
                                title="Remove product signal"
                              >
                                {humanMatch(
                                  weight.taxonomy_field,
                                  weight.taxonomy_value,
                                )}{" "}
                                <b>+{weight.weight}</b>
                                <i aria-hidden="true">×</i>
                              </button>
                            </form>
                          ),
                        )
                      ) : (
                        <em>No signals yet</em>
                      )}
                    </div>
                    <form action={addTagWeight} className="admin-weight-form">
                      <input
                        type="hidden"
                        name="version_id"
                        value={versionId}
                      />
                      <input type="hidden" name="option_id" value={option.id} />
                      <select name="match" defaultValue="energy_vibe:grounding">
                        {productMatches.map(([token, label]) => (
                          <option key={token} value={token}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <input
                        name="weight"
                        type="number"
                        min="1"
                        max="10"
                        required
                        defaultValue="5"
                        aria-label="Match strength from 1 to 10"
                      />
                      <button className="admin-secondary-action" type="submit">
                        Add this match
                      </button>
                    </form>
                  </div>
                ))}
              <form
                action={createOption}
                className="admin-discovery-add-option"
              >
                <input type="hidden" name="version_id" value={versionId} />
                <input type="hidden" name="question_id" value={question.id} />
                <input
                  name="label"
                  required
                  placeholder="e.g. Quiet & grounded"
                />
                <input name="display_order" type="hidden" value="" />
                <button className="admin-secondary-action" type="submit">
                  Add this answer
                </button>
              </form>
            </div>
          </article>
        ))}
        {!questions?.length && (
          <p className="admin-table-empty">
            Add the first question above to start shaping this discovery
            version.
          </p>
        )}
      </section>
      <section
        className="admin-discovery-review"
        data-discovery-step="review"
        hidden={initialStep !== "review"}
      >
        <div>
          <p className="admin-kicker">Final check</p>
          <h2>Ready to make this quiz live?</h2>
          <p>
            You have{" "}
            {questions?.filter((question: any) => question.active).length || 0}{" "}
            active customer question
            {questions?.filter((question: any) => question.active).length === 1
              ? ""
              : "s"}
            . We will only publish when every active answer points to at least
            one bracelet trait.
          </p>
        </div>
        <form action={publishQuizVersion} className="admin-publish-form">
          <input type="hidden" name="version_id" value={versionId} />
          <button className="admin-primary-action" type="submit">
            Publish this version
          </button>
          <small>The current live version is safely archived first.</small>
        </form>
      </section>
    </div>
  );
}
