# Scaffold README diagram prompt pack into a project.
# Usage:
#   powershell -File scaffold-readme-diagram-prompts.ps1 -ProjectRoot "D:\repos\my-app"

param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectRoot
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ProjectRoot)) {
  throw "ProjectRoot not found: $ProjectRoot"
}

$skillRoot = Split-Path -Parent $PSScriptRoot
$refRoot = Join-Path $skillRoot "references"
$outDir = Join-Path $ProjectRoot "docs\output\prd\readme-diagrams"
$refOut = Join-Path $outDir "_skill-references"

New-Item -ItemType Directory -Force -Path $outDir, $refOut | Out-Null

$mdFiles = @(
  "visual-standards.md",
  "prompt-feed-catalog.md",
  "README.md"
)
foreach ($f in $mdFiles) {
  Copy-Item -LiteralPath (Join-Path $refRoot $f) -Destination (Join-Path $outDir $f) -Force
}

$promptMap = @{
  "banner.md" = "prompt-banner.md"
  "features.md" = "prompt-features.md"
  "architecture.md" = "prompt-architecture.md"
  "tech-stack.md" = "prompt-tech-stack.md"
  "workflow.md" = "prompt-workflow.md"
  "structure.md" = "prompt-structure.md"
  "preview-showcase.md" = "prompt-preview-showcase.md"
}
foreach ($k in $promptMap.Keys) {
  Copy-Item -LiteralPath (Join-Path $refRoot "prompts\$k") -Destination (Join-Path $outDir $promptMap[$k]) -Force
}

$dirs = @("banner","features","architecture","tech-stack","workflow","structure","preview","showcase")
foreach ($d in $dirs) {
  $from = Join-Path $refRoot $d
  $to = Join-Path $refOut $d
  if (Test-Path -LiteralPath $from) {
    New-Item -ItemType Directory -Force -Path $to | Out-Null
    Copy-Item -Path (Join-Path $from "*") -Destination $to -Force
  }
}

$index = @"
# README diagram prompt pack (scaffolded)

Source skill: readme-polish
Synced: $(Get-Date -Format "yyyy-MM-dd HH:mm")

## Next

1. Read ``visual-standards.md`` + ``prompt-feed-catalog.md``
2. Pick ``reference_image`` under ``_skill-references\``
3. Author project-specific ``readme-image-prompts.md``
4. Generate diagrams / take screenshots → ``assets\images\readme\``

Benchmarks are style references only — do not publish as project assets.
"@

Set-Content -LiteralPath (Join-Path $outDir "README.md") -Value $index -Encoding UTF8
Write-Output "Scaffolded: $outDir"
