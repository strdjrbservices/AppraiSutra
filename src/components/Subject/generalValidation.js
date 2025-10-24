export const checkPhysicalDeficiencies = (field, text) => {
    const fieldName = "Are there any physical deficiencies or adverse conditions that affect the livability, soundness, or structural integrity of the property? If Yes, describe";
    if (field !== fieldName) return null;

    const value = String(text || '').trim().toLowerCase();
    if (value === 'yes') {
        return { isMatch: true };
    }
    if (value !== '') {
        return { isError: true, message: `Value must be 'Yes' for this field.` };
    }
    return null;
};

export const checkAssignmentTypeConsistency = (field, text, data) => {
    if (field !== 'Assignment Type') return null;
    const assignmentType = String(text || '').trim().toLowerCase();

    if (assignmentType === 'purchase transaction') {
        const contractData = data.CONTRACT;
        const isContractSectionEmpty = !contractData || Object.values(contractData).every(value => value === '' || value === null || value === undefined);
        if (isContractSectionEmpty) {
            return { isError: true, message: `Assignment Type is 'Purchase Transaction' then the Contract Section should not be empty.` };
        }
    } else if (assignmentType === 'refinance transaction') {
        const contractData = data.CONTRACT;
        const isContractSectionEmpty = !contractData || Object.values(contractData).every(value => value === '' || value === null || value === undefined);
        if (!isContractSectionEmpty) {
            return { isError: true, message: `Assignment Type is 'Refinance Transaction' then the Contract Section should be empty.` };
        }
    }
    return { isMatch: true };
};

export const checkFinancialAssistanceInconsistency = (field, text, data) => {
    const assistanceQuestionField = 'Is there any financial assistance (loan charges, sale concessions, gift or downpayment assistance, etc.) to be paid by any party on behalf of the borrower?';
    const assistanceAmountField = 'If Yes, report the total dollar amount and describe the items to be paid';

    if (field !== assistanceQuestionField && field !== assistanceAmountField) return null;
    if (!data.CONTRACT) return null;

    const assistanceAnswer = String(data.CONTRACT[assistanceQuestionField] || '').trim().toLowerCase();
    const amountText = String(data.CONTRACT[assistanceAmountField] || '').trim();
    const numericPart = (amountText.match(/(-?\d+(\.\d+)?)/) || [])[0];
    const amountValue = numericPart !== undefined ? parseFloat(numericPart) : NaN;

    if (assistanceAnswer === 'no') {
        if (amountText && (isNaN(amountValue) || amountValue > 0)) {
            return { isError: true, message: `Financial assistance is 'No', but the amount is not '0'.` };
        }
    } else if (assistanceAnswer === 'yes') {
        if (amountText === '' || isNaN(amountValue) || amountValue <= 0) {
            return { isError: true, message: `Financial assistance is 'Yes', but the amount is missing or not greater than 0.` };
        }
    }

    if (assistanceAnswer && amountText !== '') {
        return { isMatch: true };
    }
    return null;
};