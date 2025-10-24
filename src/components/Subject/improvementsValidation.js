export const checkFoundationWallsCondition = (field, text) => {
    if (field !== 'Foundation Walls (Material/Condition)') return null;
    const value = String(text || '').trim().toLowerCase();
    if (!value) return null;

    const validKeywords = ['avg', 'good', 'better', 'best'];
    if (validKeywords.some(keyword => value.includes(keyword))) {
        return { isMatch: true };
    }
    return { isError: true, message: `Foundation Walls (Material/Condition) must include one of: 'avg', 'good', 'better', 'best'.` };
};

export const checkRoofSurfaceCondition = (field, text) => {
    if (field !== 'Roof Surface (Material/Condition)') return null;
    const value = String(text || '').trim().toLowerCase();
    if (!value) return null;

    const validKeywords = ['avg', 'good', 'better', 'best'];
    if (validKeywords.some(keyword => value.includes(keyword))) {
        return { isMatch: true };
    }
    return { isError: true, message: `Roof Surface (Material/Condition) must include one of: 'avg', 'good', 'better', 'best'.` };
};

export const checkDesignStyleConsistency = (field, text, data, fieldPath) => {
    const improvementFields = ['Type', '# of Stories', 'Design (Style)'];
    const isImprovementField = improvementFields.includes(field) && fieldPath.length === 1;
    const isSalesGridField = field === 'Design (Style)' && fieldPath[0] === 'Subject';

    if (!isImprovementField && !isSalesGridField) return null;
    if (!data || !data.Subject) return null;

    const type = String(data['Type'] || '').trim();
    const stories = String(data['# of Stories'] || '').trim();
    const designStyle = String(data['Design (Style)'] || '').trim();
    const typeAbbr = type.match(/det/i) ? 'DT' : (type.match(/att/i) ? 'AT' : type);

    if (!type || !stories || !designStyle) return null;

    const expectedGridStyle = `${typeAbbr}${stories};${designStyle}`;
    const actualGridStyle = String(data.Subject['Design (Style)'] || '').trim();

    if (actualGridStyle && expectedGridStyle.replace(/\s/g, '').toLowerCase() !== actualGridStyle.replace(/\s/g, '').toLowerCase()) {
        return { isError: true, message: `Design/Style mismatch. Improvements section implies '${expectedGridStyle}', but Sales Grid has '${actualGridStyle}'.` };
    }
    return { isMatch: true };
};

export const checkYearBuiltVsActualAge = (field, text, data, fieldPath) => {
    const isYearBuiltField = field === 'Year Built' && fieldPath.length === 1;
    const isActualAgeField = field === 'Actual Age' && fieldPath[0] === 'Subject';

    if (!isYearBuiltField && !isActualAgeField) return null;
    if (!data || !data.Subject) return null;

    const yearBuiltStr = String(data['Year Built'] || '').trim();
    const actualAgeStr = String(data.Subject['Actual Age'] || '').trim();

    if (!yearBuiltStr || !actualAgeStr) return null;

    const yearBuilt = parseInt(yearBuiltStr, 10);
    const actualAge = parseInt(actualAgeStr.replace(/[^0-9]/g, ''), 10);
    const currentYear = new Date().getFullYear();

    if (isNaN(yearBuilt) || isNaN(actualAge)) return null;

    const calculatedAge = currentYear - yearBuilt;

    if (Math.abs(calculatedAge - actualAge) > 1) {
        return { isError: true, message: `Age mismatch: Year Built (${yearBuilt}) implies an age of ~${calculatedAge} years, but Actual Age is ${actualAge}.` };
    }
    return { isMatch: true };
};

export const checkBasementConsistency = (field, text, data) => {
    const fieldsToCheck = ['Basement Area sq.ft.', 'Basement Finish %', 'Basement & Finished'];
    if (!fieldsToCheck.some(f => field.includes(f))) return null;

    const areaStr = String(data['Basement Area sq.ft.'] || '').trim();
    const finishStr = String(data['Basement Finish %'] || '').trim();
    const gridValue = String(data.Subject?.['Basement & Finished'] || '').trim();

    if (!areaStr || !finishStr || !gridValue) return null;

    const area = parseFloat(areaStr.replace(/[^0-9.]/g, ''));
    const finishPercent = parseFloat(finishStr.replace(/[^0-9.]/g, ''));

    const gridFinishedAreaMatch = gridValue.match(/(\d+)\s*sf\s*fin/i) || gridValue.match(/(\d+)\s*sfin/i);
    const gridFinishedArea = gridFinishedAreaMatch ? parseFloat(gridFinishedAreaMatch[1]) : NaN;

    if (isNaN(area) || isNaN(finishPercent) || isNaN(gridFinishedArea)) return null;

    const calculatedFinishedArea = Math.round(area * (finishPercent / 100));

    if (Math.abs(calculatedFinishedArea - gridFinishedArea) > 1) {
        return { isError: true, message: `Basement mismatch: Improvements section implies ${calculatedFinishedArea}sf finished, but Sales Grid has ${gridFinishedArea}sf.` };
    }
    return { isMatch: true };
};

export const checkConditionDescriptionConsistency = (field, text, data, fieldPath) => {
    if (field !== 'Condition' || (fieldPath && fieldPath[0] !== 'Subject')) {
        return null;
    }

    const conditionValue = String(text || '').trim().toLowerCase();
    const conditionDescription = String(data['Describe the condition of the property'] || '').trim().toLowerCase();

    if (!conditionValue || !conditionDescription) {
        return null;
    }

    if (!conditionDescription.includes(conditionValue)) {
        return { isError: true, message: `The Subject's Condition ('${text}') is not mentioned in the 'Describe the condition of the property' field.` };
    }
    return { isMatch: true };
};