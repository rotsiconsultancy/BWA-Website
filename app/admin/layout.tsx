import AdminFrame from "@/components/admin/AdminFrame";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminFrame>{children}</AdminFrame>;
}
