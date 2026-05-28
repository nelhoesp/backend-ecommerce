function parsePositiveInteger(value, defaultValue, maxValue = null) {
    const number = parseInt(value, 10);

    if (Number.isNaN(number) || number <= 0) {
        return defaultValue;
    }

    if (maxValue && number > maxValue) {
        return maxValue;
    }

    return number;
}

function parsePrice(value) {
    const number = parseFloat(value);

    if (Number.isNaN(number) || number < 0) {
        return null;
    }

    return number;
}

module.exports = {
    parsePositiveInteger,
    parsePrice,
}