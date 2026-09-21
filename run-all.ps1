$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " DevFlow - Complete Internship Launcher" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

$projects = @(
  ".",
  "Task1/dashboard",
  "Task2/users-projects-tasks-api",
  "Task3/persistent-data-layer",
  "Task4/ai-project-management-platform/backend",
  "Task4/ai-project-management-platform/frontend"
)

foreach ($project in $projects) {
  $path = Join-Path $root $project
  if (-not (Test-Path (Join-Path $path "node_modules"))) {
    Write-Host "Installing dependencies: $project" -ForegroundColor Yellow
    Push-Location $path
    npm install
    Pop-Location
  }
}

$envFiles = @(
  "Task2/users-projects-tasks-api",
  "Task3/persistent-data-layer",
  "Task4/ai-project-management-platform/backend",
  "Task4/ai-project-management-platform/frontend"
)

foreach ($project in $envFiles) {
  $path = Join-Path $root $project
  $example = Join-Path $path ".env.example"
  $target = Join-Path $path ".env"
  if ((Test-Path $example) -and (-not (Test-Path $target))) {
    Copy-Item $example $target
  }
}

Write-Host ""
Write-Host "Starting:" -ForegroundColor Green
Write-Host " Task 1        http://localhost:5173"
Write-Host " Task 2 API    http://localhost:4002/api/health"
Write-Host " Task 3 API    http://localhost:4003/api/health"
Write-Host " Task 4 App    http://localhost:5174"
Write-Host " Task 4 API    http://localhost:4004/api/health"
Write-Host ""
Write-Host "Press Ctrl+C to stop everything." -ForegroundColor DarkGray
Write-Host ""

npm run dev
