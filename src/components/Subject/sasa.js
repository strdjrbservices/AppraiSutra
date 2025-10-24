import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';

import { Button, Stack } from '@mui/material';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function Sasa() {
  const [data, setData] = useState({});
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const fields = [
    'Property Address',
    'City',
    'County',
    'State',
    'Zip Code',
    'Borrower',
    'Owner of Public Record',
    'Legal Description',
    "Assessor's Parcel #",
    'Tax Year',
    'R.E. Taxes $',
    'Neighborhood Name',
    'Map Reference',
    'Census Tract',
    'Occupant',
    'Special Assessments $',
    'PUD',
    'HOA $ per year',
    'HOA $ per month',
    'Property Rights Appraised',
    'Assignment Type',
    'Lender/Client',
    'Address (Lender/Client)',
    'Offered for Sale in Last 12 Months',
    'Report data source(s) used, offering price(s), and date(s)'
  ];

  const patterns = {
    "Property Address": /Property Address[:\s]*([A-Za-z0-9\s\.\,\-]+)\s*City/i,
    "City": /City[:\s]*([A-Za-z\s\-]+)\s*County/i,
    "County": /County[:\s]*([A-Za-z\s\-]+)\s*State/i,
    "State": /State[:\s]*([A-Z]{2})\s*Zip Code/i,
    "Zip Code": /Zip Code[:\s]*(\d{5}(?:-\d{4})?)\s*Borrower/i,
    "Borrower": /Borrower[:\-]?\s*(.+?)\s*Owner/i,
    "Owner of Public Record": /Owner\s*of\s*Public\s*Record[:\-]?\s*(.+?)\s*County/i,
    "Legal Description": /Legal Description[:\s]*([A-Za-z0-9\s\.\,\-\:]+)\s*Assessor's Parcel #/i,
    "Assessor's Parcel #": /Assessor's Parcel #[:\s]*([A-Za-z0-9\s\.\-]+)\s*Tax Year/i,
    "Tax Year": /Tax Year[:\s]*(\d{4})\s*R\.E\. Taxes \$/i,
    "R.E. Taxes $": /R\.E\. Taxes \$[:\s]*([\d,\.]+)\s*Neighborhood Name/i,
    "Neighborhood Name": /Neighborhood Name[:\s]*([A-Za-z\s\.\-]+)\s*Map Reference/i,
    "Map Reference": /Map Reference[:\s]*([A-Za-z0-9\s\.\-]+)\s*Census Tract/i,
    "Census Tract": /Census Tract[:\s]*([A-Za-z0-9\s\.\-]+)\s*Occupant/i,
    "Occupant": /Occupant[:\s]*(Owner|Tenant|Vacant)\s*Special Assessments/i,
    "Special Assessments $": /Special Assessments \$[:\s]*([\d,\.]+)\s*PUD/i,
    "PUD": /PUD\s*(X)?\s*HOA \$/i,
    "HOA $ per year": /HOA \$[:\s]*([\d,\.]+)\s*per year/i,
    "HOA $ per month": /HOA \$[:\s]*([\d,\.]+)\s*per month/i,
    "Property Rights Appraised": /Property Rights Appraised[:\s]*(Fee Simple|Leasehold|Other \(describe\))\s*Assignment Type/i,
    "Assignment Type": /Assignment Type[:\s]*(Purchase Transaction|Refinance Transaction|Other \(describe\))\s*Lender\/Client/i,
    "Lender/Client": /Lender\/Client[:\-]?\s*(.+)/i,
    "Address (Lender/Client)": /Address[:\s]*([A-Za-z0-9\s\.\,\-]+)\s*Is the subject property currently offered for sale/i,
    "Offered for Sale in Last 12 Months": /Is the subject property currently offered for sale or has it been offered for sale in the twelve months prior to the effective date of this appraisal\?\s*(Yes|No)/i,
    "Report data source(s) used, offering price(s), and date(s)": /Report data source\(s\) used, offering price\(s\), and date\(s\)\.([\s\S]+?)I did did not analyze the contract/i
  };

  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      alert(`File selected: ${file.name}`);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }

        const extractedData = {};
        fields.forEach(field => {
          const regex = patterns[field];
          if (regex) {
            const match = fullText.match(regex);
            // Safe .trim() to avoid runtime error if no match or undefined group
            extractedData[field] = match?.[1]?.trim() || 'N/A';
          } else {
            extractedData[field] = 'N/A';
          }
        });

        setData(extractedData);
      } catch (error) {
        alert('Error reading PDF: ' + error.message);
      }
    }
  };

  const handleRefresh = () => {
    setData({});
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="subject-container container mt-5">
      <div className="text-center mb-4">
        <h2 className="app-title">Appraisal Report Data Extractor</h2>
      </div>

      <Stack direction="row" spacing={2} justifyContent="center" className="mb-4">
        <Button variant="outlined" onClick={handleFileUpload}>
          Open File (.pdf)
        </Button>
        <Button variant="contained" color="warning" onClick={handleRefresh}>
          Refresh
        </Button>
      </Stack>

      <input
        type="file"
        accept=".pdf"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className="card shadow">
        <div className="card-header CAR1 bg-primary text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <strong>Subject Information</strong>
        </div>
        <div className="card-body p-0 table-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <table className="table table-hover table-striped mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '50%' }}>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody className="table-group-divider">
              {fields.map((field, index) => (
                <tr key={index}>
                  <td>{field}</td>
                  <td>{data[field] || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Sasa;
