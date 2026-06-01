import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Script files that use CommonJS
    "src/lib/generate_mock_data.js",
  ]),
  // Relax strict rules for API routes and admin pages where dynamic JSON
  // parsing makes explicit 'any' necessary, and downgrade img element warning.
  {
    files: ["src/app/api/**/*.ts", "src/app/admin/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Project-wide overrides
  {
    rules: {
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;

