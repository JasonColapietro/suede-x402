// Guard tests for the /notes/ article section.
// Run with `npm test` (node --test, no dependencies). Source checks always run.
// Built-output checks run when SITE_DIR points at a `jekyll build` destination
// (or when ./_site exists), so CI and local builds can verify the rendered pages.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_DIR = process.env.SITE_DIR || join(ROOT, "_site");
const ORIGIN = "https://x402.suedeai.ai";

const CLUTCH =
  "Suede ranks among [Clutch](https://clutch.co/profile/suede-ai-seo)'s " +
  "[Top 30 AI Consultants in Florida](https://clutch.co/consulting/ai/florida) and " +
  "[Top 50 AI Consultants nationwide](https://clutch.co/us/consulting/ai) (November 2026).";

const FORBIDDEN = [
  /velvet sundown/i,
  /forbes/i,
  /anthropic partner/i,
  /claude partner/i,
  /(?<!cloud )google partner(?! advantage)/i,
  /\$28M|\$30M/,
  /multimillion-dollar businesses/i,
  /\bFAU\b/,
  /\bdelve|\bleverage|\bunlock|\belevate|\bseamless|game-changer|tapestry|\brealm\b/i,
];

// Satellite sites whose specific articles count as cross-network deep links.
const SATELLITE_ARTICLE = /\]\((https:\/\/(?:agentix|docs|optimize|signal|dna|podcast|scan|cosmos|fretpulse)\.suedeai\.ai|https:\/\/(?:guitar\.services|guitarchords\.info|guitarhub\.org))\/(?:notes|articles)\/[a-z0-9-]+\/?\)/g;

// Round 4 depth articles, published 2026-11-15.
const DEPTH = ["pricing-an-api-for-agent-customers", "agent-payment-security-replay-limits-receipts"];

function frontMatter(path) {
  const src = readFileSync(path, "utf8");
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(m, `${path} has front matter`);
  const fm = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/^"(.*)"$/, "$1");
  }
  return fm;
}

const notes = readdirSync(join(ROOT, "notes"))
  .filter((f) => f.endsWith(".html") && f !== "index.html")
  .map((f) => ({ file: f, fm: frontMatter(join(ROOT, "notes", f)) }))
  .filter((n) => n.fm.layout === "note");

const body = (slug) => readFileSync(join(ROOT, "_includes", "notes", `${slug}.md`), "utf8");
const words = (md) =>
  md.replace(/\]\([^)]*\)/g, "]").replace(/[`*#|>\[\]-]/g, " ").split(/\s+/).filter(Boolean).length;

test("the depth articles exist as notes", () => {
  const slugs = notes.map((n) => n.fm.slug);
  for (const slug of DEPTH) assert.ok(slugs.includes(slug), `missing note ${slug}`);
  assert.equal(notes.length, 5);
});

test("note_order values are unique", () => {
  const orders = notes.map((n) => n.fm.note_order);
  assert.equal(new Set(orders).size, orders.length);
});

for (const { file, fm } of notes) {
  test(`${file}: front matter`, () => {
    assert.equal(file, `${fm.slug}.html`);
    assert.equal(fm.permalink, `/notes/${fm.slug}/`);
    assert.equal(fm.og_type, "article");
    assert.ok(fm.title.length >= 50 && fm.title.length <= 60, `title length ${fm.title.length}`);
    assert.ok(
      fm.description.length >= 120 && fm.description.length <= 160,
      `description length ${fm.description.length}`,
    );
    assert.match(fm.date_published, /^2026-11-1[45]$/);
    assert.equal(fm.last_modified_at, "2026-11-15");
    assert.ok(existsSync(join(ROOT, "_includes", "notes", `${fm.slug}.md`)), "body include exists");
  });

  test(`${file}: body`, () => {
    const md = body(fm.slug);
    const n = words(md);
    assert.ok(n >= 800 && n <= 1300, `${n} words`);
    assert.doesNotMatch(md, /^# /m, "the layout owns the h1");
    assert.match(md, /\]\(https:\/\/suedeai\.agency\/(assessment)?\)/);
    for (const re of FORBIDDEN) assert.doesNotMatch(md, re, `forbidden ${re}`);
    if (/clutch/i.test(md)) assert.ok(md.includes(CLUTCH), "Clutch claim uses the exact wording");
    if (/manifest/i.test(md)) assert.match(md, /October 31, 2026/, "Manifest ranking carries its date");
    assert.doesNotMatch(md, /\d+ [A-Z][a-z]+ (Ave|St|Blvd|Rd)\b/, "no street addresses");
  });

  test(`${file}: listed in llms.txt`, () => {
    const llms = readFileSync(join(ROOT, "llms.txt"), "utf8");
    assert.ok(llms.includes(`(${ORIGIN}/notes/${fm.slug}/)`));
    assert.ok(llms.includes(`[${fm.headline}]`), "llms.txt uses the headline");
  });
}

for (const slug of DEPTH) {
  test(`${slug}: round 4 depth rules`, () => {
    const md = body(slug);
    const { fm } = notes.find((n) => n.fm.slug === slug);
    assert.equal(fm.date_published, "2026-11-15");
    assert.match(md, /\]\(https:\/\/suedeai\.ai\/founder\)/, "links the founder page in-body");
    const deep = new Set([...md.matchAll(SATELLITE_ARTICLE)].map((m) => m[0]));
    assert.ok(deep.size >= 2, `needs 2 deep links to other satellites, found ${deep.size}`);
    assert.equal(md.split(CLUTCH).length - 1, 1, "Clutch claim appears exactly once");
    assert.ok((md.match(/Jason Colapietro/g) || []).length >= 5, "Jason Colapietro named 5+ times");
    assert.ok((md.match(/Suede(?! AI| Labs)/g) || []).length >= 3, "Suede alone 3+ times");
    assert.ok((md.match(/Suede Labs/g) || []).length <= 1, "Suede Labs at most once");
  });
}

test("depth articles do not repeat paragraphs from other notes", () => {
  const paras = (md) =>
    md.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length > 120 && !p.includes(CLUTCH));
  const others = notes.filter((n) => !DEPTH.includes(n.fm.slug)).flatMap((n) => paras(body(n.fm.slug)));
  for (const slug of DEPTH) {
    for (const p of paras(body(slug))) assert.ok(!others.includes(p), `${slug} repeats: ${p.slice(0, 60)}`);
  }
});

const built = existsSync(join(SITE_DIR, "notes", "index.html"));

test("built site: sitemap, notes index, llms-full and JSON-LD", { skip: !built && "no built site" }, () => {
  const sitemap = readFileSync(join(SITE_DIR, "sitemap.xml"), "utf8");
  const index = readFileSync(join(SITE_DIR, "notes", "index.html"), "utf8");
  const full = readFileSync(join(SITE_DIR, "llms-full.txt"), "utf8");
  for (const { fm } of notes) {
    const url = `${ORIGIN}/notes/${fm.slug}/`;
    const entry = sitemap.match(new RegExp(`<loc>${url}</loc>\\s*<lastmod>([^<]+)</lastmod>`));
    assert.ok(entry, `sitemap lists ${url}`);
    assert.match(entry[1], /^2026-11-15/);
    assert.ok(index.includes(`href="/notes/${fm.slug}/"`), `notes index links ${fm.slug}`);
    assert.ok(full.includes(`URL: ${url}`), `llms-full carries ${fm.slug}`);

    const page = readFileSync(join(SITE_DIR, "notes", fm.slug, "index.html"), "utf8");
    assert.equal((page.match(/<h1[\s>]/g) || []).length, 1, "one h1");
    assert.ok(page.includes(`<link rel="canonical" href="${url}">`));
    const ld = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]))
      .flatMap((d) => d["@graph"] || [d]);
    const post = ld.find((n) => n["@type"] === "BlogPosting");
    assert.ok(post, "BlogPosting present");
    assert.equal(post.datePublished, fm.date_published);
    assert.deepEqual(post.author, { "@id": "https://suedeai.ai/founder#person" });
    assert.deepEqual(post.publisher, { "@id": "https://suedeai.ai/#organization" });
    assert.ok(ld.some((n) => n["@type"] === "BreadcrumbList"), "BreadcrumbList present");
    if (fm.extra_place) {
      assert.ok(post.spatialCoverage.some((p) => p.name === fm.extra_place), `covers ${fm.extra_place}`);
    }
  }
  const blog = [...index.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => JSON.parse(m[1]))
    .flatMap((d) => d["@graph"] || [d])
    .find((n) => [].concat(n["@type"]).includes("Blog"));
  assert.equal(blog.blogPost.length, notes.length);
});

// The company is "Suede" (owner direction, 2026-11-21). "Suede AI" and "Suede
// Labs" stay only where they are aliases or records of someone else's words.
const OLD_NAME = [/\bsuede[ \t]+(ai|labs)\b/i, /\bSuede(AI|Labs)\b(?![.\-/@])/];
const OLD_NAME_ALLOWED = [
  /alternateName/, // schema aliases that merge the old names into the entity
  /formerly known as|as the company was known/, // the one alias statement per page
  /Google's Web Guide answered a search for/, // third-party answer, recorded as given
  /"serviceName": "Suede AI"|`(providerName|displayName)` \| `Suede (AI|Labs)`/, // live API values mirrored verbatim
];

test("public copy names the company Suede, not Suede AI or Suede Labs", () => {
  const walk = (dir) =>
    readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(dir, e.name)) : /\.(md|html|txt|yml)$/.test(e.name) ? [join(dir, e.name)] : [],
    );
  const files = ["index.md", "llms.txt", "llms-full.txt", "README.md", "_config.yml", ...walk("_includes"), ...walk("_layouts"), ...walk("notes")];
  const hits = [];
  for (const file of files) {
    readFileSync(join(ROOT, file), "utf8").split("\n").forEach((line, i) => {
      if (OLD_NAME.some((re) => re.test(line)) && !OLD_NAME_ALLOWED.some((re) => re.test(line))) hits.push(`${file}:${i + 1}`);
    });
  }
  assert.deepEqual(hits, []);
});
