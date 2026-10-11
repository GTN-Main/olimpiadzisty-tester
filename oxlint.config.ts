import e18e from "@e18e/eslint-plugin";
import { defineConfig, type OxlintConfig } from "oxlint";

const customRules: OxlintConfig["rules"] = {
    "typescript/array-type": ["warn", { default: "array-simple" }],
    "sort-keys": "off",
    "sort-imports": "off",
    "no-magic-numbers": "off",
    "unicorn/filename-case": "off",
    "e18e/prefer-get-or-insert": "warn",
    "e18e/prefer-inline-equality": "warn",
    "e18e/prefer-includes-over-regex-test": "warn",
    "e18e/prefer-charcode-at-in-loop": "warn",
    "e18e/prefer-throw-if-no-entry": "warn",
    "e18e/no-delete-property": "warn",
    "e18e/prefer-flatmap-over-map-flat": "warn",
    "e18e/prefer-slice-over-split-index": "warn",
    "e18e/no-spread-in-reduce": "warn",
    "e18e/prefer-static-collator": "warn",
};

export default defineConfig({
    categories: { correctness: "error" },
    env: { node: true, builtin: true },
    jsPlugins: [{ name: "e18e", specifier: "@e18e/eslint-plugin" }],
    options: { reportUnusedDisableDirectives: "error", typeAware: true, typeCheck: true },
    plugins: ["eslint", "typescript", "unicorn", "oxc", "promise"],
    rules: { ...(e18e.configs.recommended.rules as OxlintConfig["rules"]), ...customRules },
});
