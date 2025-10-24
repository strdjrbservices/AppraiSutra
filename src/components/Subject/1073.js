import React from 'react';
import { SubjectInfoCard, GridInfoCard, FieldTable, MarketConditionsTable } from './FormComponents';
import { ComparableAddressConsistency } from './subject';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SalesComparisonSection from './SalesComparisonSection';

const Form1073 = ({ data, extractionAttempted, handleDataChange, editingField, setEditingField, isEditable, highlightedSubjectFields, highlightedContractFields, subjectFields, contractFields, neighborhoodFields, salesGridRows, comparableSales, salesHistoryFields, priorSaleHistoryFields, salesComparisonAdditionalInfoFields, marketConditionsRows, marketConditionsFields, reconciliationFields, costApproachFields, incomeApproachFields, condoCoopProjectsFields, appraiserFields, supplementalAddendumFields, uniformResidentialAppraisalReportFields, appraisalAndReportIdentificationFields, projectSiteFields, projectInfoFields, projectAnalysisFields, unitDescriptionsFields, imageAnalysisFields, dataConsistencyFields, formType, comparisonData, getComparisonStyle }) => (
  <>
    <SubjectInfoCard id="subject-info" title="Subject Information" fields={subjectFields} data={data} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange([field], value)} isEditable={isEditable} editingField={editingField} setEditingField={setEditingField} highlightedFields={highlightedSubjectFields} allData={data} comparisonData={comparisonData} getComparisonStyle={getComparisonStyle} />
    <GridInfoCard id="contract-section" title="Contract Section" fields={contractFields} data={data.CONTRACT} cardClass="bg-secondary" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['CONTRACT', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} highlightedFields={highlightedContractFields} allData={data} />
    <GridInfoCard id="neighborhood-section" title="Neighborhood Section" fields={neighborhoodFields} data={data.NEIGHBORHOOD} cardClass="bg-info" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['NEIGHBORHOOD', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} allData={data} />
    <GridInfoCard id="project-site-section" title="Project Site" fields={projectSiteFields} data={data} cardClass="bg-primary" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />
    <GridInfoCard id="project-info-section" title="Project Information" fields={projectInfoFields} data={data} cardClass="bg-secondary" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />
    <GridInfoCard id="project-analysis-section" title="Project Analysis" fields={projectAnalysisFields} data={data} cardClass="bg-info" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />
    <GridInfoCard id="unit-descriptions-section" title="Unit Descriptions" fields={unitDescriptionsFields} data={data} cardClass="bg-warning" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />
    <GridInfoCard id="prior-sale-history-section" title="Prior Sale History" fields={priorSaleHistoryFields} data={data} cardClass="bg-dark" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />

    <SalesComparisonSection
      data={data}
      extractionAttempted={extractionAttempted}
      handleDataChange={handleDataChange}
      editingField={editingField}
      setEditingField={setEditingField}
      salesGridRows={salesGridRows}
      comparableSales={comparableSales}
      salesHistoryFields={salesHistoryFields}
      salesComparisonAdditionalInfoFields={salesComparisonAdditionalInfoFields}
      isEditable={isEditable}
      formType={formType}
    />

    <GridInfoCard id="reconciliation-section" title="RECONCILIATION" fields={reconciliationFields} data={data} cardClass="bg-secondary" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />
    <GridInfoCard id="cost-approach-section" title="Cost Approach" fields={costApproachFields} data={data} cardClass="bg-dark" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />
    <GridInfoCard id="income-approach-section" title="Income Approach" fields={incomeApproachFields} data={data} cardClass="bg-danger" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />
    <GridInfoCard id="condo-coop-section" title="CONDO/CO-OP PROJECTS" fields={condoCoopProjectsFields} data={data} cardClass="bg-primary" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />
    <GridInfoCard id="market-conditions-summary" title="Market Conditions Summary" fields={marketConditionsFields} data={data?.MARKET_CONDITIONS} cardClass="bg-warning" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['MARKET_CONDITIONS', field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />
    <MarketConditionsTable id="market-conditions-section" title="Market Conditions Addendum" data={data} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} marketConditionsRows={marketConditionsRows} />
    <GridInfoCard id="appraiser-section" title="Appraiser Section" fields={appraiserFields} data={data} cardClass="bg-info" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />
    <FieldTable id="supplemental-addendum-section" title="Supplemental Addendum" fields={supplementalAddendumFields} data={data} cardClass="bg-light text-dark" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange([field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />
    <FieldTable id="uniform-report-section" title="Uniform Residential Appraisal Report" fields={uniformResidentialAppraisalReportFields} data={data} cardClass="bg-dark" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange([field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />
    <FieldTable id="appraisal-id-section" title="Appraisal and Report Identification" fields={appraisalAndReportIdentificationFields} data={data} cardClass="bg-info" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange([field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />
    
    <ComparableAddressConsistency data={data} comparableSales={comparableSales} extractionAttempted={extractionAttempted} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} />

    <div id="data-consistency-section" style={{ marginBottom: '1rem', marginTop: '1rem' }} className="card shadow mb-4">
      <div className="card-header CAR1 bg-dark text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <strong>Data Consistency Check</strong>
      </div>
      <div className="card-body p-0 table-container">
        <table className="table table-hover table-striped mb-0">
          <thead className="table-light">
            <tr>
              <th>Feature</th>
              <th>Improvements</th>
              <th>Sales Grid</th>
              <th>Photos</th>
              <th>Floor Plan</th>
              <th>label correct?</th>
              <th>duplicate photo?</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(dataConsistencyFields).map((feature) => (
              <tr key={feature}>
                <td className="font-medium">{feature}</td>
                {Object.keys(dataConsistencyFields[feature]).map((source) => {
                  const fieldName = dataConsistencyFields[feature][source];
                  const value = data[fieldName];
                  const isMissing = extractionAttempted && (!value || value === '');
                  return (
                    <td key={source} style={isMissing ? { border: '2px solid red' } : {}}>
                      <EditableField 
                        fieldPath={[fieldName]}
                        value={value || ''}
                        onDataChange={(path, val) => handleDataChange(path, val)}
                        editingField={editingField} setEditingField={setEditingField}
                        isMissing={isMissing} 
                        isEditable={isEditable} />
                    </td>
                  );
                })}
                <td>
                  {feature === 'Bedroom' && <EditableField fieldPath={['photo and label of the Bedrooms correct are matching?']} value={data['photo and label of the Bedrooms correct are matching?'] || ''} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />}
                  {feature === 'Bathroom' && <EditableField fieldPath={['photo and label of the Bathrooms correct are matching?']} value={data['photo and label of the Bathrooms correct are matching?'] || ''} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />}
                </td>
                <td>
                  {feature === 'Bedroom' && <EditableField fieldPath={['check for the duplicate photo of the Bedrooms?']} value={data['check for the duplicate photo of the Bedrooms?'] || ''} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />}
                  {feature === 'Bathroom' && <EditableField fieldPath={['check for the duplicate photo of the Bathrooms?']} value={data['check for the duplicate photo of the Bathrooms?'] || ''} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {(() => {
                    const values = Object.values(dataConsistencyFields[feature]).map(fieldName => data[fieldName]).filter(Boolean);
                    if (values.length === 0) return null;
                    const uniqueValues = new Set(values.map(v => String(v).trim()));
                    const isConsistent = uniqueValues.size <= 1;
                    return isConsistent ? <CheckCircleOutlineIcon style={{ color: 'green' }} /> : <ErrorOutlineIcon style={{ color: 'red' }} />;
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <GridInfoCard id="image-analysis-section" title="Image Analysis" fields={imageAnalysisFields} data={data.IMAGE_ANALYSIS} cardClass="bg-dark" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['IMAGE_ANALYSIS', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} allData={data} />
  </>
);

export default Form1073;
