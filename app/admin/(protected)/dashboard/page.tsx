import { DashboardManager } from "@/components/admin/dashboard/dashboard-manager";
import { getAdminState } from "@/lib/auth/admin";
import { getPendingAdminAccessRequestsCount } from "@/lib/auth/admin-settings-repository";
import { getAdminPosts } from "@/lib/blog/repository";
import { getAdminContacts } from "@/lib/contact/repository";
import { getAdminHomeSlides } from "@/lib/home/repository";
import { getAdminProjects } from "@/lib/projects/repository";

export default async function AdminDashboardPage() {
  // 대시보드 페이지는 데이터 조회만 담당하고, 렌더링은 전용 매니저로 위임한다.
  const [posts, projects, contacts, slides, pendingAccessRequests, adminState] = await Promise.all([
    getAdminPosts(),
    getAdminProjects(),
    getAdminContacts(),
    getAdminHomeSlides(),
    getPendingAdminAccessRequestsCount(),
    getAdminState(),
  ]);

  return (
    <DashboardManager
      posts={posts}
      projects={projects}
      contacts={contacts}
      highlights={slides}
      pendingAccessRequests={pendingAccessRequests}
      isSuperAdmin={adminState.role === "super_admin"}
    />
  );
}
