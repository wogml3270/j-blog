import { HomeManager } from "@/components/admin/home/home-manager";
import { getAdminHomeSlides, getAdminHomeSlideSources } from "@/lib/home/repository";

export default async function AdminDashboardHomePage() {
  const [highlights, sources] = await Promise.all([
    getAdminHomeSlides(),
    getAdminHomeSlideSources(),
  ]);

  return <HomeManager initialHighlights={highlights} initialSources={sources} />;
}
