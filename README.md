# j-blog

Next.js(App Router) 기반 포트폴리오/블로그 프로젝트입니다.

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
