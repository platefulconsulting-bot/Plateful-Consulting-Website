import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  {
    // Generated or non-source paths.
    ignores: [
      ".next/**",
      "node_modules/**",
      "storage/**",
      "content/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // The migration script walks untyped Cheerio nodes; `any` is the honest
    // type there and it never runs in the app.
    files: ["scripts/**/*.ts", "prisma/**/*.ts"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
];

export default config;
