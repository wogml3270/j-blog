import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 동적 페이지(/blog, /projects) 재진입 시 매번 loading 경계가 뜨는 빈도를 줄인다.
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
  pageExtensions: ["ts", "tsx", "md"],
  images: {
    // 원격 이미지 재요청을 줄이기 위해 최적화 이미지 캐시 TTL을 확장한다.
    minimumCacheTTL: 86400,
    // 관리자 외부 썸네일 + 소셜 로그인 아바타 도메인을 함께 허용한다.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "k.kakaocdn.net",
      },
      {
        protocol: "https",
        hostname: "k.kakaocdn.net",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
