module.exports = {
  parser: "@typescript-eslint/parser",
  env: {
    browser: true,
    es2021: true,
    node: true,
    "cypress/globals": true,
  },
  plugins: [
    "react",
    "prettier",
    "@typescript-eslint",
    "cypress",
    "chai-friendly",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:cypress/recommended",
    "plugin:react/jsx-runtime",
    "plugin:chai-friendly/recommended",
    "plugin:prettier/recommended",
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: ["node_modules/", "_explicacoes/"],
  // Cherry of the Cake
  rules: {
    "no-console": "error",
    "react/no-unknown-property": ["error", { ignore: ["jsx", "global"] }],
  },
};
