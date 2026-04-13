import { DashboardHomeManager } from "@/components/admin/home/dashboard-home-manager";
import { getAdminHomeHighlights, getAdminHomeHighlightSources } from "@/lib/home/repository";

export default async function AdminDashboardHomePage() {
  const [highlights, sources] = await Promise.all([
    getAdminHomeHighlights(),
    getAdminHomeHighlightSources(),
  ]);

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">메인 홈 슬라이드 관리</h1>
      <DashboardHomeManager initialHighlights={highlights} initialSources={sources} />
    </main>
  );
}
