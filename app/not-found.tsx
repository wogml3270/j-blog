import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-start justify-center gap-4 px-4">
      <p className="text-sm text-muted">404</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">페이지를 찾을 수 없습니다.</h1>
      <p className="text-base text-muted">요청하신 주소가 변경되었거나 존재하지 않습니다.</p>
      <Link href="/" className="text-sm font-medium underline">
        홈으로 이동
      </Link>
    </main>
  );
}
