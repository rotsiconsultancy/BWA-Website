import ShopCatalogue from "@/components/shop/ShopCatalogue";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  return <ShopCatalogue catalogue={await getStorefrontCatalogue()} />;
}
