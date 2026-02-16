/**
 * Maps AI difficulty_adjustment string to internal game logic if needed.
 * Currently returns the adjustment string directly as expected by the frontend.
 */
function mapDifficulty(adjustment) {
    const validAdjustments = ['increase', 'decrease', 'maintain', 'spike'];
    if (validAdjustments.includes(adjustment)) {
        return adjustment;
    }
    return 'maintain'; // Default if AI returns something weird
}

module.exports = { mapDifficulty };
