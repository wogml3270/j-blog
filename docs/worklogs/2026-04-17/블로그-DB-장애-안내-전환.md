# 블로그 DB 장애 안내 전환

## 변경 목적
- 블로그 데이터 소스에서 MDX fallback을 제거하고, DB 장애 시 사용자에게 명시적으로 안내하도록 전환.

## 적용 내용
- `lib/blog/repository.ts`
  - `lib/blog/registry` 기반 fallback 로직 제거
  - `BlogServiceUnavailableError` 추가
  - Supabase 서비스 미구성/조회 실패 시 즉시 장애 에러 throw
- `app/[lang]/(site)/blog/error.tsx`
  - 블로그 세그먼트 전용 에러 UI 추가
  - KO/EN/JA 메시지 + 재시도 버튼 제공
- `app/[lang]/(site)/blog/[slug]/page.tsx`
  - 상세 메타 생성에서 DB 오류 시 기본 메타로 fallback 처리
  - 본문 렌더를 DB markdown 단일 경로로 통일

## 검증
- `npm run -s lint` 통과(기존 경고 1건 유지)
- `npx tsc --noEmit` 통과
