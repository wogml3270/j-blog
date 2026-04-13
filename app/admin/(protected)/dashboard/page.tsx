import { DashboardManager } from "@/components/admin/dashboard/dashboard-manager";
import { getAdminPosts } from "@/lib/blog/repository";
import { getAdminContactMessages } from "@/lib/contact/repository";
import { getAdminHomeHighlights } from "@/lib/home/repository";
import { getAdminProfileContent } from "@/lib/profile/repository";
import { getAdminProjects } from "@/lib/projects/repository";

export default async function AdminDashboardPage() {
  // 대시보드 페이지는 데이터 조회만 담당하고, 렌더링은 전용 매니저로 위임한다.
  const [posts, projects, profile, contacts, highlights] = await Promise.all([
    getAdminPosts(),
    getAdminProjects(),
    getAdminProfileContent("ko"),
    getAdminContactMessages(),
    getAdminHomeHighlights(),
  ]);

  return (
    <DashboardManager
      posts={posts}
      projects={projects}
      profile={profile}
      contacts={contacts}
      highlights={highlights}
    />
  );
}
