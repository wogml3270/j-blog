# 작업 일지 - 2026-04-08 (리팩토링 2차 정리)

## 목표

- 불필요하게 잘게 분리된 컴포넌트를 줄이고, 공통화는 유지하면서 유지보수 포인트를 축소한다.

## 변경 내용

1. `ManagerListRow` 파일 통합

- 기존: `components/admin/manager-list-row.tsx` 별도 파일
- 변경: `components/admin/manager-list.tsx` 내부로 `ManagerListRow`를 통합 export
- 효과: 관리자 리스트 관련 파일을 한 곳에서 확인 가능

2. 미세 중복 제거 (쿼리 파싱)

- `app/admin/(protected)/blog/page.tsx`
- `app/admin/(protected)/projects/page.tsx`
- `app/admin/(protected)/contact/page.tsx`
- 위 3곳의 `id` 쿼리 파싱 중복 함수를 제거하고 `lib/utils/search-params.ts`의 `pickSingleQueryValue`로 통합

3. 파일 삭제

- `components/admin/manager-list-row.tsx` 삭제

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 메모

- 현재 `components/` 기준으로 미사용 컴포넌트는 없음(참조 스캔 확인).
- 다음 단계는 “파일 수 감소”보다 “역할 경계 명확화(Manager 단위 상태/폼 로직 분리)”가 효율적일 가능성이 높음.
