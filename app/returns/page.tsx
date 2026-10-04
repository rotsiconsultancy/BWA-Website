import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return Policy | Beads World Africa",
  description:
    "Beads World Africa return and exchange policy. We stand behind every piece we make — learn how returns and exchanges work.",
  alternates: { canonical: "/returns" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Return Policy | Beads World Africa",
    description:
      "We stand behind every piece we make. Learn about our return and exchange policy.",
    url: "https://beadsworldafrica.co.ke/returns",
    siteName: "Beads World Africa",
    locale: "en_US",
    type: "website",
  },
};

export default function ReturnPolicyPage() {
  
  const whatsappNumber = process.env.WHATSAPP_NUMBER;

  return (
    <main className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <p className="legal-eyebrow">Beads World Africa</p>
          <h1>Return Policy</h1>
          <p className="legal-updated">Last updated: October 2026</p>
        </header>

        <section className="legal-section">
          <p className="legal-lead">
            Every BWA piece is handcrafted and inspected before it leaves us.
            But we know buying online takes a leap of faith — so we want you to
            feel fully supported if something isn&apos;t right.
          </p>
        </section>

        <section className="legal-section">
          <h2>1. Our Commitment</h2>
          <p>
            We stand behind the quality and craftsmanship of every bracelet we
            make. If your piece arrives damaged, defective, or significantly
            different from what was described, we will make it right —
            no fuss.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Eligibility Window</h2>
          <p>
            You have <strong>7 days from the date of delivery</strong> to
            contact us about a return or exchange. After this window we are
            unable to process a return, so please inspect your order as soon as
            it arrives.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. What We Accept</h2>
          <p>We accept returns or exchanges for items that are:</p>
          <ul>
            <li>Damaged or broken on arrival (with photo evidence)</li>
            <li>Defective in material or craftsmanship</li>
            <li>
              Significantly different from the product description or images
            </li>
            <li>Unworn, unaltered, and in their original condition</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. What We Cannot Accept</h2>
          <ul>
            <li>
              Items returned more than 7 days after delivery confirmation
            </li>
            <li>
              Items that have been worn, resized, altered, or show signs of use
            </li>
            <li>
              Bespoke / custom-made orders — these are crafted uniquely for you
              and cannot be returned unless they arrive defective
            </li>
            <li>Items purchased during a final sale or clearance promotion</li>
            <li>
              Items where the original packaging has been discarded or
              destroyed
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. How to Start a Return</h2>
          <ol>
            <li>
              <strong>Contact us within 7 days</strong> of delivery via
              WhatsApp at{" "}
              <a href={`https://wa.me/${whatsappNumber}`} className="legal-link">
                +{whatsappNumber}
              </a>{" "}
              or email{" "}
              <a href="mailto:beadsworldafrica@outlook.com" className="legal-link">
                beadsworldafrica@outlook.com
              </a>
            </li>
            <li>
              <strong>Share your order reference</strong> and a short
              description of the issue, along with clear photos of the item and
              packaging.
            </li>
            <li>
              <strong>Wait for our confirmation.</strong> Our team will assess
              your request and respond within 1–2 business days with
              instructions.
            </li>
            <li>
              <strong>Ship the item back</strong> using a tracked courier
              service once we confirm your return. We recommend you keep the
              tracking number until the return is resolved.
            </li>
          </ol>
        </section>

        <section className="legal-section">
          <h2>6. Return Shipping Costs</h2>
          <p>
            If the return is due to our error (damaged, defective, or
            wrong item), <strong>we will cover the return shipping cost</strong>{" "}
            in full.
          </p>
          <p>
            If you are returning an item for a reason other than our error,
            return shipping costs are the responsibility of the customer.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Exchanges</h2>
          <p>
            We are happy to exchange an eligible item for the same product in a
            different size, or for a store credit of equal value if the original
            item is no longer available. Exchanges are subject to stock
            availability.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Refunds</h2>
          <p>
            Once we receive and inspect your returned item, we will notify you
            of the approval or rejection of your refund. Approved refunds will
            be processed within <strong>5–10 business days</strong> to your
            original payment method, or as store credit if preferred.
          </p>
          <p>
            Shipping fees are non-refundable unless the return is due to our
            error.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Damaged in Transit</h2>
          <p>
            If your package was visibly damaged upon delivery, please photograph
            the outer packaging before opening it and contact us immediately.
            This helps us file a claim with the courier on your behalf.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Contact Us</h2>
          <p>
            Our team is always happy to help. Reach us through any of these
            channels:
          </p>
          <ul>
            <li>
              <strong>WhatsApp:</strong>{" "}
              <a href={`https://wa.me/${whatsappNumber}`} className="legal-link">
                +{whatsappNumber}
              </a>
            </li>
            <li>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:beadsworldafrica@outlook.com"
                className="legal-link"
              >
                beadsworldafrica@outlook.com
              </a>
            </li>
            <li>
              <strong>Instagram:</strong>{" "}
              <a
                href="https://instagram.com/beadsworldafrica"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-link"
              >
                @beadsworldafrica
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}