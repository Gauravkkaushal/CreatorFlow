import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Path to your Next.js app (so jest can load .env and next.config.ts)
  dir: './',
})

const customConfig: Config = {
  // Use ts-jest to transform TypeScript test files
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Where to find tests
  testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/tests/**/*.test.tsx'],

  // Module name mapper so @/ path alias works in tests (mirrors tsconfig paths)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Coverage
  collectCoverageFrom: [
    'lib/**/*.ts',
    'services/**/*.ts',
    'app/api/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Transform (ts-jest handles .ts/.tsx files)
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        // Use commonjs for jest compatibility
        module: 'commonjs',
        jsx: 'react-jsx',
        esModuleInterop: true,
        paths: {
          '@/*': ['./*'],
        },
      },
    }],
  },

  // Ignore patterns
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],

  // Setup files (optional — add global mocks here if needed)
  // setupFilesAfterFramework: ['<rootDir>/tests/setup.ts'],
}

// createJestConfig wraps our config to ensure it works with Next.js
export default createJestConfig(customConfig)
