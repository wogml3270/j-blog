import { AboutManager } from "@/components/admin/about/about-manager";
import { getAdminProfileContent } from "@/lib/profile/repository";

export default async function AdminAboutPage() {
  const profile = await getAdminProfileContent("ko");
  return <AboutManager initialAbout={profile} />;
}
