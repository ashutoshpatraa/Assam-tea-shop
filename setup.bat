@echo off
setlocal

cd /d "%~dp0"

echo Assam Tea Shop - Windows setup
echo ==============================

if not exist ".env" (
  copy /Y ".env.example" ".env" >nul
  echo Created .env from .env.example.
) else (
  echo Keeping the existing .env file.
)

:: Ensure SEED_STARTER_DATA is enabled for local menu visibility
powershell -NoProfile -Command "if (Test-Path .env) { (Get-Content .env) -replace 'SEED_STARTER_DATA=\"false\"', 'SEED_STARTER_DATA=\"true\"' | Set-Content .env }" 2>nul

echo Installing npm dependencies...
call npm install
if errorlevel 1 goto fail

echo Generating Prisma client...
call npm run db:generate
if errorlevel 1 goto fail

echo Applying database migrations...
set SEED_STARTER_DATA=true
call npm run db:migrate -- --name setup
if errorlevel 1 goto fail

echo Seeding starter menu items and categories...
set SEED_STARTER_DATA=true
call npm run db:seed
if errorlevel 1 goto fail

echo.
echo ===================================================
echo Setup complete! Starter menu items are ready.
echo 1. Run run.bat to start the website.
echo 2. Open http://localhost:3000 in your browser.
echo ===================================================
echo.
pause
exit /b 0

:fail
echo.
echo Setup stopped because a command failed.
pause
exit /b 1
