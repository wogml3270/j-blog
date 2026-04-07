import { HomeManager } from "@/components/admin/home-manager";
import { getAdminProfileContent } from "@/lib/profile/repository";

export default async function AdminHomePage() {
  const profile = await getAdminProfileContent("ko");

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Home 관리</h1>
      <HomeManager initialHome={profile} />
    </main>
  );
}
