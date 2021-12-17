module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
    '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest',
  },
  roots: ["<rootDir>/src"],
  moduleFileExtensions: [
    'js',
    'vue',
  ],
  coverageDirectory: './coverage/',
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/components/**/*.{js,vue}',
    '<rootDir>/src/store/*.{js}',
  ],
  testURL: 'http://localhost:8080/',
  testMatch: ["**/src/**/*.test.js"],
  snapshotSerializers: [
    '<rootDir>/node_modules/jest-serializer-vue',
  ],
}
