import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 🔥 Add ignores here
  {
    ignores: [
      "**/node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "*.config.js",
      "*.config.cjs",
      "*.config.mjs",
       "app/generated/prisma/**",
    ],
  },

  // ✅ Add your compatibility config next
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
