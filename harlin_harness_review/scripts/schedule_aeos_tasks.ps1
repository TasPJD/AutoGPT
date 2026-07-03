<#
    schedule_aeos_tasks.ps1 — register the AEOS standing cadence as Windows Scheduled Tasks.
    Addresses review finding: the heartbeat is disabled and nothing schedules the miners,
    reconcile, hygiene, or backup — so the "self-improving" loop only runs when remembered,
    in a system built because remembering is the failure mode.

    Registers (all AtLogon + a daily time, whichever you prefer — edit triggers below):
      - HarLin_AEOS_Backup          nightly 22:30   -> backup_aeos.ps1
      - HarLin_AEOS_Mine            nightly 22:45   -> pattern_engine.py + lodestone.py mine
      - HarLin_AEOS_Reconcile       nightly 23:00   -> catalog.py reconcile + crawler.py
      - HarLin_AEOS_MemoryHygiene   weekly Sun 23:15-> memory_hygiene.py (read-only report)

    SAFETY: mining/reconcile/hygiene are read-only or queue-only (zero blast radius);
    none auto-applies a learning (that stays the gated human `promote` step). Backup is copy-only.

    Run once, elevated:
      powershell -ExecutionPolicy Bypass -File schedule_aeos_tasks.ps1
    Remove all:
      powershell -ExecutionPolicy Bypass -File schedule_aeos_tasks.ps1 -Remove
#>
param([switch]$Remove)

$ErrorActionPreference = "Stop"
$py       = "C:\Users\pauld\miniconda3\python.exe"
$runtime  = "C:\AI\HarLin_Labs\Internal Infrastructure\AEOS.prj\runtime"
$scripts  = $PSScriptRoot
$agents   = Join-Path $runtime "agents"
$catalog  = Join-Path $runtime "catalog"

$tasks = @(
    @{ Name="HarLin_AEOS_Backup";        Time="22:30"; Weekly=$null;
       Action="powershell.exe"; Args="-ExecutionPolicy Bypass -File `"$scripts\backup_aeos.ps1`"" },
    @{ Name="HarLin_AEOS_Mine";          Time="22:45"; Weekly=$null;
       Action=$py; Args="`"$agents\pattern_engine.py`"" },
    @{ Name="HarLin_AEOS_MineLodestone"; Time="22:50"; Weekly=$null;
       Action=$py; Args="`"$agents\lodestone.py`" mine --auto" },
    @{ Name="HarLin_AEOS_Reconcile";     Time="23:00"; Weekly=$null;
       Action=$py; Args="`"$catalog\catalog.py`" reconcile" },
    @{ Name="HarLin_AEOS_Crawler";       Time="23:05"; Weekly=$null;
       Action=$py; Args="`"$catalog\crawler.py`"" },
    @{ Name="HarLin_AEOS_MemoryHygiene"; Time="23:15"; Weekly="Sunday";
       Action=$py; Args="`"$agents\memory_hygiene.py`"" }
)

if ($Remove) {
    foreach ($t in $tasks) {
        schtasks /Delete /TN $t.Name /F 2>$null
        Write-Host "removed: $($t.Name)"
    }
    return
}

foreach ($t in $tasks) {
    # Build the schtasks command
    $tr = '"' + $t.Action + '" ' + $t.Args
    if ($t.Weekly) {
        schtasks /Create /TN $t.Name /TR $tr /SC WEEKLY /D $t.Weekly /ST $t.Time /F /RL LIMITED | Out-Null
    } else {
        schtasks /Create /TN $t.Name /TR $tr /SC DAILY /ST $t.Time /F /RL LIMITED | Out-Null
    }
    Write-Host "scheduled: $($t.Name) @ $($t.Time)"
}

Write-Host ""
Write-Host "Done. Verify with:  schtasks /Query /TN HarLin_AEOS_Mine /V /FO LIST"
Write-Host "NOTE: confirm the actual CLI subcommands each script expects before first run"
Write-Host "      (e.g. pattern_engine.py may take 'mine' or no arg; lodestone 'mine --auto')."
