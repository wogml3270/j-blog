import type { Locale } from "@/lib/i18n/config";

// 콘텐츠 번역 입력은 KO를 기본으로 두고 EN/JA만 별도 저장한다.
export type ContentLocale = Exclude<Locale, "ko">;
