import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Beads World Africa",
  description:
    "Read the Terms and Conditions governing your use of the Beads World Africa website and purchase of our handcrafted natural stone bracelets.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Terms & Conditions | Beads World Africa",
    description:
      "Terms and Conditions governing your use of beadsworldafrica.co.ke and purchase of BWA products.",
    url: "https://beadsworldafrica.co.ke/terms",
    siteName: "Beads World Africa",
    locale: "en_US",
    type: "website",
  },
};

export default function TermsPage() {
  const whatsappNumber = process.env.WHATSAPP_NUMBER;
  return (
    <main className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <p className="legal-eyebrow">Beads World Africa</p>
          <h1>Terms &amp; Conditions</h1>
          <p className="legal-updated">Last updated: October 2026</p>
        </header>

        <section className="legal-section">
          <p className="legal-lead">
            Please read these Terms and Conditions carefully before using{" "}
            <strong>beadsworldafrica.co.ke</strong> (the &quot;Site&quot;) or
            placing an order with Beads World Africa (&quot;BWA&quot;,
            &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing
            the Site or making a purchase you agree to be bound by these terms.
          </p>
        </section>

        <section className="legal-section">
          <h2>1. About Us</h2>
          <p>
            Beads World Africa is a Nairobi-based natural stone jewellery brand
            specialising in handcrafted bracelets made from semi-precious
            stones. We operate this website and process orders via WhatsApp and
            our online storefront.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Acceptance of Terms</h2>
          <p>
            By browsing this Site or placing an order — whether through the
            online checkout or a WhatsApp-routed order — you confirm that you
            are at least 18 years old (or have parental / guardian consent) and
            that you accept these Terms and Conditions in full. If you do not
            agree, please do not use this Site.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Products</h2>
          <p>
            All products are handcrafted and may exhibit minor natural
            variations in stone colour, pattern, or texture. These are not
            defects — they are the character of natural materials and make your
            bracelet uniquely yours.
          </p>
          <p>
            We reserve the right to discontinue any product at any time. Product
            images are as accurate as digital photography allows; actual colours
            may differ slightly on different screens.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Pricing &amp; Currency</h2>
          <p>
            Prices are displayed in Kenyan Shillings (KES) and US Dollars (USD).
            Prices are set independently in each currency — they are not
            exchange-rate conversions. The price shown at the time of your order
            confirmation is the price you pay.
          </p>
          <p>
            We reserve the right to update prices at any time without prior
            notice. Price changes will not affect orders that have already been
            confirmed.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Orders &amp; Checkout</h2>
          <p>
            Placing items in your bag does not constitute a purchase. An order
            is only confirmed once you complete the checkout process and receive
            an order confirmation — either via the Site or through our WhatsApp
            confirmation message.
          </p>
          <p>
            We reserve the right to refuse or cancel any order, for example due
            to stock unavailability, pricing errors, or suspected fraudulent
            activity. If we cancel a paid order, you will receive a full refund.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Payment</h2>
          <p>
            We accept payments via M-Pesa, bank transfer, and other methods as
            indicated at checkout. All transactions are processed securely.
            Payment is required before an order is dispatched.
          </p>
          <p>
            We do not store your payment card details on our servers. Secure
            payment processing is handled by our authorised payment partners.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Discount Codes &amp; Offers</h2>
          <p>
            Discount codes are valid for one use per customer unless otherwise
            stated. Codes cannot be combined with other offers, cannot be applied
            retrospectively to completed orders, and have no cash value. We
            reserve the right to withdraw or amend promotional offers at any
            time.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Shipping &amp; Delivery</h2>
          <p>
            We ship within Kenya and internationally. Delivery timeframes are
            estimates and may vary due to courier delays, customs processes, or
            factors outside our control. We are not liable for delays once an
            order has been dispatched.
          </p>
          <p>
            Risk of loss and title for products passes to you upon our delivery
            to the courier. We recommend selecting a tracked shipping option
            where available.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Returns &amp; Exchanges</h2>
          <p>
            Returns and exchanges are governed by our{" "}
            <a href="/returns" className="legal-link">
              Return Policy
            </a>
            , which forms part of these Terms and Conditions. By placing an
            order you confirm you have read and understood it.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Bespoke Orders</h2>
          <p>
            Custom and bespoke orders are made to your specification. By
            requesting a bespoke piece you agree that the order is non-refundable
            except in the case of a material defect or error on our part.
            Bespoke orders may take up to 14 business days to complete.
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Intellectual Property</h2>
          <p>
            All content on this Site — including text, images, logos, product
            photography, and design — is the intellectual property of Beads
            World Africa or is used with permission. You may not reproduce,
            distribute, or create derivative works from any content without our
            prior written consent.
          </p>
        </section>

        <section className="legal-section">
          <h2>12. Privacy &amp; Data</h2>
          <p>
            When you use this Site or place an order, we collect personal
            information such as your name, email address, delivery address, and
            phone number. This data is used solely to process your order,
            personalise your experience, and (where you have consented) send
            marketing communications.
          </p>
          <p>
            We do not sell your personal data to third parties. We may share it
            with couriers and payment processors where necessary to fulfil your
            order. You may request deletion of your data at any time by
            contacting us.
          </p>
        </section>

        <section className="legal-section">
          <h2>13. Marketing Communications</h2>
          <p>
            If you subscribe to our newsletter or consent to marketing, you may
            receive emails about new collections, offers, and brand stories. You
            can unsubscribe at any time using the link in any marketing email or
            by contacting us directly.
          </p>
        </section>

        <section className="legal-section">
          <h2>14. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Beads World Africa shall not
            be liable for any indirect, incidental, special, or consequential
            damages arising from your use of this Site or purchase of our
            products. Our total liability in connection with any order shall not
            exceed the amount paid for that order.
          </p>
        </section>

        <section className="legal-section">
          <h2>15. Third-Party Links</h2>
          <p>
            This Site may contain links to third-party websites (such as social
            media platforms or payment providers). We are not responsible for the
            content, privacy practices, or availability of those sites.
          </p>
        </section>

        <section className="legal-section">
          <h2>16. Changes to These Terms</h2>
          <p>
            We may update these Terms and Conditions from time to time. The
            &quot;Last updated&quot; date at the top of this page reflects when
            the most recent changes were made. Continued use of the Site after
            changes are posted constitutes your acceptance of the revised terms.
          </p>
        </section>

        <section className="legal-section">
          <h2>17. Governing Law</h2>
          <p>
            These Terms and Conditions are governed by and construed in
            accordance with the laws of Kenya. Any disputes shall be subject to
            the exclusive jurisdiction of the courts of Kenya.
          </p>
        </section>

        <section className="legal-section">
          <h2>18. Contact Us</h2>
          <p>
            Questions about these Terms? Reach our team through:
          </p>
          <ul>
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
              <strong>WhatsApp:</strong>{" "}
              <a href={`https://wa.me/${whatsappNumber}`} className="legal-link">
                +{whatsappNumber}
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
