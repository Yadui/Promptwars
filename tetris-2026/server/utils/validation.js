/**
 * Validates the metrics payload from the client.
 * Returns null if valid, or an error message if invalid.
 */
function validateMetrics(metrics) {
    if (!metrics || typeof metrics !== 'object') {
        return "Metrics must be an object";
    }

    const requiredNumericFields = [
        'linesCleared',
        'avgPlacementTime',
        'maxStackHeight',
        'rotationCount', // Not rotationFrequency based on useTetris.js
        'panicPlacements'
    ];

    for (const field of requiredNumericFields) {
        if (typeof metrics[field] !== 'number' || isNaN(metrics[field])) {
            return `Field ${field} must be a valid number`;
        }
    }

    return null;
}

module.exports = { validateMetrics };
