export const checkConditionAdjustment = (field, text, allData, saleName) => {
    const isConditionField = field === 'Condition';
    const isAdjustmentField = field === 'Condition Adjustment';

    if ((!isConditionField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return null;

    const subjectCondition = String(allData.Subject['Condition'] || '').trim().toUpperCase();
    const compCondition = String(allData[saleName]?.['Condition'] || '').trim().toUpperCase();
    const adjustmentText = String(allData[saleName]?.['Condition Adjustment'] || '').trim();

    if (!subjectCondition || !compCondition) return null;

    const adjustmentValue = parseFloat(adjustmentText.replace(/[^0-9.-]+/g, "")) || 0;

    const subjectConditionNum = parseInt(subjectCondition.replace(/[^0-9]/g, ''), 10);
    const compConditionNum = parseInt(compCondition.replace(/[^0-9]/g, ''), 10);

    if (isNaN(subjectConditionNum) || isNaN(compConditionNum)) return null;

    if (subjectConditionNum === compConditionNum) {
        if (adjustmentValue !== 0) {
            return { isError: true, message: `Warning: Condition is the same (${subjectCondition}), but adjustment is not $0.` };
        }
        return { isMatch: true };
    }
    if (subjectConditionNum > compConditionNum) { // Subject is inferior
        if (adjustmentValue > 0) {
            return { isError: true, message: `Warning: Subject condition (${subjectCondition}) is inferior to Comp (${compCondition}), so a negative adjustment is expected.` };
        }
        return { isMatch: true };
    }
    // Subject is superior
    if (adjustmentValue < 0) {
        return { isError: true, message: `Warning: Subject condition (${subjectCondition}) is superior to Comp (${compCondition}), so a positive adjustment is expected.` };
    }
    return { isMatch: true };
};

export const checkBedroomsAdjustment = (field, text, allData, saleName) => {
    const isBedroomField = field === 'Bedrooms';
    const isAdjustmentField = field === 'Bedrooms Adjustment';

    if ((!isBedroomField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return null;

    const subjectBedrooms = parseInt(String(allData.Subject['Bedrooms'] || '0').trim(), 10);
    const compBedrooms = parseInt(String(allData[saleName]?.['Bedrooms'] || '0').trim(), 10);
    const adjustmentText = String(allData[saleName]?.['Bedrooms Adjustment'] || '').trim();
    const adjustmentValue = parseFloat(adjustmentText.replace(/[^0-9.-]+/g, "")) || 0;

    if (isNaN(subjectBedrooms) || isNaN(compBedrooms)) return null;

    if (subjectBedrooms === compBedrooms) {
        if (adjustmentValue !== 0 && adjustmentText !== '') {
            return { isError: true, message: `Warning: Bedroom count is the same (${subjectBedrooms}), but adjustment is not $0.` };
        }
        return { isMatch: true };
    }
    if (compBedrooms < subjectBedrooms) {
        if (adjustmentValue < 0) {
            return { isError: true, message: `Warning: Comp has fewer bedrooms (${compBedrooms}) than Subject (${subjectBedrooms}), but adjustment is missing or not positive.` };
        }
        return { isMatch: true };
    }
    // compBedrooms > subjectBedrooms
    if (adjustmentValue > 0) {
        return { isError: true, message: `Warning: Comp has more bedrooms (${compBedrooms}) than Subject (${subjectBedrooms}), but adjustment is not negative.` };
    }
    return { isMatch: true };
};

export const checkBathsAdjustment = (field, text, allData, saleName) => {
    const isBathField = field === 'Baths';
    const isAdjustmentField = field === 'Baths Adjustment';

    if ((!isBathField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return null;

    const parseBaths = (bathString) => parseFloat(String(bathString || '0').trim());

    const subjectBaths = parseBaths(allData.Subject['Baths']);
    const compBaths = parseBaths(allData[saleName]?.['Baths']);
    const adjustmentText = String(allData[saleName]?.['Baths Adjustment'] || '').trim();
    const adjustmentValue = parseFloat(adjustmentText.replace(/[^0-9.-]+/g, "")) || 0;

    if (isNaN(subjectBaths) || isNaN(compBaths)) return null;

    if (subjectBaths === compBaths) {
        if (adjustmentValue !== 0 && adjustmentText !== '') {
            return { isError: true, message: `Warning: Bath count is the same (${subjectBaths}), but adjustment is not $0.` };
        }
        return { isMatch: true };
    }
    if (compBaths < subjectBaths) {
        if (adjustmentValue < 0) {
            return { isError: true, message: `Warning: Comp has fewer baths (${compBaths}) than Subject (${subjectBaths}), but adjustment is missing or not positive.` };
        }
        return { isMatch: true };
    }
    // compBaths > subjectBaths
    return { isMatch: true };
};

export const checkQualityOfConstructionAdjustment = (field, text, allData, saleName) => {
    const isQualityField = field === 'Quality of Construction';
    const isAdjustmentField = field === 'Quality of Construction Adjustment';

    if ((!isQualityField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return null;

    const subjectQoC = String(allData.Subject['Quality of Construction'] || '').trim().toUpperCase();
    const compQoC = String(allData[saleName]?.['Quality of Construction'] || '').trim().toUpperCase();
    const adjustmentText = String(allData[saleName]?.['Quality of Construction Adjustment'] || '').trim();

    if (!subjectQoC || !compQoC) return null;

    const adjustmentValue = parseFloat(adjustmentText.replace(/[^0-9.-]+/g, "")) || 0;
    const subjectQualityNum = parseInt(subjectQoC.replace(/[^0-9]/g, ''), 10);
    const compQualityNum = parseInt(compQoC.replace(/[^0-9]/g, ''), 10);

    if (isNaN(subjectQualityNum) || isNaN(compQualityNum)) return null;

    if (subjectQualityNum === compQualityNum) {
        if (adjustmentValue !== 0) {
            return { isError: true, message: `Warning: Quality is the same (${subjectQoC}), but adjustment is not $0.` };
        }
        return { isMatch: true };
    }
    if (subjectQualityNum > compQualityNum) { // Subject is inferior
        if (adjustmentValue > 0) {
            return { isError: true, message: `Warning: Subject (${subjectQoC}) is inferior to Comp (${compQoC}), so a negative adjustment is expected.` };
        }
        return { isMatch: true };
    }
    // Subject is superior
    if (adjustmentValue < 0) {
        return { isError: true, message: `Warning: Subject (${subjectQoC}) is superior to Comp (${compQoC}), so a positive adjustment is expected.` };
    }
    return { isMatch: true };
};

export const checkProximityToSubject = (field, text, allData, saleName) => {
    if (field !== 'Proximity to Subject' || !allData || !allData.Subject || !saleName) return null;
    const proximityText = String(text || '').trim();
    if (!proximityText) return null;

    const proximityValue = parseFloat(proximityText);
    if (isNaN(proximityValue)) return null;

    if (proximityValue > 1) {
        return { isError: true, message: `Proximity to Subject (${proximityText}) should not be greater than 1.0 miles.` };
    }
    return { isMatch: true };
};

export const checkSiteAdjustment = (field, text, allData, saleName) => {
    const isSiteField = field === 'Site';
    const isAdjustmentField = field === 'Site Adjustment';

    if ((!isSiteField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return null;

    const subjectSiteText = String(allData.Subject['Site'] || '').trim();
    const compSiteText = String(allData[saleName]?.['Site'] || '').trim();
    const adjustmentText = String(allData[saleName]?.['Site Adjustment'] || '').trim();

    if (!subjectSiteText || !compSiteText) return null;

    const subjectSiteValue = parseFloat(subjectSiteText.replace(/[^0-9.-]+sf/g, ""));
    const compSiteValue = parseFloat(compSiteText.replace(/[^0-9.-]+sf/g, ""));
    const adjustmentValue = parseFloat(adjustmentText.replace(/[^0-9.-]+/g, ""));

    if (isNaN(subjectSiteValue) || isNaN(compSiteValue)) return null;

    if (compSiteValue > subjectSiteValue && (isNaN(adjustmentValue) || adjustmentValue > 0)) {
        return { isError: true, message: `Warning: Comp site value (${compSiteText}) is superior to Subject (${subjectSiteText}), but adjustment is not negative.` };
    }
    if (compSiteValue < subjectSiteValue && (isNaN(adjustmentValue) || adjustmentValue < 0)) {
        return { isError: true, message: `Warning: Comp site value (${compSiteText}) is inferior to Subject (${subjectSiteText}), but adjustment is not positive.` };
    }
    return { isMatch: true };
};

export const checkGrossLivingAreaAdjustment = (field, text, allData, saleName) => {
    const isGlaField = field === 'Gross Living Area';
    const isAdjustmentField = field === 'Gross Living Area Adjustment';

    if ((!isGlaField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return null;

    const subjectGlaText = String(allData.Subject['Gross Living Area'] || '').trim();
    const compGlaText = String(allData[saleName]?.['Gross Living Area'] || '').trim();
    const adjustmentText = String(allData[saleName]?.['Gross Living Area Adjustment'] || '').trim();

    if (!subjectGlaText || !compGlaText) return null;

    const subjectGlaValue = parseFloat(subjectGlaText.replace(/[^0-9.-]+/g, ""));
    const compGlaValue = parseFloat(compGlaText.replace(/[^0-9.-]+/g, ""));
    const adjustmentValue = parseFloat(adjustmentText.replace(/[^0-9.-]+/g, ""));

    if (isNaN(subjectGlaValue) || isNaN(compGlaValue)) return null;

    if (compGlaValue > subjectGlaValue && (isNaN(adjustmentValue) || adjustmentValue > 0)) {
        return { isError: true, message: `Warning: Comp GLA (${compGlaText}) is superior to Subject (${subjectGlaText}), but adjustment is not negative.` };
    }
    if (compGlaValue < subjectGlaValue && (isNaN(adjustmentValue) || adjustmentValue < 0)) {
        return { isError: true, message: `Warning: Comp GLA (${compGlaText}) is inferior to Subject (${subjectGlaText}), but adjustment is not positive.` };
    }
    return { isMatch: true };
};

export const checkSubjectAddressInconsistency = (field, text, data, fieldPath) => {
    if ((field !== 'Property Address' && field !== 'Address') || !data.Subject) return null;
    if (field === 'Address' && fieldPath[0] !== 'Subject') return null;

    const mainSubjectAddress = String(data['Property Address'] || '').trim();
    const gridSubjectAddress = String(data.Subject['Address'] || '').trim();

    if (mainSubjectAddress && gridSubjectAddress && mainSubjectAddress !== gridSubjectAddress) {
        return { isError: true, message: `Subject Address mismatch: Subject section has '${mainSubjectAddress}', but Sales Comparison has '${gridSubjectAddress}'.` };
    }
    return { isMatch: true };
};

export const checkDesignStyleAdjustment = (field, text, allData, saleName) => {
    const isDesignField = field === 'Design (Style)';
    const isAdjustmentField = field === 'Design (Style) Adjustment';

    if ((!isDesignField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return null;

    const subjectDesign = String(allData.Subject['Design (Style)'] || '').trim();
    const compDesign = String(allData[saleName]?.['Design (Style)'] || '').trim();
    const adjustmentText = String(allData[saleName]?.['Design (Style) Adjustment'] || '').trim();

    if (subjectDesign && compDesign) {
        const designsAreDifferent = subjectDesign.replace(/\s/g, '') !== compDesign.replace(/\s/g, '');
        const adjustmentIsPresent = adjustmentText && adjustmentText !== '$0' && adjustmentText !== '0';

        if (designsAreDifferent && !adjustmentIsPresent) {
            return { isError: true, message: `Design/Style mismatch (Subject: '${subjectDesign}', Comp: '${compDesign}'). An adjustment is required.` };
        }
    }
    return { isMatch: true };
};

export const checkFunctionalUtilityAdjustment = (field, text, allData, saleName) => {
    const isFunctionalUtilityField = field === 'Functional Utility';
    const isAdjustmentField = field === 'Functional Utility Adjustment';

    if ((!isFunctionalUtilityField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return null;

    const subjectFunctionalUtility = String(allData.Subject['Functional Utility'] || '').trim();
    const compFunctionalUtility = String(allData[saleName]?.['Functional Utility'] || '').trim();
    const adjustmentText = String(allData[saleName]?.['Functional Utility Adjustment'] || '').trim();

    if (!subjectFunctionalUtility || !compFunctionalUtility) return null;

    if (subjectFunctionalUtility === compFunctionalUtility) {
        if (adjustmentText && adjustmentText !== '0' && adjustmentText !== '$0') {
            return { isError: true, message: `Warning: Functional Utility is the same (${subjectFunctionalUtility}), but adjustment is not $0.` };
        }
    } else {
        if (!adjustmentText || adjustmentText === '0' || adjustmentText === '$0') {
            return { isError: true, message: `Warning: Functional Utility differs (Subject: '${subjectFunctionalUtility}', Comp: '${compFunctionalUtility}'), but no adjustment is made.` };
        }
    }
    return { isMatch: true };
};

export const checkEnergyEfficientItemsAdjustment = (field, text, allData, saleName) => {
    const isItemField = field === 'Energy Efficient Items';
    const isAdjustmentField = field === 'Energy Efficient Items Adjustment';

    if ((!isItemField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return null;

    const subjectItems = String(allData.Subject['Energy Efficient Items'] || '').trim();
    const compItems = String(allData[saleName]?.['Energy Efficient Items'] || '').trim();
    const adjustmentText = String(allData[saleName]?.['Energy Efficient Items Adjustment'] || '').trim();

    if (!subjectItems && !compItems) return null;

    if (subjectItems === compItems) {
        if (adjustmentText && adjustmentText !== '0' && adjustmentText !== '$0') {
            return { isError: true, message: `Warning: Energy Efficient Items are the same, but adjustment is not $0.` };
        }
    } else {
        if (!adjustmentText || adjustmentText === '0' || adjustmentText === '$0') {
            return { isError: true, message: `Warning: Energy Efficient Items differ (Subject: '${subjectItems}', Comp: '${compItems}'), but no adjustment is made.` };
        }
    }
    return { isMatch: true };
};

export const checkPorchPatioDeckAdjustment = (field, text, allData, saleName) => {
    const isItemField = field === 'Porch/Patio/Deck';
    const isAdjustmentField = field === 'Porch/Patio/Deck Adjustment';

    if ((!isItemField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return null;

    const subjectItems = String(allData.Subject['Porch/Patio/Deck'] || '').trim();
    const compItems = String(allData[saleName]?.['Porch/Patio/Deck'] || '').trim();
    const adjustmentText = String(allData[saleName]?.['Porch/Patio/Deck Adjustment'] || '').trim();

    if (!subjectItems && !compItems && !adjustmentText) return null;

    if (subjectItems === compItems) {
        if (adjustmentText && adjustmentText !== '0' && adjustmentText !== '$0') {
            return { isError: true, message: `Warning: Porch/Patio/Deck are the same, but adjustment is not $0.` };
        }
    } else {
        if (!adjustmentText || adjustmentText === '0' || adjustmentText === '$0') {
            return { isError: true, message: `Warning: Porch/Patio/Deck differ (Subject: '${subjectItems}', Comp: '${compItems}'), but no adjustment is made.` };
        }
    }
    return { isMatch: true };
};

export const checkHeatingCoolingAdjustment = (field, text, allData, saleName) => {
    const isHeatingCoolingField = field === 'Heating/Cooling' || field === 'Heating/Cooling Adjustment';
    if (!isHeatingCoolingField || !allData || !allData.Subject || !saleName) return null;

    const subjectHeatingCooling = String(allData.Subject['Heating/Cooling'] || '').trim();
    const compHeatingCooling = String(allData[saleName]?.['Heating/Cooling'] || '').trim();
    const adjustmentText = String(allData[saleName]?.['Heating/Cooling Adjustment'] || '').trim();

    if (!subjectHeatingCooling || !compHeatingCooling) return null;

    if (subjectHeatingCooling === compHeatingCooling) {
        if (adjustmentText && adjustmentText !== '0' && adjustmentText !== '$0') {
            return { isError: true, message: `Heating/Cooling is the same (${compHeatingCooling}), but an adjustment of '${adjustmentText}' is present.` };
        }
    } else {
        if (!adjustmentText) {
            return { isError: true, message: `Heating/Cooling mismatch (Subject: '${subjectHeatingCooling}', Comp: '${compHeatingCooling}'). An adjustment is required.` };
        }
    }
    return { isMatch: true };
};

export const checkDataSourceDOM = (field, text, allData, saleName) => {
    if (field !== 'Data Source(s)' || !saleName || saleName === 'Subject') return null;

    const textValue = String(text || '').trim();
    if (!textValue) return null;

    const domIndex = textValue.toLowerCase().indexOf('dom');

    if (domIndex !== -1) {
        const restOfString = textValue.substring(domIndex + 3).trim();
        if (restOfString.replace(/[:\s]/g, '') === '') {
            return { isError: true, message: `Value for 'DOM' is missing in Data Source(s).` };
        }
    }
    return { isMatch: true };
};

export const checkActualAgeAdjustment = (field, text, allData, saleName) => {
    const isAdjustmentField = field === 'Actual Age Adjustment';
    if (!isAdjustmentField || !saleName || saleName === 'Subject' || !allData || !allData.Subject) return null;

    const subjectAgeStr = String(allData.Subject['Actual Age'] || '').trim();
    const compAgeStr = String(allData[saleName]?.['Actual Age'] || '').trim();
    const adjustmentStr = String(text || '').trim();

    if (!subjectAgeStr || !compAgeStr) return null;

    const subjectAge = parseInt(subjectAgeStr, 10);
    const compAge = parseInt(compAgeStr, 10);

    if (isNaN(subjectAge) || isNaN(compAge)) return null;

    if (subjectAge === compAge) {
        if (adjustmentStr && adjustmentStr !== '0' && adjustmentStr !== '$0') {
            return { isError: true, message: `Subject and Comp Actual Age are the same (${subjectAge}), so no adjustment is needed.` };
        }
    } else {
        if (!adjustmentStr || adjustmentStr === '0' || adjustmentStr === '$0') {
            return { isError: true, message: `Subject and Comp Actual Age are different, so an adjustment is required.` };
        }
    }
    return { isMatch: true };
};

export const checkLeaseholdFeeSimpleConsistency = (field, text, allData) => {
    if (field !== 'Leasehold/Fee Simple') return null;
    if (!allData) return null;

    const comparableSaleKeys = Object.keys(allData).filter(k => k.startsWith('COMPARABLE SALE #'));
    const allKeys = ['Subject', ...comparableSaleKeys];

    const allValues = allKeys
        .map(key => allData[key]?.['Leasehold/Fee Simple'] || (key === 'Subject' ? allData.Subject?.['Property Rights Appraised'] : null))
        .map(val => String(val || '').trim())
        .filter(Boolean);

    if (allValues.length < 2) return null;

    const uniqueValues = new Set(allValues);

    if (uniqueValues.size > 1) {
        return { isError: true, message: `Inconsistent 'Leasehold/Fee Simple' values found across Subject and Comparables.` };
    }
    return { isMatch: true };
};

export const checkCompDesignStyle = (field, text, allData, saleName) => {
    if (field !== 'Design (Style)' || !saleName || saleName === 'Subject' || !allData || !allData.Subject) return null;

    // This is a placeholder. The logic seems to be missing in the original file.
    // const subjectDesign = String(allData.Subject['Design (Style)'] || '').trim();
    // const compDesign = String(text || '').trim();

    return null;
};

export const checkDateOfSale = (field, text, allData, saleName) => {
    if (field !== 'Date of Sale/Time' || !saleName || saleName === 'Subject' || !allData) return null;

    const compDateStr = String(text || '').trim();
    if (!compDateStr) return null;

    const compDate = new Date(compDateStr);
    if (isNaN(compDate.getTime())) return null;

    const comparableKeys = Object.keys(allData).filter(k => k.startsWith('COMPARABLE SALE #') && k !== saleName);

    for (const key of comparableKeys) {
        const otherCompDateStr = String(allData[key]?.['Date of Sale/Time'] || '').trim();
        if (!otherCompDateStr) continue;

        const otherCompDate = new Date(otherCompDateStr);
        if (isNaN(otherCompDate.getTime())) continue;

        const diffTime = Math.abs(compDate - otherCompDate);
        const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44);

        if (diffMonths > 12) {
            return { isError: true, message: `Sale date is more than 12 months apart from ${key} (${otherCompDateStr}).` };
        }
    }
    return { isMatch: true };
};