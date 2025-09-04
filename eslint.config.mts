import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactNative from "eslint-plugin-react-native";
import { defineConfig } from "eslint/config";

// Prettier plugin for ESLint
import pluginPrettier from "eslint-plugin-prettier";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js, prettier: pluginPrettier, "react-native": pluginReactNative },
    extends: [
      "js/recommended",
      "plugin:react/recommended",
      "plugin:react-native/all",
      "plugin:prettier/recommended", // Prettier integration
    ],
    languageOptions: { globals: globals.browser },
    rules: {
      "react-native/no-inline-styles": "warn",
      "no-console": "warn",
      "prettier/prettier": ["error"],
    },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
]);
