import { AdminListManagerLoadingSkeleton } from "@/components/ui/skeleton/admin/list-manager-loading-skeleton";

export default function AdminDashboardHomeLoading() {
  return (
    <AdminListManagerLoadingSkeleton
      titleWidth={186}
      hasAction={false}
      sectionCount={1}
      compactToolbar
    />
  );
}
