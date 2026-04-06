import { ProfileManager } from "@/components/admin/profile-manager";
import { getAdminProfileContent } from "@/lib/profile/repository";

export default async function AdminProfilePage() {
  const profile = await getAdminProfileContent("ko");

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">프로필 관리</h1>
      <ProfileManager initialProfile={profile} />
    </main>
  );
}
