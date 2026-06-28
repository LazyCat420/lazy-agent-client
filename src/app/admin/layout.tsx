import { Suspense } from "react";
import AdminShell from "../../components/AdminShellComponent";

export const metadata = {
  title: "Lazy Agent Dashboard",
  description: "Analytics and activity monitoring for Lazy Agent Service",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminShell>
      <Suspense>{children}</Suspense>
    </AdminShell>
  );
}
