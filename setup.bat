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

echo Installing npm dependencies...
call npm install
if errorlevel 1 goto fail

echo Generating Prisma client...
call npm run db:generate
if errorlevel 1 goto fail

echo Applying database migrations...
call npm run db:migrate -- --name setup
if errorlevel 1 goto fail

echo.
echo Setup complete.
echo 1. Edit .env and set the real admin credentials and UPI details.
echo 2. Run run.bat to start the website.
echo 3. Keep SEED_STARTER_DATA=false unless you intentionally need starter data.
echo.
pause
exit /b 0

:fail
echo.
echo Setup stopped because a command failed.
pause
exit /b 1
