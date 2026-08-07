"""Dashboard generator tests + live generation (transparent, like the bootstrap).

test_generates_from_temp_db — pure unit test against a throwaway store.
test_generate_live_dashboard — GENERATES the canonical dashboard artifact
(Marketing_Sales.prj\\Dashboards\\pipeline_dashboard.html) from the live CRM
store: read-only on the DB, writes one HTML file at its registered Alfred
Workflows path. Runs in the pytest lane under Paul's chat approval
(2026-07-12 gap-analysis build) because harlin_run exposes no python lane.
"""
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
GEN = HERE / "generate_dashboard.py"
LIVE_DB = Path(r"C:\AI\HarLin_Labs\Internal Infrastructure\AEOS.prj\runtime\business\aeos_events.db")
LIVE_OUT = Path(r"C:\AI\HarLin_Commercial\Marketing_Sales.prj\Dashboards\pipeline_dashboard.html")


def _run(db: Path, out: Path):
    r = subprocess.run([sys.executable, str(GEN), "--db", str(db), "--out", str(out)],
                       capture_output=True, text=True, timeout=60)
    assert r.returncode == 0, r.stderr
    assert out.exists() and out.stat().st_size > 1000
    text = out.read_text(encoding="utf-8")
    assert "Commercial Pipeline Dashboard" in text and "GENERATED" in text


def test_generates_from_temp_db(tmp_path, monkeypatch):
    import crm_migrate
    db = tmp_path / "t.db"
    monkeypatch.setattr(sys, "argv", ["crm_migrate.py", "--db", str(db)])
    sys.path.insert(0, str(HERE))
    assert crm_migrate.main() == 0
    _run(db, tmp_path / "dash.html")


def test_generate_live_dashboard():
    assert LIVE_DB.exists(), "live CRM store missing — run test_live_bootstrap.py first"
    _run(LIVE_DB, LIVE_OUT)
