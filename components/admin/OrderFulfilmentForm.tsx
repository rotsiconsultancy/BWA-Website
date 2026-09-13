import { updateOrder } from "@/app/admin/orders/actions";

const statuses = [
  ["order_received", "Order received"],
  ["payment_pending", "Payment pending"],
  ["payment_confirmed", "Payment confirmed"],
  ["hand_crafting", "Hand-crafting"],
  ["quality_checked", "Quality checked"],
  ["ready_for_dispatch", "Ready for dispatch"],
  ["dispatched", "Dispatched"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
  ["refunded", "Refunded"],
];

export default function OrderFulfilmentForm({ order }: { order: any }) {
  return (
    <form action={updateOrder} className="admin-order-form">
      <input type="hidden" name="order_id" value={order.id} />
      <input type="hidden" name="order_number" value={order.order_number} />
      <label>
        Fulfilment status
        <select name="status" defaultValue={order.status}>
          {statuses.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Payment status
        <select name="payment_status" defaultValue={order.payment_status}>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </label>
      <label>
        Courier / rider
        <input
          name="courier_name"
          defaultValue={order.courier_name || ""}
          placeholder="e.g. Fargo Courier"
        />
      </label>
      <label>
        Tracking / consignment no.
        <input
          name="tracking_reference"
          defaultValue={order.tracking_reference || ""}
          placeholder="e.g. FGO-123456"
        />
      </label>
      <label className="admin-form-wide">
        Internal update note
        <textarea
          name="note"
          placeholder="What changed? This appears in the customer tracking timeline when relevant."
        />
      </label>
      <button className="admin-primary-action" type="submit">
        Save fulfilment update
      </button>
    </form>
  );
}
