import google.generativeai as genai
import tempfile
import json
import os

# Securely configure the API key from an environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

#{{1004}}

# SUBJECT
SUBJECT_FIELDS = [
    'Property Address', 'City', 'County', 'State', 'Zip Code', 'Borrower', 'Owner of Public Record',
    'Legal Description', "Assessor's Parcel #", 'Tax Year', 'R.E. Taxes $', 'Neighborhood Name', 'Map Reference',
    'Census Tract', 'Occupant', 'Special Assessments $', 'PUD', 'HOA $', 'HOA(per year)', 'HOA(per month)',
    'Property Rights Appraised', 'Assignment Type', 'Lender/Client', 'Address (Lender/Client)',
    'Offered for Sale in Last 12 Months', 'Report data source(s) used, offering price(s), and date(s)',
]

# CONTRACT
CONTRACT_FIELDS = [
    'I did did not analyze the contract for sale for the subject purchase transaction. Explain the results of the analysis of the contract for sale or why the analysis was not performed.',
    'Contract Price $', 'Date of Contract', 'Is property seller owner of public record?', 'Data Source(s)',
    'Is there any financial assistance (loan charges, sale concessions, gift or downpayment assistance, etc.) to be paid by any party on behalf of the borrower?',
    'If Yes, report the total dollar amount and describe the items to be paid',
]

# NEIGHBORHOOD
NEIGHBORHOOD_FIELDS = [
    "Location", "Built-Up", "Growth", "Property Values", "Demand/Supply",
    "Marketing Time", "One-Unit", "2-4 Unit", "Multi-Family", "Commercial", "Other", "one unit housing price(high,low,pred)", "one unit housing age(high,low,pred)",
    "Neighborhood Boundaries", "Neighborhood Description", "Market Conditions:",
]

# SITE
SITE_FIELDS = [
    "Dimensions", "Area", "Shape", "View", "Specific Zoning Classification", "Zoning Description",
    "Zoning Compliance", "Is the highest and best use of subject property as improved (or as proposed per plans and specifications) the present use?",
    "Electricity", "Gas", "Water", "Sanitary Sewer", "Street", "Alley", "FEMA Special Flood Hazard Area",
    "FEMA Flood Zone", "FEMA Map #", "FEMA Map Date", "Are the utilities and off-site improvements typical for the market area?",
    "Are there any adverse site conditions or external factors (easements, encroachments, environmental conditions, land uses, etc.)?",
    "If Yes, describe",
]

# IMPROVEMENTS
IMPROVEMENTS_FIELDS = [
    "Units", "# of Stories", "Type", "Existing/Proposed/Under Const.",
    "Design (Style)", "Year Built", "Effective Age (Yrs)", "Foundation Type",
    "Basement Area sq.ft.", "Basement Finish %",
    "Evidence of", "Foundation Walls (Material/Condition)",
    "Exterior Walls (Material/Condition)", "Roof Surface (Material/Condition)",
    "Gutters & Downspouts (Material/Condition)", "Window Type (Material/Condition)",
    "Storm Sash/Insulated", "Screens", "Floors (Material/Condition)", "Walls (Material/Condition)",
    "Trim/Finish (Material/Condition)", "Bath Floor (Material/Condition)", "Bath Wainscot (Material/Condition)",
    "Attic", "Heating Type", "Fuel", "Cooling Type",
    "Fireplace(s) #", "Patio/Deck", "Pool", "Woodstove(s) #", "Fence", "Porch", "Other Amenities",
    "Car Storage", "Driveway # of Cars", "Driveway Surface", "Garage # of Cars", "Carport # of Cars",
    "Garage Att.", "Garage Det.", "Garage Built-in", "Appliances",
    "Finished area above grade Rooms", "Finished area above grade Bedrooms",
    "Finished area above grade Bath(s)", "Square Feet of Gross Living Area Above Grade",
    "Additional features", "Describe the condition of the property",
    "Are there any physical deficiencies or adverse conditions that affect the livability, soundness, or structural integrity of the property?", "If Yes, describe",
    "Does the property generally conform to the neighborhood (functional utility, style, condition, use, construction, etc.)?", "If No, describe",
]

# RECONCILIATION
RECONCILIATION_FIELDS = [
    'Indicated Value by: Sales Comparison Approach $', 'Cost Approach (if developed)', 'Income Approach (if developed)',
    "as of","final value"
    'This appraisal is made "as is", subject to completion per plans and specifications on the basis of a hypothetical condition that the improvements have been completed, subject to the following repairs or alterations on the basis of a hypothetical condition that the repairs or alterations have been completed, or subject to the following required inspection based on the extraordinary assumption that the condition or deficiency does not require alteration or repair:',
]

# COST APPROACH
COST_APPROACH_FIELDS = [
    "Provide adequate information for the lender/client to replicate the below cost figures and calculations.",
    "Support for the opinion of site value (summary of comparable land sales or other methods for estimating site value)",
    "Estimated",
    "Source of cost data",
    "Quality rating from cost service ",
    "Effective date of cost data ",
    "Comments on Cost Approach (gross living area calculations, depreciation, etc.) ",
    "Estimated Remaining Economic Life (HUD and VA only) ",
    "OPINION OF SITE VALUE = $ ................................................",
    "Dwelling",
    "Garage/Carport ",
    " Total Estimate of Cost-New  = $ ...................",
    "Depreciation ",
    "Depreciated Cost of Improvements......................................................=$ ",
    "“As-is” Value of Site Improvements......................................................=$",
    "Indicated Value By Cost Approach......................................................=$",
]

RentSchedulesFIELDS2 = [
        "Address",
        "Proximity to Subject",
        "Date Lease Begins",
        "Date Lease Expires",
        "Monthly Rental",
        "Less: Utilities",
        "Furniture",
        "Adjusted Monthly Rent",
        "Data Source",
        "Rent",
        "Concessions",
        "Location/View",
        "Design and Appeal",
        "Age/Condition",
        "Room Count Total",
        "Room Count Bdrms",
        "Room Count Baths",
        "Gross Living Area",
        "Other (e.g., basement, etc.)",
        "Other:",
        "Net Adj. (total)",
        "Indicated Monthly Market Rent",
]


# INCOME APPROACH
INCOME_APPROACH_FIELDS = [
    "Estimated Monthly Market Rent $",
    "X Gross Rent Multiplier  = $",
    "Indicated Value by Income Approach",
    "Summary of Income Approach (including support for market rent and GRM) ",
]

# PUD INFORMATION
PUD_INFO_FIELDS = [
    "PUD Fees $",
    "PUD Fees (per month)",
    "PUD Fees (per year)",
    "Is the developer/builder in control of the Homeowners' Association (HOA)?", "Unit type(s)",
    "Provide the following information for PUDs ONLY if the developer/builder is in control of the HOA and the subject property is an attached dwelling unit.",
    "Legal Name of Project", "Total number of phases", "Total number of units", "Total number of units sold",
    "Total number of units rented", "Total number of units for sale", "Data source(s)", "Was the project created by the conversion of existing building(s) into a PUD?", " If Yes, date of conversion", "Does the project contain any multi-dwelling units? Yes No Data", "Are the units, common elements, and recreation facilities complete?", "If No, describe the status of completion.", "Are the common elements leased to or by the Homeowners' Association?",
    "If Yes, describe the rental terms and options.", "Describe common elements and recreational facilities."
]

# CERTIFICATION
CERTIFICATION_FIELDS = [
    "Signature", "Name", "Company Name", "Company Address", "Telephone Number", "Email Address", "Date of Signature and Report", "Effective Date of Appraisal", "State Certification #", "or State License #", "or Other (describe)", "State #", "State", "Expiration Date of Certification or License", "ADDRESS OF PROPERTY APPRAISED", "APPRAISED VALUE OF SUBJECT PROPERTY $",
    "LENDER/CLIENT Name",
    "Lender/Client Company Name",
    "Lender/Client Company Address",
    "Lender/Client Email Address",
]

# ADDENDUM
ADDENDUM_FIELDS = [
    "SUPPLEMENTAL ADDENDUM",
    "ADDITIONAL COMMENTS",
    "APPRAISER'S CERTIFICATION:",
    "SUPERVISORY APPRAISER'S CERTIFICATION:",
    "Analysis/Comments",
    "GENERAL INFORMATION ON ANY REQUIRED REPAIRS",
    "UNIFORM APPRAISAL DATASET (UAD) DEFINITIONS ADDENDUM",
]

# SALES OR TRANSFER HISTORY
SALES_TRANSFER_FIELDS = [
    "I did did not research the sale or transfer history of the subject property and comparable sales. If not, explain",
    "My research did did not reveal any prior sales or transfers of the subject property for the three years prior to the effective date of this appraisal.",
    "Data Source(s) for subject property research",
    "My research did did not reveal any prior sales or transfers of the comparable sales for the year prior to the date of sale of the comparable sale.",
    "Data Source(s) for comparable sales research",
    "Analysis of prior sale or transfer history of the subject property and comparable sales",
    "Summary of Sales Comparison Approach", "Indicated Value by Sales Comparison Approach $",
    "There are ____ comparable properties currently offered for sale in the subject neighborhood ranging in price from$ ___to $___",
    "There are ___comparable sales in the subject neighborhoodwithin the past twelvemonths ranging in sale price from$___ to $____"
]

# UNIFORM RESIDENTIAL APPRAISAL REPORT
UNIFORM_REPORT_FIELDS = [
    "SCOPE OF WORK:",
    "INTENDED USE:",
    "INTENDED USER:",
    "DEFINITION OF MARKET VALUE:",
    "STATEMENT OF ASSUMPTIONS AND LIMITING CONDITIONS:",
]

# APPRAISAL AND REPORT IDENTIFICATION
APPRAISAL_ID_FIELDS = [
    "This Report is one of the following types:", "Comments on Standards Rule 2-3", "Reasonable Exposure Time", "Comments on Appraisal and Report Identification"
]

# MARKET CONDITIONS
MARKET_CONDITIONS_FIELDS = [
    "Inventory Analysis Total # of Comparable Sales (Settled) (Prior 7-12 Months)",
    "Inventory Analysis Total # of Comparable Sales (Settled) (Prior 4-6 Months)",
    "Inventory Analysis Total # of Comparable Sales (Settled) (Current-3 Months)",
    "Inventory Analysis Total # of Comparable Sales (Settled) (Overall Trend)",
    "Instructions:",
    "Seller-(developer, builder, etc.)paid financial assistance prevalent?",
    "Explain in detail the seller concessions trends for the past 12 months (e.g., seller contributions increased from 3% to 5%, increasing use of buydowns, closing costs, condo fees, options, etc.).",
    "Are foreclosure sales (REO sales) a factor in the market?", "If yes, explain (including the trends in listings and sales of foreclosed properties).",
    "Cite data sources for above information.", "Summarize the above information as support for your conclusions in the Neighborhood section of the appraisal report form. If you used any additional information, such as an analysis of pending sales and/or expired and withdrawn listings, to formulate your conclusions, provide both an explanation and support for your conclusions."
]

# CONDO
CONDO_FIELDS = [
    "Subject Project Data Total # of Comparable Sales (Settled)(Prior 7–12 Months)(Prior 4–6 Months)(Current – 3 Months)(Overall Trend)",
    "Subject Project Data Absorption Rate (Total Sales/Months) (Prior 7–12 Months)(Prior 4–6 Months)(Current – 3 Months)(Overall Trend)",
    "Subject Project Data Total # of Comparable Active Listings (Prior 7–12 Months)(Prior 4–6 Months)(Current – 3 Months)(Overall Trend)",
    "Subject Project Data Months of Unit Supply (Total Listings/Ab.Rate) (Prior 7–12 Months)(Prior 4–6 Months)(Current – 3 Months)(Overall Trend)",
    "Are foreclosure sales (REO sales) a factor in the project?",
    "If yes, indicate the number of REO listings and explain the trends in listings and sales of foreclosed properties.",
    "Summarize the above trends and address the impact on the subject unit and project.",
]

#IMAGE
IMAGE_FIELDS =[
    "Extract the subject property address from the 'Subject Photos' section. Return as a JSON object like {'Subject Photo Address': 'address'}.",
    "Extract the subject property address from the 'Aerial Map' section. Return as a JSON object like {'Aerial Map Subject Address': 'address'}.",
    "Extract the subject property address from the 'Location Map' section. Return as a JSON object like {'Location Map Subject Address': 'address'}.",
    "Extract the address for each comparable sale from the 'Comparable Photos' section. Return as a JSON object like {'Comparable Photo Address 1': 'address', 'Comparable Photo Address 2': 'address', ...}.",
    "Extract the address for each comparable sale from the 'Location Map' section. Return as a JSON object like {'Location Map Address 1': 'address', 'Location Map Address 2': 'address', ...}.",
    "Analyze the interior photos and provide a count for each room type (bedroom, bathroom, kitchen, etc.), referencing the floor plan and improvements section. Return as a JSON object.",
    "For each comparable photo, check if the photo matches the property described in the sales comparison grid. Return as a JSON object like {'is label correct? 1': 'Yes' or 'No' or 'N/A', 'is label correct? 2': 'Yes' or 'No' or 'N/A', ...}.",
    "For each comparable photo, check if it is a duplicate of another comparable photo. Return as a JSON object like {'duplicate photo? 1': 'Yes' or 'No' or 'N/A', 'duplicate photo? 2': 'Yes' or 'No' or 'N/A', ...}.",
    "Verify and report on the consistency of comparable property addresses across the sales comparison grid, photos, and location map. Note any discrepancies or use of duplicate photos. Also, verify appraiser signature details against their license. Return as a JSON object.",
    "include bedroom, bed, bathroom, bath, half bath, kitchen, lobby, foyer, living room count with label and photo,please explan and match the floor plan with photo and improvement section, GLA",
    "please match comparable address in sales comparison approach and comparable photos, please make sure comp phto are not same, also find front, rear, street photo and make sure it is not same, capture any additionbal photo for adu according to check mark",
    "please match comparable address in sales comparison approach and comparable photos, please make sure comp phto are not same, also find front, rear, street photo and make sure it is not same, capture any additionbal photo for adu according to check mark, please match the same in location map, areial map should have subject address, please check signature section details of appraiser in appraiser license copy for accuracy"
]
    # "Subject related photos Count with Lables",
    # "subject address match with SALES COMPARISON APPROACH section, Comparable Photo Page, and Location Map",
    # "Bedroom photo count match with SALES COMPARISON APPROACH and IMPROVEMENTS section",
    # "Bathroom photo count match with SALES COMPARISON APPROACH and IMPROVEMENTS section",
    # "Comparable photos count and lables",
    # "Comparable lables and Address match with SALES COMPARISON APPROACH",
    # "Subject address match in areial map",
    # "Building Sketch summary",
    # "Appraiser licence summary",
    # "Name and other information of appraisaer match with licence and signature page"
# TOTAL ROOMS
# Interior Room & Floor Plan Matching:
# Identify and count all interior spaces: bedrooms, beds, bathrooms, half baths, kitchen, lobby, foyer, living room.
# Include labels and corresponding photos for each room.
# Match the floor plan with the provided photos and include an “Improvements” section.
# Include GLA (Gross Living Area) details.
# Sales Comparison Approach (Comps):
# Match comparable property addresses with the photos.
# Ensure no two comparable photos are identical.
# Capture front, rear, and street views for each comparable; ensure these are unique.
# Include any additional photos for ADU (Accessory Dwelling Unit) based on checkmarks.
# Location & Maps:
# Match comparable properties in the location map.
# Ensure the aerial map shows the subject property address.
# Appraiser Verification:
# Check the signature section details against the appraiser’s license copy for accuracy.


RENT_SCHEDULE_RECONCILIATION_FIELDS = [
    "Comments on market data, including the range of rents for single family properties, an estimate of vacancy for single family rental properties, the general trend of rents and vacancy, and support for the above adjustments. (Rent concessions should be adjusted to the market, not to the subject property.)",
    "Final Reconciliation of Market Rent:",
    "I (WE) ESTIMATE THE MONTHLY MARKET RENT OF THE SUBJECT AS OF",
    "TO BE $",
]


SalesGridFIELDS2 = [
        "Address",
        "Proximity to Subject",
        "Sale Price",
        "Sale Price/Gross Liv. Area",
        "Data Source(s)",
        "Verification Source(s)",
        "Sale or Financing Concessions",
        "Sale or Financing Concessions Adjustment",
        "Date of Sale/Time",
        "Date of Sale/Time Adjustment",
        "Location",
        "Location Adjustment",
        "Leasehold/Fee Simple",
        "Leasehold/Fee Simple Adjustment",
        "Site",
        "Site Adjustment",
        "View",
        "View Adjustment",
        "Design (Style)",
        "Design (Style) Adjustment",
        "Quality of Construction",
        "Quality of Construction Adjustment",
        "Actual Age",
        "Actual Age Adjustment",
        "Condition",
        "Condition Adjustment",
        "Total Rooms",
        "Bedrooms",
        "Bedrooms Adjustment",
        "Baths",
        "Baths Adjustment",
        "Above Grade Room Count Adjustment",
        "Gross Living Area",
        "Gross Living Area Adjustment",
        "Basement & Finished Rooms Below Grade",
        "Basement & Finished Rooms Below Grade Adjustment",
        "Functional Utility",
        "Functional Utility Adjustment",
        "Heating/Cooling",
        "Heating/Cooling Adjustment",
        "Energy Efficient Items",
        "Energy Efficient Items Adjustment",
        "Garage/Carport",
        "Garage/Carport Adjustment",
        "Porch/Patio/Deck",
        "Porch/Patio/Deck Adjustment",
        "Net Adjustment (Total)",
        "Adjusted Sale Price of Comparable",
        #SALES HISTORY
        "Date of Prior Sale/Transfer",
        "Price of Prior Sale/Transfer", 
        "Data Source(s) for prior sale",
        "Effective Date of Data Source(s) for prior sale",
]

RentSchedulesFIELDS2 = [
        "Address",
        "Proximity to Subject",
        "Date Lease Begins",
        "Date Lease Expires",
        "Monthly Rental",
        "Less: Utilities",
        "Furniture",
        "Adjusted Monthly Rent",
        "Data Source",
        "Rent",
        "Concessions",
        "Location/View",
        "Design and Appeal",
        "Age/Condition",
        "Room Count Total",
        "Room Count Bdrms",
        "Room Count Baths",
        "Gross Living Area",
        "Other (e.g., basement, etc.)",
        "Other:",
        "Net Adj. (total)",
        "Indicated Monthly Market Rent",
]


#{{1073}}
Project_SITE_FIELDS = [
    "Topography", "Size", "Density", "View", "Specific Zoning Classification", "Zoning Description",
    "Zoning Compliance", "Is the highest and best use of subject property as improved (or as proposed per plans and specifications) the present use?",
    "Electricity", "Gas", "Water", "Sanitary Sewer", "Street", "Alley", "FEMA Special Flood Hazard Area",
    "FEMA Flood Zone", "FEMA Map #", "FEMA Map Date", "Are the utilities and off-site improvements typical for the market area?",
    "Are there any adverse site conditions or external factors (easements, encroachments, environmental conditions, land uses, etc.)?",
    "If Yes, describe",
]

Project_Info_FIELDS = [
    "Data source(s) for project information", "Project Description", "# of Stories",
      "# of Elevators", "Existing/Proposed/Under Construction", "Year Built",
    "Effective Age", "Exterior Walls",
    "Roof Surface", "Total # Parking", "Ratio (spaces/units)", "Type", "Guest Parking", "# of Units", "# of Units Completed",
    "# of Units For Sale", "# of Units Sold", "# of Units Rented", "# of Owner Occupied Units",
    "# of Phases","# of Units","# of Units for Sale","# of Units Sold","# of Units Rented","# of Owner Occupied Units","# of Planned Phases",
    "# of Planned Units","# of Planned Units for Sale","# of Planned Units Sold","# of Planned Units Rented","# of Planned Owner Occupied Units",
    "Project Primary Occupancy","Is the developer/builder in control of the Homeowners' Association (HOA)?",
    "Management Group","Does any single entity (the same individual, investor group, corporation, etc.) own more than 10% of the total units in the project?"
    ,"Was the project created by the conversion of existing building(s) into a condominium?",
    "If Yes,describe the original use and date of conversion", 
    "Are the units, common elements, and recreation facilities complete (including any planned rehabilitation for a condominium conversion)?","If No, describe",
    "Is there any commercial space in the project?",
    "If Yes, describe and indicate the overall percentage of the commercial space.","Describe the condition of the project and quality of construction.",
    "Describe the common elements and recreational facilities.","Are any common elements leased to or by the Homeowners' Association?",
    "If Yes, describe the rental terms and options.","Is the project subject to a ground rent?",
    "If Yes, $ per year (describe terms and conditions)",
    "Are the parking facilities adequate for the project size and type?","If No, describe and comment on the effect on value and marketability."
]

Project_Analysis_FIELDS = [
    "I did did not analyze the condominium project budget for the current year. Explain the results of the analysis of the budget (adequacy of fees, reserves, etc.), or why the analysis was not performed.",
    "Are there any other fees (other than regular HOA charges) for the use of the project facilities?",
    "If Yes, report the charges and describe.",
    "Compared to other competitive projects of similar quality and design, the subject unit charge appears",
    "If High or Low, describe",
    "Are there any special or unusual characteristics of the project (based on the condominium documents, HOA meetings, or other information) known to the appraiser?",
    "If Yes, describe and explain the effect on value and marketability.",


]

UNIT_DESCRIPTIONS_FIELDS = [
    "Unit Charge$"," per month X 12 = $", "per year",
    "Annual assessment charge per year per square feet of gross living area = $",
    "Utilities included in the unit monthly assessment [None/Heat/Air/Conditioning/Electricity/Gas/Water/Sewer/Cable/Other (describe)]",
    "Floor #",
    "# of Levels",
    "Heating Type/Fuel",
    "Central AC/Individual AC/Other (describe)",
    "Fireplace(s) #/Woodstove(s) #/Deck/Patio/Porch/Balcony/Other",
    "Refrigerator/Range/Oven/Disp Microwave/Dishwasher/Washer/Dryer",
    "Floors",
    "Walls",
    "Trim/Finish",
    "Bath Wainscot",
    "Doors",
    "None/Garage/Covered/Open",    
    "Assigned/Owned",
    "# of Cars",
    "Parking Space #",
    "Finished area above grade contains:",
    "Rooms",
    "Bedrooms",
    "Bath(s)",
    "Square Feet of Gross Living Area Above Grade",
    "Are the heating and cooling for the individual units separately metered?", "If No, describe and comment on compatibility to other projects in the market area.",
    "Additional features (special energy efficient items, etc.)",
    "Describe the condition of the property (including needed repairs, deterioration, renovations, remodeling, etc.)",
    "Are there any physical deficiencies or adverse conditions that affect the livability, soundness, or structural integrity of the property? ", "If Yes, describe",
    "Does the property generally conform to the neighborhood (functional utility, style, condition, use, construction, etc.)?", "If No, describe"
]

# DATA CONSISTENCY
DATA_CONSISTENCY_FIELDS = [
    "Bedroom Improvements Count",
    "Bedroom Sales Comparison Approach Count",
    "Bedroom Photo Count",
    "TOTAL Bedroom Floorplan Count",
    "Bathroom Improvements Count",
    "Bathroom Sales Comparison Approach Count",
    "Bathroom Photo Count",
    "TOTAL Bathroom Floorplan Count",
    "GLA Improvements Count",
    "GLA Sales Comparison Approach Count",
    "GLA Photo Count",
    "GLA Floorplan Count",
    "photo and label of the Bedrooms correct are matching?",
    "photo and label of the Bathrooms correct are matching?",
    "check for the duplicate photo of the Bedrooms?",
    "check for the duplicate photo of the Bathrooms?",
    
]
PRIOR_SALE_HISTORY_FIELDS =[
    "Prior Sale History: I did did not research the sale or transfer history of the subject property and comparable sales",
    "Prior Sale History: My research did did not reveal any prior sales or transfers of the subject property for the three years prior to the effective date of this appraisal",
    "Prior Sale History: Data source(s) for subject",
    "Prior Sale History: My research did did not reveal any prior sales or transfers of the comparable sales for the year prior to the date of sale of the comparable sale",
    "Prior Sale History: Data source(s) for comparables",
    "Prior Sale History: Report the results of the research and analysis of the prior sale or transfer history of the subject property and comparable sales",
    "Prior Sale History: Date of Prior Sale/Transfer",
    "Prior Sale History: Price of Prior Sale/Transfer",
    "Prior Sale History: Data Source(s) for prior sale/transfer",
    "Prior Sale History: Effective Date of Data Source(s)",
    "Prior Sale History: Analysis of prior sale or transfer history of the subject property and comparable sales"
]

FORM_TYPE_CATEGORIES = {
    "1004": [
        "SUBJECT", "CONTRACT", "NEIGHBORHOOD", "SITE", "IMPROVEMENTS", "SALES_GRID",
        "SALES_TRANSFER", "RECONCILIATION", "COST_APPROACH", "INCOME_APPROACH",
        "PUD_INFO", "MARKET_CONDITIONS", "CONDO", "CERTIFICATION", "ADDENDUM",
        "UNIFORM_REPORT", "APPRAISAL_ID", "IMAGE_ANALYSIS", "DATA_CONSISTENCY","ADDENDUM_FIELDS"
    ],
    "1073": [
        "SUBJECT", "CONTRACT", "NEIGHBORHOOD", "PROJECT_SITE", "PROJECT_INFO",
        "PROJECT_ANALYSIS", "UNIT_DESCRIPTIONS", "PRIOR_SALE_HISTORY", "SALES_GRID",
        "SALES_TRANSFER", "RECONCILIATION", "COST_APPROACH", "INCOME_APPROACH",
        "CONDO", "CERTIFICATION", "ADDENDUM", "UNIFORM_REPORT", "APPRAISAL_ID","ADDENDUM_FIELDS"
        "IMAGE_ANALYSIS", "DATA_CONSISTENCY"
    ],
    "1007": [
        "SUBJECT", "CONTRACT", "NEIGHBORHOOD", "SITE", "IMPROVEMENTS", "SALES_GRID",
        "SALES_TRANSFER", "RENT_SCHEDULE_GRID", "RENT_SCHEDULE_RECONCILIATION",
        "RECONCILIATION", "COST_APPROACH", "INCOME_APPROACH", "PUD_INFO",
        "MARKET_CONDITIONS", "CONDO", "CERTIFICATION", "ADDENDUM", "UNIFORM_REPORT","ADDENDUM_FIELDS",
        "APPRAISAL_ID", "IMAGE_ANALYSIS", "DATA_CONSISTENCY"
    ]
}

# Default categories for form types not explicitly defined
DEFAULT_CATEGORIES = [
    "SUBJECT", "CONTRACT", "NEIGHBORHOOD", "SITE", "IMPROVEMENTS", "SALES_GRID",
    "SALES_TRANSFER", "RECONCILIATION", "COST_APPROACH", "INCOME_APPROACH",
    "PUD_INFO", "MARKET_CONDITIONS", "CONDO", "CERTIFICATION", "ADDENDUM",
    "UNIFORM_REPORT", "APPRAISAL_ID", "IMAGE_ANALYSIS", "DATA_CONSISTENCY"
]


async def extract_fields_from_pdf(pdf_path, form_type: str, category: str = None, custom_prompt: str = None):
    from google.api_core import exceptions as google_exceptions
    combined_result = {}
    raw_responses = []

    try:
        # Read the PDF file bytes directly to avoid the File API's `ragStoreName` requirement.
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

        # Create the file part to be included in the prompt.
        sample_file_part = {"mime_type": "application/pdf", "data": pdf_bytes}

        model = genai.GenerativeModel(model_name="gemini-2.5-flash")

        if custom_prompt:
            # Handle custom prompt directly
            final_prompt = (
                f"Extract information from the appraisal report based on the following request: '{custom_prompt}'. "
                "Return your answer strictly as a JSON object. "
                "If the information is not found, return an empty JSON object or indicate that in the JSON values. "
                "Do not include any explanation or formatting outside the JSON object."
            )
            response = await model.generate_content_async(contents=[sample_file_part, final_prompt])
            raw_text = response.text
            json_str = raw_text.strip().lstrip('```json').rstrip('```').strip()
            data = json.loads(json_str) if json_str else {}
            return {'fields': data, 'raw': f"--- CUSTOM PROMPT SECTION ---\n{raw_text}"}


        async def process_category(category_name, fields_list):
            complex_field_instructions = (
                "For fields containing 'did did not', the value should be a JSON object like {'choice': 'did' or 'did not', 'comment': 'extracted text'}. "
                "For Yes/No questions, if the answer is 'Yes' and there is associated text, the value should be a JSON object like {'choice': 'Yes', 'comment': 'extracted text'}. "
                "If the answer is just 'Yes' or 'No' without other text, the value should be the string 'Yes' or 'No'. "
                "If a checkbox is marked, treat it as 'Yes'."
            )
            
            base_prompt = (
                "Extract the following fields from the appraisal report. "
                "Return your answer strictly as a JSON object with this structure: { 'FieldName': 'Value', ... } "
                "If a field is missing, set its value to ''. Do not include any explanation or formatting outside the JSON object. "
            )

            final_prompt = f"{base_prompt}{complex_field_instructions} Fields for {category_name}: {fields_list}."

            response = await model.generate_content_async(contents=[sample_file_part, final_prompt])
            return category_name, response

        async def process_sales_grid():
            sales_grid_prompt = (
                "Extract the following fields for the Subject and each Comparable Sale from the SALES COMPARISON APPROACH section of the appraisal report. "
                "Return your answer strictly as a JSON object with this structure: { 'Subject': {SalesGridFIELDS2}, 'COMPARABLE SALE #1': {SalesGridFIELDS2}, ... } "
                "If a field is missing, set its value to ''. Do not include any explanation or formatting outside the JSON object. "f"Fields: {SalesGridFIELDS2}. "
            )
            response = await model.generate_content_async(contents=[sample_file_part, sales_grid_prompt])
            return "SALES_GRID", response

        async def process_rent_schedule_grid():
            rent_schedule_prompt = (
                "Extract the following fields for the Subject and each Comparable Rent from the COMPARABLE RENT SCHEDULE section of the appraisal report. "
                "Return your answer strictly as a JSON object with this structure: { 'Subject': {RentSchedulesFIELDS2}, 'COMPARABLE RENT #1': {RentSchedulesFIELDS2}, ... } "
                "If a field is missing, set its value to ''. Do not include any explanation or formatting outside the JSON object. "f"Fields: {RentSchedulesFIELDS2}. "
            )
            response = await model.generate_content_async(contents=[sample_file_part, rent_schedule_prompt])
            return "RENT_SCHEDULE_GRID", response

        field_categories = {
            "SUBJECT": SUBJECT_FIELDS, "CONTRACT": CONTRACT_FIELDS, "NEIGHBORHOOD": NEIGHBORHOOD_FIELDS,
            "SITE": SITE_FIELDS, "IMPROVEMENTS": IMPROVEMENTS_FIELDS, "RECONCILIATION": RECONCILIATION_FIELDS,
            "COST_APPROACH": COST_APPROACH_FIELDS, "INCOME_APPROACH": INCOME_APPROACH_FIELDS,
            "RENT_SCHEDULE_RECONCILIATION": RENT_SCHEDULE_RECONCILIATION_FIELDS, "PUD_INFO": PUD_INFO_FIELDS,
            "CERTIFICATION": CERTIFICATION_FIELDS, "ADDENDUM": ADDENDUM_FIELDS, "SALES_TRANSFER": SALES_TRANSFER_FIELDS,
            "UNIFORM_REPORT": UNIFORM_REPORT_FIELDS, "APPRAISAL_ID": APPRAISAL_ID_FIELDS, "MARKET_CONDITIONS": MARKET_CONDITIONS_FIELDS,
            "CONDO": CONDO_FIELDS, "IMAGE_ANALYSIS": IMAGE_FIELDS,
            "PRIOR_SALE_HISTORY": PRIOR_SALE_HISTORY_FIELDS, "PROJECT_SITE": Project_SITE_FIELDS, "PROJECT_INFO": Project_Info_FIELDS,
            "PROJECT_ANALYSIS": Project_Analysis_FIELDS, "UNIT_DESCRIPTIONS": UNIT_DESCRIPTIONS_FIELDS,
            "DATA_CONSISTENCY": DATA_CONSISTENCY_FIELDS
        }

        if category:
            # We are now only ever processing a single category.
            category_name = category.upper()
            if category_name == "SALES_GRID":
                _, response = await process_sales_grid()
            elif category_name == "RENT_SCHEDULE_GRID":
                _, response = await process_rent_schedule_grid()
            elif category_name in field_categories:
                _, response = await process_category(category_name, field_categories[category_name])
            else:
                raise ValueError(f"Unknown category provided: {category}")
            results = [(category_name, response)]
        else:
            # This case should no longer be hit as the UI requires a category.
            raise ValueError("No category specified for extraction.")

        # results = []
        # chunk_size = 5
        # for i in range(0, len(tasks), chunk_size):
        #     chunk = tasks[i:i + chunk_size]
        #     chunk_results = await asyncio.gather(*chunk)
        #     results.extend(chunk_results)

        for category_name, response in results:
            try:
                raw_text = response.text
            except ValueError:
                # Handle cases where the response is blocked (e.g., for safety reasons)
                reason = "Unknown"
                if response.prompt_feedback.block_reason:
                    reason = response.prompt_feedback.block_reason.name
                print(f"Response for '{category_name}' was blocked. Reason: {reason}")
                raw_text = f'{{"error": "Response blocked", "reason": "{reason}"}}'

            if category_name == "SALES_GRID":
                section_header = "SALES GRID"
            elif category_name == "RENT_SCHEDULE_GRID":
                section_header = "RENT SCHEDULE GRID"
            else: 
                section_header = category_name
            raw_responses.append(f"--- {section_header} SECTION ---\n{raw_text}")

            json_str = raw_text.strip().lstrip('```json').rstrip('```').strip()
            if json_str:
                try:
                    data = json.loads(json_str)
                     
                    for key, value in data.items():
                        if isinstance(value, bool):
                            data[key] = "Yes" if value else "No"

                     
                    for field, value in data.items():
                        if isinstance(value, dict) and 'choice' in value and 'did did not' in field.lower():
                             
                            data[field] = f"I {value.get('choice', '')} . {value.get('comment', '')}".strip()

                    if category_name in ["SALES_GRID", "RENT_SCHEDULE_GRID"]:
                         
                        if "Subject" in data:
                            if "Subject" not in combined_result:
                                combined_result["Subject"] = {}
                            combined_result["Subject"].update(data["Subject"])
                            del data["Subject"]  
                        combined_result.update(data)
                    else:
                        combined_result.update(data)

                    # For non-grid categories, store the processed data (with transformations applied) under its category name.
                    if category_name not in ["SALES_GRID", "RENT_SCHEDULE_GRID"]:
                         combined_result.setdefault(category_name, {}).update(data)
                except json.JSONDecodeError as e:
                    print(f"Error decoding JSON for {category_name}: {e}")
                    print(f"Raw text was: {raw_text}")
                except Exception as e:
                    print(f"An unexpected error occurred during data processing for {category_name}: {e}")

    except google_exceptions.ResourceExhausted as e:
        print(f"Gemini API Quota Exceeded: {e}")
        
        raise Exception(f"API quota exceeded. Please check your plan and billing details. Original error: {e}")

    except Exception as e:
        print(f"Error parsing JSON from Gemini: {e}")
         
        return {'fields': combined_result, 'raw': "\n\n".join(raw_responses)}

    return {'fields': combined_result, 'raw': "\n\n".join(raw_responses)}

 
def get_sales_comparison_data(extracted_data):
     
    return {
        "table_data": {},
        "research_data": {},
        "additional_data": {}
    }
