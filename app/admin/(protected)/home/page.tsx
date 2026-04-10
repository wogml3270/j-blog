import { HomeHighlightManager } from "@/components/admin/home/home-manager";
import { getAdminHomeHighlights, getAdminHomeHighlightSources } from "@/lib/home/repository";

export default async function AdminHighlightPage() {
  const [highlights, sources] = await Promise.all([
    getAdminHomeHighlights(),
    getAdminHomeHighlightSources(),
  ]);

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">홈 관리</h1>
      <HomeHighlightManager initialHighlights={highlights} initialSources={sources} />
    </main>
  );
}
