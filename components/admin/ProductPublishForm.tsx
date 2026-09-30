"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ImageIcon,
  Loader2,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { createProduct } from "@/app/admin/products/actions";
import type { ProductActionState } from "@/app/admin/products/actions";
import { useProductDraftStore } from "@/lib/admin/product-draft-store";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

import {
  groups,
  getTaxonomyLabel,
  type TagGroup,
} from "@/lib/commerce/taxonomy";

export type { TagGroup };
export { groups };

export type GalleryImage = {
  url: string;
  alt: string;
  kind: "hero" | "gallery" | "detail" | "lifestyle";
};
const initialProductActionState: ProductActionState = {};

export function GalleryFields({
  images,
  onChange,
}: {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  const update = (index: number, patch: Partial<GalleryImage>) =>
    onChange(
      images.map((image, imageIndex) =>
        imageIndex === index ? { ...image, ...patch } : image,
      ),
    );

  const uploadSingleFile = async (file: File, targetIndex: number) => {
    setUploadError(null);
    setUploadingIndex(targetIndex);
    try {
      const supabase = getSupabaseBrowser();
      const fileExt = file.name.split(".").pop() || "png";
      const sanitizedName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase();
      const filePath = `products/${Date.now()}-${sanitizedName}.${fileExt}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      const readableName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .trim();
      const currentAlt = images[targetIndex]?.alt || "";
      const autoAlt =
        currentAlt.trim() ||
        readableName.charAt(0).toUpperCase() + readableName.slice(1);

      update(targetIndex, { url: publicUrl, alt: autoAlt });
    } catch (err: any) {
      console.error("Supabase Storage Upload Error:", err);
      setUploadError(
        err?.message ||
          "Failed to upload image to Supabase Storage. Ensure bucket 'product-images' exists.",
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleBulkUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setIsBulkUploading(true);

    const availableSlots = 10 - images.length;
    const filesToUpload = Array.from(files).slice(
      0,
      Math.max(0, availableSlots),
    );
    const uploadedImages: GalleryImage[] = [];

    try {
      const supabase = getSupabaseBrowser();

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const fileExt = file.name.split(".").pop() || "png";
        const sanitizedName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9]/g, "-")
          .toLowerCase();
        const filePath = `products/${Date.now()}-${i}-${sanitizedName}.${fileExt}`;

        const { error } = await supabase.storage
          .from("product-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: file.type,
          });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        const readableName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .trim();
        const autoAlt =
          readableName.charAt(0).toUpperCase() + readableName.slice(1);

        const isFirst = images.length === 0 && i === 0;
        uploadedImages.push({
          url: publicUrlData.publicUrl,
          alt: autoAlt,
          kind: isFirst ? "hero" : "gallery",
        });
      }

      const initialIsBlank =
        images.length === 1 && !images[0].url && !images[0].alt;

      if (initialIsBlank) {
        onChange(uploadedImages);
      } else {
        onChange([...images, ...uploadedImages]);
      }
    } catch (err: any) {
      console.error("Bulk Upload Error:", err);
      setUploadError(
        err?.message ||
          "Failed during image batch upload to Supabase Storage.",
      );
    } finally {
      setIsBulkUploading(false);
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = "";
    }
  };

  return (
    <div className="admin-gallery-fields admin-form-wide">
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <div className="admin-gallery-heading">
        <div>
          <strong>Product gallery</strong>
          <p>
            Upload image files directly to Storage or paste image URLs. (Max 10 images).
          </p>
        </div>
        <div className="admin-gallery-actions">
          <input
            type="file"
            ref={bulkFileInputRef}
            onChange={handleBulkUpload}
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            multiple
            hidden
          />
          <button
            type="button"
            className="admin-gallery-upload-all-btn"
            onClick={() => bulkFileInputRef.current?.click()}
            disabled={images.length >= 10 || isBulkUploading}
          >
            {isBulkUploading ? (
              <>
                <Loader2 size={15} className="admin-spin" aria-hidden="true" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={15} aria-hidden="true" /> Upload to Storage Center
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() =>
              onChange([...images, { url: "", alt: "", kind: "gallery" }])
            }
            disabled={images.length >= 10 || isBulkUploading}
          >
            <Plus size={15} aria-hidden="true" /> Add link
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="admin-gallery-error-banner" role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          <div>
            <strong>Upload Warning:</strong> {uploadError}
            <div className="admin-gallery-error-hint">
              Tip: Run <code>supabase/storage.sql</code> in your Supabase SQL Editor to set up the <code>product-images</code> bucket &amp; RLS policies.
            </div>
          </div>
        </div>
      )}

      <div className="admin-gallery-list">
        {images.map((image, index) => (
          <div className="admin-gallery-row" key={index}>
            <div className="admin-gallery-preview-container">
              <span className="admin-gallery-number">
                {index === 0 ? "Cover" : index + 1}
              </span>
              <div className="admin-gallery-thumbnail">
                {image.url ? (
                  <img
                    src={image.url}
                    alt={image.alt || `Preview ${index + 1}`}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <ImageIcon size={20} className="admin-gallery-placeholder-icon" />
                )}
              </div>
            </div>

            <label className="admin-gallery-url-field">
              Image URL / Supabase Storage
              <div className="admin-gallery-input-group">
                <input
                  type="url"
                  value={image.url}
                  onChange={(event) => update(index, { url: event.target.value })}
                  placeholder="https://… or click Upload"
                  required={index === 0}
                />
                <label className="admin-gallery-row-upload">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadSingleFile(file, index);
                      e.target.value = "";
                    }}
                    hidden
                    disabled={uploadingIndex === index || isBulkUploading}
                  />
                  {uploadingIndex === index ? (
                    <Loader2 size={14} className="admin-spin" aria-hidden="true" />
                  ) : (
                    <Upload size={14} aria-hidden="true" />
                  )}
                  <span>Upload</span>
                </label>
              </div>
            </label>

            <label>
              Describe the image
              <input
                value={image.alt}
                onChange={(event) => update(index, { alt: event.target.value })}
                placeholder="e.g. Detail of Tiger Eye bead texture"
                required={index === 0}
              />
            </label>

            {index > 0 && (
              <label>
                Image role
                <select
                  value={image.kind}
                  onChange={(event) =>
                    update(index, {
                      kind: event.target.value as GalleryImage["kind"],
                    })
                  }
                >
                  <option value="gallery">Gallery</option>
                  <option value="detail">Detail</option>
                  <option value="lifestyle">Lifestyle</option>
                </select>
              </label>
            )}

            {images.length > 1 && (
              <button
                type="button"
                className="admin-gallery-remove"
                onClick={() =>
                  onChange(images.filter((_, item) => item !== index))
                }
                aria-label={`Remove image ${index + 1}`}
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TagPicker({
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
              {getTaxonomyLabel(group.name, tag)}{" "}
              <X size={13} aria-hidden="true" />
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
  const [images, setImages] = useState<GalleryImage[]>([
    { url: "", alt: "", kind: "hero" },
  ]);
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
            Base price (KES)
            <input
              name="price_kes"
              required
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 3800"
            />
          </label>
          <label>
            Base price (USD)
            <input
              name="price_usd"
              required
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 35"
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
            Variant adjustment (KES)
            <input
              name="variant_price_adjustment_kes"
              type="number"
              min="0"
              step="1"
              defaultValue="0"
            />
          </label>
          <label>
            Variant adjustment (USD)
            <input
              name="variant_price_adjustment_usd"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
            />
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
          <GalleryFields images={images} onChange={setImages} />
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
