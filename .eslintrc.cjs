module.exports = {
  extends: ['alloy', 'alloy/typescript'],
  ignorePatterns: ['**/*.js'],
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
    "max-params": "off"
  },
}
