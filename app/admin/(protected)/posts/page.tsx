import { redirect } from "next/navigation";

export default async function AdminPostsPage() {
  redirect("/admin/blog");
}
