@echo off
setlocal

cd /d "%~dp0"

echo Starting Assam Tea Shop at http://localhost:3000
echo Close this window to stop the development server.

call npm run dev
if errorlevel 1 (
  echo.
  echo The website did not start. Run setup.bat first.
  pause
  exit /b 1
)
