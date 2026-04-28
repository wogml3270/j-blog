# j-blog

Next.js(App Router) 기반 포트폴리오/블로그 프로젝트입니다.

## 프로젝트 소개

### 1) 프로젝트 목적

이 프로젝트는 개인 포트폴리오와 기술 블로그를 하나의 서비스로 통합해, 실제 진행했던 프로젝트 경험과 학습/문제해결 과정을 구조적으로 기록하고 공개하기 위한 목적의 개인 CMS 기반 웹 서비스입니다.

- 진행 프로젝트를 직접 등록/수정/비공개 관리 후 공개 전환
- 개인 기술 글 작성 및 발행(예약 발행 포함)
- 다국어(ko/en/ja) 콘텐츠 운영을 고려한 확장 가능한 구조 설계

### 2) 작업 기간

- 2026.04.03 ~ 현재 (상시 진행 중)

### 3) 현재 서비스 범위

- 포트폴리오 프로젝트 아카이빙
- 개인 기술 블로그 운영
- 사용자 문의 접수 및 관리자 응답 상태 관리
- 블로그/프로젝트별 댓글 작성, 수정, 삭제 및 관리자 관리

### 4) 관리자 페이지(CMS) 상세

- `/admin/dashboard`
  - 게시글/프로젝트/문의/프로필 최신 상태를 한 화면에서 확인하는 운영 대시보드
- `/admin/home`
  - 메인 Hero 슬라이드 노출 순서, 활성 상태, CTA 라벨을 드래그 앤 드롭 기반으로 관리
- `/admin/about`
  - 프로필(이름/직함/요약)과 기술 스택 항목을 카테고리별로 관리
  - 다국어 탭(KO/EN/JA) 입력 및 이미지 업로드 지원
- `/admin/projects`
  - 프로젝트 CRUD, 공개/비공개, 메인 노출, 기간/역할/기술스택/링크 관리
  - 다국어 콘텐츠(EN/JA) 입력, 마크다운 본문 편집, 댓글 관리
- `/admin/blog`
  - 글 CRUD, slug/태그/썸네일/메인노출 관리
  - 공개/비공개, 예약 발행 시점 관리, 마크다운 에디터 기반 본문 작성
  - 다국어 콘텐츠(EN/JA) 입력, 댓글 관리
- `/admin/contact`
  - 문의 내역 조회, 상태(`new`/`replied`) 변경, 관리자 메모 기록

### 5) 기술 구조

- Next.js(App Router) + TypeScript 기반 구조
- Supabase(PostgreSQL/Auth/Storage) 중심 데이터 모델링
- API Route(`app/api/*`) + Repository Layer(`lib/*/repository.ts`)로 데이터 접근 로직 분리
- 관리자/공개 페이지 모두 데이터베이스 중심으로 조회/저장되는 API 기반 아키텍처
- OAuth 로그인(Google/GitHub/Kakao) 및 관리자 접근 제어(allowlist) 적용

### 6) 핵심 구현 포인트

- 블로그/프로젝트 검색 UI와 페이지네이션 공통화로 사용자 경험 일관성 확보
- 댓글 섹션 공통 컴포넌트화로 도메인 간 중복 제거 및 유지보수성 개선
- 관리자 매니저 구조 분리/리팩터링으로 화면 책임 분리 및 확장성 강화
- 다국어 콘텐츠 입력/조회/폴백 정책 정립(KO 기본, EN/JA 확장)
- sitemap 동적 충돌 대응 및 배포 별칭 자동화로 운영 안정성 개선

### 7) 향후 확장 계획

- 이미지 저장형 갤러리 콘텐츠(Portfolio Gallery) 추가
- 관리자에서 갤러리 업로드/정렬/공개 상태를 관리할 수 있는 전용 메뉴 확장
- 기존 프로젝트/블로그와 연결되는 미디어 허브 형태로 통합 운영

## 실행

```bash
npm install
npm run dev
```

## Admin CMS + Supabase 설정

### 1) 환경변수

`.env.example`를 참고해 `.env.local`을 구성합니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_ALLOWED_EMAILS` (콤마 구분)
- `RESEND_API_KEY` (선택)
- `SITE_CONTACT_TO_EMAIL` (선택)
- `SITE_CONTACT_FROM_EMAIL` (선택)

### 2) Supabase 스키마 적용

Supabase SQL Editor에서 아래 파일을 실행합니다.

- 최초 1회: `supabase/schema-v1.0.0.sql`
- 이후 증분: `supabase/schema-v1.0.1.sql` -> `supabase/schema-v1.0.2.sql` 순서로 적용

적용 후 `admin_allowlist`에 기본 슈퍼관리자(`wogml3270@gmail.com`)가 등록됩니다.

### 3) 소셜 로그인 Provider 설정

Supabase Auth > Providers에서 다음을 활성화합니다.

- Google
- GitHub
- Kakao

Redirect URL에 다음을 등록합니다.

- `http://localhost:3000/auth/callback`
- (배포 시) `https://<your-domain>/auth/callback`

### 4) 초기 데이터 시드

```bash
npm run seed:supabase
```

- 기존 `content/blog/*.mdx`를 posts/tags로 이관
- 기본 프로젝트/프로필 데이터 이관
- allowlist 이메일 upsert

## 주요 라우트

- 공개 사이트: `/{lang}` (`ko`, `en`, `ja`)
- 관리자 로그인: `/admin/login`
- 관리자 화면: `/admin/dashboard`, `/admin/home`, `/admin/about`, `/admin/projects`, `/admin/blog`, `/admin/contact`
- OAuth 콜백: `/auth/callback`

## 품질 체크

```bash
npm run lint
npm run build
```

## v2 작업 계획 (2026-04-14)

여기서부터 다음 작업은 `v2` 기준으로 진행합니다.

### 1) 리팩토링 (`docs/refector`)

- 데이터베이스 테이블명을 공개 페이지명과 동일한 도메인 기준으로 정리
- 관련 전역 리네이밍 일괄 적용
  - 함수명 / 변수명 / 상태값
  - API 비즈니스 로직 함수명
  - `types/` 내부 파일명 및 타입명
- 관리자 `*-manager` 파일의 과도한 길이 개선
  - 파일 분리 및 역할 단위 모듈화

### 2) 공개 페이지

- 프로젝트/블로그 검색 기능 활성화
  - Zustand 상태 관리 활용
- About 페이지 모바일 하단 오버플로우 이슈 수정

### 3) 관리자 페이지

- 다국어 콘텐츠 처리(EN/JA) 도입
  - 공개 페이지 언어 스위칭 시 해당 언어 콘텐츠 노출
  - 스키마 지속 업데이트 포함
