import type { Metadata } from "next";
import WelcomeForm from "@/components/welcome/WelcomeForm";
import { BWA_WHATSAPP, QR_SLUG } from "@/lib/commerce/qr-welcome";
import { whatsAppLink } from "@/lib/commerce/whatsapp";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Welcome to BWA | Beads World Africa",
  robots: { index: false, follow: false },
};

export default async function WelcomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();
  const { data: link } =
    supabase && QR_SLUG.test(slug)
      ? await supabase
          .from("qr_links")
          .select("slug,active,reward_percent,reward_valid_days")
          .eq("slug", slug)
          .maybeSingle()
      : { data: null };

  // A printed card must never land on a dead page.
  if (!link)
    return (
      <main className="review-page welcome-page">
        <section className="review-card review-card-plain">
          <p className="eyebrow">Beads World Africa</p>
          <h1>Thank you for choosing BWA.</h1>
          <p>
            We couldn&apos;t open this link. Message us on WhatsApp and
            we&apos;ll register your bracelet for you.
          </p>
          <a
            className="btn btn-primary"
            href={whatsAppLink(
              BWA_WHATSAPP,
              "Hello BWA, I scanned the card in my bracelet box and the link didn't open.",
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message us on WhatsApp
          </a>
        </section>
      </main>
    );

  const { data: products } = await supabase!
    .from("products")
    .select("id,title")
    .eq("active", true)
    .order("title");

  return (
    <main className="review-page welcome-page">
      <WelcomeForm
        slug={link.slug}
        percent={link.reward_percent}
        validDays={link.reward_valid_days}
        active={link.active}
        products={(products || []) as { id: string; title: string }[]}
      />
    </main>
  );
}
