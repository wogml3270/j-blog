import { HomeManager } from "@/components/admin/home/home-manager";
import { getAdminHomeHighlights, getAdminHomeHighlightSources } from "@/lib/home/repository";

export default async function AdminDashboardHomePage() {
  const [highlights, sources] = await Promise.all([
    getAdminHomeHighlights(),
    getAdminHomeHighlightSources(),
  ]);

  return <HomeManager initialHighlights={highlights} initialSources={sources} />;
}
