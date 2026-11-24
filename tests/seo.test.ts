import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { noindexHeaders, SITE_URL } from "@/lib/seo";

describe("search engine settings", () => {
  it("robots.txt lets crawlers in, keeps them out of /api/, and points at the sitemap", () => {
    const r = robots();
    expect(r.rules).toEqual({ userAgent: "*", allow: "/", disallow: "/api/" });
    expect(r.sitemap).toBe("https://transfer.finlitgarden.com/sitemap.xml");
  });

  it("the sitemap lists only the public planner", () => {
    expect(sitemap().map((e) => e.url)).toEqual([`${SITE_URL}/`]);
  });

  it("student plans (names in the title) get a noindex header instead of a robots.txt block", () => {
    const h = noindexHeaders();
    expect(h.map((x) => x.source)).toEqual(["/plan/:path*"]);
    expect(h[0].headers).toEqual([{ key: "X-Robots-Tag", value: "noindex, nofollow" }]);
    expect(JSON.stringify(robots().rules)).not.toContain("/plan");
  });
});
