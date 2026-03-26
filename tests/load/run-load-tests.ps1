#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Run load tests for the 3D Body Measurement API
.DESCRIPTION
    Wrapper script to run k6 load tests with common configurations
.EXAMPLE
    .\run-load-tests.ps1 -Scenario smoke
    .\run-load-tests.ps1 -Scenario load -ApiUrl http://localhost:8000
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('smoke', 'load', 'stress', 'spike', 'database', 'all')]
    [string]$Scenario = 'smoke',
    
    [Parameter(Mandatory=$false)]
    [string]$ApiUrl = 'http://localhost:8000',
    
    [Parameter(Mandatory=$false)]
    [switch]$SaveReport
)

$ErrorActionPreference = 'Stop'

# Check if k6 is installed
if (-not (Get-Command k6 -ErrorAction SilentlyContinue)) {
    Write-Host "❌ k6 is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   choco install k6" -ForegroundColor Yellow
    Write-Host "   Or download from: https://dl.k6.io/msi/k6-latest-amd64.msi" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Running Load Test: $Scenario" -ForegroundColor Cyan
Write-Host "📡 API URL: $ApiUrl" -ForegroundColor Gray
Write-Host ""

$scriptDir = $PSScriptRoot
$resultsDir = Join-Path $scriptDir "results"

# Ensure results directory exists
if (-not (Test-Path $resultsDir)) {
    New-Item -ItemType Directory -Path $resultsDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

switch ($Scenario) {
    'smoke' {
        Write-Host "Running quick smoke test (5 VUs, 30s)..." -ForegroundColor Green
        $testFile = Join-Path $scriptDir "api-load-test.js"
        $args = @("run", "--env", "API_URL=$ApiUrl", $testFile, "--scenario", "smoke")
    }
    'load' {
        Write-Host "Running load test (100 VUs, 5m)..." -ForegroundColor Green
        $testFile = Join-Path $scriptDir "api-load-test.js"
        $args = @("run", "--env", "API_URL=$ApiUrl", $testFile, "--scenario", "load")
    }
    'stress' {
        Write-Host "Running stress test (500 VUs, 7m)..." -ForegroundColor Yellow
        $testFile = Join-Path $scriptDir "api-load-test.js"
        $args = @("run", "--env", "API_URL=$ApiUrl", $testFile, "--scenario", "stress")
    }
    'spike' {
        Write-Host "Running spike test (1000 VUs, 2m)..." -ForegroundColor Red
        $testFile = Join-Path $scriptDir "api-load-test.js"
        $args = @("run", "--env", "API_URL=$ApiUrl", $testFile, "--scenario", "spike")
    }
    'database' {
        Write-Host "Running database load test..." -ForegroundColor Green
        $testFile = Join-Path $scriptDir "database-load-test.js"
        $args = @("run", "--env", "API_URL=$ApiUrl", $testFile)
    }
    'all' {
        Write-Host "Running all scenarios (this will take ~15 minutes)..." -ForegroundColor Yellow
        $testFile = Join-Path $scriptDir "api-load-test.js"
        $args = @("run", "--env", "API_URL=$ApiUrl", $testFile)
    }
}

if ($SaveReport) {
    $reportFile = Join-Path $resultsDir "$Scenario-$timestamp.json"
    $args += @("--out", "json=$reportFile")
    Write-Host "📄 Report will be saved to: $reportFile" -ForegroundColor Gray
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host ""

# Run k6
& k6 @args

$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor DarkGray

if ($exitCode -eq 0) {
    Write-Host "✅ Load test completed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Load test completed with threshold failures (exit code: $exitCode)" -ForegroundColor Yellow
}

exit $exitCode
