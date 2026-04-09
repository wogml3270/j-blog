import type { PublishStatus } from "@/types/db";
import type { HomeHighlightSourceType } from "@/types/home";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type HomeHighlightSyncInput = {
  sourceType: HomeHighlightSourceType;
  sourceId: string;
  featured: boolean;
  status: PublishStatus;
};

type HomeHighlightExistingRow = {
  id: string;
  is_active: boolean;
};

type HomeHighlightOrderRow = {
  order_index: number;
};

async function getNextOrderIndex(): Promise<number> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return 0;
  }

  const { data, error } = await service
    .from("home_highlights")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle<HomeHighlightOrderRow>();

  if (error || !data) {
    return 0;
  }

  return Math.max(0, Number(data.order_index) + 1);
}

// source 상태(featured/published)에 맞춰 홈 하이라이트 연결을 자동 동기화한다.
export async function syncHomeHighlightSource(input: HomeHighlightSyncInput): Promise<void> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return;
  }

  const sourceId = input.sourceId.trim();

  if (!sourceId) {
    return;
  }

  const shouldInclude = input.featured && input.status === "published";

  if (!shouldInclude) {
    await service
      .from("home_highlights")
      .delete()
      .eq("source_type", input.sourceType)
      .eq("source_id", sourceId);
    return;
  }

  const { data: existing } = await service
    .from("home_highlights")
    .select("id,is_active")
    .eq("source_type", input.sourceType)
    .eq("source_id", sourceId)
    .maybeSingle<HomeHighlightExistingRow>();

  if (existing) {
    if (!existing.is_active) {
      await service.from("home_highlights").update({ is_active: true }).eq("id", existing.id);
    }
    return;
  }

  const nextOrderIndex = await getNextOrderIndex();

  await service.from("home_highlights").insert({
    source_type: input.sourceType,
    source_id: sourceId,
    order_index: nextOrderIndex,
    is_active: true,
  });
}

// 원본 데이터가 삭제되면 홈 하이라이트 연결도 함께 제거한다.
export async function removeHomeHighlightSource(
  sourceType: HomeHighlightSourceType,
  sourceId: string,
): Promise<void> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return;
  }

  const normalizedSourceId = sourceId.trim();

  if (!normalizedSourceId) {
    return;
  }

  await service
    .from("home_highlights")
    .delete()
    .eq("source_type", sourceType)
    .eq("source_id", normalizedSourceId);
}
