import type { Metadata } from "next";
import ShopCatalogue from "@/components/shop/ShopCatalogue";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Shop Bracelets | Beads World Africa",
  alternates: { canonical: "/shop" },
  robots: { index: false, follow: true },
};

export default async function ShopPage() {
  return <ShopCatalogue catalogue={await getStorefrontCatalogue()} />;
}
