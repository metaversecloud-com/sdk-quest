module.exports = {
  env: {
    browser: true, // Browser global variables like `window` etc.
    commonjs: true, // CommonJS global variables and CommonJS scoping.Allows require, exports and module.
    es6: true, // Enable all ECMAScript 6 features except for modules.
    jest: true, // Jest global variables like `it` etc.
    node: true, // Defines things like process.env when generating through node
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jest/recommended",
    "plugin:testing-library/react",
  ],
  parser: "@babel/eslint-parser", // Uses babel-eslint transforms.
  // parser: process.env.NODE_ENV === "development" ? "babel-eslint" : "@babel/eslint-parser", // Uses babel-eslint transforms.
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
  plugins: ["import", "react"],
  root: true, // For configuration cascading.
  rules: {
    "brace-style": [
      "error",
      "1tbs",
      {
        allowSingleLine: true,
      },
    ],
    "linebreak-style": ["error", "unix"],
    "max-statements-per-line": [
      "error",
      {
        max: 2,
      },
    ],
    "object-curly-spacing": ["error", "always"],
    "space-before-blocks": 0,
    "react/jsx-sort-props": [
      "error",
      {
        ignoreCase: true,
      },
    ],
    "react/jsx-curly-brace-presence": [
      "error",
      {
        props: "never",
        children: "never",
      },
    ],
    "react/prop-types": "off",
    // "react/prop-types": ["error", { ignore: ["children", "className"] }],
    "sort-imports": [
      "error",
      {
        allowSeparatedGroups: true,
        ignoreDeclarationSort: true,
      },
    ],
  },
  settings: {
    react: {
      version: "detect", // Detect react version
    },
  },
};
