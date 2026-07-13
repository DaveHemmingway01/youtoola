import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const root = process.cwd();
const brandDirectory = path.join(root, "public/brand");
const reviewDirectory = path.join(root, "docs/brand/reviews/favicon");
const sizes = [16, 32, 48, 64];
const sha256 = (buffer) =>
  createHash("sha256").update(buffer).digest("hex");
const asDataUrl = (buffer, mime = "image/png") =>
  `data:${mime};base64,${buffer.toString("base64")}`;

const source = await readFile(path.join(brandDirectory, "youtoola-symbol.png"));
const candidates = await Promise.all(
  sizes.map(async (size) => ({
    size,
    buffer: await readFile(
      path.join(brandDirectory, `favicon-${size}x${size}.png`),
    ),
  })),
);
const ico = await readFile(path.join(brandDirectory, "favicon.ico"));
const icoCount = ico.readUInt16LE(4);
const icoEntries = Array.from({ length: icoCount }, (_, index) => {
  const directoryOffset = 6 + index * 16;
  const size = ico[directoryOffset] || 256;
  const length = ico.readUInt32LE(directoryOffset + 8);
  const offset = ico.readUInt32LE(directoryOffset + 12);
  return { size, buffer: ico.subarray(offset, offset + length) };
});

await mkdir(reviewDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const utilityPage = await browser.newPage();
const sourceUrl = asDataUrl(source);
const candidateUrls = Object.fromEntries(
  candidates.map(({ size, buffer }) => [size, asDataUrl(buffer)]),
);

const screenshot = async ({ name, html, width, height }) => {
  const page = await browser.newPage({ viewport: { width, height } });
  try {
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() =>
      Promise.all([...document.images].map((image) => image.decode())),
    );
    await page.screenshot({ path: path.join(reviewDirectory, name) });
  } finally {
    await page.close();
  }
};

const base = `*{box-sizing:border-box}html,body{margin:0;font:14px Arial,sans-serif;color:#000A3F}img{display:block}`;
const image = (size, extra = "") =>
  `<img src="${candidateUrls[size]}" width="${size}" height="${size}" alt="Youtoola favicon ${size} pixels" ${extra}>`;

try {
  await screenshot({
    name: "native-size-contact-sheet.png",
    width: 1000,
    height: 360,
    html: `<style>${base}body{padding:24px;background:#E7E9EF}.row{display:flex;gap:14px;margin-bottom:18px}.cell{width:224px;height:145px;border:1px solid #C7CCD8;border-radius:12px;display:grid;place-items:center;position:relative}.light{background:#FFF}.dark{background:#000A3F;color:#FFF}.label{position:absolute;bottom:10px;font-weight:700}</style><div class="row">${sizes.map((size) => `<div class="cell light">${image(size)}<span class="label">${size}×${size} native</span></div>`).join("")}</div><div class="row">${sizes.map((size) => `<div class="cell dark">${image(size)}<span class="label">${size}×${size} native</span></div>`).join("")}</div>`,
  });

  await screenshot({
    name: "browser-tabs-light-dark.png",
    width: 1200,
    height: 420,
    html: `<style>${base}body{padding:38px;background:#D8DCE5}.browser{margin-bottom:30px;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px #0002}.bar{height:116px;padding:36px 30px 0;display:flex;gap:12px;align-items:end}.light{background:#EEF1F6}.dark{background:#000A3F}.tab{width:320px;height:64px;border-radius:14px 14px 0 0;display:flex;align-items:center;gap:12px;padding:0 18px;font-size:16px;font-weight:700}.light .tab{background:#FFF}.dark .tab{background:#121C52;color:#FFF}</style><div class="browser light"><div class="bar"><div class="tab">${image(16)}<span>Youtoola</span></div></div></div><div class="browser dark"><div class="bar"><div class="tab">${image(16)}<span>Youtoola</span></div></div></div>`,
  });

  await screenshot({
    name: "bookmarks-list.png",
    width: 920,
    height: 520,
    html: `<style>${base}body{padding:42px;background:#F5F7FB}.panel{width:720px;margin:auto;background:#FFF;border:1px solid #D6DCE8;border-radius:16px;padding:22px;box-shadow:0 12px 36px #0001}.title{font-size:18px;font-weight:700;margin-bottom:16px}.item{height:62px;display:flex;align-items:center;gap:14px;border-top:1px solid #E8EBF2}.item:first-of-type{border:0}.url{color:#667085;font-size:12px;margin-top:4px}</style><div class="panel"><div class="title">Bookmarks</div><div class="item">${image(16)}<div><strong>Youtoola</strong><div class="url">www.youtoola.com</div></div></div><div class="item">${image(32)}<div><strong>Youtoola — practical online tools</strong><div class="url">www.youtoola.com</div></div></div><div class="item">${image(48)}<div><strong>Youtoola shortcut</strong><div class="url">www.youtoola.com</div></div></div></div>`,
  });

  await screenshot({
    name: "browser-shortcut.png",
    width: 1000,
    height: 520,
    html: `<style>${base}body{display:grid;place-items:center;background:linear-gradient(145deg,#E9EDF5,#C9D0DE)}.grid{display:flex;gap:74px}.shortcut{width:150px;text-align:center;font-size:15px;font-weight:700}.icon{width:104px;height:104px;margin:0 auto 14px;display:grid;place-items:center;background:#FFF;border-radius:22px;box-shadow:0 8px 24px #0002}.dark .icon{background:#000A3F}.dark{color:#000A3F}</style><div class="grid"><div class="shortcut"><div class="icon">${image(48)}</div>Youtoola</div><div class="shortcut"><div class="icon">${image(64)}</div>Youtoola 64</div><div class="shortcut dark"><div class="icon">${image(64)}</div>Dark surface</div></div>`,
  });

  await screenshot({
    name: "compact-navigation.png",
    width: 1180,
    height: 360,
    html: `<style>${base}body{padding:38px;background:#E7E9EF}.nav{height:76px;background:#FFF;border-radius:14px;display:flex;align-items:center;padding:0 24px;gap:14px;box-shadow:0 8px 24px #0001}.nav.dark{margin-top:34px;background:#000A3F;color:#FFF}.brand{display:flex;align-items:center;gap:12px;font-size:20px;font-weight:700}.links{margin-left:auto;display:flex;gap:28px;font-weight:700}</style><nav class="nav"><div class="brand">${image(32)}Youtoola</div><div class="links"><span>Tools</span><span>Categories</span><span>Search</span></div></nav><nav class="nav dark"><div class="brand">${image(32)}Youtoola</div><div class="links"><span>Tools</span><span>Categories</span><span>Search</span></div></nav>`,
  });

  await screenshot({
    name: "png-and-ico-comparison.png",
    width: 1120,
    height: 620,
    html: `<style>${base}body{padding:34px;background:#F5F7FB}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}.panel{background:#FFF;border:1px solid #D6DCE8;border-radius:16px;padding:26px}.title{font-size:18px;font-weight:700;margin-bottom:24px}.row{height:92px;display:grid;grid-template-columns:90px 1fr;align-items:center;border-top:1px solid #E8EBF2}.row:first-of-type{border:0}.pair{display:flex;align-items:center;gap:18px}</style><div class="grid"><section class="panel"><div class="title">Standalone PNGs</div>${candidates.map(({ size }) => `<div class="row"><strong>${size}×${size}</strong>${image(size)}</div>`).join("")}</section><section class="panel"><div class="title">PNG entries decoded from ICO</div>${icoEntries.map(({ size, buffer }) => `<div class="row"><strong>${size}×${size}</strong><img src="${asDataUrl(buffer)}" width="${size}" height="${size}" alt="ICO ${size} pixel entry"></div>`).join("")}</section></div>`,
  });

  await screenshot({
    name: "magnified-diagnostics.png",
    width: 1180,
    height: 660,
    html: `<style>${base}body{padding:34px;background:#1D2438;color:#FFF}.note{font-weight:700;margin-bottom:24px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}.panel{height:530px;border:1px solid #526080;border-radius:14px;display:grid;place-items:center;position:relative}.light{background:#FFF}.dark{background:#000A3F}.pixel{width:384px;height:384px;image-rendering:pixelated}.label{position:absolute;bottom:20px;font-weight:700}.light .label{color:#000A3F}</style><div class="note">Diagnostic only — 16×16 source pixels enlarged to expose clipping, alpha fringe or malformed edges.</div><div class="grid"><div class="panel light"><img class="pixel" src="${candidateUrls[16]}" alt="Magnified favicon on white"><span class="label">White surface — 24× magnification</span></div><div class="panel dark"><img class="pixel" src="${candidateUrls[16]}" alt="Magnified favicon on dark navy"><span class="label">Dark navy — 24× magnification</span></div></div>`,
  });

  const metrics = await utilityPage.evaluate(
    async ({ sourceUrl, candidates: urls }) => {
      const measure = async (source) => {
        const image = new Image();
        image.src = source;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Canvas 2D context is unavailable.");
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        ).data;
        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = -1;
        let maxY = -1;
        for (let index = 0; index < canvas.width * canvas.height; index += 1) {
          if (pixels[index * 4 + 3] > 0) {
            const x = index % canvas.width;
            const y = Math.floor(index / canvas.width);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
        return {
          dimensions: [canvas.width, canvas.height],
          bounds: [minX, minY, maxX, maxY],
          padding: [
            minX,
            minY,
            canvas.width - 1 - maxX,
            canvas.height - 1 - maxY,
          ],
        };
      };
      const result = { source: await measure(sourceUrl), candidates: {} };
      for (const [size, url] of Object.entries(urls)) {
        result.candidates[size] = await measure(url);
      }
      return result;
    },
    { sourceUrl, candidates: candidateUrls },
  );

  const dimensionsReport = [
    "# Favicon Dimensions and Padding",
    "",
    "All candidates use the complete approved 2048×2048 canvas and are independently resampled from that master. No crop, repositioning, geometry change, sharpening, or cascading resize is used.",
    "",
    `Source master SHA-256: \`${sha256(source)}\``,
    "",
    `Source alpha bounds: \`${metrics.source.bounds.join(", ")}\`; transparent padding left/top/right/bottom: \`${metrics.source.padding.join(", ")}\` pixels.`,
    "",
    "| Candidate | Alpha bounds | Transparent padding L/T/R/B | SHA-256 |",
    "| --- | --- | --- | --- |",
    ...candidates.map(({ size, buffer }) => {
      const value = metrics.candidates[size];
      return `| ${size}×${size} | ${value.bounds.join(", ")} | ${value.padding.join(", ")} | \`${sha256(buffer)}\` |`;
    }),
    "",
    `ICO SHA-256: \`${sha256(ico)}\``,
    "",
  ].join("\n");
  await writeFile(
    path.join(reviewDirectory, "dimensions-and-padding-report.md"),
    dimensionsReport,
    "utf8",
  );
} finally {
  await utilityPage.close();
  await browser.close();
}

console.log(`Rendered favicon reviews in ${path.relative(root, reviewDirectory)}`);
