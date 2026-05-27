$ErrorActionPreference = "Stop"

function Get-EnvMapFromDotEnvFile {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  if (-not (Test-Path $Path)) {
    throw "Could not find env file at: $Path"
  }

  $map = [ordered]@{}
  $lines = Get-Content -LiteralPath $Path

  foreach ($raw in $lines) {
    $line = $raw.Trim()
    if ($line.Length -eq 0) { continue }
    if ($line.StartsWith("#")) { continue }

    # Match KEY=VALUE (VALUE may be quoted)
    $m = [regex]::Match($line, '^(?<key>[A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?<value>.*)$')
    if (-not $m.Success) { continue }

    $key = $m.Groups["key"].Value
    $value = $m.Groups["value"].Value.Trim()

    # Strip surrounding quotes if present
    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    $map[$key] = $value
  }

  return $map
}

function Require-Command {
  param([string]$Name)
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $cmd) { throw "Missing required command: $Name. Install it and try again." }
}

Require-Command "npx"

$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot ".env"

Write-Host "Reading env vars from $envPath"
$envMap = Get-EnvMapFromDotEnvFile -Path $envPath

if ($envMap.Count -eq 0) {
  throw "No env vars found in $envPath"
}

Write-Host "Linking Vercel project (first run may ask questions)..."
npx vercel link | Out-Host

$targets = @("production", "preview")

foreach ($target in $targets) {
  Write-Host ""
  Write-Host "Importing variables to Vercel target: $target"

  foreach ($key in $envMap.Keys) {
    $value = $envMap[$key]

    if ([string]::IsNullOrWhiteSpace($value)) {
      Write-Host "Skipping empty value: $key"
      continue
    }

    # Feed value via stdin to avoid exposing it in process args
    Write-Host "Setting $key"
    $value | npx vercel env add $key $target | Out-Host
  }
}

Write-Host ""
Write-Host "Done. Trigger a redeploy if Vercel doesn't automatically rebuild:"
Write-Host "  npx vercel --prod"

