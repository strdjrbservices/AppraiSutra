export const checkLenderAddressInconsistency = (field, text, data) => {
    const relevantFields = ['Address (Lender/Client)', 'Lender/Client Company Address'];
    if (!relevantFields.includes(field) || !data) return null;

    const subjectLenderAddress = String(data['Address (Lender/Client)'] || '').trim();
    const appraiserLenderAddress = String(data['Lender/Client Company Address'] || '').trim();

    if (subjectLenderAddress && appraiserLenderAddress && subjectLenderAddress !== appraiserLenderAddress) {
        return { isError: true, message: `Lender Address mismatch: Subject section has '${subjectLenderAddress}', but Appraiser section has '${appraiserLenderAddress}'.` };
    }
    return { isMatch: true };
};

export const checkLenderNameInconsistency = (field, text, data) => {
    if (field !== 'Lender/Client' || !data) return null;
    const subjectLenderName = String(text || '').trim();
    const appraiserLenderName = String(data['Lender/Client Company Name'] || '').trim();
    if (subjectLenderName && appraiserLenderName && subjectLenderName !== appraiserLenderName) {
        return { isError: true, message: `"Lender/Client mismatch: Subject section has '${subjectLenderName}', but Appraiser section has '${appraiserLenderName}'."` };
    }
    return { isMatch: true };
};