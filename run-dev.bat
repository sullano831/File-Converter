@echo off
set "NODE=C:\Program Files\nodejs"
set "PATH=%NODE%;%PATH%"
cd /d "c:\xampp\htdocs\file-converter"

echo Installing dependencies (this may take a minute)...
call npm install --prefer-offline --no-audit --fetch-timeout=120000
if errorlevel 1 (
  echo.
  echo First attempt had a problem. Retrying once...
  call npm install --prefer-offline --no-audit --fetch-timeout=120000
)
if errorlevel 1 (
  echo.
  echo ERROR: Dependencies could not be installed. Check your internet connection and try again.
  pause
  exit /b 1
)
echo.
echo ============================================
echo  When the server starts, open in your browser:
echo  http://localhost:5173
echo  KEEP THIS WINDOW OPEN while using the app.
echo  (Close the window or press Ctrl+C to stop)
echo ============================================
echo.
call npm run dev
pause
