import { defineConfig } from "oxfmt";

export default defineConfig({
    experimentalOperatorPosition: "start",
    sortImports: true,
    sortPackageJson: { sortScripts: true },
    objectWrap: "collapse",
});
