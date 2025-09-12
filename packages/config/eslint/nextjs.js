module.exports = {
  extends: [
    "./base.js",
    "next/core-web-vitals"
  ],
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.test.tsx"],
      extends: ["plugin:testing-library/react", "plugin:jest-dom/recommended"],
      env: {
        jest: true
      }
    }
  ]
};