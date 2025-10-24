import os
# Suppress gRPC ALTS credentials warnings when not on GCP
os.environ["GRPC_VERBOSITY"] = "ERROR"

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pdf_extractor import (
    extract_fields_from_pdf, 
    get_sales_comparison_data
)
import tempfile
import traceback

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/extract-by-category")
async def extract_by_category(file: UploadFile = File(...), form_type: str = Form(...), category: str = Form(None)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        # This function from pdf_extractor.py contains the long-running Gemini calls
        data = await extract_fields_from_pdf(tmp_path, form_type, category=category, custom_prompt=None)
        return data
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass

@app.post("/extract")
async def extract(file: UploadFile = File(...), form_type: str = Form(...), category: str = Form(None), comment: str = Form(None)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    try:
        data = await extract_fields_from_pdf(tmp_path, form_type, category=category, custom_prompt=comment)
        return data
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
