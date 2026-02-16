const { mapDifficulty } = require('../../server/utils/difficulty');

describe('mapDifficulty', () => {
    test('returns "increase" when requested', () => {
        expect(mapDifficulty('increase')).toBe('increase');
    });

    test('returns "decrease" when requested', () => {
        expect(mapDifficulty('decrease')).toBe('decrease');
    });

    test('returns "maintain" when requested', () => {
        expect(mapDifficulty('maintain')).toBe('maintain');
    });

    test('returns "spike" when requested', () => {
        expect(mapDifficulty('spike')).toBe('spike');
    });

    test('defaults to "maintain" for invalid inputs', () => {
        expect(mapDifficulty('crazy')).toBe('maintain');
        expect(mapDifficulty(null)).toBe('maintain');
        expect(mapDifficulty(123)).toBe('maintain');
    });
});
