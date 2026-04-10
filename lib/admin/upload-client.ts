import type { AdminUploadScope } from "@/types/admin";

type UploadAdminMediaResponse = {
  url: string;
  bucket: string;
  path: string;
};

// 관리자 이미지 업로드 요청을 공통 경로로 보내고 공개 URL을 반환한다.
export async function uploadAdminMediaFile(
  file: File,
  scope: AdminUploadScope,
): Promise<UploadAdminMediaResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("scope", scope);

  const response = await fetch("/api/admin/media/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "이미지 업로드에 실패했습니다.");
  }

  return (await response.json()) as UploadAdminMediaResponse;
}
