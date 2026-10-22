"use client";

import { useState } from "react";
import { applyStorePrice, saveCostRecipe } from "@/app/admin/pricing/actions";
import {
  checkPrice,
  formatKes,
  packagingOptions,
  priceStatusLabel,
  type CostRecipe,
  type PackagingChoice,
  type PricingSettings,
  type SalesChannel,
} from "@/lib/commerce/cost-pricing";

type RecipeDraft = Record<Exclude<keyof CostRecipe, "packaging">, string> & {
  packaging: PackagingChoice;
};

const toDraft = (recipe: CostRecipe): RecipeDraft => ({
  material_cost: String(recipe.material_cost || ""),
  material_yield: String(recipe.material_yield || ""),
  charm_cost: String(recipe.charm_cost || ""),
  charm_count: String(recipe.charm_count || ""),
  extra_cost: String(recipe.extra_cost || ""),
  packaging: recipe.packaging,
  labour_kes: String(recipe.labour_kes || ""),
});

const num = (input: string) => {
  const parsed = Number(input);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const fromDraft = (draft: RecipeDraft): CostRecipe => ({
  material_cost: num(draft.material_cost),
  material_yield: num(draft.material_yield),
  charm_cost: num(draft.charm_cost),
  charm_count: num(draft.charm_count),
  extra_cost: num(draft.extra_cost),
  packaging: draft.packaging,
  labour_kes: num(draft.labour_kes),
});

const channelLabels: Record<SalesChannel, string> = {
  direct: "Selling yourself",
  consignment: "Through a partner shop",
};

export default function PricingCalculator({
  productId,
  storePrice,
  initialRecipe,
  initialNotes,
  hasRecipe,
  settings,
  unitsSold,
}: {
  productId: string;
  storePrice: number;
  initialRecipe: CostRecipe;
  initialNotes: string;
  hasRecipe: boolean;
  settings: PricingSettings;
  unitsSold: number;
}) {
  const [draft, setDraft] = useState(() => toDraft(initialRecipe));
  const [channel, setChannel] = useState<SalesChannel>("direct");
  const [tryPrice, setTryPrice] = useState(String(storePrice || ""));
  const recipe = fromDraft(draft);
  const price = num(tryPrice);
  const result = checkPrice(price, recipe, settings, channel, unitsSold);
  const yieldMissing = recipe.material_yield <= 0;

  const update =
    (key: keyof RecipeDraft) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setDraft((current) => ({ ...current, [key]: event.target.value }));

  const costLines = [
    {
      label: `Beads / stones (${formatKes(recipe.material_cost)} ÷ ${recipe.material_yield || "?"})`,
      value: result.making.beads,
    },
    {
      label: `String (${formatKes(settings.string_roll_cost)} roll ÷ ${settings.string_roll_yield})`,
      value: result.making.string,
    },
    { label: "Charms", value: result.making.charms },
    { label: "Other materials", value: result.making.extra },
    {
      label: `Broken / wasted beads (${settings.wastage_pct}%)`,
      value: result.making.wastage,
    },
    { label: "Packaging", value: result.making.packaging },
    { label: "Labour", value: result.making.labour },
  ].filter((line) => line.value > 0 || line.label === "Labour");

  return (
    <div className="admin-pricing-workspace">
      <form action={saveCostRecipe} className="admin-product-form">
        <input type="hidden" name="product_id" value={productId} />
        <section className="admin-form-section">
          <div className="admin-form-heading">
            <div>
              <p className="admin-kicker">Step 1</p>
              <h2>What goes into it?</h2>
              <p>Enter what you paid. String and wastage are added for you.</p>
            </div>
            {!hasRecipe && <span>Not saved yet</span>}
          </div>
          <div className="admin-form-grid">
            <label>
              Bead pack / strand cost (KES)
              <input
                name="material_cost"
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                value={draft.material_cost}
                onChange={update("material_cost")}
                placeholder="500"
                required
              />
              <span className="admin-field-help">
                What you paid for one pack or strand.
              </span>
            </label>
            <label>
              Bracelets it makes
              <input
                name="material_yield"
                type="number"
                min="0.1"
                step="0.1"
                inputMode="decimal"
                value={draft.material_yield}
                onChange={update("material_yield")}
                placeholder="1.5"
                required
              />
              <span className="admin-field-help">
                e.g. 4 for a small pack, 1.5 for a stone strand.
              </span>
            </label>
            <label>
              Charm cost each (KES)
              <input
                name="charm_cost"
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                value={draft.charm_cost}
                onChange={update("charm_cost")}
                placeholder="20"
              />
            </label>
            <label>
              Charms on this bracelet
              <input
                name="charm_count"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={draft.charm_count}
                onChange={update("charm_count")}
                placeholder="1"
              />
            </label>
            <label>
              Packaging
              <select
                name="packaging"
                value={draft.packaging}
                onChange={update("packaging")}
              >
                {packagingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Other materials per bracelet (KES)
              <input
                name="extra_cost"
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                value={draft.extra_cost}
                onChange={update("extra_cost")}
                placeholder="0"
              />
              <span className="admin-field-help">
                Spacers, clasps, cards — anything else.
              </span>
            </label>
            <label>
              Labour per bracelet (KES)
              <input
                name="labour_kes"
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                value={draft.labour_kes}
                onChange={update("labour_kes")}
                placeholder="0"
              />
              <span className="admin-field-help">
                Leave at 0 while you make them yourself. Fill in when you pay
                someone.
              </span>
            </label>
            <label>
              Notes
              <input
                name="notes"
                defaultValue={initialNotes}
                placeholder="Supplier, bead size, etc."
              />
            </label>
          </div>
        </section>
        <div className="admin-form-actions">
          <button type="submit" className="admin-primary-action">
            Save costs
          </button>
        </div>
      </form>

      <aside className="admin-pricing-result" aria-live="polite">
        <section className="admin-form-section">
          <p className="admin-kicker">Step 2</p>
          <h2>What it costs you</h2>
          <dl className="admin-pricing-lines">
            {costLines.map((line) => (
              <div key={line.label}>
                <dt>{line.label}</dt>
                <dd>{formatKes(line.value)}</dd>
              </div>
            ))}
            <div className="is-total">
              <dt>Cost to make</dt>
              <dd>{formatKes(result.making.total)}</dd>
            </div>
            <div>
              <dt>Stand payback</dt>
              <dd>{formatKes(result.stand)}</dd>
            </div>
            <div className="is-total">
              <dt>Full cost</dt>
              <dd>{formatKes(result.fullCost)}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-form-section">
          <p className="admin-kicker">Step 3</p>
          <h2>What to charge</h2>
          <div
            className="admin-pricing-channels"
            role="radiogroup"
            aria-label="Where it sells"
          >
            {(Object.keys(channelLabels) as SalesChannel[]).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={channel === option}
                className={channel === option ? "is-active" : undefined}
                onClick={() => setChannel(option)}
              >
                {channelLabels[option]}
                {option === "consignment" &&
                  ` (${settings.consignment_commission_pct}% cut)`}
              </button>
            ))}
          </div>
          {yieldMissing ? (
            <p className="admin-pricing-hint">
              Enter how many bracelets the pack or strand makes.
            </p>
          ) : result.breakEven === null || result.goodPrice === null ? (
            <p className="admin-pricing-hint">
              Ads and partner cuts take the whole sale. Check the settings.
            </p>
          ) : (
            <div className="admin-pricing-prices">
              <div>
                <span>Lowest safe price</span>
                <strong>{formatKes(result.breakEven)}</strong>
                <small>Below this you lose money.</small>
              </div>
              <div className="is-good">
                <span>Good price</span>
                <strong>{formatKes(result.goodPrice)}</strong>
                <small>
                  Money back + {settings.target_profit_pct}% profit.
                </small>
                <button
                  type="button"
                  onClick={() => setTryPrice(String(result.goodPrice))}
                >
                  Try this price
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="admin-form-section">
          <p className="admin-kicker">Step 4</p>
          <h2>Where the money goes</h2>
          <label className="admin-pricing-try">
            If you sell it for (KES)
            <input
              type="number"
              min="0"
              step="10"
              inputMode="decimal"
              value={tryPrice}
              onChange={(event) => setTryPrice(event.target.value)}
            />
          </label>
          {price > 0 && !yieldMissing && (
            <>
              <p
                className={`admin-status admin-pricing-status-${result.status}`}
              >
                {priceStatusLabel[result.status]} ·{" "}
                {result.profitPct.toFixed(0)}% profit
              </p>
              <dl className="admin-pricing-lines">
                <div>
                  <dt>Customer pays</dt>
                  <dd>{formatKes(price)}</dd>
                </div>
                <div>
                  <dt>Ads &amp; monthly costs</dt>
                  <dd>− {formatKes(result.shared)}</dd>
                </div>
                {result.commission > 0 && (
                  <div>
                    <dt>Partner cut</dt>
                    <dd>− {formatKes(result.commission)}</dd>
                  </div>
                )}
                <div>
                  <dt>Restock (full cost back)</dt>
                  <dd>− {formatKes(result.split.restock)}</dd>
                </div>
                <div className="is-total">
                  <dt>{result.profit >= 0 ? "Profit" : "Loss"}</dt>
                  <dd>{formatKes(result.profit)}</dd>
                </div>
              </dl>
              {result.profit > 0 && (
                <dl className="admin-pricing-split">
                  <div>
                    <dt>Better products</dt>
                    <dd>{formatKes(result.split.betterProducts)}</dd>
                  </div>
                  <div>
                    <dt>Savings</dt>
                    <dd>{formatKes(result.split.reserves)}</dd>
                  </div>
                  <div>
                    <dt>Your pay</dt>
                    <dd>{formatKes(result.split.ownerPay)}</dd>
                  </div>
                </dl>
              )}
              {channel === "direct" && price !== storePrice && (
                <form action={applyStorePrice} className="admin-pricing-apply">
                  <input type="hidden" name="product_id" value={productId} />
                  <input type="hidden" name="price_kes" value={price} />
                  <p>
                    Store price is {formatKes(storePrice)}. Changing it updates
                    the website immediately.
                  </p>
                  <button type="submit" className="admin-secondary-action">
                    Set store price to {formatKes(price)}
                  </button>
                </form>
              )}
            </>
          )}
        </section>
      </aside>
    </div>
  );
}
