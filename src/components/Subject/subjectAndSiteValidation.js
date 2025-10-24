export const checkRETaxes = (field, text) => {
    if (field !== 'R.E. Taxes $') return null;
    const taxesValue = String(text || '').trim();
    if (!taxesValue) return null;

    const integerPart = taxesValue.split('.')[0].replace(/,/g, '');

    if (integerPart.length > 5) {
        return { isError: true, message: `R.E. Taxes value cannot be more than 5 digits.` };
    }
    return null;
};

export const checkHighestAndBestUse = (field, text) => {
    const fieldName = "Is the highest and best use of subject property as improved (or as proposed per plans and specifications) the present use?";
    if (field !== fieldName) return null;

    const raw = String(text || '').trim();
    if (!raw) {
        // If blank, don't raise an immediate error here — allow user to fill later.
        return null;
    }

    const value = raw.toLowerCase();

    // Accept common affirmative variants: yes, y, yes (present use), yes - as improved, etc.
    const yesPattern = /^(y|yes)\b|present use|as improved|as proposed/;
    if (yesPattern.test(value)) {
        return { isMatch: true };
    }

    // Explicit 'no' should warn user and point to supplemental addendum for explanation.
    if (value.startsWith('no')) {
        return { isError: true, message: `Highest & Best Use is not the present use. Please explain in 'SUPPLEMENTAL ADDENDUM'.` };
    }

    // For any other unexpected value, provide clearer guidance instead of a terse failure.
    return { isError: true, message: `Value for 'Highest and Best Use' should be 'Yes' (or 'No' with explanation in 'SUPPLEMENTAL ADDENDUM').` };
};

export const checkTaxYear = (field, text) => {
    if (field !== 'Tax Year') return null;
    const taxYearValue = String(text || '').trim();
    if (!taxYearValue) return null;

    const taxYear = parseInt(taxYearValue, 10);
    if (isNaN(taxYear)) {
        return { isError: true, message: `Tax Year must be a valid year.` };
    }

    const currentYear = new Date().getFullYear();

    if (taxYear > currentYear) {
        return { isError: true, message: `Tax Year (${taxYear}) cannot be in the future.` };
    }
    if (taxYear < currentYear - 1) {
        return { isError: true, message: `Tax Year (${taxYear}) cannot be more than two years in the past.` };
    }
    return null;
};

export const checkPropertyRightsInconsistency = (field, text, data) => {
    if (field !== 'Property Rights Appraised' || !data.Subject) return null;
    const subjectPropertyRights = String(text || '').trim();
    const salesGridPropertyRights = String(data.Subject['Leasehold/Fee Simple'] || '').trim();
    if (subjectPropertyRights && salesGridPropertyRights) {
        if (subjectPropertyRights !== salesGridPropertyRights) {
            return { isError: true, message: `Property Rights mismatch: Subject section has '${subjectPropertyRights}', but Sales Comparison has '${salesGridPropertyRights}'.` };
        }
        return { isMatch: true };
    }
    return null;
};

export const checkUtilities = (field, text) => {
    const utilityFields = ["Electricity", "Gas", "Water", "Sanitary Sewer", "Street", "Alley"];
    if (!utilityFields.includes(field)) return null;

    const value = String(text || '').trim();
    if (!value) {
        return { isError: true, message: `'${field}' in the Site section cannot be blank.` };
    }
    return { isMatch: true };
};