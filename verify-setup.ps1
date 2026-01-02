#!/usr/bin/env pwsh
# Career Compass - Quick Start Script for Recording
# Run this before recording to verify everything works

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Career Compass - Recording Setup Verification       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$script:allChecks = @()

function Test-Check {
    param(
        [string]$Description,
        [scriptblock]$Test,
        [string]$SuccessMessage,
        [string]$FailureMessage
    )
    
    Write-Host "  Checking: $Description..." -NoNewline
    
    try {
        $result = & $Test
        if ($result) {
            Write-Host " ✓" -ForegroundColor Green
            $script:allChecks += @{ Status = "Pass"; Check = $Description }
            if ($SuccessMessage) {
                Write-Host "    $SuccessMessage" -ForegroundColor Gray
            }
            return $true
        } else {
            Write-Host " ✗" -ForegroundColor Red
            $script:allChecks += @{ Status = "Fail"; Check = $Description }
            if ($FailureMessage) {
                Write-Host "    $FailureMessage" -ForegroundColor Yellow
            }
            return $false
        }
    } catch {
        Write-Host " ✗" -ForegroundColor Red
        $script:allChecks += @{ Status = "Error"; Check = $Description }
        Write-Host "    Error: $_" -ForegroundColor Red
        return $false
    }
}

Write-Host "1. Environment Checks" -ForegroundColor Cyan
Write-Host "─────────────────────" -ForegroundColor Cyan

Test-Check `
    -Description "Python installed" `
    -Test { Get-Command python -ErrorAction SilentlyContinue } `
    -SuccessMessage "Python found: $(python --version 2>&1)" `
    -FailureMessage "Please install Python 3.8+"

Test-Check `
    -Description "Node.js installed" `
    -Test { Get-Command node -ErrorAction SilentlyContinue } `
    -SuccessMessage "Node.js found: $(node --version)" `
    -FailureMessage "Please install Node.js 16+"

Test-Check `
    -Description "npm installed" `
    -Test { Get-Command npm -ErrorAction SilentlyContinue } `
    -SuccessMessage "npm found: $(npm --version)" `
    -FailureMessage "npm should come with Node.js"

Write-Host "`n2. Project Structure Checks" -ForegroundColor Cyan
Write-Host "───────────────────────────" -ForegroundColor Cyan

Test-Check `
    -Description "AI Service directory" `
    -Test { Test-Path "ai-service" } `
    -FailureMessage "ai-service folder not found"

Test-Check `
    -Description "Backend directory" `
    -Test { Test-Path "backend" } `
    -FailureMessage "backend folder not found"

Test-Check `
    -Description "Frontend directory" `
    -Test { Test-Path "frontend" } `
    -FailureMessage "frontend folder not found"

Write-Host "`n3. Configuration Checks" -ForegroundColor Cyan
Write-Host "───────────────────────" -ForegroundColor Cyan

Test-Check `
    -Description "AI Service .env file" `
    -Test { Test-Path "ai-service\.env" } `
    -FailureMessage "Create ai-service\.env file with GOOGLE_API_KEY"

Test-Check `
    -Description "AI Service requirements.txt" `
    -Test { Test-Path "ai-service\requirements.txt" } `
    -FailureMessage "requirements.txt not found"

Test-Check `
    -Description "Backend package.json" `
    -Test { Test-Path "backend\package.json" } `
    -FailureMessage "backend\package.json not found"

Test-Check `
    -Description "Frontend package.json" `
    -Test { Test-Path "frontend\package.json" } `
    -FailureMessage "frontend\package.json not found"

Write-Host "`n4. API Key Checks" -ForegroundColor Cyan
Write-Host "─────────────────" -ForegroundColor Cyan

if (Test-Path "ai-service\.env") {
    $envContent = Get-Content "ai-service\.env" -Raw
    
    Test-Check `
        -Description "Google API Key configured" `
        -Test { $envContent -match "GOOGLE_API_KEY=\S+" } `
        -SuccessMessage "API key found in .env" `
        -FailureMessage "Add GOOGLE_API_KEY to ai-service\.env"
    
    Test-Check `
        -Description "LLM Model configured" `
        -Test { $envContent -match "LLM_MODEL=" } `
        -SuccessMessage "Model: $($envContent -replace '(?s).*LLM_MODEL=([^\r\n]+).*', '$1')" `
        -FailureMessage "Add LLM_MODEL to ai-service\.env"
}

Write-Host "`n5. Dependencies Checks" -ForegroundColor Cyan
Write-Host "──────────────────────" -ForegroundColor Cyan

# Check if Python packages are installed
Push-Location "ai-service" -ErrorAction SilentlyContinue
if ($?) {
    Test-Check `
        -Description "Python packages installed" `
        -Test { 
            $result = python -c "import fastapi, uvicorn, google.generativeai" 2>&1
            $LASTEXITCODE -eq 0
        } `
        -SuccessMessage "Core Python packages found" `
        -FailureMessage "Run: pip install -r requirements.txt"
    Pop-Location
}

# Check if backend dependencies are installed
Push-Location "backend" -ErrorAction SilentlyContinue
if ($?) {
    Test-Check `
        -Description "Backend node_modules" `
        -Test { Test-Path "node_modules" } `
        -SuccessMessage "Backend dependencies installed" `
        -FailureMessage "Run: npm install in backend folder"
    Pop-Location
}

# Check if frontend dependencies are installed
Push-Location "frontend" -ErrorAction SilentlyContinue
if ($?) {
    Test-Check `
        -Description "Frontend node_modules" `
        -Test { Test-Path "node_modules" } `
        -SuccessMessage "Frontend dependencies installed" `
        -FailureMessage "Run: npm install in frontend folder"
    Pop-Location
}

Write-Host "`n6. Port Availability Checks" -ForegroundColor Cyan
Write-Host "───────────────────────────" -ForegroundColor Cyan

Test-Check `
    -Description "Port 8000 available (AI Service)" `
    -Test { 
        $port = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
        -not $port
    } `
    -SuccessMessage "Port 8000 is free" `
    -FailureMessage "Port 8000 in use - stop existing service"

Test-Check `
    -Description "Port 5000 available (Backend)" `
    -Test { 
        $port = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
        -not $port
    } `
    -SuccessMessage "Port 5000 is free" `
    -FailureMessage "Port 5000 in use - stop existing service"

Test-Check `
    -Description "Port 5173 available (Frontend)" `
    -Test { 
        $port = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
        -not $port
    } `
    -SuccessMessage "Port 5173 is free" `
    -FailureMessage "Port 5173 in use - stop existing service"

# Summary
Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    Summary Report                        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$passed = ($script:allChecks | Where-Object { $_.Status -eq "Pass" }).Count
$failed = ($script:allChecks | Where-Object { $_.Status -ne "Pass" }).Count
$total = $script:allChecks.Count

Write-Host "  Total Checks: $total" -ForegroundColor White
Write-Host "  Passed: $passed" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host "  Failed: $failed" -ForegroundColor Red
}

if ($failed -eq 0) {
    Write-Host "`n  ✓ All checks passed! Ready to start services." -ForegroundColor Green
    Write-Host "`n  Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Open 3 terminal windows" -ForegroundColor White
    Write-Host "  2. Terminal 1: cd ai-service; python -m uvicorn main:app --reload --port 8000" -ForegroundColor Gray
    Write-Host "  3. Terminal 2: cd backend; npm run dev" -ForegroundColor Gray
    Write-Host "  4. Terminal 3: cd frontend; npm run dev" -ForegroundColor Gray
    Write-Host "  5. Open browser: http://localhost:5173" -ForegroundColor Gray
    Write-Host "`n  For detailed guide, see: RECORDING_CHECKLIST.md" -ForegroundColor Yellow
} else {
    Write-Host "`n  ⚠ Some checks failed. Please fix the issues above." -ForegroundColor Yellow
    Write-Host "  Refer to RECORDING_CHECKLIST.md for setup instructions." -ForegroundColor Gray
}

Write-Host "`n" 
