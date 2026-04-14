import { AboutManager } from "@/components/admin/about/about-manager";
import { getAdminAboutContent } from "@/lib/profile/repository";

export default async function AdminAboutPage() {
  const about = await getAdminAboutContent("ko");
  return <AboutManager initialAbout={about} />;
}
