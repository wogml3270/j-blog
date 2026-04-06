import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { getAdminState } from "@/lib/auth/admin";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = await getAdminState();

  if (!state.user || !state.isAdmin) {
    redirect(`/admin/login?reason=${state.reason}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:px-8">
      <AdminSidebar email={state.email} />
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
