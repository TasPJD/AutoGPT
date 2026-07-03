<#
    git_init_harness.ps1 — put the harness under version control.
    Addresses review finding: AEOS, PAi, and HarLin_OS are NOT under git (REV-001 flagged,
    still true) — no history, no rollback, no safety net for AI-edited code.

    ORDER MATTERS FOR PAi: do NOT git-init PersonalAI.prj until the secrets are purged and
    rotated (see 07_PAI_SECURITY_PATCHES.md). This script REFUSES to init PAi unless a
    sentinel file `.secrets-purged` exists in the PAi root, to prevent committing live creds.

    Creates a local repo + .gitignore per target. Does NOT create remotes or push — you do
    that once you've confirmed no secrets are staged:
        git -C "<path>" remote add origin <private-repo-url>
        git -C "<path>" push -u origin main

    Usage:
      powershell -ExecutionPolicy Bypass -File git_init_harness.ps1
#>
$ErrorActionPreference = "Stop"

$targets = @(
    @{ Name="AEOS";      Path="C:\AI\HarLin_Labs\Internal Infrastructure\AEOS.prj";  IsPai=$false },
    @{ Name="HarLin_OS"; Path="C:\AI\HarLin_OS";                                     IsPai=$false },
    @{ Name="PAi";       Path="C:\AI\HarLin_Labs\Internal Infrastructure\AEOS.prj\PersonalAI.prj"; IsPai=$true }
)

$gitignore = @"
# --- Secrets / creds (NEVER commit) ---
Creds*.json
*.secret.local
functions/.secret.local
.env
.env.*
*.tmp
.gmail-refresh-token.tmp
service-account*.json
*serviceAccount*.json

# --- Build / deps ---
node_modules/
.firebase/
dist/
build/
__pycache__/
*.pyc
.venv/

# --- Data stores (back these up, don't version them) ---
*.duckdb
*.duckdb.wal
*.sqlite
*.db
*.db-wal
*.db-shm
pulse_fallback.jsonl
"@

foreach ($t in $targets) {
    if (-not (Test-Path $t.Path)) { Write-Host "SKIP $($t.Name): path not found"; continue }

    if ($t.IsPai) {
        $sentinel = Join-Path $t.Path ".secrets-purged"
        if (-not (Test-Path $sentinel)) {
            Write-Host "REFUSING to init PAi: secrets not confirmed purged." -ForegroundColor Yellow
            Write-Host "  1. Apply 07_PAI_SECURITY_PATCHES.md (rotate + purge secrets)."
            Write-Host "  2. Then: New-Item -ItemType File '$sentinel'"
            Write-Host "  3. Re-run this script."
            continue
        }
    }

    if (Test-Path (Join-Path $t.Path ".git")) {
        Write-Host "SKIP $($t.Name): already a git repo"
        continue
    }

    Write-Host "git init: $($t.Name)  ($($t.Path))"
    git -C $t.Path init -b main | Out-Null
    Set-Content -Path (Join-Path $t.Path ".gitignore") -Value $gitignore -Encoding UTF8

    # Guard: scan staged content for obvious secret patterns before the first add
    git -C $t.Path add -A
    $staged = git -C $t.Path diff --cached --name-only
    $suspect = $staged | Where-Object { $_ -match "(Creds.*\.json|\.env|secret|serviceAccount)" }
    if ($suspect) {
        Write-Host "  WARNING: suspicious files staged — review before commit:" -ForegroundColor Yellow
        $suspect | ForEach-Object { Write-Host "    $_" }
        Write-Host "  Aborting auto-commit for $($t.Name). Unstage secrets, then commit manually." -ForegroundColor Yellow
        continue
    }

    git -C $t.Path commit -m "Initial commit: $($t.Name) under version control" | Out-Null
    Write-Host "  committed. Add a PRIVATE remote + push manually when ready."
}

Write-Host ""
Write-Host "Reminder: create PRIVATE GitHub repos only. Push manually after confirming no secrets:"
Write-Host '  git -C "<path>" remote add origin git@github.com:TasPJD/<repo>.git'
Write-Host '  git -C "<path>" push -u origin main'
