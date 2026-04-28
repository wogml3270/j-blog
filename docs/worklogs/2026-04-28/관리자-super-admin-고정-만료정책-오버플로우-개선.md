# 관리자 super_admin 고정 + 만료 정책 UX + 오버플로우 개선

## 변경 배경
- Settings > 관리자 계정 관리에서 super_admin이 수정 가능한 상태였고, 만료 정책 UI가 복잡해 가로 오버플로우가 발생함.
- `super_admin`은 ENV 기준 고정 불변이어야 하며, test_admin 만료 정책은 기존 계정에도 바로 설정 가능해야 함.

## 적용 내용
1. super_admin 고정 정책 강화
- `ADMIN_SUPER_ADMIN_EMAILS` 환경변수 도입 (`.env.example`, `README.md` 반영).
- 인증 가드에서 ENV super_admin 이메일을 최우선 판정하도록 변경.
- 관리자 멤버 수정 API/저장소에서 super_admin 수정 차단.
- 권한 요청 승인 UI/API에서 `super_admin` 선택 옵션 제거.

2. 관리자 계정 관리 UI 재구성
- 계정 카드 레이아웃을 세로 중심으로 단순화하여 가로 오버플로우 해소.
- 저장 버튼을 우측에 고정 배치.
- super_admin은 역할/만료일 수정 UI를 숨기고 안내문만 노출.
- `admin/test_admin`만 역할 변경 가능하도록 제한.

3. 만료 정책 입력 흐름 정리
- test_admin에서 `만료일 지정 안함/7일/14일/30일/90일/직접 지정` 사용 가능.
- 기존 만료일 없는 test_admin도 프리셋/직접 지정으로 즉시 설정 가능.

## 검증
- `npx tsc --noEmit` 통과
- `npm run -s lint` 통과
