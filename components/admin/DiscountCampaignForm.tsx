type Campaign = {
  id?: string;
  code?: string;
  name?: string;
  discount_type?: "percentage" | "fixed";
  percentage_basis_points?: number | null;
  fixed_amount_kes?: number | null;
  fixed_amount_usd?: number | null;
  minimum_subtotal_kes?: number | null;
  minimum_subtotal_usd?: number | null;
  max_redemptions?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
};

const inputForNairobi = (value?: string | null) => {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const pick = (type: string) =>
    parts.find((part) => part.type === type)?.value;
  return `${pick("year")}-${pick("month")}-${pick("day")}T${pick("hour")}:${pick("minute")}`;
};

export default function DiscountCampaignForm({
  action,
  campaign,
  codeLocked = false,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  campaign?: Campaign;
  codeLocked?: boolean;
  submitLabel: string;
}) {
  const percentage = campaign?.percentage_basis_points
    ? campaign.percentage_basis_points / 100
    : "";
  return (
    <form action={action} className="admin-product-form admin-discount-form">
      {campaign?.id && (
        <input type="hidden" name="discount_id" value={campaign.id} />
      )}
      {codeLocked && (
        <input type="hidden" name="code" value={campaign?.code || ""} />
      )}
      <section className="admin-form-section">
        <div className="admin-form-heading">
          <div>
            <p className="admin-kicker">Campaign identity</p>
            <h2>Make the offer recognisable.</h2>
          </div>
        </div>
        <div className="admin-form-grid">
          <label>
            Internal campaign name
            <input
              name="name"
              required
              defaultValue={campaign?.name || ""}
              placeholder="October concierge welcome"
            />
          </label>
          <label>
            Customer code
            <input
              name={codeLocked ? undefined : "code"}
              required={!codeLocked}
              disabled={codeLocked}
              defaultValue={campaign?.code || ""}
              placeholder="WELCOME10"
              maxLength={32}
              autoCapitalize="characters"
            />
            {codeLocked && (
              <small>Codes are permanent once used on an order.</small>
            )}
          </label>
          <label>
            Discount method
            <select
              name="discount_type"
              defaultValue={campaign?.discount_type || "percentage"}
            >
              <option value="percentage">Percentage off</option>
              <option value="fixed">Fixed amount off</option>
            </select>
          </label>
          <label>
            Percentage off
            <input
              name="percentage"
              type="number"
              min="0.01"
              max="100"
              step="0.01"
              defaultValue={percentage}
              placeholder="10"
            />
            <small>Used only for percentage campaigns.</small>
          </label>
        </div>
      </section>
      <section className="admin-form-section">
        <div className="admin-form-heading">
          <div>
            <p className="admin-kicker">Exact currency values</p>
            <h2>Keep KES and USD intentional.</h2>
          </div>
        </div>
        <div className="admin-form-grid">
          <label>
            Fixed amount off · KES
            <input
              name="fixed_amount_kes"
              type="number"
              min="0"
              step="1"
              defaultValue={campaign?.fixed_amount_kes ?? ""}
              placeholder="500"
            />
          </label>
          <label>
            Fixed amount off · USD
            <input
              name="fixed_amount_usd"
              type="number"
              min="0"
              step="0.01"
              defaultValue={campaign?.fixed_amount_usd ?? ""}
              placeholder="5"
            />
            <small>Both fixed amounts are required for a fixed campaign.</small>
          </label>
          <label>
            Minimum merchandise subtotal · KES
            <input
              name="minimum_subtotal_kes"
              type="number"
              min="0"
              step="1"
              defaultValue={campaign?.minimum_subtotal_kes ?? ""}
              placeholder="Optional"
            />
          </label>
          <label>
            Minimum merchandise subtotal · USD
            <input
              name="minimum_subtotal_usd"
              type="number"
              min="0"
              step="0.01"
              defaultValue={campaign?.minimum_subtotal_usd ?? ""}
              placeholder="Optional"
            />
          </label>
        </div>
      </section>
      <section className="admin-form-section">
        <div className="admin-form-heading">
          <div>
            <p className="admin-kicker">Availability</p>
            <h2>Set the campaign’s boundaries.</h2>
          </div>
        </div>
        <div className="admin-form-grid">
          <label>
            Total use cap
            <input
              name="max_redemptions"
              type="number"
              min="1"
              step="1"
              defaultValue={campaign?.max_redemptions ?? ""}
              placeholder="Unlimited"
            />
          </label>
          <label>
            Starts at · Nairobi time
            <input
              name="starts_at"
              type="datetime-local"
              defaultValue={inputForNairobi(campaign?.starts_at)}
            />
          </label>
          <label>
            Ends at · Nairobi time
            <input
              name="ends_at"
              type="datetime-local"
              defaultValue={inputForNairobi(campaign?.ends_at)}
            />
          </label>
        </div>
        <p>
          Discounts reduce bracelet subtotal only. Delivery is never discounted,
          and a customer may use one code per order.
        </p>
      </section>
      <div className="admin-form-actions">
        <div>
          <strong>Ready to save?</strong>
          <span>
            Checkout validates the live campaign again before an order is
            created.
          </span>
        </div>
        <button className="admin-primary-action" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
