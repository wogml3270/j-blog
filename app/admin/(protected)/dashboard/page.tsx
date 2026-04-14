import { DashboardManager } from "@/components/admin/dashboard/dashboard-manager";
import { getAdminPosts } from "@/lib/blog/repository";
import { getAdminContacts } from "@/lib/contact/repository";
import { getAdminHomeSlides } from "@/lib/home/repository";
import { getAdminAboutContent } from "@/lib/profile/repository";
import { getAdminProjects } from "@/lib/projects/repository";

export default async function AdminDashboardPage() {
  // 대시보드 페이지는 데이터 조회만 담당하고, 렌더링은 전용 매니저로 위임한다.
  const [posts, projects, about, contacts, slides] = await Promise.all([
    getAdminPosts(),
    getAdminProjects(),
    getAdminAboutContent("ko"),
    getAdminContacts(),
    getAdminHomeSlides(),
  ]);

  return (
    <DashboardManager
      posts={posts}
      projects={projects}
      profile={about}
      contacts={contacts}
      highlights={slides}
    />
  );
}
