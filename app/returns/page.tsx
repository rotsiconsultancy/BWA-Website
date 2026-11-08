import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exchange Policy | Beads World Africa",
  description:
    "Beads World Africa exchange policy: no money back, but if the size or fit isn't right you can switch your bracelet for another piece within 7 days of delivery. Delivery for exchanges is paid by the customer.",
  alternates: { canonical: "/returns" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Exchange Policy | Beads World Africa",
    description:
      "Switch your bracelet for another piece within 7 days of delivery. We don't give money back.",
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
          <h1>Exchange Policy</h1>
          <p className="legal-updated">Last updated: November 2026</p>
        </header>

        <section className="legal-section">
          <p className="legal-lead">
            Every BWA piece is handcrafted and checked by hand before it leaves
            us. If the size or fit isn&apos;t right, we&apos;ll help you switch
            it for a piece that fits.
          </p>
        </section>

        <section className="legal-section">
          <h2>1. Exchanges, Not Refunds</h2>
          <p>
            <strong>We don&apos;t give money back.</strong> Instead, you can
            switch your bracelet for another piece: a different size, a
            different stone or a different bracelet altogether, subject to
            stock.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Exchange Window</h2>
          <p>
            You have <strong>7 days from the date of delivery</strong> to
            contact us about an exchange. After this window we are unable to
            exchange an item, so please inspect your order as soon as it
            arrives.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. What We Exchange</h2>
          <p>We exchange a bracelet when:</p>
          <ul>
            <li>It&apos;s the wrong size for your wrist</li>
            <li>It doesn&apos;t fit well</li>
          </ul>
          <p>
            The bracelet must be unworn, unaltered and in its original condition
            and packaging.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. What We Cannot Exchange</h2>
          <ul>
            <li>Items we hear about more than 7 days after delivery</li>
            <li>
              Items that have been worn, resized, altered, or show signs of use
            </li>
            <li>
              Custom-made orders (including Design Your Own), which are made to
              your own choices
            </li>
            <li>Items purchased during a final sale or clearance promotion</li>
            <li>
              Items where the original packaging has been discarded or destroyed
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. How to Exchange</h2>
          <ol>
            <li>
              <strong>Contact us within 7 days</strong> of delivery via WhatsApp
              at{" "}
              <a
                href={`https://wa.me/${whatsappNumber}`}
                className="legal-link"
              >
                +{whatsappNumber}
              </a>{" "}
              or email{" "}
              <a
                href="mailto:beadsworldafrica@outlook.com"
                className="legal-link"
              >
                beadsworldafrica@outlook.com
              </a>
            </li>
            <li>
              <strong>Share your order reference</strong>, what&apos;s wrong
              with the size or fit and clear photos of the item and packaging.
            </li>
            <li>
              <strong>Choose your new piece.</strong> We&apos;ll confirm
              it&apos;s in stock and reply within 1–2 business days with
              instructions.
            </li>
            <li>
              <strong>Send the item back</strong> as we agree on WhatsApp. Once
              we receive and check it, we send your new piece.
            </li>
          </ol>
        </section>

        <section className="legal-section">
          <h2>6. Delivery Costs</h2>
          <p>
            <strong>Delivery for an exchange is paid by the customer</strong>:
            both sending the item back to us and sending the new piece to you.
            Within Nairobi this is usually the Uber or Bolt fare; elsewhere we
            confirm the cost on WhatsApp.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Choosing a Different Piece</h2>
          <p>
            If the piece you switch to costs more than the one you bought, you
            pay the difference before we send it.
          </p>
          <p>
            If it costs less, we keep the balance as{" "}
            <strong>credit for your next order</strong>. Just mention it on
            WhatsApp when you order again. Credit isn&apos;t paid out in cash.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. No Cash Refunds</h2>
          <p>
            Exchanged items are not refunded in cash, M-Pesa or to a card, and
            delivery fees are not refunded. If we ever have to cancel an order
            you have already paid for, we refund the full amount you paid (see
            our{" "}
            <a href="/terms" className="legal-link">
              Terms
            </a>
            ).
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Contact Us</h2>
          <p>
            Our team is always happy to help. Reach us through any of these
            channels:
          </p>
          <ul>
            <li>
              <strong>WhatsApp:</strong>{" "}
              <a
                href={`https://wa.me/${whatsappNumber}`}
                className="legal-link"
              >
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
            <li>
              <strong>TikTok:</strong>{" "}
              <a
                href="https://tiktok.com/@beadsworldafrica"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-link"
              >
                @beadsworldafrica
              </a>
            </li>
            <li>
              <strong>Facebook:</strong>{" "}
              <a
                href="https://facebook.com/beadsworldafrica"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-link"
              >
                Beads World Africa
              </a>
            </li>
            <li>
              <strong>LinkedIn:</strong>{" "}
              <a
                href="https://linkedin.com/company/beadsworldafrica"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-link"
              >
                Beads World Africa
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
