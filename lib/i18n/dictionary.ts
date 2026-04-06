import type { Locale } from "@/lib/i18n/config";
import type { NavigationKey } from "@/lib/site/navigation";
import enAbout from "@/locales/en/about.json";
import enBlog from "@/locales/en/blog.json";
import enFooter from "@/locales/en/footer.json";
import enHeader from "@/locales/en/header.json";
import enMain from "@/locales/en/main.json";
import enNotFound from "@/locales/en/not-found.json";
import enProjects from "@/locales/en/projects.json";
import enTheme from "@/locales/en/theme.json";
import jaAbout from "@/locales/ja/about.json";
import jaBlog from "@/locales/ja/blog.json";
import jaFooter from "@/locales/ja/footer.json";
import jaHeader from "@/locales/ja/header.json";
import jaMain from "@/locales/ja/main.json";
import jaNotFound from "@/locales/ja/not-found.json";
import jaProjects from "@/locales/ja/projects.json";
import jaTheme from "@/locales/ja/theme.json";
import koAbout from "@/locales/ko/about.json";
import koBlog from "@/locales/ko/blog.json";
import koFooter from "@/locales/ko/footer.json";
import koHeader from "@/locales/ko/header.json";
import koMain from "@/locales/ko/main.json";
import koNotFound from "@/locales/ko/not-found.json";
import koProjects from "@/locales/ko/projects.json";
import koTheme from "@/locales/ko/theme.json";

type MainDictionary = typeof koMain;
type HeaderDictionary = typeof koHeader;
type FooterDictionary = typeof koFooter;
type BlogDictionary = typeof koBlog;
type AboutDictionary = typeof koAbout;
type ProjectsDictionary = typeof koProjects;
type NotFoundDictionary = typeof koNotFound;
type ThemeDictionary = typeof koTheme;

export type Dictionary = {
  nav: Record<NavigationKey, string>;
  header: HeaderDictionary;
  language: MainDictionary["language"];
  theme: ThemeDictionary;
  footer: FooterDictionary;
  common: MainDictionary["common"];
  home: MainDictionary["home"];
  about: AboutDictionary;
  blog: BlogDictionary;
  projects: ProjectsDictionary;
  notFound: NotFoundDictionary;
};

const dictionaries = {
  ko: {
    main: koMain,
    header: koHeader,
    footer: koFooter,
    blog: koBlog,
    about: koAbout,
    projects: koProjects,
    notFound: koNotFound,
    theme: koTheme,
  },
  en: {
    main: enMain,
    header: enHeader,
    footer: enFooter,
    blog: enBlog,
    about: enAbout,
    projects: enProjects,
    notFound: enNotFound,
    theme: enTheme,
  },
  ja: {
    main: jaMain,
    header: jaHeader,
    footer: jaFooter,
    blog: jaBlog,
    about: jaAbout,
    projects: jaProjects,
    notFound: jaNotFound,
    theme: jaTheme,
  },
} satisfies Record<
  Locale,
  {
    main: MainDictionary;
    header: HeaderDictionary;
    footer: FooterDictionary;
    blog: BlogDictionary;
    about: AboutDictionary;
    projects: ProjectsDictionary;
    notFound: NotFoundDictionary;
    theme: ThemeDictionary;
  }
>;

export function getDictionary(locale: Locale): Dictionary {
  const source = dictionaries[locale];

  return {
    nav: source.main.nav as Record<NavigationKey, string>,
    header: source.header,
    language: source.main.language,
    theme: source.theme,
    footer: source.footer,
    common: source.main.common,
    home: source.main.home,
    about: source.about,
    blog: source.blog,
    projects: source.projects,
    notFound: source.notFound,
  };
}
