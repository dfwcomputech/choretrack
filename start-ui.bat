@echo off
REM ChoreTrack UI Launch Script
REM This script sets up the environment and starts the Vite dev server

setlocal enabledelayedexpansion

REM Add bundled Node.js to PATH for this session
set "PATH=%~dp0backend\node;!PATH!"

REM Navigate to the UI folder
cd /d "%~dp0ui"

echo.
echo Starting ChoreTrack UI...
call node.exe -v >nul 2>&1
for /f "tokens=*" %%i in ('node.exe -v') do set NODE_VER=%%i
for /f "tokens=*" %%i in ('npm.cmd -v') do set NPM_VER=%%i
echo Node: %NODE_VER%
echo npm: %NPM_VER%

REM Install dependencies if node_modules is missing
if not exist node_modules (
    echo.
    echo Installing dependencies...
    call npm.cmd install
)

REM Start the dev server
echo.
echo Launching dev server...
call npm.cmd run dev

endlocal
