import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["dist/**", "node_modules/**", "server/finance.db"] },
  {
    files: ["src/**/*.{js,jsx}", "server/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...js.configs.recommended.rules,
      // The 23k-line legacy file drowns in style noise — enforce only the
      // rules that catch real bugs (undefined identifiers = the class of bug
      // that broke Select.jsx during extraction; hooks misuse).
      "no-unused-vars": "off",
      "no-empty": "off",
      "no-undef": "error",
      "no-useless-assignment": "off",
      "no-useless-escape": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",
    },
  },
];
