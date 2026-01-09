export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "^@sdc-js$": "<rootDir>/src/index.ts"
  },
  testMatch: ["**/tests/**/*.test.ts"],
};
