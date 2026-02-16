const { validateMetrics } = require('../../server/utils/validation');

describe('validateMetrics', () => {
    test('passes with a valid payload', () => {
        const validPayload = {
            linesCleared: 10,
            avgPlacementTime: 500,
            maxStackHeight: 5,
            rotationCount: 15, // matches server field name
            panicPlacements: 0
        };
        expect(validateMetrics(validPayload)).toBeNull();
    });

    test('returns error if metrics is not an object', () => {
        expect(validateMetrics(null)).toBe("Metrics must be an object");
        expect(validateMetrics(123)).toBe("Metrics must be an object");
        expect(validateMetrics("string")).toBe("Metrics must be an object");
    });

    test('fails if a required field is missing', () => {
        const invalidPayload = {
            linesCleared: 10,
            avgPlacementTime: 500
            // missing others
        };
        expect(validateMetrics(invalidPayload)).toContain('must be a valid number');
    });

    test('fails if a field is not a number', () => {
        const invalidPayload = {
            linesCleared: "10", // string
            avgPlacementTime: 500,
            maxStackHeight: 5,
            rotationCount: 15,
            panicPlacements: 0
        };
        expect(validateMetrics(invalidPayload)).toContain('must be a valid number');
    });

    test('ignores extra fields safely', () => {
        const extraPayload = {
            linesCleared: 10,
            avgPlacementTime: 500,
            maxStackHeight: 5,
            rotationCount: 15,
            panicPlacements: 0,
            hack: 'true'
        };
        expect(validateMetrics(extraPayload)).toBeNull();
    });
});
