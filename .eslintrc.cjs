module.exports = {
  extends: ['alloy', 'alloy/typescript'],
  ignorePatterns: ['**/*.js'],
  plugins: ["unused-imports"],
  env: {
    browser: true,
    node: true,
    mocha: true,
    jest: true,
    jquery: true,
  },
  globals: {
    // Your global variables (setting to false means it's not allowed to be reassigned)
    //
    // myGlobal: false
  },
  rules: {
    "max-params": "off",
    // auto fix for unused imports
    "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "warn",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        // allow _, _0, _1, etc. for skipping unused arguments
        varsIgnorePattern: "^_\\d*$",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
    // disable red squiggles
    "prefer-const": "warn",
    "no-empty": "warn",
  },
}
