# 작업일지 (2026-04-07)

## 목표

- 문의함 관리에 `관리자 메모`를 DB 컬럼으로 추가
- 문의 상세 패널에서 상태 변경 UI를 `select`에서 `radio`로 전환
- 문의 상세 레이아웃을 다른 관리자 화면과 같은 카드형 구조로 정리

## 작업 내용

### 1) DB 마이그레이션 추가

- 파일: `supabase/schema-v1.0.3.sql`
- 변경:
  - `contact_messages.admin_note` 컬럼 추가
  - 기존 데이터 백필(`NULL -> ''`)
  - `not null + default ''` 적용
  - `schema_migrations`에 `v1.0.3` 이력 기록

### 2) 타입/리포지토리 반영

- 파일: `types/content.ts`
  - `ContactMessage` 타입에 `adminNote: string` 추가
- 파일: `lib/contact/repository.ts`
  - `admin_note` select/mapping 추가
  - 업데이트 함수를 상태 전용에서 상태+메모 동시 저장으로 확장

### 3) 관리자 API 확장

- 파일: `app/api/admin/contact/[id]/route.ts`
- 변경:
  - payload에 `adminNote` 파싱/검증(최대 3000자)
  - `status + adminNote`를 함께 저장하도록 업데이트

### 4) 문의함 관리자 UI 개편

- 파일: `components/admin/contact-manager.tsx`
- 변경:
  - 상세 패널 레이아웃을 카드형 섹션으로 재구성
    - 문의자 정보
    - 문의 내용
    - 관리자 메모
    - 상태 라디오 그룹
  - 상태 선택을 `select` -> `radio`로 변경
  - 변경사항 감지(`isDirty`) 후 저장 버튼 활성화
  - 목록에서 메모 존재 시 `메모 있음` 배지 표시

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 적용 안내

- Supabase SQL Editor에서 `supabase/schema-v1.0.3.sql`을 실행해야 실제 DB 컬럼이 생성됩니다.
