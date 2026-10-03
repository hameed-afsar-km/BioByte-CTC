import nextConfig from "eslint-config-next";
import { defineConfig } from "eslint/config";

export default defineConfig([
  ...nextConfig,
  {
    ignores: ["node_modules/**", ".next/**", "BIOBYTE/**", "next-env.d.ts"],
  },
]);