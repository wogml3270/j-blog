import { readFile } from "node:fs/promises";

const VERCEL_API_BASE = "https://api.vercel.com";
const DEFAULT_ALIAS_DOMAIN = "j-fe-blog.vercel.app";
const MAX_POLL_COUNT = 40;
const POLL_INTERVAL_MS = 15_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readLocalProjectMeta() {
  try {
    const raw = await readFile(".vercel/project.json", "utf8");
    const parsed = JSON.parse(raw);

    return {
      projectId: parsed.projectId ?? null,
      teamId: parsed.orgId ?? null,
    };
  } catch {
    return {
      projectId: null,
      teamId: null,
    };
  }
}

function buildTeamQuery(teamId) {
  return teamId?.startsWith("team_") ? `teamId=${encodeURIComponent(teamId)}` : "";
}

// Vercel API 호출을 공통화해 에러 메시지를 한 번에 확인할 수 있게 한다.
async function fetchVercelJson(path, { token, method = "GET", body, teamId } = {}) {
  const query = buildTeamQuery(teamId);
  const url = query ? `${VERCEL_API_BASE}${path}${path.includes("?") ? "&" : "?"}${query}` : `${VERCEL_API_BASE}${path}`;
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `Vercel API ${method} ${path} failed (${response.status}): ${JSON.stringify(payload)}`,
    );
  }

  return payload;
}

function pickReadyDeployment(deployments, githubSha) {
  if (githubSha) {
    return deployments.find(
      (deployment) =>
        deployment?.meta?.githubCommitSha === githubSha && deployment.readyState === "READY",
    );
  }

  return deployments.find((deployment) => deployment.readyState === "READY");
}

async function waitForDeployment({ token, teamId, projectId, githubSha }) {
  for (let attempt = 1; attempt <= MAX_POLL_COUNT; attempt += 1) {
    // 프로젝트의 production 배포 목록을 확인해 READY 상태를 기다린다.
    const result = await fetchVercelJson(
      `/v6/deployments?projectId=${encodeURIComponent(projectId)}&target=production&limit=20`,
      {
        token,
        teamId,
      },
    );
    const deployments = Array.isArray(result.deployments) ? result.deployments : [];
    const ready = pickReadyDeployment(deployments, githubSha);

    if (ready) {
      return ready;
    }

    if (attempt < MAX_POLL_COUNT) {
      console.log(
        `[alias-sync] waiting deployment... (${attempt}/${MAX_POLL_COUNT}) sha=${githubSha ?? "latest"}`,
      );
      await sleep(POLL_INTERVAL_MS);
    }
  }

  throw new Error(
    `[alias-sync] ready production deployment not found. sha=${githubSha ?? "latest"}`,
  );
}

async function run() {
  const token = process.env.VERCEL_TOKEN ?? "";
  const aliasDomain = process.env.VERCEL_ALIAS_DOMAIN ?? DEFAULT_ALIAS_DOMAIN;
  const githubSha = process.env.GITHUB_SHA?.trim() || null;

  if (!token) {
    throw new Error("VERCEL_TOKEN is required.");
  }

  const localMeta = await readLocalProjectMeta();
  const projectId = process.env.VERCEL_PROJECT_ID ?? localMeta.projectId;
  const teamId = process.env.VERCEL_TEAM_ID ?? localMeta.teamId;

  if (!projectId) {
    throw new Error("VERCEL_PROJECT_ID is required (or provide .vercel/project.json).");
  }

  const deployment = await waitForDeployment({
    token,
    teamId,
    projectId,
    githubSha,
  });

  console.log(
    `[alias-sync] assigning ${aliasDomain} -> ${deployment.url} (${deployment.id})`,
  );

  // 배포가 준비되면 고정 URL 별칭을 최신 배포로 재지정한다.
  await fetchVercelJson(`/v2/deployments/${deployment.id}/aliases`, {
    token,
    method: "POST",
    body: { alias: aliasDomain },
    teamId,
  });

  console.log(`[alias-sync] done: https://${aliasDomain}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
