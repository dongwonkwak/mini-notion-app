module.exports = {
  root: true,
  extends: ["@editor/config/eslint/base"],
  ignorePatterns: [
    "node_modules/",
    "dist/",
    ".next/",
    "coverage/",
    "*.config.js",
    "*.config.ts"
  ]
};