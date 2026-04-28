# Home/About super_admin 수정권한 제한

## 요청 배경
- 관리자 권한(`admin`) 계정도 Home/About를 수정할 수 있는 상태여서 정책과 달랐다.
- 정책: Home/About 수정은 `super_admin`만 가능해야 함.

## 변경 사항
- API 서버 권한 강화
  - `PUT /api/admin/about`: `write` -> `manage_admin` 권한으로 변경
  - `PUT /api/admin/home-slide`: `write` -> `manage_admin` 권한으로 변경
- 관리자 UI 권한 동기화
  - `components/admin/about/about-manager.tsx`
    - 수정/업로드/저장 관련 체크를 `canManageAdmin` 기준으로 변경
    - 비권한 계정 안내 문구를 `super_admin만 수정 가능`으로 명확화
  - `components/admin/home/home-manager.tsx`
    - 드래그/활성 토글/CTA 수정/저장 버튼 모두 `canManageAdmin` 기준으로 변경
    - 비권한 계정 안내 문구를 `super_admin만 수정 가능`으로 명확화

## 확인
- `npx tsc --noEmit` 통과
- `npm run -s lint` 통과

