import Link from "next/link";
import type { FaqItem } from "@/lib/commerce/faq";

export default function FaqSection({
  items,
  title = "Questions, answered.",
}: {
  items: FaqItem[];
  title?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return (
    <section className="container faq-section" aria-labelledby="faq-title">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="faq-section-head">
        <p className="eyebrow">Good to know</p>
        <h2 id="faq-title">{title}</h2>
      </div>
      <div className="faq-list">
        {items.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>
              {item.answer}
              {item.link && (
                <>
                  {" "}
                  <Link href={item.link.href}>{item.link.label} →</Link>
                </>
              )}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
