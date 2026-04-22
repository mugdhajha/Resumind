@echo off
echo.
echo RESUMIND - Frontend Setup
echo =========================
echo.

cd /d "%~dp0frontend"

echo Installing npm dependencies...
npm install

echo.
echo Setup complete!
echo.
echo To start the frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Then open: http://localhost:5173
echo.
pause
