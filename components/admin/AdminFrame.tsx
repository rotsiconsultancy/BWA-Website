"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Calculator,
  LayoutDashboard,
  Package,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  TicketPercent,
  Users,
} from "lucide-react";

const navigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/products", label: "Catalogue", icon: Package },
  { href: "/admin/pricing", label: "Pricing", icon: Calculator },
  { href: "/admin/discounts", label: "Offers", icon: TicketPercent },
  { href: "/admin/discovery", label: "Discovery", icon: Sparkles },
  { href: "/admin/sync", label: "CRM sync", icon: RefreshCw },
];

export default function AdminFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <Link
            href="/admin"
            className="admin-wordmark"
            aria-label="BWA Operations home"
          >
            <span>BWA</span>
            <small>Operations</small>
          </Link>
          <nav className="admin-nav" aria-label="Admin navigation">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/admin"
                  ? pathname === href
                  : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={active ? "is-active" : undefined}
                >
                  <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="admin-sidebar-foot">
          <p>
            BWA owns the commerce record.
            <br />
            CRM receives a downstream copy.
          </p>
          <Link href="/" className="admin-store-link">
            View storefront <ArrowUpRight aria-hidden="true" size={15} />
          </Link>
        </div>
      </aside>
      <section className="admin-workspace">{children}</section>
    </main>
  );
}
