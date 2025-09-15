/** @type {import("prettier").Config} */
module.exports = {
  // 기본 설정
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,

  // Import 정렬 플러그인
  plugins: ['@trivago/prettier-plugin-sort-imports'],

  // Import 정렬 관련
  importOrder: [
    // 1. Node.js 내장 모듈
    '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib)(/.*)?$',

    // 2. 외부 라이브러리 (node_modules)
    '^[a-z]',

    // 3. 내부 패키지 (@editor/*)
    '^@editor/(.*)$',

    // 4. 상대 경로 imports
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderGroupNamespaceSpecifiers: true,
  importOrderCaseInsensitive: true,

  // 기타 설정
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  vueIndentScriptAndStyle: false,
  embeddedLanguageFormatting: 'auto',
};
