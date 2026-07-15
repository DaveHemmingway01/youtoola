import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

import { OG_DEFAULT_SPEC } from "./generate-og-default.mjs";

const root = process.cwd();
const reviewDirectory = path.join(root, "docs/brand/reviews/og-default");
const candidate = await readFile(path.join(root, "public/brand/og-default.png"));
const candidateUrl = `data:image/png;base64,${candidate.toString("base64")}`;
const sha256 = createHash("sha256").update(candidate).digest("hex");

await mkdir(reviewDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const screenshot = async (name, width, height, body, styles = "") => {
  const page = await browser.newPage({ viewport: { height, width } });
  try {
    await page.emulateMedia({ colorScheme: "light" });
    await page.setContent(`<style>*{box-sizing:border-box}html{color-scheme:only light}html,body{margin:0;font:16px Arial,sans-serif}img{forced-color-adjust:none}${styles}</style>${body}`);
    await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode())));
    await page.screenshot({ path: path.join(reviewDirectory, name) });
  } finally {
    await page.close();
  }
};

try {
  const card = `<article class="card"><img src="${candidateUrl}" alt="Youtoola default social preview"><div class="meta"><b>Youtoola</b><span>www.youtoola.com</span><p>Free, practical online tools for everyday calculations, decisions and tasks.</p></div></article>`;
  await screenshot(
    "social-preview-light.png",
    920,
    760,
    card,
    "body{display:grid;place-items:center;background:#F3F5F9;color:#000A3F}.card{width:720px;background:#FFF;border:1px solid #D8DDEA;border-radius:18px;overflow:hidden;box-shadow:0 14px 40px #0002}.card>img{display:block;width:100%;height:auto}.meta{padding:22px}.meta span{display:block;color:#63708A;font-size:14px;margin-top:4px}.meta p{margin:14px 0 0;line-height:1.45}",
  );
  await screenshot(
    "social-preview-dark.png",
    920,
    760,
    card,
    "body{display:grid;place-items:center;background:#080D20;color:#F8FAFC}.card{width:720px;background:#121A35;border:1px solid #2B3555;border-radius:18px;overflow:hidden;box-shadow:0 14px 40px #0008}.card>img{display:block;width:100%;height:auto}.meta{padding:22px}.meta span{display:block;color:#AEB8CE;font-size:14px;margin-top:4px}.meta p{margin:14px 0 0;line-height:1.45}",
  );
  await screenshot(
    "crop-and-safe-area-diagnostics.png",
    1500,
    900,
    `<div class="canvas"><img src="${candidateUrl}" alt=""><div class="safe"></div><div class="square"></div></div><aside><b>Yellow:</b> 80×60px social safe margin<br><b>Pink:</b> centred square crop diagnostic</aside>`,
    `body{padding:70px;background:#E9EDF5;color:#000A3F}.canvas{position:relative;width:1200px;height:630px;box-shadow:0 16px 44px #0003}.canvas img{display:block;width:1200px;height:630px}.safe{position:absolute;inset:${OG_DEFAULT_SPEC.safeMargin.vertical}px ${OG_DEFAULT_SPEC.safeMargin.horizontal}px;border:4px solid #FFD43B}.square{position:absolute;width:630px;height:630px;left:285px;top:0;border:4px solid #FF4D8D}aside{margin-top:28px;line-height:1.8}`,
  );
  await screenshot(
    "native-and-thumbnail-contact-sheet.png",
    1420,
    920,
    `<h1>Default social candidate</h1><div class="native"><img src="${candidateUrl}" alt="Youtoola default social preview"></div><div class="sizes">${[600, 300, 150].map((width) => `<figure><img src="${candidateUrl}" width="${width}"><figcaption>${width}×${Math.round(width * 630 / 1200)}</figcaption></figure>`).join("")}</div>`,
    "body{padding:40px;background:#F5F7FB;color:#000A3F}h1{font-size:24px}.native img{display:block;width:1200px;height:630px}.sizes{display:flex;gap:28px;align-items:start;margin-top:30px}.sizes figure{margin:0}.sizes img{display:block;height:auto}.sizes figcaption{margin-top:8px;font-weight:700}",
  );
} finally {
  await browser.close();
}

await writeFile(
  path.join(reviewDirectory, "candidate-summary.md"),
  [
    "# Default Open Graph Candidate Summary",
    "",
    `- Dimensions: ${OG_DEFAULT_SPEC.width}×${OG_DEFAULT_SPEC.height}`,
    `- Background: ${OG_DEFAULT_SPEC.background}`,
    `- Copy: ${OG_DEFAULT_SPEC.tagline}`,
    `- Safe margin: ${OG_DEFAULT_SPEC.safeMargin.horizontal}px horizontal, ${OG_DEFAULT_SPEC.safeMargin.vertical}px vertical`,
    `- Candidate SHA-256: \`${sha256}\``,
    "- The frozen primary logo is composited unchanged on a soft-white panel so its approved dark wordmark remains legible on the approved navy canvas.",
    "",
  ].join("\n"),
  "utf8",
);

console.log(`Rendered OG review files in ${path.relative(root, reviewDirectory)}`);
