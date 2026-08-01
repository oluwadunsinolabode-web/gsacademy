import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-admin";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await isAdmin();

  if (!auth.authenticated || !auth.admin) {
    redirect("/login/admin");
  }

  return (
    <AdminDashboardLayout>
      {children}
    </AdminDashboardLayout>
  );
}