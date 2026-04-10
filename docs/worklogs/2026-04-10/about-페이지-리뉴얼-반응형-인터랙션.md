# About 페이지 리뉴얼 (반응형 + 인터랙션)

## 작업 목적
- 소개 페이지를 단순 정보 나열에서 벗어나 인터랙티브한 브랜드 섹션으로 재구성한다.
- 데스크탑/모바일 모두 자연스럽게 보이도록 반응형 레이아웃을 정리한다.

## 변경 내용
- 파일: `app/[lang]/(site)/about/page.tsx`
- 레이아웃
  - 풀폭 배경(그라디언트/라디얼 레이어) 적용
  - 상단: 소개 텍스트 카드 + 프로필 카드 2단(모바일 1단) 구성
  - 하단: 기술스택 인터랙티브 카드 그리드 구성
- 인터랙션
  - 카드 hover 시 translate/scale/shadow 전환
  - 프로필 카드에 글로우/확대 전환
  - 기술 로고 hover 시 확대 효과
  - `SlideIn` 시퀀스 모션으로 섹션 진입 애니메이션 강화
- 카피/라벨
  - locale별 라벨 세분화(`profileCard`, `experience`, `skillDeck`, `core`)

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과
