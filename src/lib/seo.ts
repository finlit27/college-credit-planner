// Search engine settings for transfer.finlitgarden.com: robots.txt, sitemap.xml and noindex headers.
//
// Only the planner itself (/) is public. A /plan/<id> page is one student's plan, with the student's
// name in its title, reached by a share link; /plan/preview/* are internal fixtures. All of /plan/
// gets an X-Robots-Tag: noindex header. It is deliberately NOT disallowed in robots.txt: Google
// can't see a noindex on a page it is told not to fetch, and can still list the bare URL.
export const SITE_URL = "https://transfer.finlitgarden.com";

export const PUBLIC_PATHS = ["/"];

// Next.js header "source" patterns (https://nextjs.org/docs/app/api-reference/config/next-config-js/headers)
export const NOINDEX_SOURCES = ["/plan/:path*"];

export function noindexHeaders() {
  return NOINDEX_SOURCES.map((source) => ({
    source,
    headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
  }));
}
