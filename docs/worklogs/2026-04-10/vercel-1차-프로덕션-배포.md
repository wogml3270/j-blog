# Vercel 1차 프로덕션 배포 (Production only)

## 배포 결과
- Vercel 프로젝트 연결: `wogml3270s-projects/j-blog`
- 프로덕션 alias URL(기존): `https://j-blog-two.vercel.app`
- 프로덕션 alias URL(변경): `https://j-fe-blog.vercel.app`
- 배포 Inspect URL:
  - `https://vercel.com/wogml3270s-projects/j-blog/7y2RQHECuCd2wGuAZVhDySJnDgpz`

## 적용한 작업
1. Vercel CLI 로그인 및 프로젝트 연결
2. Production 배포 1회 수행
3. `.env.local` 기준으로 Vercel Production 환경변수 등록
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`
   - `SUPABASE_PROJECT_THUMBNAIL_BUCKET`
   - `ADMIN_ALLOWED_EMAILS`
4. 환경변수 반영을 위해 Production 재배포 1회 추가 수행

## 스모크 테스트 결과
- `/` -> `200`
- `/about` -> `200`
- `/blog` -> `200`
- `/projects` -> `200`
- `/admin/login` -> `200`
- `/auth/callback`(code 없음) -> `307 /admin/login?reason=missing_code`
- `https://j-fe-blog.vercel.app` -> `200`

## Supabase 대시보드에서 수동으로 맞춰야 할 항목
- Auth > URL Configuration
  - Site URL: `https://j-fe-blog.vercel.app`
  - Additional Redirect URLs:
    - `https://j-fe-blog.vercel.app/auth/callback`
    - `https://j-blog-two.vercel.app/auth/callback` (임시 호환)
    - `http://localhost:3000/auth/callback`
- Auth > Providers (Google/GitHub/Kakao)
  - Supabase callback URL은 기존 방식 유지
  - 각 Provider 콘솔에 위 production callback URL 반영 여부 확인

## 메모
- Vercel 빌드 로그에 `.env` 파일 감지 경고가 있어, 장기적으로는 로컬 `.env` 파일 의존 없이 Vercel 환경변수만 사용하도록 정리 필요.
