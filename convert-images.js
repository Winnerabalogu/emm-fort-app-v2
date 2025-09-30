// convert-images.js
import { readdirSync, statSync, existsSync, mkdirSync } from "fs";
import { join, extname, parse, basename } from "path";
import sharp from "sharp";

const INPUT_DIR = "public/creator";
const VALID_EXT = [".jpg", ".jpeg", ".png", ".gif"];

async function convertToWebp() {
  // handle files directly inside public/creator
  const rootFiles = readdirSync(INPUT_DIR);
  for (const file of rootFiles) {
    const ext = extname(file).toLowerCase();
    if (!VALID_EXT.includes(ext)) continue;

    const inputFile = join(INPUT_DIR, file);
    const outputFile = join(INPUT_DIR, `${parse(file).name}.webp`);

    await sharp(inputFile).webp({ quality: 80 }).toFile(outputFile);
    console.log(`✅ Converted root file: ${file} -> ${basename(outputFile)}`);
  }

  // handle subfolders in public/creator
  for (const folder of rootFiles) {
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

      await sharp(inputFile).webp({ quality: 80 }).toFile(outputFile);
      console.log(`✅ Converted: ${file} -> ${basename(outputFile)}`);
    }
  }
}

convertToWebp().catch(console.error);
