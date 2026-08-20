import sharp from "sharp";
import { writeFileSync, statSync } from "fs";

const src = "public/favicon.png";

const targets = [
  { out: "public/favicon-32.png", size: 32 },
  { out: "public/apple-touch-icon.png", size: 180 },
];

for (const t of targets) {
  const buf = await sharp(src)
    .resize(t.size, t.size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  writeFileSync(t.out, buf);
  console.log(t.out, statSync(t.out).size, "bytes");
}
