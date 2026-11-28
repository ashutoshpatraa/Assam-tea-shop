@echo off
setlocal

cd /d "%~dp0"

echo ===================================================
echo Assam Tea Shop - Starting Development Server
echo ===================================================

:: Ensure .env exists with starter menu data enabled
if not exist ".env" (
  copy /Y ".env.example" ".env" >nul
  echo Created .env from .env.example.
)

:: Ensure SEED_STARTER_DATA is true so menu items are never missing
powershell -NoProfile -Command "if (Test-Path .env) { (Get-Content .env) -replace 'SEED_STARTER_DATA=\"false\"', 'SEED_STARTER_DATA=\"true\"' | Set-Content .env }" 2>nul
set SEED_STARTER_DATA=true

:: If database is missing, initialize schema and seed
if not exist "dev.db" (
  echo Initializing database schema...
  call npm run db:generate
  call npm run db:migrate -- --name init
  echo Populating starter menu items...
  call npm run db:seed
) else (
  :: Ensure menu items exist even if database was wiped or unseeded
  echo Verifying menu items in database...
  call npm run db:seed >nul 2>&1
)

echo.
echo Starting Assam Tea Shop at http://localhost:3000
echo Close this window to stop the development server.
echo.

call npm run dev
if errorlevel 1 (
  echo.
  echo The website did not start. Run setup.bat first.
  pause
  exit /b 1
)
