import Link from "next/link";
import StoreImage from "@/components/commerce/StoreImage";
import type { JournalPost } from "@/lib/journal/posts";

export function formatPostDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function JournalPostCard({
  post,
  featured = false,
}: {
  post: JournalPost;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/journal/${post.slug}`}
      className={`journal-card${featured ? " journal-card--featured" : ""}`}
    >
      <div className="journal-card-media">
        <StoreImage
          src={post.cover}
          alt={post.coverAlt}
          sizes={
            featured
              ? "(max-width: 900px) 100vw, 60vw"
              : "(max-width: 760px) 100vw, 33vw"
          }
          width={1600}
          height={900}
          eager={featured}
        />
      </div>
      <div className="journal-card-copy">
        <p className="eyebrow">{post.category}</p>
        <h2>{post.title}</h2>
        {featured && <p>{post.description}</p>}
        <span>
          {formatPostDate(post.date)} · {post.readingMinutes} min read
        </span>
        {featured && <b>Read the story →</b>}
      </div>
    </Link>
  );
}
