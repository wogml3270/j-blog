import type { PublishStatus } from "@/types/db";
import type { HomeSlideSourceType } from "@/types/home-slide";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type HomeSlideSyncInput = {
  sourceType: HomeSlideSourceType;
  sourceId: string;
  featured: boolean;
  status: PublishStatus;
};

type HomeSlideExistingRow = {
  id: string;
  is_active: boolean;
};

type HomeSlideOrderRow = {
  order_index: number;
};

async function getNextOrderIndex(): Promise<number> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return 0;
  }

  const { data, error } = await service
    .from("home_slide")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle<HomeSlideOrderRow>();

  if (error || !data) {
    return 0;
  }

  return Math.max(0, Number(data.order_index) + 1);
}

// source 상태(featured/published)에 맞춰 홈 하이라이트 연결을 자동 동기화한다.
// source(featured/published) 상태를 기준으로 home_slide 연결을 자동 동기화한다.
export async function syncHomeSlideSource(input: HomeSlideSyncInput): Promise<void> {
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
      .from("home_slide")
      .delete()
      .eq("source_type", input.sourceType)
      .eq("source_id", sourceId);
    return;
  }

  const { data: existing } = await service
    .from("home_slide")
    .select("id,is_active")
    .eq("source_type", input.sourceType)
    .eq("source_id", sourceId)
    .maybeSingle<HomeSlideExistingRow>();

  if (existing) {
    if (!existing.is_active) {
      await service.from("home_slide").update({ is_active: true }).eq("id", existing.id);
    }
    return;
  }

  const nextOrderIndex = await getNextOrderIndex();

  await service.from("home_slide").insert({
    source_type: input.sourceType,
    source_id: sourceId,
    order_index: nextOrderIndex,
    is_active: true,
  });
}

// 원본 데이터가 삭제되면 홈 하이라이트 연결도 함께 제거한다.
// 원본 콘텐츠 삭제 시 home_slide 연결도 함께 정리한다.
export async function removeHomeSlideSource(
  sourceType: HomeSlideSourceType,
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
    .from("home_slide")
    .delete()
    .eq("source_type", sourceType)
    .eq("source_id", normalizedSourceId);
}

// v1 호출처 호환을 위해 기존 함수명을 alias로 유지한다.
export const syncHomeHighlightSource = syncHomeSlideSource;
export const removeHomeHighlightSource = removeHomeSlideSource;
