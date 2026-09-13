"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { createProduct } from "@/app/admin/products/actions";
import type { ProductActionState } from "@/app/admin/products/actions";
import { useProductDraftStore } from "@/lib/admin/product-draft-store";

type TagGroup = {
  name: string;
  label: string;
  required?: boolean;
  options: [string, string][];
};
const groups: TagGroup[] = [
  {
    name: "energy_vibe",
    label: "Energy",
    required: true,
    options: [
      ["grounding", "Grounding"],
      ["protection", "Protection"],
      ["vitality", "Vitality"],
      ["focus", "Focus"],
      ["calm", "Calm"],
      ["clarity", "Clarity"],
    ],
  },
  {
    name: "intention",
    label: "Intention",
    options: [
      ["inner_strength", "Inner strength"],
      ["wealth_abundance", "Wealth & abundance"],
      ["peace_mind", "Peace of mind"],
      ["courage", "Courage"],
      ["transformation", "Transformation"],
    ],
  },
  {
    name: "stone_type",
    label: "Stones",
    required: true,
    options: [
      ["tiger_eye", "Tiger Eye"],
      ["lava_stone", "Lava Stone"],
      ["matte_onyx", "Matte Onyx"],
      ["lapis_lazuli", "Lapis Lazuli"],
      ["african_turquoise", "African Turquoise"],
      ["red_jasper", "Red Jasper"],
      ["hematite", "Hematite"],
    ],
  },
  {
    name: "color_palette",
    label: "Palette",
    options: [
      ["earth_tones", "Earth tones"],
      ["dark_monochrome", "Dark monochrome"],
      ["vibrant_gold", "Vibrant gold"],
      ["deep_blue", "Deep blue"],
      ["raw_natural", "Raw natural"],
    ],
  },
  {
    name: "style_tags",
    label: "Style",
    required: true,
    options: [
      ["everyday_minimal", "Everyday minimal"],
      ["bold_statement", "Bold statement"],
      ["stacked_layers", "Stacked layers"],
      ["raw_rugged", "Raw & rugged"],
    ],
  },
  {
    name: "wrist_fits",
    label: "Fits",
    required: true,
    options: [
      ["small_16cm", "Small · 16 cm"],
      ["medium_18cm", "Medium · 18 cm"],
      ["large_20cm", "Large · 20 cm"],
      ["adjustable", "Adjustable"],
    ],
  },
  {
    name: "occasion",
    label: "Occasion",
    options: [
      ["everyday", "Everyday"],
      ["work", "Work"],
      ["weekend", "Weekend"],
      ["evening", "Evening"],
      ["gifting", "Gifting"],
    ],
  },
  {
    name: "recipient",
    label: "For whom",
    options: [
      ["self", "For self"],
      ["gift_for_woman", "Gift for her"],
      ["gift_for_man", "Gift for him"],
    ],
  },
];
const initialProductActionState: ProductActionState = {};

function TagPicker({
  group,
  selected,
  onChange,
}: {
  group: TagGroup;
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const labels = Object.fromEntries(group.options);
  return (
    <div className="admin-tag-picker">
      <input type="hidden" name={group.name} value={selected.join(",")} />
      <div className="admin-tag-label">
        <span>
          {group.label}
          {group.required ? " *" : ""}
        </span>
        <small>
          {selected.length ? `${selected.length} selected` : "Optional"}
        </small>
      </div>
      <div className="admin-tag-values">
        {selected.length ? (
          selected.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => onChange(selected.filter((item) => item !== tag))}
            >
              {labels[tag]} <X size={13} aria-hidden="true" />
            </button>
          ))
        ) : (
          <span>Nothing selected</span>
        )}
      </div>
      <button
        type="button"
        className="admin-tag-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {open ? "Close" : "Choose"} <ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && (
        <div className="admin-tag-menu">
          {group.options.map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={selected.includes(value) ? "is-selected" : ""}
              onClick={() =>
                onChange(
                  selected.includes(value)
                    ? selected.filter((item) => item !== value)
                    : [...selected, value],
                )
              }
            >
              {selected.includes(value) ? (
                <Check size={15} aria-hidden="true" />
              ) : (
                <Plus size={15} aria-hidden="true" />
              )}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductPublishForm({
  reset = false,
}: {
  reset?: boolean;
}) {
  const tags = useProductDraftStore((state) => state.tags);
  const publish = useProductDraftStore((state) => state.publish);
  const values = useProductDraftStore((state) => state.values);
  const setTags = useProductDraftStore((state) => state.setTags);
  const setPublish = useProductDraftStore((state) => state.setPublish);
  const setValue = useProductDraftStore((state) => state.setValue);
  const clear = useProductDraftStore((state) => state.clear);
  const [state, formAction, pending] = useActionState(
    createProduct,
    initialProductActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!formRef.current) return;
    Object.entries(values).forEach(([name, value]) => {
      const field = formRef.current?.elements.namedItem(name);
      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement
      ) {
        if (field instanceof HTMLInputElement && field.type === "checkbox") {
          field.checked = value === "on";
        } else {
          field.value = value;
        }
      }
    });
  }, [values]);
  useEffect(() => {
    if (reset) clear();
  }, [clear, reset]);
  return (
    <form
      ref={formRef}
      action={formAction}
      className="admin-product-form"
      onChange={(event) => {
        const target = event.target;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement
        ) {
          setValue(
            target.name,
            target.type === "checkbox"
              ? target.checked
                ? "on"
                : ""
              : target.value,
          );
        }
      }}
    >
      {state.error && (
        <div className="admin-form-error" role="alert">
          <strong>Nothing has been lost.</strong>
          <span>{state.error}</span>
        </div>
      )}
      <div className="admin-form-section">
        <div className="admin-form-heading">
          <div>
            <h2>Start with the essentials</h2>
            <p>
              Give the bracelet a name, price, a sellable size, and its first
              image.
            </p>
          </div>
          <span>1 / 3</span>
        </div>
        <aside className="admin-start-here">
          <strong>Start here — example product</strong>
          <p>
            Imagine you are adding a Black Onyx bracelet called “The Grounded.”
            Use this as your guide, then replace the words with your own piece.
          </p>
          <dl>
            <div>
              <dt>Product name</dt>
              <dd>The Grounded</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>3,800</dd>
            </div>
            <div>
              <dt>Public URL</dt>
              <dd>the-grounded</dd>
            </div>
            <div>
              <dt>Product SKU</dt>
              <dd>BWA-GRD</dd>
            </div>
            <div>
              <dt>Size / variant</dt>
              <dd>M / 18 cm</dd>
            </div>
            <div>
              <dt>Variant SKU</dt>
              <dd>BWA-GRD-M</dd>
            </div>
            <div>
              <dt>Opening stock</dt>
              <dd>10</dd>
            </div>
          </dl>
          <small>
            <b>SKU means stock code.</b> Keep it short and unique:{" "}
            <code>BWA</code> + a 3-letter bracelet code + optional size. For
            example, <code>BWA-GRD-M</code>.
          </small>
        </aside>
        <div className="admin-form-grid">
          <label>
            Product name
            <input name="title" required placeholder="e.g. The Grounded" />
          </label>
          <label>
            Price (KES)
            <input
              name="price"
              required
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 3800"
            />
          </label>
          <label>
            Public URL
            <input
              name="slug"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="e.g. the-grounded"
            />
          </label>
          <label>
            Product SKU
            <input name="sku" required placeholder="e.g. BWA-GRD" />
          </label>
          <label>
            Size / variant
            <input name="variant_title" placeholder="e.g. M / 18 cm" />
          </label>
          <label>
            Variant SKU
            <input name="variant_sku" placeholder="e.g. BWA-GRD-M" />
          </label>
          <label>
            Opening stock
            <input
              name="stock"
              required
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 10"
            />
          </label>
          <label>
            Short descriptor
            <input
              name="descriptor"
              placeholder="e.g. Quiet confidence, made wearable."
            />
          </label>
        </div>
      </div>
      <div className="admin-form-section">
        <div className="admin-form-heading">
          <div>
            <h2>Tell its story</h2>
            <p>
              This becomes the product page and helps it earn its place in
              search.
            </p>
          </div>
          <span>2 / 3</span>
        </div>
        <div className="admin-form-grid">
          <label className="admin-form-wide">
            Product story
            <textarea
              name="story"
              required
              placeholder="What makes this bracelet special? Describe the stone, feeling, and craftsmanship."
            />
          </label>
          <label className="admin-form-wide">
            Care & craft notes{" "}
            <span className="admin-field-help">One note per line</span>
            <textarea
              name="details"
              placeholder={
                "Hand-finished in Kenya\nNatural stone variation makes every piece unique"
              }
            />
          </label>
          <label>
            Hero image URL
            <input
              name="image_url"
              required
              type="url"
              placeholder="Paste an image URL"
            />
          </label>
          <label>
            Describe the image
            <input
              name="image_alt"
              required
              placeholder="e.g. Black Onyx and Lava Stone bracelet"
            />
          </label>
        </div>
      </div>
      <div className="admin-form-section">
        <div className="admin-form-heading">
          <div>
            <h2>Help customers find it</h2>
            <p>
              Choose the traits that match this bracelet. Click a selected trait
              to remove it.
            </p>
          </div>
          <span>3 / 3</span>
        </div>
        <div className="admin-tag-grid">
          {groups.map((group) => (
            <TagPicker
              key={group.name}
              group={group}
              selected={tags[group.name] || []}
              onChange={(next) => setTags(group.name, next)}
            />
          ))}
        </div>
      </div>
      <details className="admin-seo-details">
        <summary>Optional: refine Google search appearance</summary>
        <div className="admin-form-grid">
          <label>
            SEO title
            <input
              name="seo_title"
              placeholder="The Grounded | Beads World Africa"
            />
          </label>
          <label>
            SEO description
            <input
              name="seo_description"
              placeholder="A concise description for search results."
            />
          </label>
        </div>
      </details>
      <div className="admin-form-actions">
        <div>
          <label>
            <input name="featured" type="checkbox" /> Feature in shop
          </label>
          <label>
            <input name="trending" type="checkbox" /> Mark as in focus
          </label>
        </div>
        <label className="admin-publish-switch">
          <input
            name="publish"
            type="checkbox"
            checked={publish}
            onChange={(event) => setPublish(event.target.checked)}
          />
          <span>{publish ? "Publish to storefront" : "Save as draft"}</span>
        </label>
        <button
          className="admin-primary-action"
          type="submit"
          disabled={pending}
        >
          {pending ? "Saving…" : publish ? "Publish product" : "Save draft"}
        </button>
      </div>
    </form>
  );
}
