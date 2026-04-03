export type NavigationItem = {
  href: string;
  label: string;
};

export const SITE_NAV_ITEMS: NavigationItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
];
