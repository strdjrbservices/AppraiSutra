export const checkContractFieldsMandatory = (field, text, data, fieldPath) => {
    if (fieldPath[0] !== 'CONTRACT') return null;

    const assignmentType = String(data['Assignment Type'] || '').trim().toLowerCase();

    if (assignmentType === 'purchase transaction') {
        if (!text || String(text).trim() === '') {
            return { isError: true, message: `This field is mandatory when Assignment Type is 'Purchase Transaction'.` };
        }
    }
    return null;
};