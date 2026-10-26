import Image from "next/image";

// Hosts allowed in next.config.ts images.remotePatterns. Anything else (an
// image URL pasted from another site) falls back to a plain <img>, because
// next/image throws on unconfigured hosts.
const OPTIMISABLE_REMOTE =
  /^https:\/\/[^/]+\.supabase\.(co|in|net)\/storage\/v1\/object\/public\//;

export default function StoreImage({
  src,
  alt,
  sizes,
  width = 800,
  height = 960,
  eager = false,
  className,
}: {
  src: string;
  alt: string;
  /** How wide the image renders, e.g. "(max-width: 760px) 50vw, 25vw". */
  sizes: string;
  /** Intrinsic ratio hint only; the global img CSS sets the rendered size. */
  width?: number;
  height?: number;
  /** For the main image above the fold (largest contentful paint). */
  eager?: boolean;
  className?: string;
}) {
  const optimise =
    (src.startsWith("/") && !src.endsWith(".svg")) ||
    OPTIMISABLE_REMOTE.test(src);
  const loading = eager ? "eager" : "lazy";
  const fetchPriority = eager ? "high" : undefined;
  if (!optimise)
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        className={className}
      />
    );
  return (
    <Image
      src={src}
      alt={alt}
      sizes={sizes}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      className={className}
    />
  );
}
