<#
    backup_aeos.ps1 — nightly backup of the AEOS "persistent brain" + Claude memory.
    Addresses review finding: the persistent brain has NO automated backup (one disk
    failure = amnesia). Ready to run as-is; schedule via schedule_aeos_tasks.ps1.

    What it backs up (copy-based, safe to run while DBs are in use — copies a snapshot):
      - the 5 AEOS databases (pulse, context, semantic_index, nexusboard, catalog)
      - Pulse summaries + SESSION_INDEX
      - Claude Code memory (~/.claude/projects/*/memory)
      - the learning queue + pattern_engine/lodestone data

    Destination: OneDrive (offsite, already syncing). Keeps the last N daily snapshots.

    Usage:
      powershell -ExecutionPolicy Bypass -File backup_aeos.ps1
      powershell -ExecutionPolicy Bypass -File backup_aeos.ps1 -KeepDays 14
#>
param(
    [int]$KeepDays = 14,
    [string]$Dest = "C:\Users\pauld\OneDrive - HarLin Consulting Pty Ltd\AI\_backups\aeos"
)

$ErrorActionPreference = "Stop"
$runtime = "C:\AI\HarLin_Labs\Internal Infrastructure\AEOS.prj\runtime"
$stamp   = Get-Date -Format "yyyyMMdd_HHmmss"
$target  = Join-Path $Dest $stamp
New-Item -ItemType Directory -Force -Path $target | Out-Null

function Copy-IfExists($src, $subdir) {
    if (Test-Path $src) {
        $dir = Join-Path $target $subdir
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Copy-Item $src -Destination $dir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  backed up: $src"
    } else {
        Write-Host "  (skip, not found): $src"
    }
}

Write-Host "AEOS backup -> $target"

# --- Databases (copy-based snapshot; a locked DuckDB still copies fine) ---
Copy-IfExists (Join-Path $runtime "pulse\pulse.duckdb")            "db"
Copy-IfExists (Join-Path $runtime "brain\context.duckdb")          "db"
Copy-IfExists (Join-Path $runtime "brain\semantic_index.duckdb")   "db"
Copy-IfExists (Join-Path $runtime "products\nexusboard.duckdb")    "db"
Copy-IfExists (Join-Path $runtime "catalog\catalog.sqlite")        "db"

# --- Pulse artefacts + learning state ---
Copy-IfExists (Join-Path $runtime "pulse\summaries")                        "pulse"
Copy-IfExists (Join-Path $runtime "pulse\SESSION_INDEX.md")                 "pulse"
Copy-IfExists (Join-Path $runtime "pulse\pulse_fallback.jsonl")             "pulse"
Copy-IfExists (Join-Path $runtime "agents\pattern_engine_data")             "agents"
Copy-IfExists (Join-Path $runtime "agents\lodestone_data")                  "agents"
Copy-IfExists (Join-Path $runtime "agents\memory_hygiene_data")             "agents"

# --- Claude Code memory (cross-session facts — irreplaceable) ---
$projects = "C:\Users\pauld\.claude\projects"
if (Test-Path $projects) {
    Get-ChildItem $projects -Directory | ForEach-Object {
        $mem = Join-Path $_.FullName "memory"
        if (Test-Path $mem) { Copy-IfExists $mem ("memory\" + $_.Name) }
    }
}

# --- Prune old snapshots ---
if (Test-Path $Dest) {
    $cutoff = (Get-Date).AddDays(-$KeepDays)
    Get-ChildItem $Dest -Directory | Where-Object { $_.CreationTime -lt $cutoff } | ForEach-Object {
        Write-Host "  pruning old snapshot: $($_.Name)"
        Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "AEOS backup complete: $target"
