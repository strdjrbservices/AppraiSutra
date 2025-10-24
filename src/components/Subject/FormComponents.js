import React from 'react';

import { Tooltip } from '@mui/material';

const HighlightKeywords = ({ text, keywords }) => {
  if (!keywords || !text) {
    return text;
  }
  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} style={{ backgroundColor: '#91ff00ff', color: '#000000', padding: '1px 3px', borderRadius: '3px' }}>{part}</span>
        ) : (
          part
        )
      )}
    </span>
  );
};

export const EditableField = ({ fieldPath, value, onDataChange, editingField, setEditingField, usePre, isMissing, inputClassName, inputStyle, isEditable, isAdjustment, allData, saleName }) => {
  const isEditing = isEditable && editingField && JSON.stringify(editingField) === JSON.stringify(fieldPath);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !usePre) {
      setEditingField(null);
    } else if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  const handleContainerClick = () => {
    if (!isEditing && isEditable) {
      setEditingField(fieldPath);
    }
  };

  const getValidationInfo = (field, text, data, fieldPath) => {
    let message = null;
    let isError = false;
    let isMatch = false;

    if (!field || !data) {
      return { style: {}, message: null };
    }

    function checkZoning() {
      if (field !== 'Zoning Compliance') return null;
      const value = String(text || '').trim();
      const validValues = ['Legal', 'Legal Nonconforming (Grandfathered Use)', 'No Zoning'];

      if (value.startsWith('Illegal')) {
        return { isError: true, message: "STOP REVIEW AND ESCALATE TO MANAGER/ CLIENT" };
      }

      if (value === 'Legal') {
        return { isMatch: true };
      } else if (value === 'Legal Nonconforming (Grandfathered Use)' || value === 'No Zoning') {
        const supplementalAddendum = String(data['SUPPLEMENTAL ADDENDUM'] || '').trim();
        if (!supplementalAddendum) {
          return { isError: true, message: `Comments are required in 'Supplemental Addendum' when compliance is '${value}'.` };
        } else {
          // It's a valid state with comments, but we can keep the special styling.
        }
      } else if (value && !validValues.some(v => value.startsWith(v))) {
        return { isError: true, message: `Invalid Zoning Compliance value: '${value}'.` };
      }
      return null;
    }
    function checkHighestAndBestUse() {
      if (field !== 'Is the highest and best use of subject property as improved (or as proposed per plans and specifications) the present use?') {
        return;
      }
      const raw = String(text || '').trim();
      if (!raw) {
        return;
      }

      const value = raw.toLowerCase();
      const yesPattern = /^(y|yes)\b|present use|as improved|as proposed/;

      if (yesPattern.test(value)) {
        return { isMatch: true };
      }

      if (value.startsWith('no')) {
        return { isError: true, message: `Highest & Best Use is not the present use. Please explain in 'SUPPLEMENTAL ADDENDUM'.` };
      }

      return { isError: true, message: `Value for 'Highest and Best Use' should be 'Yes' (or 'No' with explanation in 'SUPPLEMENTAL ADDENDUM').` };
    }

    function checkFemaInconsistency() {
      const relevantFields = ['FEMA Special Flood Hazard Area', 'FEMA Flood Zone'];
      if (!relevantFields.includes(field)) return null;

      const hazardArea = String(data['FEMA Special Flood Hazard Area'] || '').trim().toLowerCase();
      const floodZone = String(data['FEMA Flood Zone'] || '').trim().toUpperCase();

      if (!hazardArea || !floodZone) return null;

      const isNoAndInvalid = hazardArea === 'no' && floodZone !== 'X' && floodZone !== 'X500';
      const isYesAndInvalid = hazardArea === 'yes' && !['A', 'AE'].includes(floodZone);

      if (isNoAndInvalid) {
        return { isError: true, message: `Hazard Area is 'No', so Flood Zone should be 'X' or 'X500'.` };
      } else if (isYesAndInvalid) {
        return { isError: true, message: `Hazard Area is 'Yes', so Flood Zone should be 'A' or 'AE'.` };
      } else {
        return { isMatch: true };
      }
    }

    function checkFemaFieldsConsistency() {
      const femaFields = ["FEMA Flood Zone", "FEMA Map #", "FEMA Map Date"];
      if (!femaFields.includes(field) || !data) return null;

      const hazardArea = String(data['FEMA Special Flood Hazard Area'] || '').trim();
      const fieldValue = String(text || '').trim();

      if (hazardArea && !fieldValue) {
        return { isError: true, message: `'${field}' cannot be empty when 'FEMA Special Flood Hazard Area' has a value.` };
      } else if (hazardArea && fieldValue) {
        return { isMatch: true };
      }
      return null;
    }
    function checkViewInconsistency() {
      // This validation should run for 'View' in both the Site section and the Subject column of the sales grid.
      if (field !== 'View') {
        return null;
      }

      // Not enough data to validate if allData or Subject grid data is missing.
      if (!allData || !allData.Subject) {
        return null;
      }

      const siteView = String(allData['View'] || '').trim();
      const salesGridSubjectView = String(allData.Subject['View'] || '').trim();

      if (siteView && salesGridSubjectView && siteView.replace(/\s/g, '') !== salesGridSubjectView.replace(/\s/g, '')) {
        return { isError: true, message: `View mismatch: Site section has '${siteView}', but Sales Comparison has '${salesGridSubjectView}'.` };
      } else if (siteView && salesGridSubjectView) {
        return { isMatch: true };
      }
      return null;
    }
    function checkDesignStyleAdjustment() {
      const isDesignField = field === 'Design (Style)';
      const isAdjustmentField = field === 'Design (Style) Adjustment';

      if ((!isDesignField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return null;

      const subjectDesign = String(allData.Subject['Design (Style)'] || '').trim();
      const compDesign = String(allData[saleName]?.['Design (Style)'] || '').trim();
      const adjustmentText = String(allData[saleName]?.['Design (Style) Adjustment'] || '').trim();

      if (subjectDesign && compDesign) {
        const designsAreDifferent = subjectDesign.replace(/\s/g, '') !== compDesign.replace(/\s/g, '');
        const adjustmentIsPresent = adjustmentText && adjustmentText !== '$0' && adjustmentText !== '0';

        if (designsAreDifferent) {
          if (adjustmentIsPresent) {
            return { isMatch: true };
          } else {
            return { isError: true, message: `Design/Style mismatch (Subject: '${subjectDesign}', Comp: '${compDesign}'). An adjustment is required.` };
          }
        } else {
          return { isMatch: true };
        }
      }
      return null;
    }
    function checkAreaInconsistency() {

      const isAreaField = field === 'Area' && fieldPath.length === 1;
      const isSalesGridSiteField = field === 'Site' && fieldPath[0] === 'Subject';

      if (!isAreaField && !isSalesGridSiteField) return null;
      if (!allData || !allData.Subject) return null;

      const siteArea = String(allData['Area'] || '').trim();
      const salesGridSubjectSite = String(allData.Subject['Site'] || '').trim();

      if (siteArea && salesGridSubjectSite && siteArea.replace(/\s/g, '') !== salesGridSubjectSite.replace(/\s/g, '')) {
        return { isError: true, message: `Area/Site mismatch: Site section has '${siteArea}', but Sales Comparison has '${salesGridSubjectSite}'.` };
      } else if (siteArea && salesGridSubjectSite) {
        return { isMatch: true };
      }
      return null;
    }
    function checkLenderAddressInconsistency() {

      const relevantFields = ['Address (Lender/Client)', 'Lender/Client Company Address'];
      if (!relevantFields.includes(field) || !data) return;

      const subjectLenderAddress = String(data['Address (Lender/Client)'] || '').trim();
      const appraiserLenderAddress = String(data['Lender/Client Company Address'] || '').trim();

      if (subjectLenderAddress && appraiserLenderAddress) {
        if (subjectLenderAddress !== appraiserLenderAddress) {
          return { isError: true, message: `Lender Address mismatch: Subject section has '${subjectLenderAddress}', but Appraiser section has '${appraiserLenderAddress}'.` };
        } else {
          return { isMatch: true };
        }
      }
      return null;
    }
    function checkLenderNameInconsistency() {
      if (field !== 'Lender/Client' || !data) return;
      const subjectLenderName = String(text || '').trim();
      const appraiserLenderName = String(data['Lender/Client Company Name'] || '').trim();
      if (subjectLenderName && appraiserLenderName) {
        if (subjectLenderName !== appraiserLenderName) {
          return { isError: true, message: `Lender/Client mismatch: Subject section has '${subjectLenderName}', but Appraiser section has '${appraiserLenderName}'.` };
        } else {
          return { isMatch: true };
        }
      }
      return null;
    }
    function checkConditionAdjustment() {
      const isConditionField = field === 'Condition';
      const isAdjustmentField = field === 'Condition Adjustment';

      if ((!isConditionField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return;

      const subjectCondition = String(allData.Subject['Condition'] || '').trim().toUpperCase();
      const compCondition = String(allData[saleName]?.['Condition'] || '').trim().toUpperCase();
      const adjustmentText = String(allData[saleName]?.['Condition Adjustment'] || '').trim();

      if (!subjectCondition || !compCondition) return;

      const adjustmentValue = parseFloat(adjustmentText.replace(/[^0-9.-]+/g, "")) || 0;

      if (subjectCondition && compCondition) {
        const subjectConditionNum = parseInt(subjectCondition.replace(/[^0-9]/g, ''), 10);
        const compConditionNum = parseInt(compCondition.replace(/[^0-9]/g, ''), 10);

        if (isNaN(subjectConditionNum) || isNaN(compConditionNum)) return;

        if (subjectConditionNum === compConditionNum) {
          if (adjustmentValue !== 0) {
            isError = true;
            message = `Warning: Condition is the same (${subjectCondition}), but adjustment is not $0.`;
          }
          else {
            isMatch = true;
          }
        } else if (subjectConditionNum > compConditionNum) {
          if (adjustmentValue > 0) {
            isError = true;
            message = `Warning: Subject condition (${subjectCondition}) is inferior to Comp (${compCondition}), so a negative adjustment is expected.`;
          }
          else {
            isMatch = true;
          }
        } else {
          if (adjustmentValue < 0) {
            isError = true;
            message = `Warning: Subject condition (${subjectCondition}) is superior to Comp (${compCondition}), so a positive adjustment is expected.`;
          }
        }

      }
    }
    function checkBedroomsAdjustment() {
      const isBedroomField = field === 'Bedrooms';
      const isAdjustmentField = field === 'Bedrooms Adjustment';

      if ((!isBedroomField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return;

      const subjectBedrooms = parseInt(String(allData.Subject['Bedrooms'] || '0').trim(), 10);
      const compBedrooms = parseInt(String(allData[saleName]?.['Bedrooms'] || '0').trim(), 10);
      const adjustmentText = String(allData[saleName]?.['Bedrooms Adjustment'] || '').trim();
      const adjustmentValue = parseFloat(adjustmentText.replace(/[^0-9.-]+/g, "")) || 0;

      if (isNaN(subjectBedrooms) || isNaN(compBedrooms)) return;

      if (subjectBedrooms === compBedrooms) {
        if (adjustmentValue !== 0 && adjustmentText !== '') {
          isError = true;
          message = `Warning: Bedroom count is the same (${subjectBedrooms}), but adjustment is not $0.`;
        } else {
          isMatch = true;
        }
      } else if (compBedrooms < subjectBedrooms) {
        if (adjustmentValue < 0) {
          isError = true;
          message = `Warning: Comp has fewer bedrooms (${compBedrooms}) than Subject (${subjectBedrooms}), but adjustment is missing or not positive.`;
        } else {
          isMatch = true;
        }
      } else { // compBedrooms > subjectBedrooms
        if (adjustmentValue > 0) {
          isError = true;
          message = `Warning: Comp has more bedrooms (${compBedrooms}) than Subject (${subjectBedrooms}), but adjustment is not negative.`;
        } else {
          isMatch = true;
        }
      }
    }

    function checkBathsAdjustment() {
      const isBathField = field === 'Baths';
      const isAdjustmentField = field === 'Baths Adjustment';

      if ((!isBathField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return;

      const parseBaths = (bathString) => {
        const cleanedString = String(bathString || '0').trim();
        return parseFloat(cleanedString);
      };

      const subjectBaths = parseBaths(allData.Subject['Baths']);
      const compBaths = parseBaths(allData[saleName]?.['Baths']);

      const adjustmentText = String(allData[saleName]?.['Baths Adjustment'] || '').trim();
      const adjustmentValue = parseFloat(adjustmentText.replace(/[^0-9.-]+/g, "")) || 0;


      if (isNaN(subjectBaths) || isNaN(compBaths)) return;

      if (subjectBaths === compBaths) {
        if (adjustmentValue !== 0 && adjustmentText !== '') {
          isError = true;
          message = `Warning: Bath count is the same (${subjectBaths}), but adjustment is not $0.`;
        } else {
          isMatch = true;
        }
      } else if (compBaths < subjectBaths) {
        if (adjustmentValue < 0) {
          isError = true;
          message = `Warning: Comp has fewer baths (${compBaths}) than Subject (${subjectBaths}), but adjustment is missing or not positive.`;
        } else {
          isMatch = true;
        }
      } else { // compBaths > subjectBaths
        isMatch = true;
      }
    }
    function checkSubjectAddressInconsistency() {
      if ((field !== 'Property Address' && field !== 'Address') || !data.Subject) return;
      if (field === 'Address' && fieldPath[0] !== 'Subject') return;

      const mainSubjectAddress = String(data['Property Address'] || '').trim();
      const gridSubjectAddress = String(data.Subject['Address'] || '').trim();

      if (mainSubjectAddress && gridSubjectAddress) {
        if (mainSubjectAddress !== gridSubjectAddress) {
          isError = true;
          message = `Subject Address mismatch: Subject section has '${mainSubjectAddress}', but Sales Comparison has '${gridSubjectAddress}'.`;
        } else {
          isMatch = true;
        }
      }
    }
    function checkQualityOfConstructionAdjustment() {
      const isQualityField = field === 'Quality of Construction';
      const isAdjustmentField = field === 'Quality of Construction Adjustment';

      if ((!isQualityField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return;

      const subjectQoC = String(allData.Subject['Quality of Construction'] || '').trim().toUpperCase();
      const compQoC = String(allData[saleName]?.['Quality of Construction'] || '').trim().toUpperCase();
      const adjustmentText = String(allData[saleName]?.['Quality of Construction Adjustment'] || '').trim();

      if (!subjectQoC || !compQoC) return; // Not enough data to compare

      const adjustmentValue = parseFloat(adjustmentText.replace(/[^0-9.-]+/g, "")) || 0;

      // Supports both C# and Q# formats, where a lower number is better quality.
      const subjectQualityNum = parseInt(subjectQoC.replace(/[^0-9]/g, ''), 10);
      const compQualityNum = parseInt(compQoC.replace(/[^0-9]/g, ''), 10);

      if (isNaN(subjectQualityNum) || isNaN(compQualityNum)) return; // Not in a supported format

      if (subjectQualityNum === compQualityNum) { // Same quality
        if (adjustmentValue !== 0) {
          isError = true;
          message = `Warning: Quality is the same (${subjectQoC}), but adjustment is not $0.`;
        } else {
          isMatch = true;
        }
      } else if (subjectQualityNum > compQualityNum) {
        if (adjustmentValue > 0) {
          isError = true;
          message = `Warning: Subject (${subjectQoC}) is inferior to Comp (${compQoC}), so a negative adjustment is expected.`;
        } else {
          isMatch = true;
        }
      } else {
        if (adjustmentValue < 0) {
          isError = true;
          message = `Warning: Subject (${subjectQoC}) is superior to Comp (${compQoC}), so a positive adjustment is expected.`;
        } else {
          isMatch = true;
        }
      }
    }

    const checkProximityToSubject = () => {

      if (fieldPath.slice(-1)[0] !== 'Proximity to Subject' || !allData || !allData.Subject || !saleName) return;
      const proximityText = String(text || '').trim();
      if (!proximityText) return;

      const proximityValue = parseFloat(proximityText);
      if (isNaN(proximityValue)) return;

      if (proximityValue > 1) {
        isError = true;
        message = `Proximity to Subject (${proximityText}) should not be greater than 1.0 miles.`;
      } else {
        isMatch = true;
      }
    };

    function checkSiteAdjustment() {
      const isSiteField = field === 'Site';
      const isAdjustmentField = field === 'Site Adjustment';

      if ((!isSiteField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return;

      const subjectSiteText = String(allData.Subject['Site'] || '').trim();
      const compSiteText = String(allData[saleName]?.['Site'] || '').trim();
      const adjustmentText = String(allData[saleName]?.['Site Adjustment'] || '').trim();

      if (!subjectSiteText || !compSiteText) return;

      const subjectSiteValue = parseFloat(subjectSiteText.replace(/[^0-9.-]+sf/g, ""));
      const compSiteValue = parseFloat(compSiteText.replace(/[^0-9.-]+sf/g, ""));
      const adjustmentValue = parseFloat(adjustmentText.replace(/[^0-9.-]+/g, ""));

      if (isNaN(subjectSiteValue) || isNaN(compSiteValue)) return;

      if (compSiteValue > subjectSiteValue && (isNaN(adjustmentValue) || adjustmentValue > 0)) {
        isError = true;
        message = `Warning: Comp site value (${compSiteText}) is superior to Subject (${subjectSiteText}), but adjustment is not negative.`;
      }
      else if (compSiteValue < subjectSiteValue && (isNaN(adjustmentValue) || adjustmentValue < 0)) {

        isError = true;
        message = `Warning: Comp site value (${compSiteText}) is inferior to Subject (${subjectSiteText}), but adjustment is not positive.`;
      } else {
        isMatch = true;
      }
    };


    function checkGrossLivingAreaAdjustment() {
      const isGlaField = field === 'Gross Living Area';
      const isAdjustmentField = field === 'Gross Living Area Adjustment';

      if ((!isGlaField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return;

      const subjectGlaText = String(allData.Subject['Gross Living Area'] || '').trim();
      const compGlaText = String(allData[saleName]?.['Gross Living Area'] || '').trim();
      const adjustmentText = String(allData[saleName]?.['Gross Living Area Adjustment'] || '').trim();

      if (!subjectGlaText || !compGlaText) return;

      const subjectGlaValue = parseFloat(subjectGlaText.replace(/[^0-9.-]+/g, ""));
      const compGlaValue = parseFloat(compGlaText.replace(/[^0-9.-]+/g, ""));
      const adjustmentValue = parseFloat(adjustmentText.replace(/[^0-9.-]+/g, ""));

      if (isNaN(subjectGlaValue) || isNaN(compGlaValue)) return;

      if (compGlaValue > subjectGlaValue && (isNaN(adjustmentValue) || adjustmentValue > 0)) {
        isError = true;
        message = `Warning: Comp GLA (${compGlaText}) is superior to Subject (${subjectGlaText}), but adjustment is not negative.`;
      } else if (compGlaValue < subjectGlaValue && (isNaN(adjustmentValue) || adjustmentValue < 0)) {
        isError = true;
        message = `Warning: Comp GLA (${compGlaText}) is inferior to Subject (${subjectGlaText}), but adjustment is not positive.`;
      } else {
        isMatch = true;
      }
    };
    function checkFunctionalUtilityAdjustment() {
      const isFunctionalUtilityField = field === 'Functional Utility';
      const isAdjustmentField = field === 'Functional Utility Adjustment';

      if ((!isFunctionalUtilityField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return;

      const subjectFunctionalUtility = String(allData.Subject['Functional Utility'] || '').trim();
      const compFunctionalUtility = String(allData[saleName]?.['Functional Utility'] || '').trim();
      const adjustmentText = String(allData[saleName]?.['Functional Utility Adjustment'] || '').trim();

      if (!subjectFunctionalUtility || !compFunctionalUtility) return;

      if (subjectFunctionalUtility === compFunctionalUtility) {
        if (adjustmentText && adjustmentText !== '0' && adjustmentText !== '$0') {
          isError = true;
          message = `Warning: Functional Utility is the same (${subjectFunctionalUtility}), but adjustment is not $0.`;
        } else {
          isMatch = true;
        }
      } else { // Different
        if (!adjustmentText || adjustmentText === '0' || adjustmentText === '$0') {
          isError = true;
          message = `Warning: Functional Utility differs (Subject: '${subjectFunctionalUtility}', Comp: '${compFunctionalUtility}'), but no adjustment is made.`;
        }
      }
    }

    function checkEnergyEfficientItemsAdjustment() {
      const isItemField = field === 'Energy Efficient Items';
      const isAdjustmentField = field === 'Energy Efficient Items Adjustment';

      if ((!isItemField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return;

      const subjectItems = String(allData.Subject['Energy Efficient Items'] || '').trim();
      const compItems = String(allData[saleName]?.['Energy Efficient Items'] || '').trim();
      const adjustmentText = String(allData[saleName]?.['Energy Efficient Items Adjustment'] || '').trim();

      if (!subjectItems && !compItems) return; // Don't run if both are empty

      if (subjectItems === compItems) {
        if (adjustmentText && adjustmentText !== '0' && adjustmentText !== '$0') {
          isError = true;
          message = `Warning: Energy Efficient Items are the same, but adjustment is not $0.`;
        } else {
          isMatch = true;
        }
      } else { // Different values
        if (!adjustmentText || adjustmentText === '0' || adjustmentText === '$0') {
          isError = true;
          message = `Warning: Energy Efficient Items differ (Subject: '${subjectItems}', Comp: '${compItems}'), but no adjustment is made.`;
        } else {
          isMatch = true;
        }
      }
    }

    function checkPorchPatioDeckAdjustment() {
      const isItemField = field === 'Porch/Patio/Deck';
      const isAdjustmentField = field === 'Porch/Patio/Deck Adjustment';

      if ((!isItemField && !isAdjustmentField) || !allData || !allData.Subject || !saleName) return;

      const subjectItems = String(allData.Subject['Porch/Patio/Deck'] || '').trim();
      const compItems = String(allData[saleName]?.['Porch/Patio/Deck'] || '').trim();
      const adjustmentText = String(allData[saleName]?.['Porch/Patio/Deck Adjustment'] || '').trim();

      if (!subjectItems && !compItems && !adjustmentText) return; // Don't run if all are empty

      if (subjectItems === compItems) {
        if (adjustmentText && adjustmentText !== '0' && adjustmentText !== '$0') {
          isError = true;
          message = `Warning: Porch/Patio/Deck are the same, but adjustment is not $0.`;
        } else {
          isMatch = true;
        }
      } else { // Different values
        if (!adjustmentText || adjustmentText === '0' || adjustmentText === '$0') {
          isError = true;
          message = `Warning: Porch/Patio/Deck differ (Subject: '${subjectItems}', Comp: '${compItems}'), but no adjustment is made.`;
        } else {
          isMatch = true;
        }
      }
    }

    const checkDateOfSale = () => {
      if (field !== 'Date of Sale/Time' || !saleName || saleName === 'Subject' || !allData) {
        return;
      }

      const compDateStr = String(text || '').trim();
      if (!compDateStr) return;

      const compDate = new Date(compDateStr);
      if (isNaN(compDate.getTime())) return;

      const comparableKeys = Object.keys(allData).filter(k => k.startsWith('COMPARABLE SALE #') && k !== saleName);

      for (const key of comparableKeys) {
        const otherCompDateStr = String(allData[key]?.['Date of Sale/Time'] || '').trim();
        if (!otherCompDateStr) continue;

        const otherCompDate = new Date(otherCompDateStr);
        if (isNaN(otherCompDate.getTime())) continue;

        const diffTime = Math.abs(compDate - otherCompDate);
        const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44); // Average days in a month

        if (diffMonths > 12) {
          isError = true;
          message = `Sale date is more than 12 months apart from ${key} (${otherCompDateStr}).`;
          break;
        }
      }
      if (!isError) {
        isMatch = true;
      }
    };
    const checkPropertyRightsInconsistency = () => {
      if (field !== 'Property Rights Appraised' || !data.Subject) return;
      const subjectPropertyRights = String(text || '').trim();
      const salesGridPropertyRights = String(data.Subject['Leasehold/Fee Simple'] || '').trim();
      if (subjectPropertyRights && salesGridPropertyRights) {
        if (subjectPropertyRights !== salesGridPropertyRights) {
          isError = true;
          message = `Property Rights mismatch: Subject section has '${subjectPropertyRights}', but Sales Comparison has '${salesGridPropertyRights}'.`;
        } else {
          isMatch = true;
        }
      }
    }
    function checkFinancialAssistanceInconsistency() {
      const assistanceQuestionField = 'Is there any financial assistance (loan charges, sale concessions, gift or downpayment assistance, etc.) to be paid by any party on behalf of the borrower?';
      const assistanceAmountField = 'If Yes, report the total dollar amount and describe the items to be paid';

      if (field !== assistanceQuestionField && field !== assistanceAmountField) return;
      if (!data.CONTRACT) return;

      const assistanceAnswer = String(data.CONTRACT[assistanceQuestionField] || '').trim().toLowerCase();
      const amountText = String(data.CONTRACT[assistanceAmountField] || '').trim();
      const numericPart = (amountText.match(/(-?\d+(\.\d+)?)/) || [])[0];
      const amountValue = numericPart !== undefined ? parseFloat(numericPart) : NaN;

      if (assistanceAnswer === 'no') {
        if (amountText && (isNaN(amountValue) || amountValue > 0)) {
          isError = true;
          message = `Financial assistance is 'No', but the amount is not '0'.`;
        }
      } else if (assistanceAnswer === 'yes') {
        if (amountText === '' || isNaN(amountValue) || amountValue <= 0) {
          isError = true;
          message = `Financial assistance is 'Yes', but the amount is missing or not greater than 0.`;
        }
      }

      if (assistanceAnswer && amountText !== '' && !isError) {
        isMatch = true;
      }
    }
    function checkAssignmentTypeConsistency() {
      if (field !== 'Assignment Type') return;
      const assignmentType = String(text || '').trim();
      const assignmentTypeLower = assignmentType.toLowerCase();


      if (assignmentTypeLower === 'purchase transaction') {
        const contractData = data.CONTRACT;
        const isContractSectionEmpty = !contractData || Object.values(contractData).every(value => value === '' || value === null || value === undefined);
        if (isContractSectionEmpty) {
          isError = true;
          message = `Assignment Type is 'Purchase Transaction' then the Contract Section should not be empty.`;
        } else {
          isMatch = true;
        }
      } else if (assignmentTypeLower === 'refinance transaction') {
        const contractData = data.CONTRACT;
        const isContractSectionEmpty = !contractData || Object.values(contractData).every(value => value === '' || value === null || value === undefined);
        if (!isContractSectionEmpty) {
          isError = true;
          message = `Assignment Type is 'Refinance Transaction' then the Contract Section should be empty.`;
        }
      } else {
        isError = true;
        message = `Assignment Type is 'Refinance Transaction' then the Contract Section should be empty.`;
      }
    }
    function checkContractFieldsMandatory() {

      if (fieldPath[0] !== 'CONTRACT') return;

      const assignmentType = String(data['Assignment Type'] || '').trim().toLowerCase();

      if (assignmentType === 'purchase transaction') {
        if (!text || String(text).trim() === '') {
          isError = true;
          message = `This field is mandatory when Assignment Type is 'Purchase Transaction'.`;
        } else if (!isError) {
          isMatch = true;
        }
      }
    }
    function checkNeighborhoodUsageConsistency() {
      const usageFields = ["One-Unit", "2-4 Unit", "Multi-Family", "Commercial", "Other"];
      if (!usageFields.includes(field) || !data.NEIGHBORHOOD) return;

      const values = usageFields.map(f => {
        const val = String(data.NEIGHBORHOOD[f] || '0').replace('%', '').trim();
        return parseFloat(val) || 0;
      });
      const total = values.reduce((sum, v) => sum + v, 0);
      const anyFieldHasValue = usageFields.some(f => data.NEIGHBORHOOD[f] !== undefined && data.NEIGHBORHOOD[f] !== null && data.NEIGHBORHOOD[f] !== '');

      if (anyFieldHasValue && total !== 100) {
        isError = true;
        message = `Neighborhood usage total is ${total}%, not 100%.`;
      } else if (anyFieldHasValue && total === 100) {
        isMatch = true;
      }
    }
    function checkDesignStyleConsistency() {
      const improvementFields = ['Type', '# of Stories', 'Design (Style)'];
      const isImprovementField = improvementFields.includes(field) && fieldPath.length === 1;
      const isSalesGridField = field === 'Design (Style)' && fieldPath[0] === 'Subject';

      if (!isImprovementField && !isSalesGridField) return;
      if (!data || !data.Subject) return;

      const type = String(data['Type'] || '').trim();
      const stories = String(data['# of Stories'] || '').trim();
      const designStyle = String(data['Design (Style)'] || '').trim();

      const typeAbbr = type.match(/det/i) ? 'DT' : (type.match(/att/i) ? 'AT' : type);

      if (!type || !stories || !designStyle) return;

      const expectedGridStyle = `${typeAbbr}${stories};${designStyle}`;

      const actualGridStyle = String(data.Subject['Design (Style)'] || '').trim();

      if (actualGridStyle && expectedGridStyle.replace(/\s/g, '').toLowerCase() !== actualGridStyle.replace(/\s/g, '').toLowerCase()) {
        isError = true;
        message = `Design/Style mismatch. Improvements section implies '${expectedGridStyle}', but Sales Grid has '${actualGridStyle}'.`;
      } else if (actualGridStyle) {
        isMatch = true;
      }
    }
    function checkYearBuiltVsActualAge() {
      const isYearBuiltField = field === 'Year Built' && fieldPath.length === 1;
      const isActualAgeField = field === 'Actual Age' && fieldPath[0] === 'Subject';

      if (!isYearBuiltField && !isActualAgeField) return;
      if (!data || !data.Subject) return;

      const yearBuiltStr = String(data['Year Built'] || '').trim();
      const actualAgeStr = String(data.Subject['Actual Age'] || '').trim();

      if (!yearBuiltStr || !actualAgeStr) return;

      const yearBuilt = parseInt(yearBuiltStr, 10);
      const actualAge = parseInt(actualAgeStr.replace(/[^0-9]/g, ''), 10);
      const currentYear = new Date().getFullYear();

      if (isNaN(yearBuilt) || isNaN(actualAge)) return;

      const calculatedAge = currentYear - yearBuilt;

      if (Math.abs(calculatedAge - actualAge) > 1) {
        if (!isError) { // Don't overwrite a more specific error
          isError = true;
          message = `Age mismatch: Year Built (${yearBuilt}) implies an age of ~${calculatedAge} years, but Actual Age is ${actualAge}.`;
        }
      } else if (!isError) {
        isMatch = true; // Only set match if no other error has been found
      }
    }
    function checkBasementConsistency() {
      const fieldsToCheck = [
        'Basement Area sq.ft.',
        'Basement Finish %',
        'Basement & Finished'
      ];

      if (!fieldsToCheck.some(f => field.includes(f))) return;

      const areaStr = String(data['Basement Area sq.ft.'] || '').trim();
      const finishStr = String(data['Basement Finish %'] || '').trim();
      const gridValue = String(data.Subject?.['Basement & Finished'] || '').trim();

      if (!areaStr || !finishStr || !gridValue) return;

      const area = parseFloat(areaStr.replace(/[^0-9.]/g, ''));
      const finishPercent = parseFloat(finishStr.replace(/[^0-9.]/g, ''));

      const gridFinishedAreaMatch = gridValue.match(/(\d+)\s*sf\s*fin/i) || gridValue.match(/(\d+)\s*sfin/i);
      const gridFinishedArea = gridFinishedAreaMatch ? parseFloat(gridFinishedAreaMatch[1]) : NaN;

      if (isNaN(area) || isNaN(finishPercent) || isNaN(gridFinishedArea)) return;

      const calculatedFinishedArea = Math.round(area * (finishPercent / 100));

      if (Math.abs(calculatedFinishedArea - gridFinishedArea) > 1) {
        isError = true;
        message = `Basement mismatch: Improvements section implies ${calculatedFinishedArea}sf finished, but Sales Grid has ${gridFinishedArea}sf.`;
      } else if (!isError) {
        isMatch = true;
      }
    }
    function checkHousingPriceAndAge() {
      const priceField = "one unit housing price(high,low,pred)";
      const ageField = "one unit housing age(high,low,pred)";

      if (field !== priceField && field !== ageField) return;

      const housingData = allData?.NEIGHBORHOOD?.[field];
      if (typeof housingData !== 'object' || housingData === null) return;

      const highStr = String(housingData.high || '0').replace(/[^0-9.-]+/g, "");
      const lowStr = String(housingData.low || '0').replace(/[^0-9.-]+/g, "");
      const predStr = String(housingData.pred || '0').replace(/[^0-9.-]+/g, "");

      const high = parseFloat(highStr);
      const low = parseFloat(lowStr);
      const pred = parseFloat(predStr);

      if (isNaN(high) || isNaN(low) || isNaN(pred)) return false;

      if (!(high >= pred && pred >= low)) {
        isError = true;
        const fieldName = field.includes('price') ? 'Price' : 'Age';
        message = `${fieldName} values are inconsistent. Expected High >= Predominant >= Low. (High: ${housingData.high}, Pred: ${housingData.pred}, Low: ${housingData.low})`;
        // Stop further validation
      } else {
        isMatch = true;
      }
      return false;
    }
    function checkSpecificZoningClassification() {
      if (field !== 'Specific Zoning Classification') return;
      const value = String(text || '').trim();
      const validValues = ['R1', 'R2', 'Residence'];
      const regex = new RegExp(`\\b(${validValues.join('|')})\\b`, 'i');

      if (value && regex.test(value)) {
        isMatch = true;
      } else if (value) {
        isError = true;
        message = `Invalid Specific Zoning Classification: '${value}'. Expected to contain R1, R2, or Residence.`;
      }
    }
    function checkNeighborhoodBoundaries() {
      if (field !== 'Neighborhood Boundaries') return;

      const value = String(text || '').toLowerCase();
      if (!value) return; // Don't validate if empty

      const requiredWords = ['north', 'south', 'east', 'west'];
      const missingWords = requiredWords.filter(word => !value.includes(word));

      if (missingWords.length > 0) {
        isError = true;
        message = `Neighborhood Boundaries is missing required directions: ${missingWords.join(', ').toUpperCase()}.`;
      } else if (!isError) {
        isMatch = true;
      }
    }
    function checkPhysicalDeficiencies() {
      const fieldName = "Are there any physical deficiencies or adverse conditions that affect the livability, soundness, or structural integrity of the property? If Yes, describe";
      if (field !== fieldName) return;

      const value = String(text || '').trim().toLowerCase();
      if (value !== 'yes') {
        isError = true;
        message = `Value must be 'Yes' for this field.`;
      } else {
        isMatch = true;
      }
    }

    const checkActualAgeAdjustment = () => {
      const isAdjustmentField = field === 'Actual Age Adjustment';
      if (!isAdjustmentField || !saleName || saleName === 'Subject' || !allData || !allData.Subject) return;

      const subjectAgeStr = String(allData.Subject['Actual Age'] || '').trim();
      const compAgeStr = String(allData[saleName]?.['Actual Age'] || '').trim();
      const adjustmentStr = String(text || '').trim();

      if (!subjectAgeStr || !compAgeStr) return;

      const subjectAge = parseInt(subjectAgeStr, 10);
      const compAge = parseInt(compAgeStr, 10);

      if (isNaN(subjectAge) || isNaN(compAge)) return;

      if (subjectAge === compAge) {
        if (adjustmentStr && adjustmentStr !== '0' && adjustmentStr !== '$0') {
          isError = true;
          message = `Subject and Comp Actual Age are the same (${subjectAge}), so no adjustment is needed.`;
        } else {
          isMatch = true;
        }
      } else { // subjectAge !== compAge
        if (!adjustmentStr || adjustmentStr === '0' || adjustmentStr === '$0') {
          isError = true;
          message = `Subject and Comp Actual Age are different, so an adjustment is required.`;
        } else {
          isMatch = true;
        }
      }
    };

    const checkCompDesignStyle = () => {
      if (field !== 'Design (Style)' || !saleName || saleName === 'Subject' || !allData || !allData.Subject) return;
    };
    const checkLeaseholdFeeSimpleConsistency = () => {
      if (field !== 'Leasehold/Fee Simple') return;
      if (!allData) return;

      const comparableSaleKeys = Object.keys(allData).filter(k => k.startsWith('COMPARABLE SALE #'));
      const allKeys = ['Subject', ...comparableSaleKeys];

      const allValues = allKeys
        .map(key => allData[key]?.['Leasehold/Fee Simple'] || (key === 'Subject' ? allData.Subject?.['Property Rights Appraised'] : null))
        .map(val => String(val || '').trim())
        .filter(Boolean);

      if (allValues.length < 2) return; // Not enough data to compare

      const uniqueValues = new Set(allValues);

      if (uniqueValues.size > 1) {
        isError = true;
        message = `Inconsistent 'Leasehold/Fee Simple' values found across Subject and Comparables.`;
      } else if (!isError) {
        isMatch = true;
      }
    };
    const checkDataSourceDOM = () => {
      if (field !== 'Data Source(s)' || !saleName || saleName === 'Subject') return;

      const textValue = String(text || '').trim();
      if (!textValue) return;

      const domIndex = textValue.toLowerCase().indexOf('dom');

      if (domIndex !== -1) {
        const restOfString = textValue.substring(domIndex + 3).trim();
        // Check if there is any non-whitespace character after 'DOM'
        if (restOfString.replace(/[:\s]/g, '') === '') {
          isError = true;
          message = `Value for 'DOM' is missing in Data Source(s).`;
        } else {
          isMatch = true;
        }
      }
    };

    // const checkLocationConsistency = () => {
    //   if (field !== 'Location' || !saleName || saleName === 'Subject' || !allData || !allData.Subject) return;

    //   const subjectLocation = String(allData.Subject['Location'] || '').trim();
    //   const compLocation = String(text || '').trim();

    //   if (!subjectLocation || !compLocation) return;

    //   if (subjectLocation === compLocation) {
    //     if (!isError) {
    //       isMatch = true;
    //     }
    //   } else {
    //     isError = true;
    //     message = `Location mismatch: Subject is '${subjectLocation}' but Comp is '${compLocation}'.`;
    //   }
    // };
    const checkHeatingCoolingAdjustment = () => {
      const isHeatingCoolingField = field === 'Heating/Cooling' || field === 'Heating/Cooling Adjustment';
      if (!isHeatingCoolingField || !allData || !allData.Subject || !saleName) return;

      const subjectHeatingCooling = String(allData.Subject['Heating/Cooling'] || '').trim();
      const compHeatingCooling = String(allData[saleName]?.['Heating/Cooling'] || '').trim();
      const adjustmentText = String(allData[saleName]?.['Heating/Cooling Adjustment'] || '').trim();

      if (!subjectHeatingCooling || !compHeatingCooling) return;

      if (subjectHeatingCooling === compHeatingCooling) {
        if (adjustmentText && adjustmentText !== '0' && adjustmentText !== '$0') {
          isError = true;
          message = `Heating/Cooling is the same (${compHeatingCooling}), but an adjustment of '${adjustmentText}' is present.`;
        } else {
          isMatch = true;
        }
      } else { // Values are different
        if (!adjustmentText) {
          isError = true;
          message = `Heating/Cooling mismatch (Subject: '${subjectHeatingCooling}', Comp: '${compHeatingCooling}'). An adjustment is required.`;
        } else {
          isMatch = true;
        }
      }
    };

    function checkConditionDescriptionConsistency() {
      // This validation should run for 'Condition' in the Subject column of the sales grid.
      if (field !== 'Condition' || (fieldPath && fieldPath[0] !== 'Subject')) {
        return;
      }

      const conditionValue = String(text || '').trim().toLowerCase();
      const conditionDescription = String(data['Describe the condition of the property'] || '').trim().toLowerCase();

      if (!conditionValue || !conditionDescription) {
        return; // Not enough data to validate
      }

      if (conditionDescription.includes(conditionValue)) {
        isMatch = true;
      } else {
        isError = true;
        message = `The Subject's Condition ('${text}') is not mentioned in the 'Describe the condition of the property' field.`;
      }
    }

    function checkRETaxes() {
      if (field !== 'R.E. Taxes $') return;
      const taxesValue = String(text || '').trim();
      if (!taxesValue) return;

      // Remove commas and get only the integer part for digit count
      const integerPart = taxesValue.split('.')[0].replace(/,/g, '');

      if (integerPart.length > 5) {
        isError = true;
        message = `R.E. Taxes value cannot be more than 5 digits.`;
      }
    }

    const checkTaxYear = () => {
      if (field !== 'Tax Year') return;
      const taxYearValue = String(text || '').trim();
      if (!taxYearValue) return;

      const taxYear = parseInt(taxYearValue, 10);
      if (isNaN(taxYear)) {
        isError = true;
        message = `Tax Year must be a valid year.`;
        return;
      }

      const currentYear = new Date().getFullYear();

      if (taxYear > currentYear) {
        isError = true;
        message = `Tax Year (${taxYear}) cannot be in the future.`;
      } else if (taxYear < currentYear - 1) {
        isError = true;
        message = `Tax Year (${taxYear}) cannot be more than two years in the past.`;
      }
    }

    const checkFoundationWallsCondition = () => {
      if (field !== 'Foundation Walls (Material/Condition)' || !data) return;

      const value = String(text || '').trim().toLowerCase();
      if (!value) return; // Don't validate if empty

      const validKeywords = ['avg', 'good', 'better', 'best'];
      const containsKeyword = validKeywords.some(keyword => value.includes(keyword));

      if (containsKeyword) {
        isMatch = true;

      } else {
        isError = true;
        message = `Foundation Walls (Material/Condition) must include one of: 'avg', 'good', 'better', 'best'.`;
      }
    }

    const checkRoofSurfaceCondition = () => {
      if (field !== 'Roof Surface (Material/Condition)') return;

      const value = String(text || '').trim().toLowerCase();
      if (!value) return; // Don't validate if empty

      const validKeywords = ['avg', 'good', 'better', 'best'];
      const containsKeyword = validKeywords.some(keyword => value.includes(keyword));

      if (containsKeyword) {
        isMatch = true;
      } else {
        isError = true;
        message = `Roof Surface (Material/Condition) must include one of: 'avg', 'good', 'better', 'best'.`;
      }
    };
    const checkUtilities = (field, text) => {
      const utilityFields = ["Electricity", "Gas", "Water", "Sanitary Sewer", "Street", "Alley"];
      if (!utilityFields.includes(field)) return null;

      const value = String(text || '').trim();
      if (!value) {
        return { isError: true, message: `'${field}' in the Site section cannot be blank.` };
      }
      return { isMatch: true };
    };

    // const validationChecks = [
    //   // General & High-Level Checks
    //   checkPhysicalDeficiencies,
    //   checkAssignmentTypeConsistency,
    //   checkContractFieldsMandatory,
    //   checkFinancialAssistanceInconsistency,

    //   // Subject & Site Section Checks
    //   checkZoning,
    //   checkSpecificZoningClassification,
    //   checkFemaInconsistency,
    //   checkHighestAndBestUse,
    //   checkFemaFieldsConsistency,
    //   checkViewInconsistency,
    //   checkAreaInconsistency,
    //   checkTaxYear,
    //   checkRETaxes,
    //   checkPropertyRightsInconsistency,

    //   // Neighborhood Section Checks
    //   checkHousingPriceAndAge,
    //   checkNeighborhoodUsageConsistency,
    //   checkNeighborhoodBoundaries,

    //   // Improvements Section Checks
    //   checkFoundationWallsCondition,
    //   checkRoofSurfaceCondition,
    //   checkDesignStyleConsistency,
    //   checkYearBuiltVsActualAge,
    //   checkBasementConsistency,
    //   checkConditionDescriptionConsistency,

    //   // Sales Comparison Grid Checks
    //   checkSubjectAddressInconsistency,
    //   checkDesignStyleAdjustment,
    //   checkQualityOfConstructionAdjustment,
    //   checkConditionAdjustment,
    //   checkBedroomsAdjustment,
    //   checkBathsAdjustment,
    //   checkSiteAdjustment,
    //   checkGrossLivingAreaAdjustment,
    //   checkFunctionalUtilityAdjustment,
    //   checkEnergyEfficientItemsAdjustment,
    //   checkPorchPatioDeckAdjustment,
    //   checkHeatingCoolingAdjustment,
    //   checkProximityToSubject,
    //   checkDateOfSale,
    //   checkDataSourceDOM,
    //   checkActualAgeAdjustment,
    //   checkLeaseholdFeeSimpleConsistency,
    //   checkCompDesignStyle,

    //   // Appraiser/Lender Checks
    //   checkLenderAddressInconsistency,
    //   checkLenderNameInconsistency,
    // ];

    const getGeneralValidationChecks = () => [
      checkPhysicalDeficiencies,
      checkAssignmentTypeConsistency,
      checkContractFieldsMandatory,
      checkFinancialAssistanceInconsistency,
    ];

    const getSubjectAndSiteValidationChecks = () => [
      checkZoning,
      checkSpecificZoningClassification,
      checkFemaInconsistency,
      checkHighestAndBestUse,
      checkFemaFieldsConsistency,
      checkViewInconsistency,
      checkAreaInconsistency,
      checkTaxYear,
      checkRETaxes,
      checkPropertyRightsInconsistency,
      checkUtilities,
    ];

    const getNeighborhoodValidationChecks = () => [
      checkHousingPriceAndAge,
      checkNeighborhoodUsageConsistency,
      checkNeighborhoodBoundaries,
    ];

    const getImprovementsValidationChecks = () => [
      checkFoundationWallsCondition,
      checkRoofSurfaceCondition,
      checkDesignStyleConsistency,
      checkYearBuiltVsActualAge,
      checkBasementConsistency,
      checkConditionDescriptionConsistency,
    ];

    const getSalesComparisonValidationChecks = () => [
      checkSubjectAddressInconsistency,
      checkDesignStyleAdjustment,
      checkQualityOfConstructionAdjustment,
      checkConditionAdjustment,
      checkBedroomsAdjustment,
      checkBathsAdjustment,
      checkSiteAdjustment,
      checkGrossLivingAreaAdjustment,
      checkFunctionalUtilityAdjustment,
      checkEnergyEfficientItemsAdjustment,
      checkPorchPatioDeckAdjustment,
      checkHeatingCoolingAdjustment,
      checkProximityToSubject,
      checkDateOfSale,
      checkDataSourceDOM,
      checkActualAgeAdjustment,
      checkLeaseholdFeeSimpleConsistency,
      checkCompDesignStyle,
    ];

    const getAppraiserLenderValidationChecks = () => [
      checkLenderAddressInconsistency,
      checkLenderNameInconsistency,
    ];

    const fieldLevelChecks = [
      ...getGeneralValidationChecks(),
      ...getSubjectAndSiteValidationChecks(),
      ...getNeighborhoodValidationChecks(),
      ...getImprovementsValidationChecks(),
    ];

    const crossFieldChecks = [
      ...getSalesComparisonValidationChecks(),
      ...getAppraiserLenderValidationChecks(),
    ];

    const validationChecks = [...fieldLevelChecks, ...crossFieldChecks];

    validationChecks.forEach(validationFn => {
      if (isError) return;
      const result = validationFn(field, text, allData, fieldPath, saleName);
      if (result) {
        if (result.isError) {
          isError = true;
          message = result.message;
        } else if (result.isMatch) {
          isMatch = true;
        }
      }
    });

    let style = {};
    if (isError) {
      style = { backgroundColor: '#ff0015ff', color: '#000000ff', padding: '2px 5px', borderRadius: '4px', border: '1px solid #721c24' };
    } else if (isMatch) {
      style = { backgroundColor: '#91ff00ff', color: '#000000', padding: '2px 5px', borderRadius: '4px' };
      message = "Validation successful!"; // Set a success message
    } else if (field === 'Zoning Compliance' && text?.trim() === 'Legal Nonconforming (Grandfathered Use)') {
      style = { backgroundColor: '#ff9d0bff', color: '#ffffff', padding: '2px 5px', borderRadius: '4px' };
    }

    return { style, message };
  };

  const validation = getValidationInfo(fieldPath.slice(-1)[0], value, allData, fieldPath);
  const fieldContent = (
    <div className={`editable-field-container ${isAdjustment ? 'adjustment-value' : ''}`} onClick={handleContainerClick} style={{ ...(isMissing ? { border: '2px solid #ff50315b' } : {}), ...validation.style }}>
      {isEditing ? (
        React.createElement(usePre ? 'textarea' : 'input', {
          type: "text",
          value: value,
          onChange: (e) => onDataChange(fieldPath, e.target.value),
          onBlur: () => setEditingField(null),
          onKeyDown: handleKeyDown,
          autoFocus: true,
          className: inputClassName || `form-control form-control-sm ${isAdjustment ? 'adjustment-value' : ''}`,
          style: inputStyle || { width: '100%', border: '1px solid #ccc', background: '#fff', padding: 0, height: 'auto', resize: usePre ? 'vertical' : 'none' },
          rows: usePre ? 3 : undefined
        })
      ) : (
        <>
          {(() => {
            if (typeof value === 'object' && value !== null && !React.isValidElement(value)) {
              return JSON.stringify(value);
            }

            const neighborhoodUsageFields = ["One-Unit", "2-4 Unit", "Multi-Family", "Commercial", "Other"];
            if (fieldPath[0] === 'NEIGHBORHOOD' && neighborhoodUsageFields.includes(fieldPath.slice(-1)[0])) {
              const numericValue = String(value || '').replace('%', '').trim();
              return `${numericValue}%`;
            }

            let displayValue = value;
            const finalField = fieldPath.slice(-1)[0];
            if (finalField === 'Report data source(s) used, offering price(s), and date(s)') {
              displayValue = <HighlightKeywords text={value} keywords={['DOM', 'MLS', ' listed for', 'for ', 'Listed on', 'from', 'until', 'RMLS', 'sale on']} />;
            } else if (finalField === 'Neighborhood Boundaries') {
              displayValue = <HighlightKeywords text={value} keywords={['North', 'East', 'West', 'South']} />;
            }

            if (usePre) {
              return <pre className={`editable-field-pre ${isAdjustment ? 'adjustment-value' : ''}`}>{displayValue}</pre>;
            } else {
              return <span className={`editable-field-span ${isAdjustment ? 'adjustment-value' : ''}`}>{displayValue}</span>;
            }
          })()}
        </>
      )}
    </div>
  );

  if (validation.message) {
    return <Tooltip title={validation.message} placement="top" arrow>{fieldContent}</Tooltip>;
  }
  return (
    <div>
      {fieldContent}
    </div>
  );
};

export const FieldTable = ({ id, title, fields, data, cardClass = 'bg-primary', usePre = false, extractionAttempted, onDataChange, editingField, setEditingField }) => {
  return (
    <div id={id} style={{ marginBottom: '1rem', marginTop: '1rem' }} className="card shadow mb-4">
      <div className={`card-header CAR1 ${cardClass} text-white`} style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <strong>{title}</strong>
      </div>
      <div className="card-body p-0 table-container">
        <table className="table table-hover table-striped mb-0">
          <tbody>
            {fields.map((field, index) => {

              const fieldLabel = typeof field === 'object' && field !== null ? `${field.choice} ${field.comment || ''}`.trim() : field;
              const value = data[fieldLabel];
              const isMissing = extractionAttempted && (value === undefined || value === null || value === '');
              return (
                <tr key={index}>
                  <td style={{ width: usePre ? '35%' : '50%' }}>
                    {typeof field === 'object' && field !== null ? `${field.choice} ${field.comment || ''}`.trim() : field}
                  </td>
                  <td style={isMissing ? { border: '2px solid red' } : {}} >
                    <EditableField
                      fieldPath={[fieldLabel]}
                      value={value || ''}
                      onDataChange={(path, val) => onDataChange(path[0], val)}
                      editingField={editingField}
                      setEditingField={setEditingField}
                      usePre={usePre} isMissing={isMissing}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const MarketConditionsTable = ({ id, title, data, onDataChange, editingField, setEditingField, marketConditionsRows = [] }) => {
  const columns = ["Prior 7-12 Months", "Prior 4-6 Months", "Current-3 Months", "Overall Trend"];

  return (
    <div id={id} style={{ marginBottom: '1rem', marginTop: '1rem' }} className="card shadow mb-4">
      <div className="card-header CAR1 bg-warning text-dark" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <strong>{title}</strong>
      </div>
      <div className="card-body p-0 table-container">
        <table className="table table-hover table-striped mb-0" style={{ fontSize: '0.8rem' }}>
          <thead className="table-light">
            <tr>
              <th className="border border-gray-400 p-1 bg-gray-200" style={{ width: '30%' }}>Inventory Analysis</th>
              {columns.map(col => <th key={col} className="border border-gray-400 p-1 bg-gray-200">{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {marketConditionsRows.map(row => (
              <tr key={row.label}>
                <td className="border border-gray-400 p-1 font-medium" style={{ width: '40%' }}>{row.label}</td>
                {columns.map(col => {
                  const fieldName = `${row.fullLabel} (${col.replace(/ /g, '')})`;
                  const marketData = data?.MARKET_CONDITIONS ?? {};
                  const value = marketData[fieldName] || '';

                  return (
                    <td key={col} className="border border-gray-400 p-1">
                      <EditableField
                        fieldPath={[fieldName]}
                        value={value}
                        onDataChange={(path, val) => onDataChange(path, val)}
                        editingField={editingField}
                        setEditingField={setEditingField} isMissing={!value}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const SubjectInfoCard = ({ id, title, fields, data, extractionAttempted, onDataChange, isEditable, editingField, setEditingField, highlightedFields, allData, comparisonData, getComparisonStyle }) => {
  const renderGridItem = (field) => {
    const isHighlighted = highlightedFields.includes(field);
    const itemStyle = {};
    if (extractionAttempted && (data[field] === undefined || data[field] === null || data[field] === '')) {
      itemStyle.padding = '4px';
      itemStyle.borderRadius = '4px';
    }

    let displayValue = data[field] || '';
    let fieldPath = [field];

    const comparisonStyle = getComparisonStyle ? getComparisonStyle(field, displayValue, comparisonData?.[field]) : {};



    if (field === 'PUD') {
      const perMonth = data['PUD Fees (per month)'];
      const perYear = data['PUD Fees (per year)'];
      if (perMonth) {
        displayValue = `${displayValue} per month`;
      } else if (perYear) {
        displayValue = `${displayValue} per year`;
      }
    }

    return (
      <div key={field} className={`subject-grid-item ${isHighlighted ? 'highlighted-field' : ''}`} style={{ ...itemStyle, ...comparisonStyle }}>
        <span className="field-label">{field}</span>
        <EditableField
          fieldPath={fieldPath}
          value={displayValue}
          onDataChange={onDataChange}
          editingField={editingField}
          setEditingField={setEditingField}
          isMissing={extractionAttempted && (data[field] === undefined || data[field] === null || data[field] === '')}
          allData={allData || data}
          isEditable={isEditable || field === 'Property Address'}
        />
      </div>
    );
  };

  return (
    <div id={id} className="card shadow mb-4 subject-info-card">
      <div className="card-header CAR1 bg-secondary text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <strong>{title}</strong>
      </div>
      <div className="card-body subject-grid-container">
        {fields
          .filter(field =>
            field !== 'HOA(per month)' &&
            field !== 'HOA(per year)' &&
            field !== 'PUD Fees (per month)' &&
            field !== 'PUD Fees (per year)'
          )
          .map(field => renderGridItem(field))
        }
      </div>
    </div>
  );
};

export const GridInfoCard = ({ id, title, fields, data, cardClass = 'bg-secondary', usePre = false, extractionAttempted, onDataChange, editingField, setEditingField, highlightedFields = [], allData }) => {

  const renderNeighborhoodTotal = () => {
    if (id !== 'neighborhood-section' || !data) return null;

    const usageFields = ["One-Unit", "2-4 Unit", "Multi-Family", "Commercial", "Other"];
    const values = usageFields.map(f => {
      const val = String(data[f] || '0').replace('%', '').trim();
      return parseFloat(val) || 0;
    });
    const total = values.reduce((sum, v) => sum + v, 0);

    const totalStyle = {
      fontWeight: 'bold',
      padding: '2px 8px',
      borderRadius: '4px',
      color: total === 100 ? '#000000' : '#721c24',
      backgroundColor: total === 100 ? '#91ff00ff' : '#f8d7da',
    };

    return <span style={totalStyle}>Total: {total}%</span>;
  };

  const renderValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).map(([key, val]) => `${key}: ${val}`).join(', ');
    }
    return value || '';
  };

  const renderGridItemValue = (field) => {
    if (field === 'Garage Att./Det./Built-in') {
      const att = data['Garage Att.'] || '';
      const det = data['Garage Detached'] || '';
      const builtin = data['Garage Built-in'] || '';
      return [att, det, builtin].filter(Boolean).join(' / ');
    }
    return renderValue(data[field]);
  };

  const renderGridItem = (field) => {
    const isHighlighted = highlightedFields.includes(field);
    let isItemMissing = extractionAttempted && (!data || renderGridItemValue(field) === '');

    if (field === 'Garage Att./Det./Built-in') {
      const att = data['Garage Att.'] || '';
      const det = data['Garage Detached'] || '';
      const builtin = data['Garage Built-in'] || '';
      isItemMissing = extractionAttempted && !att && !det && !builtin;
    }
    return (
      <div key={field} className={`subject-grid-item ${isHighlighted ? 'highlighted-field' : ''}`}>
        <span className="field-label">{field}</span>
        <EditableField
          fieldPath={(() => {
            const baseFieldPath = Array.isArray(field) ? field : [field];

            return onDataChange.length === 2 ? baseFieldPath : [id.replace('-section', '').toUpperCase(), ...baseFieldPath];
          })()}
          value={data ? renderGridItemValue(field) : ''}
          onDataChange={onDataChange}
          editingField={editingField}
          setEditingField={setEditingField}
          usePre={usePre}
          isMissing={isItemMissing}
          inputClassName={`form-control form-control-sm ${usePre ? "field-value-pre" : "field-value"}`}
          isEditable={true}
          allData={allData}
          inputStyle={{ width: '100%', border: 'none', background: 'transparent', padding: 0, height: 'auto', resize: usePre ? 'vertical' : 'none' }}
        />
      </div>
    );
  };

  return (
    <div id={id} className="card shadow mb-4">
      {id === 'neighborhood-section' && (
        <div className="card-header grid-info-header bg-secondary">
          <h5 className="grid-info-title"> </h5>
        </div>
      )}
      <div className={`card-header grid-info-header ${cardClass}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h5 className="grid-info-title">{title}</h5>
          {renderNeighborhoodTotal()}
        </div>
      </div>
      <div className="card-body subject-grid-container">
        {fields.map(field => renderGridItem(field))}
      </div>
    </div>
  );
};
