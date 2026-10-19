@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Installa prima Node.js LTS da https://nodejs.org e riapri questo file.
  pause
  exit /b 1
)
node server.mjs --open
pause
