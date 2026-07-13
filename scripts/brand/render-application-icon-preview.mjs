import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const root = process.cwd();
const brandDirectory = path.join(root, "public/brand");
const reviewDirectory = path.join(
  root,
  "docs/brand/reviews/application-icons",
);
const source = await readFile(path.join(brandDirectory, "youtoola-symbol.png"));
const assets = await Promise.all(
  [
    ["apple-touch-icon.png", 180, 0.75],
    ["icon-192.png", 192, 23 / 32],
    ["icon-512.png", 512, 23 / 32],
  ].map(async ([name, size, scale]) => ({
    name,
    size,
    scale,
    buffer: await readFile(path.join(brandDirectory, name)),
  })),
);
const sha256 = (buffer) =>
  createHash("sha256").update(buffer).digest("hex");
const dataUrl = (buffer) => `data:image/png;base64,${buffer.toString("base64")}`;
const urls = Object.fromEntries(assets.map(({ size, buffer }) => [size, dataUrl(buffer)]));
const sourceUrl = dataUrl(source);

await mkdir(reviewDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const screenshot = async (name, width, height, body, styles = "") => {
  const page = await browser.newPage({ viewport: { width, height } });
  try {
    await page.setContent(
      `<style>*{box-sizing:border-box}html,body{margin:0;font:14px Arial,sans-serif;color:#000A3F}img{display:block}${styles}</style>${body}`,
    );
    await page.evaluate(() =>
      Promise.all([...document.images].map((image) => image.decode())),
    );
    await page.screenshot({ path: path.join(reviewDirectory, name) });
  } finally {
    await page.close();
  }
};
const icon = (size, width = size) =>
  `<img src="${urls[size]}" width="${width}" height="${width}" alt="Youtoola application icon">`;
const contextStyles = `body{padding:38px;background:#E6E9F0}.panel{background:#FFF;border-radius:22px;padding:28px;box-shadow:0 12px 34px #0002}.title{font-size:18px;font-weight:700;margin-bottom:22px}.row{display:flex;align-items:center;gap:24px}.label{font-weight:700;margin-top:10px;text-align:center}`;

try {
  await screenshot(
    "direction-a-versus-direction-b.png",
    1100,
    560,
    `<div class="grid"><section><h2>Direction A — diagnostic only</h2><div class="tile transparent"><img src="${sourceUrl}" width="256" height="256"></div></section><section><h2>Direction B — approved candidate</h2><div class="tile">${icon(512, 256)}</div></section></div>`,
    `body{padding:40px;background:#E8EBF2}.grid{display:grid;grid-template-columns:1fr 1fr;gap:32px}.tile{height:360px;background:#FFF;border-radius:20px;display:grid;place-items:center}.transparent{background-color:#FFF;background-image:linear-gradient(45deg,#E7E9EF 25%,transparent 25%),linear-gradient(-45deg,#E7E9EF 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#E7E9EF 75%),linear-gradient(-45deg,transparent 75%,#E7E9EF 75%);background-size:24px 24px;background-position:0 0,0 12px,12px -12px,-12px 0}h2{font-size:18px}`,
  );

  const homeScreen = (platform, dark) => `<div class="phone ${dark ? "dark" : "light"}"><div class="status">09:41</div><div class="apps"><div class="app"><div class="mask ${platform}">${icon(platform === "ios" ? 180 : 192, 74)}</div><b>Youtoola</b></div><div class="placeholder"></div><div class="placeholder"></div></div></div>`;
  for (const [name, platform, dark] of [
    ["ios-home-screen-light.png", "ios", false],
    ["ios-home-screen-dark.png", "ios", true],
    ["android-home-screen-light.png", "android", false],
    ["android-home-screen-dark.png", "android", true],
  ]) {
    await screenshot(
      name,
      720,
      720,
      homeScreen(platform, dark),
      `body{display:grid;place-items:center;background:${dark ? "#111728" : "#E8EEF7"}}.phone{width:340px;height:640px;border:10px solid #111;border-radius:48px;padding:42px 24px;box-shadow:0 20px 50px #0004}.light{background:linear-gradient(145deg,#DDEBFF,#FFF);color:#101828}.dark{background:linear-gradient(145deg,#172044,#050918);color:#FFF}.status{font-weight:700;margin-bottom:55px}.apps{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.app{text-align:center;font-size:12px}.mask{width:74px;height:74px;margin:0 auto 8px;overflow:hidden}.ios{border-radius:17px}.android{border-radius:50%}.placeholder{width:74px;height:74px;border-radius:18px;background:#8DA0BC88}`,
    );
  }

  await screenshot(
    "browser-install-prompt.png",
    900,
    460,
    `<div class="panel"><div class="row">${icon(192, 86)}<div><div class="title">Install Youtoola</div><p>Quick access to practical online tools.</p></div></div><div class="buttons"><button>Cancel</button><button class="primary">Install</button></div></div>`,
    `${contextStyles}body{display:grid;place-items:center}.panel{width:620px}.buttons{text-align:right;margin-top:28px}button{padding:11px 22px;border:0;border-radius:9px;margin-left:10px}.primary{background:#000A3F;color:#FFF}`,
  );
  await screenshot(
    "mobile-bookmark.png",
    760,
    480,
    `<div class="panel"><div class="title">Add bookmark</div><div class="row">${icon(180, 68)}<div><b>Youtoola</b><p>https://www.youtoola.com</p></div></div></div>`,
    `${contextStyles}body{display:grid;place-items:center}.panel{width:560px}`,
  );
  await screenshot(
    "launcher-grid.png",
    1000,
    620,
    `<div class="grid">${["Mail", "Maps", "Youtoola", "Camera", "Notes", "Files", "Music", "Settings"].map((label, index) => `<div class="app">${index === 2 ? `<div class="launch">${icon(192, 92)}</div>` : '<div class="placeholder"></div>'}<b>${label}</b></div>`).join("")}</div>`,
    `body{padding:70px;background:linear-gradient(150deg,#DCEAFF,#AAB9D4)}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:48px}.app{text-align:center}.launch,.placeholder{width:92px;height:92px;margin:0 auto 10px;border-radius:23px;overflow:hidden}.placeholder{background:#FFF9;box-shadow:0 5px 14px #0002}`,
  );

  const maskPreview = async (name, radius) =>
    screenshot(
      name,
      820,
      480,
      `<div class="panel"><div class="masked">${icon(512, 250)}</div><div><div class="title">Common launcher mask</div><p>The production PNG remains square. This crop is review-only.</p></div></div>`,
      `${contextStyles}body{display:grid;place-items:center}.panel{display:flex;align-items:center;gap:40px}.masked{width:250px;height:250px;overflow:hidden;border-radius:${radius};box-shadow:0 10px 28px #0003}`,
    );
  await maskPreview("circular-mask.png", "50%");
  await maskPreview("rounded-square-mask.png", "22%");
  await maskPreview("squircle-mask.png", "34%");

  await screenshot(
    "native-size-contact-sheet.png",
    1180,
    620,
    `<h2>Native-size candidates</h2><div class="row native">${assets.map(({ size }) => `<div class="cell">${icon(size)}<b>${size}×${size}</b></div>`).join("")}</div><h2>Typical displayed sizes</h2><div class="row">${assets.map(({ size }) => `<div class="cell">${icon(size, size === 512 ? 96 : 72)}<b>${size === 180 ? "Apple" : "PWA"}</b></div>`).join("")}</div>`,
    `body{padding:32px;background:#E8EBF2}.row{display:flex;gap:28px;align-items:end}.cell{background:#FFF;border-radius:16px;padding:18px;display:grid;gap:12px;place-items:center}.native{height:550px;align-items:start}.native .cell:last-child{transform:scale(.72);transform-origin:top left}h2{margin:0 0 18px}`,
  );
  await screenshot(
    "safe-area-overlay.png",
    1120,
    580,
    `<div class="grid">${assets.map(({ name, size }) => `<div class="cell"><div class="overlay">${icon(size, 280)}<div class="safe ${size === 180 ? "apple" : "android"}"></div><div class="circle"></div></div><b>${name}</b></div>`).join("")}</div>`,
    `body{padding:36px;background:#E8EBF2}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.cell{background:#FFF;border-radius:18px;padding:22px;text-align:center}.overlay{width:280px;height:280px;position:relative;margin-bottom:15px}.safe,.circle{position:absolute;inset:12.5%;border:3px solid #FFCB05}.android{inset:19.44%}.circle{border-color:#FF4D6D;border-radius:50%;inset:10%}.overlay img{position:absolute}`,
  );

  const metricsPage = await browser.newPage();
  const metrics = await metricsPage.evaluate(
    async ({ items, background }) => {
      const results = [];
      for (const item of items) {
        const image = new Image(); image.src = item.url; await image.decode();
        const canvas = document.createElement("canvas"); canvas.width = item.size; canvas.height = item.size;
        const context = canvas.getContext("2d", { willReadFrequently: true }); context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, item.size, item.size).data;
        let minX=item.size,minY=item.size,maxX=-1,maxY=-1,maxRadius=0;
        for(let i=0;i<item.size*item.size;i++){const o=i*4,x=i%item.size,y=Math.floor(i/item.size);if(pixels[o]!==background[0]||pixels[o+1]!==background[1]||pixels[o+2]!==background[2]){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);maxRadius=Math.max(maxRadius,Math.hypot(x-(item.size-1)/2,y-(item.size-1)/2));}}
        results.push({...item,bounds:[minX,minY,maxX,maxY],radial:maxRadius/item.size*100});
      }
      return results;
    },
    { items: assets.map(({name,size,scale})=>({name,size,scale,url:urls[size]})), background:[0,10,63] },
  );
  await metricsPage.close();
  await writeFile(
    path.join(reviewDirectory, "dimensions-and-safe-area-report.md"),
    [
      "# Application Icon Dimensions and Safe Area",
      "",
      `Source master SHA-256: \`${sha256(source)}\``,
      "",
      "| Candidate | Scale | Symbol contribution bounds | Maximum radial extent | SHA-256 |",
      "| --- | ---: | --- | ---: | --- |",
      ...metrics.map((item) => `| ${item.name} | ${(item.scale*100).toFixed(3)}% | ${item.bounds.join(", ")} | ${item.radial.toFixed(2)}% | \`${sha256(assets.find(({name})=>name===item.name).buffer)}\` |`),
      "",
      "Yellow rectangles show the approved placement scale; red circles show the conservative 40% radial maskable safe zone. These overlays are diagnostic only.",
      "",
    ].join("\n"),
  );
} finally {
  await browser.close();
}

console.log(`Rendered application-icon reviews in ${path.relative(root, reviewDirectory)}`);
