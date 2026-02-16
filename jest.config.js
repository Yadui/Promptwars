module.exports = {
    projects: [
        {
            displayName: 'backend',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/tests/backend/**/*.test.js'],
            moduleNameMapper: {
                '^@server/(.*)$': '<rootDir>/server/$1',
            },
            collectCoverageFrom: [
                '<rootDir>/server/**/*.js',
                '!<rootDir>/server/index.js', // optional: exclude entry file
            ],
        },
        {
            displayName: 'frontend',
            testEnvironment: 'jsdom',
            testMatch: ['<rootDir>/tests/frontend/**/*.test.{js,mjs}'],
            moduleNameMapper: {
                '^@client/(.*)$': '<rootDir>/client/src/$1',
            },
            collectCoverageFrom: [
                '<rootDir>/client/src/**/*.js',
                '!<rootDir>/client/src/main.js',
            ],
        },
    ],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            statements: 70,
            branches: 60,
            functions: 70,
            lines: 70,
        },
    },
};
