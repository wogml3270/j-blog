import { AdminListManagerLoadingSkeleton } from "@/components/ui/skeleton/admin/list-manager-loading-skeleton";

export default function AdminContactLoading() {
  return (
    <AdminListManagerLoadingSkeleton
      titleWidth={126}
      hasAction={false}
      sectionCount={2}
      withThumbnail={false}
      compactToolbar
    />
  );
}
