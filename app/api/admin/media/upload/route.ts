import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { normalizeUploadScope, uploadAdminImageToStorage } from "@/lib/admin/media-upload";

export async function POST(request: Request) {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const scope = normalizeUploadScope(formData.get("scope"));

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "업로드 파일이 없습니다." }, { status: 400 });
  }

  const result = await uploadAdminImageToStorage(file, guard.user.id, scope);

  if (result.error || !result.data) {
    return NextResponse.json({ error: result.error ?? "업로드에 실패했습니다." }, { status: 400 });
  }

  return NextResponse.json(result.data);
}
