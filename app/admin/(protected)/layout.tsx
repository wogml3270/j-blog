import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/common/sidebar";
import { getAdminState } from "@/lib/auth/admin";
import { Container } from "@/components/layout/container";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const state = await getAdminState();

  if (!state.user || !state.isAdmin) {
    redirect(`/admin/login?reason=${state.reason}`);
  }

  return (
    <Container className="flex w-full flex-col gap-4 py-4 sm:gap-5 sm:py-6 xl:flex-row xl:items-start">
      <AdminSidebar email={state.email} avatarUrl={state.avatarUrl} />
      <section className="min-w-0 flex-1">{children}</section>
    </Container>
  );
}
