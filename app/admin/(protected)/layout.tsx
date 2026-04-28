import { redirect } from "next/navigation";
import { AdminSessionProvider } from "@/components/admin/common/admin-session-provider";
import { AdminSidebar } from "@/components/admin/common/sidebar";
import { getAdminState } from "@/lib/auth/admin";
import { Container } from "@/components/layout/container";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const state = await getAdminState();

  if (!state.user || !state.isAdmin) {
    redirect(`/admin/login?reason=${state.reason}`);
  }

  return (
    <AdminSessionProvider
      value={{
        userId: state.user.id,
        role: state.role,
        canReadAdmin: state.canReadAdmin,
        canWriteAdmin: state.canWriteAdmin,
        canManageAdmin: state.canManageAdmin,
      }}
    >
      <Container className="flex w-full flex-col gap-4 py-4 sm:gap-5 sm:py-6 xl:flex-row xl:items-start">
        <AdminSidebar email={state.email} avatarUrl={state.avatarUrl} role={state.role} />
        <section className="min-w-0 flex-1">{children}</section>
      </Container>
    </AdminSessionProvider>
  );
}
