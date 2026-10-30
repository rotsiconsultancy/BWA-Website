// The Design Your Own columns on products (supabase/schema.sql, 2026-10-30).
export const DESIGN_FIELDS =
  "design_enabled,design_slug,design_name,design_bead_shape,design_bead_images,design_colour,design_aliases";

export const BEAD_SHAPES = ["sphere", "rondelle", "tube"] as const;

type Previous = { design_slug: string | null; design_aliases: string[] | null } | null;

/**
 * The design_* values from the product form, or an error. An old stone code is
 * kept as an alias, so design links already sent keep opening this stone.
 */
export function readDesignFields(formData: FormData, previous: Previous) {
  const get = (key: string) => String(formData.get(key) || "").trim();
  const enabled = formData.get("design_enabled") === "on";
  const slug = get("design_slug").toLowerCase() || null;
  const name = get("design_name") || null;
  const shape = get("design_bead_shape") || "sphere";
  const colour = get("design_colour").toLowerCase() || null;
  const images = get("design_bead_images")
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    return { error: "The stone code may use only lowercase letters, numbers and single hyphens." };
  if (enabled && (!slug || !name))
    return { error: "To offer this stone in Design Your Own, give it a stone code and a name." };
  if (!(BEAD_SHAPES as readonly string[]).includes(shape))
    return { error: "Choose a bead shape: round, rondelle or tube." };
  if (colour && !/^#[0-9a-f]{6}$/.test(colour))
    return { error: "The bead colour must look like #8a5a1e." };
  if (images.some((url) => !/^https:\/\//.test(url)))
    return { error: "Each bead photo must be a full https:// address, one per line." };

  const aliases = [...(previous?.design_aliases || [])];
  const old = previous?.design_slug;
  if (old && old !== slug && !aliases.includes(old)) aliases.push(old);
  return {
    fields: {
      design_enabled: enabled,
      design_slug: slug,
      design_name: name,
      design_bead_shape: shape,
      design_colour: colour,
      design_bead_images: images,
      design_aliases: slug ? aliases.filter((a) => a !== slug) : aliases,
    },
  };
}
