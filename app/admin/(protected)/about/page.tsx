import { AboutManager } from "@/components/admin/about-manager";
import { getAdminProfileContent } from "@/lib/profile/repository";

export default async function AdminAboutPage() {
  const profile = await getAdminProfileContent("ko");

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">About 관리</h1>
      <AboutManager initialAbout={profile} />
    </main>
  );
}
