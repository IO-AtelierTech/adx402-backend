import { defineConfig } from "eslint/config";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import importPlugin from "eslint-plugin-import";

export default defineConfig([
  {
    ignores: [
      "node_modules/**",
      "**/target/**",
      "dist",
      "dev_dist",
      "drizzle.config.ts",
      "drizzle/**",
    ],
  },
  // Base config for all TS files anywhere in the repo
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ["./tsconfig.json"],
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
      import: importPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
      "no-duplicate-imports": "off",
      "import/no-duplicates": "warn", // Use the import plugin version instead
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      "unused-imports/no-unused-imports": "warn",
      camelcase: "off",
      "prefer-const": "error",
      "no-multiple-empty-lines": ["warn", { max: 1, maxEOF: 1 }],
    },
  },
]);
