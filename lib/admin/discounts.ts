export type DiscountStatus =
  "active" | "scheduled" | "paused" | "expired" | "exhausted";

export const discountStatus = (
  campaign: {
    active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    max_redemptions: number | null;
  },
  redemptions: number,
  now = new Date(),
): DiscountStatus => {
  if (!campaign.active) return "paused";
  if (campaign.starts_at && new Date(campaign.starts_at) > now)
    return "scheduled";
  if (campaign.ends_at && new Date(campaign.ends_at) <= now) return "expired";
  if (
    campaign.max_redemptions !== null &&
    redemptions >= campaign.max_redemptions
  )
    return "exhausted";
  return "active";
};

export const formatNairobiDateTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-KE", {
        timeZone: "Africa/Nairobi",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "No limit";
