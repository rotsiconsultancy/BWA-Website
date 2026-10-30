"use client";

import Link from "next/link";
import { Download, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import GrowBwaLinks from "@/components/marketing/GrowBwaLinks";
import {
  forgetSavedCustomer,
  useSavedCustomer,
} from "@/lib/commerce/saved-customer";
import {
  forgetSavedDesigns,
  useSavedDesigns,
} from "@/lib/design/saved-designs";
import { trackGa4Event } from "@/lib/marketing/ga4";

// Chrome on Android fires this when the site can be installed; iOS never
// does, so the install row only appears where one tap actually installs.
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const placedOn = new Intl.DateTimeFormat("en-KE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function AccountDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const customer = useSavedCustomer();
  const designs = useSavedDesigns();
  const closeButton = useRef<HTMLButtonElement>(null);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null,
  );
  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", capture);
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, []);
  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const keydown = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [open, onClose]);
  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    trackGa4Event("app_install_prompt", { outcome });
    setInstallPrompt(null);
  };
  return (
    <div
      className={"cart-drawer-root " + (open ? "is-open" : "")}
      aria-hidden={!open}
    >
      <button
        className="cart-drawer-scrim"
        aria-label="Close"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />
      <aside
        className="cart-drawer account-drawer"
        inert={!open}
        aria-label="Your details on this phone"
        aria-modal="true"
        role="dialog"
      >
        <div className="cart-drawer-head">
          <div>
            <span className="eyebrow">Saved on this phone</span>
            <h2>{customer ? `Hi ${customer.firstName}` : "Welcome to BWA"}</h2>
          </div>
          <button
            ref={closeButton}
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="account-drawer-body">
          {customer ? (
            <>
              <section className="account-section">
                <h3>Your details</h3>
                <p>
                  {[customer.firstName, customer.lastName]
                    .filter(Boolean)
                    .join(" ")}
                  <br />
                  {customer.phone}
                  {customer.email && (
                    <>
                      <br />
                      {customer.email}
                    </>
                  )}
                  {customer.deliveryMethod === "standard" && customer.city && (
                    <>
                      <br />
                      {[customer.address, customer.city]
                        .filter(Boolean)
                        .join(", ")}
                    </>
                  )}
                </p>
                <small>
                  Checkout fills these in for you next time. They stay on this
                  phone only.
                </small>
              </section>
              {customer.orders.length > 0 && (
                <section className="account-section">
                  <h3>Your orders</h3>
                  <ul className="account-orders">
                    {customer.orders.map((order) => (
                      <li key={order.orderNumber}>
                        <Link
                          href={"/order/" + order.orderNumber}
                          onClick={onClose}
                        >
                          <strong>{order.orderNumber}</strong>
                          <span>
                            {placedOn.format(new Date(order.placedAt))} ·{" "}
                            {order.total}
                          </span>
                          <em>Track</em>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          ) : (
            <section className="account-section">
              <p>
                No account or password needed. When you place an order, we
                remember your details on this phone so the next one takes
                seconds.
              </p>
              <Link
                href="/find-your-bracelet"
                className="drawer-view-bag"
                onClick={onClose}
              >
                Find your bracelet
              </Link>
            </section>
          )}
          {designs.length > 0 && (
            <section className="account-section">
              <h3>Your designs</h3>
              <ul className="account-orders account-designs">
                {designs.map((design) => (
                  <li key={design.id}>
                    <Link
                      href={"/design-your-own?" + design.query}
                      onClick={() => {
                        trackGa4Event("design_your_own_reopen", { design_id: design.id });
                        onClose();
                      }}
                    >
                      {design.bead?.startsWith("#") || !design.bead ? (
                        <span className="account-design-bead" style={{ background: design.bead ?? "#8a8279" }} />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="account-design-bead" src={design.bead} alt="" width={36} height={36} />
                      )}
                      <strong>{design.name}</strong>
                      <span>
                        {design.id} · {placedOn.format(new Date(design.savedAt))}
                      </span>
                      <em>Open</em>
                    </Link>
                  </li>
                ))}
              </ul>
              {!customer && (
                <button
                  type="button"
                  className="account-forget"
                  onClick={() => {
                    if (window.confirm("Remove your saved designs from this phone?"))
                      forgetSavedDesigns();
                  }}
                >
                  Remove these designs from this phone
                </button>
              )}
            </section>
          )}
          <section className="account-section">
            <h3>Be part of BWA</h3>
            <GrowBwaLinks placement="account" />
          </section>
          {installPrompt && (
            <button type="button" className="account-install" onClick={install}>
              <Download size={16} aria-hidden="true" /> Add BWA to your home
              screen
            </button>
          )}
          {customer && (
            <button
              type="button"
              className="account-forget"
              onClick={() => {
                if (window.confirm("Forget your details on this phone?")) {
                  forgetSavedCustomer();
                  forgetSavedDesigns();
                }
              }}
            >
              Not you? Forget me on this phone
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
