import Link from "next/link";
import { ShortcutIcon } from "@/components/ui/icons/shortcut-icon";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getAdminPosts } from "@/lib/blog/repository";
import { getAdminContactMessages } from "@/lib/contact/repository";
import { getAdminProfileContent } from "@/lib/profile/repository";
import { getAdminProjects } from "@/lib/projects/repository";

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default async function AdminDashboardPage() {
  // 대시보드는 서로 독립적인 데이터 소스를 병렬 로딩해 초기 응답 시간을 줄인다.
  const [posts, projects, profile, contacts] = await Promise.all([
    getAdminPosts(),
    getAdminProjects(),
    getAdminProfileContent("ko"),
    getAdminContactMessages(),
  ]);

  const newContactsCount = contacts.filter((item) => item.status === "new").length;
  const draftPostsCount = posts.filter((item) => item.status === "draft").length;
  const draftProjectsCount = projects.filter((item) => item.status === "draft").length;
  const mainVisiblePostsCount = posts.filter((item) => item.featured).length;
  const mainVisibleProjectsCount = projects.filter((item) => item.featured).length;
  const recentPosts = posts.slice(0, 3);
  const recentProjects = projects.slice(0, 3);
  const recentContacts = contacts.slice(0, 3);

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">관리자 대시보드</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/admin/blog"
          className="group block rounded-xl border border-border bg-surface p-4 transition hover:border-foreground/35"
        >
          <p className="text-xs uppercase tracking-wide text-muted group-hover:underline">
            블로그 글
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground group-hover:underline">
            {posts.length}
          </p>
          <p className="mt-1 text-xs text-muted">메인 노출 {mainVisiblePostsCount}개</p>
        </Link>

        <Link
          href="/admin/projects"
          className="group block rounded-xl border border-border bg-surface p-4 transition hover:border-foreground/35"
        >
          <p className="text-xs uppercase tracking-wide text-muted group-hover:underline">
            프로젝트
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground group-hover:underline">
            {projects.length}
          </p>
          <p className="mt-1 text-xs text-muted">메인 노출 {mainVisibleProjectsCount}개</p>
        </Link>

        <Link
          href="/admin/contact"
          className="group block rounded-xl border border-border bg-surface p-4 transition hover:border-foreground/35"
        >
          <p className="text-xs uppercase tracking-wide text-muted group-hover:underline">
            문의
            <span className="font-bold text-red-300">
              {newContactsCount > 0 ? ` (신규 ${newContactsCount}건)` : ""}
            </span>
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground group-hover:underline">
            {newContactsCount}
          </p>
          <p className="mt-1 text-xs text-muted">전체 {contacts.length}건</p>
        </Link>

        <Link
          href="/admin/about"
          className="group block rounded-xl border border-border bg-surface p-4 transition hover:border-foreground/35"
        >
          <p className="text-xs uppercase tracking-wide text-muted group-hover:underline">
            소개 공개 상태
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground group-hover:underline">
            {profile.status === "published" ? "공개" : "비공개"}
          </p>
          <p className="mt-1 text-xs text-muted">마지막 변경 {formatDate(profile.updatedAt)}</p>
        </Link>
      </div>

      <SurfaceCard tone="surface" padding="md">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          지금 확인할 항목
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          {newContactsCount > 0 ? (
            <li>
              <Link href="/admin/contact" className="text-foreground underline">
                신규 문의 {newContactsCount}건 확인하기
              </Link>
            </li>
          ) : null}
          {draftPostsCount > 0 ? (
            <li>
              <Link href="/admin/blog" className="text-foreground underline">
                비공개 블로그 글 {draftPostsCount}개 점검하기
              </Link>
            </li>
          ) : null}
          {draftProjectsCount > 0 ? (
            <li>
              <Link href="/admin/projects" className="text-foreground underline">
                비공개 프로젝트 {draftProjectsCount}개 점검하기
              </Link>
            </li>
          ) : null}
          {profile.status === "draft" ? (
            <li>
              <Link href="/admin/about" className="text-foreground underline">
                소개 페이지가 비공개 상태입니다. 공개 여부 확인하기
              </Link>
            </li>
          ) : null}
          {newContactsCount === 0 &&
          draftPostsCount === 0 &&
          draftProjectsCount === 0 &&
          profile.status === "published" ? (
            <li className="text-muted">지금 즉시 처리할 항목이 없습니다.</li>
          ) : null}
        </ul>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-3">
        <SurfaceCard tone="surface" padding="md">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              최근 블로그 변경
            </h2>
            <Link
              href="/admin/blog"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-foreground/10"
              aria-label="블로그 관리 바로가기"
              title="블로그 관리 바로가기"
            >
              <ShortcutIcon className="h-3.5 w-3.5" />
              <span className="sr-only">바로가기</span>
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/admin/blog?page=1&id=${post.id}`}
                    className="block rounded-md border border-border bg-background px-3 py-2 transition hover:border-foreground/35"
                  >
                    <p className="truncate text-sm font-medium text-foreground hover:underline">
                      {post.title}
                    </p>
                    <p className="text-xs text-muted">
                      {post.status === "published" ? "공개" : "비공개"} ·
                      {post.featured ? " 메인 노출" : " 일반"} · {formatDate(post.publishedAt)}
                    </p>
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted">데이터가 없습니다.</li>
            )}
          </ul>
        </SurfaceCard>

        <SurfaceCard tone="surface" padding="md">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              최근 프로젝트 변경
            </h2>
            <Link
              href="/admin/projects"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-foreground/10"
              aria-label="프로젝트 관리 바로가기"
              title="프로젝트 관리 바로가기"
            >
              <ShortcutIcon className="h-3.5 w-3.5" />
              <span className="sr-only">바로가기</span>
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/admin/projects?page=1&id=${project.id}`}
                    className="block rounded-md border border-border bg-background px-3 py-2 transition hover:border-foreground/35"
                  >
                    <p className="truncate text-sm font-medium text-foreground hover:underline">
                      {project.title}
                    </p>
                    <p className="text-xs text-muted">
                      {project.status === "published" ? "공개" : "비공개"} ·
                      {project.featured ? " 메인 노출" : " 일반"}
                    </p>
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted">데이터가 없습니다.</li>
            )}
          </ul>
        </SurfaceCard>

        <SurfaceCard tone="surface" padding="md">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">최근 문의</h2>
            <Link
              href="/admin/contact"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-foreground/10"
              aria-label="문의함 바로가기"
              title="문의함 바로가기"
            >
              <ShortcutIcon className="h-3.5 w-3.5" />
              <span className="sr-only">바로가기</span>
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {recentContacts.length > 0 ? (
              recentContacts.map((contact) => (
                <li key={contact.id}>
                  <Link
                    href={`/admin/contact?page=1&id=${contact.id}`}
                    className="block rounded-md border border-border bg-background px-3 py-2 transition hover:border-foreground/35"
                  >
                    <p className="truncate text-sm font-medium text-foreground hover:underline">
                      {contact.subject}
                    </p>
                    <p className="text-xs text-muted">
                      {contact.status === "new"
                        ? "신규"
                        : contact.status === "read"
                          ? "확인함"
                          : "답변완료"}{" "}
                      · {formatDate(contact.createdAt)}
                    </p>
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted">데이터가 없습니다.</li>
            )}
          </ul>
        </SurfaceCard>
      </div>
    </main>
  );
}
