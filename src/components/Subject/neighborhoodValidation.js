export const checkHousingPriceAndAge = (field, text, allData) => {
    const priceField = "one unit housing price(high,low,pred)";
    const ageField = "one unit housing age(high,low,pred)";

    if (field !== priceField && field !== ageField) return null;

    const housingData = allData?.NEIGHBORHOOD?.[field];
    if (typeof housingData !== 'object' || housingData === null) return null;

    const high = parseFloat(String(housingData.high || '0').replace(/[^0-9.-]+/g, ""));
    const low = parseFloat(String(housingData.low || '0').replace(/[^0-9.-]+/g, ""));
    const pred = parseFloat(String(housingData.pred || '0').replace(/[^0-9.-]+/g, ""));

    if (isNaN(high) || isNaN(low) || isNaN(pred)) return null;

    if (!(high >= pred && pred >= low)) {
        const fieldName = field.includes('price') ? 'Price' : 'Age';
        return { isError: true, message: `${fieldName} values are inconsistent. Expected High >= Predominant >= Low. (High: ${housingData.high}, Pred: ${housingData.pred}, Low: ${housingData.low})` };
    }
    return { isMatch: true };
};

export const checkNeighborhoodBoundaries = (field, text) => {
    if (field !== 'Neighborhood Boundaries') return null;
    const value = String(text || '').toLowerCase();
    if (!value) return null;

    const requiredWords = ['north', 'south', 'east', 'west'];
    const missingWords = requiredWords.filter(word => !value.includes(word));

    if (missingWords.length > 0) {
        return { isError: true, message: `Neighborhood Boundaries is missing required directions: ${missingWords.join(', ').toUpperCase()}.` };
    }
    return { isMatch: true };
};

export const checkNeighborhoodUsageConsistency = (field, text, data) => {
    const usageFields = ["One-Unit", "2-4 Unit", "Multi-Family", "Commercial", "Other"];
    if (!usageFields.includes(field) || !data.NEIGHBORHOOD) return null;

    const values = usageFields.map(f => {
        const val = String(data.NEIGHBORHOOD[f] || '0').replace('%', '').trim();
        return parseFloat(val) || 0;
    });
    const total = values.reduce((sum, v) => sum + v, 0);
    const anyFieldHasValue = usageFields.some(f => data.NEIGHBORHOOD[f] !== undefined && data.NEIGHBORHOOD[f] !== null && data.NEIGHBORHOOD[f] !== '');

    if (anyFieldHasValue && total !== 100) {
        return { isError: true, message: `Neighborhood usage total is ${total}%, not 100%.` };
    } else if (anyFieldHasValue) {
        return { isMatch: true };
    }
    return null;
};