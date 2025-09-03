
import { readdirSync, statSync, existsSync, mkdirSync } from "fs";
import { join, extname, parse, basename } from "path";
import sharp from "sharp";

const INPUT_DIR = "public";
const VALID_EXT = [".jpg", ".jpeg", ".png", ".gif"];

async function convertToWebp() {
  const folders = readdirSync(INPUT_DIR);

  for (const folder of folders) {
    const folderPath = join(INPUT_DIR, folder);

    if (!statSync(folderPath).isDirectory()) continue;

    const outDir = join(INPUT_DIR, `${folder}-webp`);
    if (!existsSync(outDir)) {
      mkdirSync(outDir);
    }

    const files = readdirSync(folderPath);

    for (const file of files) {
      const ext = extname(file).toLowerCase();
      if (!VALID_EXT.includes(ext)) continue;

      const inputFile = join(folderPath, file);
      const outputFile = join(outDir, `${parse(file).name}.webp`);      
      if (existsSync(outputFile)) {
        const inputStat = statSync(inputFile);
        const outputStat = statSync(outputFile);

        if (outputStat.mtimeMs > inputStat.mtimeMs) {
          console.log(`⚡ Skipping (up-to-date): ${file}`);
          continue;
        }
      }

      await sharp(inputFile)
        .webp({ quality: 80 })
        .toFile(outputFile);

      console.log(`✅ Converted: ${file} -> ${basename(outputFile)}`);
    }
  }
}

convertToWebp().catch(console.error);
