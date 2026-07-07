# Core-Tray Recognition & Renaming — TrayClip Build Plan (2026-07-06)

Priority 5 of the 2026-07-06 directive. The idea is already captured on the estate as
**TrayClip** (`NEXUS.prj/TrayClip_CONCEPT.md`, 2026-07-05, 🟠, WP-29, ignition on Paul's word,
HP-15 respected — this document does not ignite it; it completes the groundwork so ignition is
cheap). Status 🟠 AWAITING CONFIRM.

## 1. WP-29 Step 1 answered: the reusable prior state

The concept doc guessed the prior ML work lived in `CoreProcessingAI.prj` / `CorePhoto.prj` —
**those are stubs. The real reusable assets are:**

1. **`GeoLedger/ml/tray_detector.py`** — "Auto-Crop Pipeline v5": ridge regression over
   hand-crafted features (brightness grids, edge density, Sobel profiles) + edge refinement +
   multi-band perspective estimation. Results (`ml/detection_report.txt`, 2026-04-03):
   training mean corner error 217 px; **leave-one-out CV 447 px mean / 307 px median** —
   learns within-hole priors, does not generalise across holes/cameras. Conclusion: the
   *pipeline scaffolding, evaluation harness, and honest metrics* are reusable; the
   hand-crafted-features model is not the path.
2. **`meta_ml_training` table in the GL DB** — 102 human 4-corner annotations
   (source_path, corners_json, dimensions), growing with every logged tray. This is the real
   asset: a self-labelling loop already wired into the production workflow.
3. **`rename_tray_photos.py`** + the per-hole rename scripts — the naming-convention logic
   (`<Hole>_<Wet|Dry>_TrayNN.JPG`, reverse-order shooting support) already encodes the
   output spec, proven on 691 files across 22 folders.
4. **FieldCam vision §3.10** (on-device unwarp before upload) — TrayClip's model is the
   engine FieldCam later embeds (Multiplier: one engine, two products).

## 2. Technical path (v1, 4–6 weeks as concepted — sharpened)

- **Model:** stop hand-crafting features. Fine-tune a small segmentation model
  (YOLOv8n-seg / MobileSAM-class) on the 102 annotations + augmentation (perspective,
  lighting, tray-type). Corner extraction from mask quadrilateral fit. Target: <2% of image
  diagonal corner error cross-hole (≈ 10–20× better than the ridge baseline); the existing
  LOO-CV harness is the yardstick — keep it.
- **Label flywheel:** every GL 4-corner crop keeps feeding `meta_ml_training`; TrayClip's GUI
  correction clicks write back the same format. Accuracy compounds with use — data gravity
  at the model level, and a genuine moat vs a cloner starting from zero labels.
- **OCR (v1.5):** depth-block digits via PaddleOCR/Tesseract with a numeric+depth grammar;
  cross-check OCR depth sequence against tray order and flag misfits (advisory, never
  auto-trust — Data Truth rules apply to pixels too).
- **Packaging:** offline Windows CLI + minimal GUI; ONNX runtime (no GPU requirement);
  manifest CSV out; the GL importer consumes the manifest so renamed/cropped sets flow into
  `tbl_tray_photos` through the one write path (GL 02 §3).

## 3. Commercial sharpening (beyond the concept doc)

- The concept's strongest segment is **legacy archives**: decades of unlabelled core photos
  in juniors' and surveys' shares. Offer per-archive batch pricing (per-1,000-photos) beside
  the site licence — it monetises without seats and demos the flywheel.
- Positioning vs Datarock/GeologicAI (IMDEX's ~A$31M Datarock consolidation is the exit
  comp): they sell *interpretation* from scanners; TrayClip sells *order* from ordinary
  phone photos, offline, at three figures — a pre-processor they benefit from, not a rival.
  Keep the Imago/Datarock export in v2 as the partnership hook.
- Trademark sweep for "TrayClip" before public use (flagged in concept; unresolved).

## 4. Awaiting Paul

Ignition word for WP-29 (HP-15) · trademark check go-ahead · decision whether v1 targets the
Tunkillia backlog first (payback: the 305 stale-filename orphan photos in GL become TrayClip's
first real reconciliation job — closing a GL unresolved item with the new product's own demo).
