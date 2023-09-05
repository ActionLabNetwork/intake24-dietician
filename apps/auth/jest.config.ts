import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['jest-extended/all'],
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.ts'],
  moduleNameMapper: {
    '^@intake24-dietician/auth/(.*)$': '<rootDir>/src/$1',
    '^@intake24-dietician/db/(.*)$':
      '<rootDir>/../../packages/db/src/$1',
    '^@intake24-dietician/common/(.*)$':
      '<rootDir>/../../packages/common/src/$1',
    '^@intake24-dietician/(.*?)$': '<rootDir>/../../packages/$1/src',
  },
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.spec.ts'],
  testTimeout: 10000,
}

export default config;
