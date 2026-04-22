@echo off
echo.
echo RESUMIND - Backend Setup
echo ========================
echo.

cd /d "%~dp0backend"

echo Creating virtual environment...
python -m venv venv

echo Activating venv...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

echo Downloading spaCy model...
python -m spacy download en_core_web_sm

echo.
echo Setup complete!
echo.
echo To start the backend:
echo   cd backend
echo   venv\Scripts\activate
echo   uvicorn main:app --reload --port 8000
echo.
pause
