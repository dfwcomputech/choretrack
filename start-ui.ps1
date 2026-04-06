# ChoreTrack UI Launch Script
# This script sets up the environment and starts the Vite dev server

# Add bundled Node.js to PATH for this session
$env:Path = "$PSScriptRoot\backend\node;$env:Path"

# Navigate to the UI folder
Set-Location "$PSScriptRoot\ui"

Write-Host "Starting ChoreTrack UI..." -ForegroundColor Green
Write-Host "Node: $(node.exe -v)" -ForegroundColor Gray
Write-Host "npm: $(npm.cmd -v)" -ForegroundColor Gray

# Install dependencies if node_modules is missing
if (-not (Test-Path "node_modules")) {
    Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
    npm.cmd install
}

# Start the dev server
Write-Host "`nLaunching dev server..." -ForegroundColor Yellow
npm.cmd run dev
