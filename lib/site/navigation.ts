export type NavigationKey = "home" | "about" | "projects" | "blog";

export type NavigationItem = {
  href: string;
  key: NavigationKey;
};

export const SITE_NAV_ITEMS: NavigationItem[] = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/projects", key: "projects" },
  { href: "/blog", key: "blog" },
];
