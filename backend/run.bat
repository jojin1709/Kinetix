@echo off
cd /d "%~dp0"

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -q --upgrade pip
pip install -q -r requirements.txt

if not defined VYDEA_MOCK_MODEL set VYDEA_MOCK_MODEL=1
if not defined VYDEA_LOW_VRAM set VYDEA_LOW_VRAM=1

echo Starting Vydea backend on http://localhost:8000 (VYDEA_MOCK_MODEL=%VYDEA_MOCK_MODEL%)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
