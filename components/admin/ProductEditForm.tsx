"use client";

import { useActionState, useState } from "react";
import {
  GalleryFields,
  type GalleryImage,
  groups,
  TagPicker,
} from "@/components/admin/ProductPublishForm";
import {
  updateProduct,
  type ProductActionState,
} from "@/app/admin/products/actions";

type EditableProduct = Record<string, any> & {
  id: string;
  product_images: {
    url: string;
    alt_text: string;
    kind: GalleryImage["kind"] | "spin";
    sort_order: number;
  }[];
  product_variants: {
    id: string;
    title: string;
    sku: string;
    price_adjustment_kes: number | string | null;
    price_adjustment_usd: number | string | null;
    stock_quantity: number;
  }[];
};

const initialState: ProductActionState = {};

export default function ProductEditForm({
  product,
}: {
  product: EditableProduct;
}) {
  const primaryVariant = product.product_variants[0];
  const [tags, setTags] = useState<Record<string, string[]>>(
    Object.fromEntries(
      groups.map((group) => [group.name, product[group.name] || []]),
    ),
  );
  const [images, setImages] = useState<GalleryImage[]>(
    product.product_images.length
      ? [...product.product_images]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((image, index) => ({
            url: image.url,
            alt: image.alt_text,
            kind: index === 0 || image.kind === "spin" ? "hero" : image.kind,
          }))
      : [{ url: "", alt: "", kind: "hero" }],
  );
  const [publish, setPublish] = useState(product.active);
  const [state, formAction, pending] = useActionState(
    updateProduct,
    initialState,
  );

  return (
    <form action={formAction} className="admin-product-form">
      <input type="hidden" name="product_id" value={product.id} />
      <input type="hidden" name="variant_id" value={primaryVariant.id} />
      {state.error && (
        <div className="admin-form-error" role="alert">
          <strong>Your edits are still on screen.</strong>
          <span>{state.error}</span>
        </div>
      )}
      {state.success && (
        <p className="admin-form-notice is-success">{state.success}</p>
      )}
      <section className="admin-form-section">
        <div className="admin-form-heading">
          <div>
            <h2>Core product details</h2>
            <p>Update this bracelet and its primary sellable size.</p>
          </div>
          <span>1 / 3</span>
        </div>
        <div className="admin-form-grid">
          <label>
            Product name
            <input name="title" required defaultValue={product.title} />
          </label>
          <label>
            Public URL
            <input
              name="slug"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              defaultValue={product.slug}
            />
          </label>
          <label>
            Product SKU
            <input name="sku" required defaultValue={product.sku} />
          </label>
          <label>
            Base price (KES)
            <input
              name="price_kes"
              required
              type="number"
              min="0"
              step="1"
              defaultValue={product.price_kes ?? product.price}
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
              defaultValue={product.price_usd ?? ""}
            />
          </label>
          <label>
            Short descriptor
            <input name="descriptor" defaultValue={product.descriptor ?? ""} />
          </label>
          <label>
            Size / primary variant
            <input name="variant_title" defaultValue={primaryVariant.title} />
          </label>
          <label>
            Variant SKU
            <input name="variant_sku" defaultValue={primaryVariant.sku} />
          </label>
          <label>
            Variant adjustment (KES)
            <input
              name="variant_price_adjustment_kes"
              type="number"
              min="0"
              step="1"
              defaultValue={primaryVariant.price_adjustment_kes ?? 0}
            />
          </label>
          <label>
            Variant adjustment (USD)
            <input
              name="variant_price_adjustment_usd"
              type="number"
              min="0"
              step="0.01"
              defaultValue={primaryVariant.price_adjustment_usd ?? 0}
            />
          </label>
          <label>
            Current stock
            <input
              name="stock"
              required
              type="number"
              min="0"
              step="1"
              defaultValue={primaryVariant.stock_quantity}
            />
          </label>
        </div>
      </section>
      <section className="admin-form-section">
        <div className="admin-form-heading">
          <div>
            <h2>Story & gallery</h2>
            <p>The first image is the product cover.</p>
          </div>
          <span>2 / 3</span>
        </div>
        <div className="admin-form-grid">
          <label className="admin-form-wide">
            Product story
            <textarea
              name="story"
              required
              defaultValue={product.story ?? ""}
            />
          </label>
          <label className="admin-form-wide">
            Care & craft notes{" "}
            <span className="admin-field-help">One note per line</span>
            <textarea
              name="details"
              defaultValue={(product.details || []).join("\n")}
            />
          </label>
          <GalleryFields images={images} onChange={setImages} />
        </div>
      </section>
      <section className="admin-form-section">
        <div className="admin-form-heading">
          <div>
            <h2>Discovery & search</h2>
            <p>Traits power Find Your Bracelet and BWA discovery hubs.</p>
          </div>
          <span>3 / 3</span>
        </div>
        <div className="admin-tag-grid">
          {groups.map((group) => (
            <TagPicker
              key={group.name}
              group={group}
              selected={tags[group.name] || []}
              onChange={(next) =>
                setTags((current) => ({ ...current, [group.name]: next }))
              }
            />
          ))}
        </div>
        <div className="admin-form-grid admin-edit-seo-fields">
          <label>
            SEO title
            <input name="seo_title" defaultValue={product.seo_title ?? ""} />
          </label>
          <label>
            SEO description
            <input
              name="seo_description"
              defaultValue={product.seo_description ?? ""}
            />
          </label>
        </div>
      </section>
      <div className="admin-form-actions">
        <div>
          <label>
            <input
              name="featured"
              type="checkbox"
              defaultChecked={product.featured}
            />{" "}
            Feature in shop
          </label>
          <label>
            <input
              name="trending"
              type="checkbox"
              defaultChecked={product.is_trending}
            />{" "}
            Mark as in focus
          </label>
        </div>
        <label className="admin-publish-switch">
          <input
            name="publish"
            type="checkbox"
            checked={publish}
            onChange={(event) => setPublish(event.target.checked)}
          />
          <span>{publish ? "Live on storefront" : "Keep as draft"}</span>
        </label>
        <button
          className="admin-primary-action"
          type="submit"
          disabled={pending}
        >
          {pending ? "Saving…" : "Save product changes"}
        </button>
      </div>
    </form>
  );
}
