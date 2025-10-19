// src/pages/ComparePage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box, Container, Stack, Typography, Button, Card, CardContent, Chip,
  Breadcrumbs, Link, Avatar, LinearProgress, IconButton, Paper, Tooltip, CircularProgress
} from "@mui/material";
import {
  ArrowBack, ElectricalServices, Assessment, PowerInput,
  ArrowBackIosNew, ArrowForwardIos, ZoomIn, ZoomOut, RestartAlt,
  Add, Edit, Delete, Comment as CommentIcon
} from "@mui/icons-material";

import {
  getTransformer,
  getInspections,
  getImages,
  buildImageRawUrl,
  saveError,
  updateError,
  deleteError as deleteErrorApi,
  getErrors
} from "../services/transformerService";
import useSnackbar from "../hooks/useSnackbar";
import ErrorDrawDialog from "../components/dialogs/ErrorDrawDialog";
import ErrorEditDialog from "../components/dialogs/ErrorEditDialog";
import ErrorBoxEditDialog from "../components/dialogs/ErrorBoxEditDialog";

/* ========================================================================
   Simplified: All errors (AI-detected + user-added) are stored in the same
   database table. Backend saves AI detections to the errors table after
   analysis completes. Frontend only needs to call getErrors().
   ======================================================================== */


/* ---------------- utils ---------------- */
function getImageInspectionId(img) {
  if (!img || typeof img !== "object") return undefined;
  if (img.inspectionId != null) return String(img.inspectionId);
  if (img.inspection_id != null) return String(img.inspection_id);
  if (img.inspectionID != null) return String(img.inspectionID);
  if (img.inspection && (img.inspection.id != null || img.inspectionId != null)) {
    return String(img.inspection.id ?? img.inspectionId);
  }
  if (img.meta && (img.meta.inspectionId != null || img.meta.inspection_id != null)) {
    return String(img.meta.inspectionId ?? img.meta.inspection_id);
  }
  return undefined;
}

/** Derive anomaly flag from detection boxes. */
function anomalyFromBoxes(boxes = []) {
  if (!boxes.length) return "NORMAL";
  const hasFaulty = boxes.some(b => String(b.status).toUpperCase() === "FAULTY" || String(b.status).toUpperCase() === "RED");
  if (hasFaulty) return "FAULTY";
  return "POTENTIAL";
}

/* ===================== AI Faults list (under all images) ===================== */
function AIFaultList({ boxes, onEdit, onDelete, onEditBox }) {
  const items = Array.isArray(boxes) ? boxes : [];

  const isNormalized = (b) =>
      b &&
      b.cx >= 0 && b.cx <= 1 &&
      b.cy >= 0 && b.cy <= 1 &&
      b.w  >= 0 && b.w  <= 1 &&
      b.h  >= 0 && b.h  <= 1;

  // Keep the original order unless idx is provided; when idx exists, sort by it.
  const rows = items
      .slice()
      .sort((a, b) => {
        const ai = a?.idx ?? Number.MAX_SAFE_INTEGER;
        const bi = b?.idx ?? Number.MAX_SAFE_INTEGER;
        return ai - bi;
      });

  return (
      <Box sx={{ mt: 2.5 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Detected Errors</Typography>

        {rows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No anomalies detected (Normal)
            </Typography>
        ) : (
            <Stack spacing={0.75}>
              {rows.map((b, mapIndex) => {
                const num = b?.idx ?? (mapIndex + 1);
                const tag = String(b?.status || "").toUpperCase() === "FAULTY" ? "Faulty" : "Potential";
                const rgb =
                    Array.isArray(b?.colorRgb) && b.colorRgb.length === 3
                        ? `rgb(${b.colorRgb.join(",")})`
                        : undefined;

                const coords = isNormalized(b)
                    ? `cx=${(b.cx * 100).toFixed(1)}%, cy=${(b.cy * 100).toFixed(1)}%, w=${(b.w * 100).toFixed(1)}%, h=${(b.h * 100).toFixed(1)}%`
                    : `cx=${Math.round(b.cx)}, cy=${Math.round(b.cy)}, w=${Math.round(b.w)}, h=${Math.round(b.h)}`;

                const kind = b?.isPoint ? "point" : "box";
                const isDeleted = b?.isDeleted;

                return (
                    <Paper
                        key={`fault-${b?.regionId ?? b?.idx ?? mapIndex}`}
                        sx={{ 
                          p: 1.1, 
                          borderRadius: 1.5, 
                          bgcolor: isDeleted ? "rgba(255,0,0,0.06)" : "rgba(102,120,255,0.06)",
                          opacity: isDeleted ? 0.6 : 1,
                          border: isDeleted ? "1px dashed rgba(255,0,0,0.3)" : "none"
                        }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" justifyContent="space-between">
                          <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
                            <Chip size="small" label={`#${num}`} sx={{ height: 22, fontWeight: 700 }} />
                            {isDeleted && <Chip size="small" label="DELETED" color="error" sx={{ height: 22 }} />}
                            <Chip size="small" label={tag} color={tag === "Faulty" ? "error" : "warning"} sx={{ height: 22 }} />
                            {b?.label && <Chip size="small" label={b.label} variant="outlined" sx={{ height: 22 }} />}
                            {typeof b?.confidence === "number" && (
                                <Chip size="small" label={`Conf ${(b.confidence * 100).toFixed(0)}%`} variant="outlined" sx={{ height: 22 }} />
                            )}
                            {b?.isManual && <Chip size="small" label="Manual" color="info" variant="outlined" sx={{ height: 22 }} />}
                            {rgb && <Box sx={{ width: 12, height: 12, borderRadius: 999, background: rgb, ml: 0.5 }} />}
                            <Typography variant="body2" sx={{ opacity: 0.85 }}>
                              {kind} • {coords}
                            </Typography>
                          </Stack>

                          {!isDeleted && (
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Edit box position/size">
                                <IconButton size="small" onClick={() => onEditBox(mapIndex)} color="primary">
                                  <ZoomIn fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit properties">
                                <IconButton size="small" onClick={() => onEdit(mapIndex)}>
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete error">
                                <IconButton size="small" color="error" onClick={() => onDelete(mapIndex)}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          )}
                        </Stack>

                        {b?.comment && (
                          <Box sx={{ pl: 1, borderLeft: "2px solid rgba(102,120,255,0.3)" }}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <CommentIcon fontSize="small" sx={{ opacity: 0.6 }} />
                              <Typography variant="body2" color="text.secondary">
                                {b.comment}
                              </Typography>
                            </Stack>
                          </Box>
                        )}

                        {isDeleted && b?.deletedAt && (
                          <Typography variant="caption" color="error" sx={{ fontStyle: "italic" }}>
                            Deleted on {new Date(b.deletedAt).toLocaleString()}
                          </Typography>
                        )}

                        {(b?.lastModifiedAt || b?.lastModifiedBy) && (
                          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                            Last modified: {new Date(b.lastModifiedAt || b.lastModifiedBy).toLocaleString()}
                            {b?.lastModifiedBy && ` by ${b.lastModifiedBy}`}
                          </Typography>
                        )}

                        {(b?.createdAt || b?.timestamp) && (
                          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                            {(b?.lastModifiedAt || b?.lastModifiedBy) ? 'Created' : 'Created'}: {new Date(b.createdAt || b.timestamp).toLocaleString()}
                            {b?.createdBy && ` by ${b.createdBy}`}
                          </Typography>
                        )}
                      </Stack>
                    </Paper>
                );
              })}
            </Stack>
        )}
      </Box>
  );
}

/** Small badge stack for AI status + anomaly. */
function AnalysisBadges({ status, anomaly }) {
  // status: 'running' | 'done' | 'error' | 'disabled'
  // anomaly: 'FAULTY' | 'POTENTIAL' | 'NORMAL' | undefined (only after done)
  const StatusChip = (() => {
    switch (status) {
      case "running":
        return (
            <Chip
                size="small"
                icon={<CircularProgress size={12} sx={{ ml: 0.5 }} />}
                label="AI analysis: running"
                color="info"
                variant="filled"
            />
        );
      case "done":
        return <Chip size="small" label="AI analysis: done" color="success" variant="filled" />;
      default:
        return <Chip size="small" label="" variant="outlined" />;
    }
  })();

  const AnomalyChip = (() => {
    if (status !== "done") return null;
    if (anomaly === "FAULTY") return <Chip size="small" label="Faulty" color="error" variant="filled" />;
    if (anomaly === "POTENTIAL") return <Chip size="small" label="Potential faulty" color="warning" variant="filled" />;
    return <Chip size="small" label="Normal" color="success" variant="filled" />;
  })();

  return (
      <Stack direction="row" spacing={1} sx={{ position: "absolute", left: 8, top: 8, zIndex: 3 }}>
        {StatusChip}
        {AnomalyChip}
      </Stack>
  );
}

/**
 * ZoomableImageWithBoxes
 * - Fits image with object-fit: contain inside a fixed viewport (width:100%, height:360).
 * - Draws overlay boxes (if provided) aligned to the image content.
 * - Supports mouse wheel zoom (cursor-centric), drag-to-pan, and Reset.
 * - Accepts overlay nodes for top-left (badges) and top-right (controls).
 */
function ZoomableImageWithBoxes({ src, alt, boxes, topLeft, showControls = true }) {
  const viewportRef = useRef(null);
  const imgRef = useRef(null);

  // Fit layout
  const [layout, setLayout] = useState({
    ready: false,
    naturalW: 0, naturalH: 0,
    renderW: 0, renderH: 0,
    offsetX: 0, offsetY: 0,
  });

  // Interaction
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const dragging = useRef(false);
  const lastPt = useRef({ x: 0, y: 0 });

  const MIN_SCALE = 1;
  const MAX_SCALE = 8;
  const ZOOM_STEP = 1.2;

  const computeLayout = () => {
    const v = viewportRef.current;
    const img = imgRef.current;
    if (!v || !img || !img.naturalWidth || !img.naturalHeight) return;

    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const vw = v.clientWidth;
    const vh = v.clientHeight;

    const fit = Math.min(vw / naturalW, vh / naturalH);
    const renderW = naturalW * fit;
    const renderH = naturalH * fit;
    const offsetX = (vw - renderW) / 2;
    const offsetY = (vh - renderH) / 2;

    setLayout({ ready: true, naturalW, naturalH, renderW, renderH, offsetX, offsetY });
    // Reset on new layout
    setScale(1); setTx(0); setTy(0);
  };

  useEffect(() => {
    const onResize = () => computeLayout();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Add wheel event listener with { passive: false } to allow preventDefault
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e) => {
      if (!layout.ready) return;
      e.preventDefault();

      const rect = viewport.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const gx = mx - layout.offsetX;
      const gy = my - layout.offsetY;

      const dir = e.deltaY > 0 ? -1 : 1;
      const targetScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * (dir > 0 ? ZOOM_STEP : 1 / ZOOM_STEP)));
      if (targetScale === scale) return;

      const nx = gx - (targetScale / scale) * (gx - tx);
      const ny = gy - (targetScale / scale) * (gy - ty);

      setScale(targetScale);
      setTx(nx);
      setTy(ny);
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [layout, scale, tx, ty]);

  const triggerWheelZoom = (dir) => {
    const rect = viewportRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    
    if (!layout.ready) return;

    const gx = cx - rect.left - layout.offsetX;
    const gy = cy - rect.top - layout.offsetY;

    const targetScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * (dir > 0 ? ZOOM_STEP : 1 / ZOOM_STEP)));
    if (targetScale === scale) return;

    const nx = gx - (targetScale / scale) * (gx - tx);
    const ny = gy - (targetScale / scale) * (gy - ty);

    setScale(targetScale);
    setTx(nx);
    setTy(ny);
  };

  const onMouseDown = (e) => { dragging.current = true; lastPt.current = { x: e.clientX, y: e.clientY }; };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPt.current.x;
    const dy = e.clientY - lastPt.current.y;
    lastPt.current = { x: e.clientX, y: e.clientY };
    setTx((p) => p + dx);
    setTy((p) => p + dy);
  };
  const endDrag = () => { dragging.current = false; };
  const resetView = () => { setScale(1); setTx(0); setTy(0); };

  const renderScale = layout.renderW / (layout.naturalW || 1);
  const toRenderBox = (b) => {
    if (!layout.ready) return null;
    const normalized = b.cx >= 0 && b.cx <= 1 && b.cy >= 0 && b.cy <= 1 && b.w >= 0 && b.w <= 1 && b.h >= 0 && b.h <= 1;
    const cx = normalized ? b.cx * layout.naturalW : b.cx;
    const cy = normalized ? b.cy * layout.naturalH : b.cy;
    const bw = normalized ? b.w * layout.naturalW : b.w;
    const bh = normalized ? b.h * layout.naturalH : b.h;
    return {
      left:  (cx - bw / 2) * renderScale,
      top:   (cy - bh / 2) * renderScale,
      width: bw * renderScale,
      height: bh * renderScale,
    };
  };

  const borderFor = (box) => {
    if (box?.colorRgb && box.colorRgb.length === 3) {
      return `2px solid rgb(${box.colorRgb.join(",")})`;
    }
    if (box?.color) {
      return `2px solid ${box.color}`;
    }
    const s = String(box?.status || "").toUpperCase();
    return (s === "FAULTY" || s === "RED") ? "2px solid red" : "2px solid yellow";
  };

  return (
      <Box
          ref={viewportRef}
          sx={{ position: "relative", width: "100%", height: 360, overflow: "hidden", backgroundColor: "#0b0b0b", borderRadius: 1 }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseLeave={endDrag}
          onMouseUp={endDrag}
      >
        {/* Badges (top-left) */}
        {topLeft}

        {/* Controls (top-right) */}
        {showControls && (
            <Stack direction="row" spacing={1}
                   sx={{ position: "absolute", right: 8, top: 8, zIndex: 2, bgcolor: "rgba(0,0,0,0.35)", p: 0.5, borderRadius: 1 }}>
              <Tooltip title="Zoom out">
            <span>
              <IconButton size="small" onClick={() => triggerWheelZoom(1)} disabled={scale <= MIN_SCALE} sx={{ color: "white" }}>
                <ZoomOut fontSize="small" />
              </IconButton>
            </span>
              </Tooltip>
              <Tooltip title="Zoom in">
                <IconButton size="small" onClick={() => triggerWheelZoom(-1)} sx={{ color: "white" }}>
                  <ZoomIn fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset view">
                <IconButton size="small" onClick={resetView} sx={{ color: "white" }}>
                  <RestartAlt fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
        )}

        {/* Render group (image + overlays) */}
        {layout.ready && (
            <Box
                sx={{
                  position: "absolute",
                  left: layout.offsetX,
                  top: layout.offsetY,
                  width: layout.renderW,
                  height: layout.renderH,
                  transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
                  transformOrigin: "0 0",
                }}
            >
              <img
                  ref={imgRef}
                  src={src}
                  alt={alt}
                  onLoad={computeLayout}
                  style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
              />
              {Array.isArray(boxes) && boxes.map((b, i) => {
                // Skip rendering deleted errors on the image
                if (b.isDeleted) return null;
                
                const r = toRenderBox(b);
                if (!r) return null;

                const rgb = Array.isArray(b.colorRgb) && b.colorRgb.length === 3
                    ? b.colorRgb.join(",")
                    : null;

                return (
                    <>
                      {/* box / point marker */}
                      <Box
                          key={(b.regionId ?? i) + "-rect"}
                          sx={{
                            position: "absolute",
                            left: r.left,
                            top: r.top,
                            width: r.width,
                            height: r.height,
                            border: b.isPoint
                                ? (rgb ? `2px solid rgba(${rgb}, 0.9)` : "2px solid red")
                                : (rgb ? `2px solid rgb(${rgb})` : "2px solid yellow"),
                            borderRadius: b.isPoint ? "999px" : 0.5,
                            backgroundColor: b.isPoint && rgb ? `rgba(${rgb}, 0.15)` : "transparent",
                            boxShadow: b.isPoint
                                ? "0 0 0 1px rgba(0,0,0,0.25) inset, 0 0 8px rgba(0,0,0,0.3)"
                                : "0 0 0 1px rgba(0,0,0,0.25) inset",
                            pointerEvents: "none",
                          }}
                          title={
                            [b.status, b.label, typeof b.confidence === "number" ? `conf ${(b.confidence*100).toFixed(0)}%` : ""]
                                .filter(Boolean)
                                .join(" • ")
                          }
                      />

                      {/* number badge */}
                      <Box
                          key={(b.regionId ?? i) + "-badge"}
                          sx={{
                            position: "absolute",
                            // For rectangles, place near top-left; for points, center the badge.
                            left: b.isPoint ? r.left + r.width / 2 - 10 : r.left - 15,
                            top:  b.isPoint ? r.top  + r.height / 2 - 10 : r.top  - 15,
                            width: 20,
                            height: 20,
                            borderRadius: "999px",
                            backgroundColor: rgb ? `rgba(${rgb}, 0.95)` : "rgba(255,0,0,0.95)",
                            color: "white",
                            fontSize: 12,
                            fontWeight: 700,
                            lineHeight: "20px",
                            textAlign: "center",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
                            pointerEvents: "none",
                            userSelect: "none",
                          }}
                      >
                        {b.idx ?? i + 1}
                      </Box>
                    </>
                );
              })}
            </Box>
        )}

        {/* Hidden preload to get natural size before ready */}
        {!layout.ready && (
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                onLoad={computeLayout}
                style={{ visibility: "hidden", position: "absolute", inset: 0, maxWidth: "100%", maxHeight: "100%" }}
            />
        )}
      </Box>
  );
}

export default function ComparePage() {
  const { id, inspectionId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const { show } = useSnackbar();

  const [transformer, setTransformer] = useState(state?.transformer || null);
  const [inspection, setInspection] = useState(state?.inspection || null);
  const [loading, setLoading] = useState(false);
  const [baseline, setBaseline] = useState(null);
  const [maint, setMaint] = useState([]);
  const [idx, setIdx] = useState(0);

  // imageId -> boxes[]
  const [boxesById, setBoxesById] = useState({});
  // imageId -> { status: 'running'|'done'|'error'|'disabled', anomaly?: 'FAULTY'|'POTENTIAL'|'NORMAL' }
  const [analysisById, setAnalysisById] = useState({});

  // Dialog states
  const [drawDialogOpen, setDrawDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [boxEditDialogOpen, setBoxEditDialogOpen] = useState(false);
  const [selectedErrorIndex, setSelectedErrorIndex] = useState(null);
  const [savingError, setSavingError] = useState(false);

  // User context - TODO: Replace with actual authentication
  const [currentUser] = useState("Admin"); // This should come from auth context/service

  const setAnalysis = (imgId, patch) =>
      setAnalysisById(prev => ({ ...prev, [imgId]: { ...(prev[imgId] || {}), ...patch } }));

  const loadDetections = async (imageIds = []) => {
    console.log("🔍 loadDetections called with imageIds:", imageIds);
    
    const unique = [...new Set(imageIds.filter(Boolean))];
    console.log("📋 Unique imageIds:", unique);
    
    const need = unique.filter((k) => boxesById[k] == null);
    console.log("⚡ Images needing fetch:", need);
    console.log("💾 Current boxesById state:", boxesById);
    
    if (!need.length) {
      console.log("✅ All images already loaded, skipping fetch");
      return;
    }

    // mark running
    need.forEach((id) => setAnalysis(id, { status: "running" }));

    try {
      const results = await Promise.allSettled(
          need.map(async (imgId) => {
            console.log(`📡 Fetching errors for image ${imgId}...`);
            
            // Load all errors (AI-detected + user-added) from database
            const response = await getErrors(imgId);
            console.log(`📦 Response for image ${imgId}:`, response);
            
            const allErrors = Array.isArray(response?.data?.data) ? response.data.data : [];
            console.log(`✨ Parsed errors for image ${imgId}:`, allErrors);
            
            return { imgId, boxes: allErrors };
          })
      );

      console.log("🎯 All fetch results:", results);

      const nextBoxes = {};
      results.forEach((r, i) => {
        const key = need[i];
        if (r.status === "fulfilled") {
          console.log(`✅ Success for image ${key}:`, r.value.boxes);
          nextBoxes[key] = r.value.boxes;
          const anomaly = anomalyFromBoxes(r.value.boxes);
          console.log(`🎨 Anomaly status for ${key}:`, anomaly);
          setAnalysis(key, { status: "done", anomaly });
        } else {
          console.error(`❌ Failed for image ${key}:`, r.reason);
          nextBoxes[key] = [];
          setAnalysis(key, { status: "error" });
          show(r.reason?.message || `Failed to load errors for image ${key}`, "error");
        }
      });
      
      console.log("🔄 Updating boxesById with:", nextBoxes);
      setBoxesById((p) => {
        const updated = { ...p, ...nextBoxes };
        console.log("💡 New boxesById state:", updated);
        return updated;
      });
    } catch (e) {
      console.error("💥 Unexpected error in loadDetections:", e);
      show(e?.message || "Failed to load errors", "error");
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [tRes, insRes, imgRes] = await Promise.all([
          transformer ? Promise.resolve({ data: transformer }) : getTransformer(id).catch(() => ({ data: null })),
          inspection ? Promise.resolve({ data: [inspection] }) : getInspections(id).catch(() => ({ data: [] })),
          getImages(id).catch(() => ({ data: [] })),
        ]);
        if (!mounted) return;

        const t = tRes?.data || null;
        setTransformer(t);

        const ins =
            inspection ||
            (insRes?.data || []).find((x) => String(x.id) === String(inspectionId)) ||
            null;
        setInspection(ins);

        const all = Array.isArray(imgRes?.data) ? imgRes.data : [];

        // Baseline (latest)
        const baselines = all.filter((x) => x.imageType === "BASELINE");
        baselines.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        const latestBaseline = baselines[0] || null;
        setBaseline(latestBaseline);
        if (latestBaseline?.id) setAnalysis(latestBaseline.id, { status: "disabled" }); // not analyzed by design

        // Maintenance for this inspection
        const wantedId = String(inspectionId);
        let m = all.filter((x) => x.imageType === "MAINTENANCE");
        m = m.filter((x) => getImageInspectionId(x) === wantedId);
        m.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setMaint(m);
        setIdx(0);

        // Start analysis for maintenance images
        await loadDetections(m.map((im) => im.id));
      } catch (e) {
        show(e?.response?.data?.error || e?.message || "Failed to load comparison data", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, inspectionId]);

  // If user flips to a maintenance image whose boxes aren't loaded yet
  useEffect(() => {
    const current = maint[idx];
    if (!current?.id) return;
    if (boxesById[current.id] != null) return;
    loadDetections([current.id]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, maint]);

  const title = useMemo(
      () => inspection?.title ? `Compare: ${inspection.title}` : "Compare: Baseline vs Maintenance",
      [inspection]
  );

  const next = () => setIdx((i) => (i + 1) % Math.max(maint.length || 1, 1));
  const prev = () => setIdx((i) => (i - 1 + Math.max(maint.length || 1, 1)) % Math.max(maint.length || 1, 1));

  const baselineBadge =
      baseline?.id ? <AnalysisBadges status={analysisById[baseline.id]?.status || "disabled"} anomaly={analysisById[baseline.id]?.anomaly} /> : null;
  const maintBadge = maint.length
      ? <AnalysisBadges status={analysisById[maint[idx].id]?.status || "running"} anomaly={analysisById[maint[idx].id]?.anomaly} />
      : null;

  // Boxes for the currently selected maintenance image (used in unified AI list)
  const currentMaintBoxes = boxesById[maint[idx]?.id] || [];
  console.log("🖼️ Current maintenance image ID:", maint[idx]?.id);
  console.log("📦 Current boxes for this image:", currentMaintBoxes);

  // Add indices to boxes for display
  const numberedBoxes = currentMaintBoxes.map((box, i) => ({ ...box, idx: i + 1 }));
  console.log("🔢 Numbered boxes:", numberedBoxes);

  // Error management handlers
  const handleAddError = async (newError) => {
    if (!maint[idx]?.id) return;
    
    const imageId = maint[idx].id;
    const currentBoxes = boxesById[imageId] || [];
    
    setSavingError(true);
    try {
      // Save to backend
      const response = await saveError(imageId, newError);
      const savedError = response?.data?.data || response?.data;
      
      // Update local state with server response (includes ID)
      const updatedBoxes = [...currentBoxes, { 
        ...newError, 
        ...savedError,
        idx: currentBoxes.length + 1 
      }];
      
      setBoxesById(prev => ({ ...prev, [imageId]: updatedBoxes }));
      show("Error added and saved successfully", "success");
    } catch (error) {
      console.error("Failed to save error:", error);
      show(error?.response?.data?.error || error?.message || "Failed to save error to server", "error");
    } finally {
      setSavingError(false);
    }
  };

  const handleEditError = (index) => {
    setSelectedErrorIndex(index);
    setEditDialogOpen(true);
  };

  const handleEditBox = (index) => {
    setSelectedErrorIndex(index);
    setBoxEditDialogOpen(true);
  };

  const handleSaveEditedError = async (updatedError) => {
    if (!maint[idx]?.id) return;
    
    const imageId = maint[idx].id;
    const currentBoxes = boxesById[imageId] || [];
    
    setSavingError(true);
    try {
      // Save to backend
      if (updatedError.id || updatedError.regionId) {
        await updateError(imageId, updatedError.id || updatedError.regionId, updatedError);
      }
      
      // Update local state
      const updatedBoxes = [...currentBoxes];
      updatedBoxes[selectedErrorIndex] = updatedError;
      
      setBoxesById(prev => ({ ...prev, [imageId]: updatedBoxes }));
      show("Error updated and saved successfully", "success");
    } catch (error) {
      console.error("Failed to update error:", error);
      show(error?.response?.data?.error || error?.message || "Failed to update error on server", "error");
    } finally {
      setSavingError(false);
    }
  };

  const handleDeleteError = async (index) => {
    if (!maint[idx]?.id) return;
    
    const imageId = maint[idx].id;
    const currentBoxes = boxesById[imageId] || [];
    const errorToDelete = currentBoxes[index];
    
    setSavingError(true);
    try {
      // Soft delete on backend
      if (errorToDelete.id || errorToDelete.regionId) {
        await deleteErrorApi(imageId, errorToDelete.id || errorToDelete.regionId);
      }
      
      // Update local state - soft delete
      const updatedBoxes = [...currentBoxes];
      updatedBoxes[index] = {
        ...updatedBoxes[index],
        isDeleted: true,
        deletedAt: new Date().toISOString(),
      };
      
      setBoxesById(prev => ({ ...prev, [imageId]: updatedBoxes }));
      show("Error marked as deleted", "warning");
    } catch (error) {
      console.error("Failed to delete error:", error);
      show(error?.response?.data?.error || error?.message || "Failed to delete error on server", "error");
    } finally {
      setSavingError(false);
    }
  };

  return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component="button" onClick={() => navigate("/")} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ElectricalServices fontSize="small" /> Transformers
          </Link>
          <Link
              component="button"
              onClick={() => navigate(`/transformers/${id}/inspections`, { state: { transformer } })}
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <Assessment fontSize="small" /> Inspections
          </Link>
          <Typography color="text.primary">Compare</Typography>
        </Breadcrumbs>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Typography variant="h5">{title}</Typography>
          </Stack>
        </Stack>

        {/* Header */}
        <Card sx={{ mb: 3, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", borderRadius: 3 }}>
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" gap={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                  <PowerInput />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Transformer {transformer?.transformerNo || "Unknown"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    ID: {transformer?.id ?? "-"} • Type: {transformer?.transformerType ?? "-"}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`Pole: ${transformer?.poleNo || "-"}`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }} />
                <Chip label={`Region: ${transformer?.region || "-"}`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }} />
                <Chip label={`Type: ${transformer?.transformerType || "-"}`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Compare panes */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {/* Baseline (zoom/pan enabled, no overlays) */}
          <Paper sx={{ flex: 1, p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Baseline</Typography>
            {baseline ? (
                <ZoomableImageWithBoxes
                    src={buildImageRawUrl(baseline.id)}
                    alt={baseline.filename || `baseline-${baseline.id}`}
                    boxes={[]} // no overlays on baseline
                    topLeft={baselineBadge}
                    showControls
                />
            ) : (
                <Typography variant="body2" color="text.secondary">No baseline available</Typography>
            )}
            {baseline?.createdAt && (
                <Chip size="small" sx={{ mt: 1 }} label={`Taken: ${new Date(baseline.createdAt).toLocaleString()}`} />
            )}
          </Paper>

          {/* Maintenance (zoom/pan enabled, overlays shown) */}
          <Paper sx={{ flex: 1, p: 2, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" gutterBottom>
                Maintenance {maint.length ? `(${idx + 1}/${maint.length})` : ""}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Add new error">
                  <span>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => setDrawDialogOpen(true)}
                      disabled={!maint.length}
                    >
                      Add Error
                    </Button>
                  </span>
                </Tooltip>
                <IconButton onClick={prev} disabled={!maint.length}><ArrowBackIosNew fontSize="small" /></IconButton>
                <IconButton onClick={next} disabled={!maint.length}><ArrowForwardIos fontSize="small" /></IconButton>
              </Stack>
            </Stack>

            {maint.length ? (
                <>
                  <ZoomableImageWithBoxes
                      src={buildImageRawUrl(maint[idx].id)}
                      alt={maint[idx].filename || `maintenance-${maint[idx].id}`}
                      boxes={numberedBoxes}
                      topLeft={maintBadge}
                      showControls
                  />
                  {maint[idx]?.createdAt && (
                      <Chip size="small" sx={{ mt: 1 }} label={`Taken: ${new Date(maint[idx].createdAt).toLocaleString()}`} />
                  )}
                </>
            ) : (
                <Typography variant="body2" color="text.secondary">No maintenance images for this inspection</Typography>
            )}
          </Paper>
        </Stack>

        {/* Unified AI Faults section (below all images) */}
        <Box sx={{ mt: 2 }}>
          <AIFaultList 
            boxes={numberedBoxes} 
            onEdit={handleEditError}
            onEditBox={handleEditBox}
            onDelete={handleDeleteError}
          />
        </Box>

        {/* Dialogs */}
        <ErrorDrawDialog
          open={drawDialogOpen}
          onClose={() => setDrawDialogOpen(false)}
          onSave={handleAddError}
          imageSrc={maint[idx] ? buildImageRawUrl(maint[idx].id) : ""}
          imageId={maint[idx]?.id}
          currentUser={currentUser}
        />

        <ErrorEditDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedErrorIndex(null);
          }}
          onSave={handleSaveEditedError}
          error={selectedErrorIndex !== null ? numberedBoxes[selectedErrorIndex] : null}
          errorIndex={selectedErrorIndex}
          currentUser={currentUser}
        />

        <ErrorBoxEditDialog
          open={boxEditDialogOpen}
          onClose={() => {
            setBoxEditDialogOpen(false);
            setSelectedErrorIndex(null);
          }}
          onSave={handleSaveEditedError}
          imageSrc={maint[idx] ? buildImageRawUrl(maint[idx].id) : ""}
          imageId={maint[idx]?.id}
          error={selectedErrorIndex !== null ? numberedBoxes[selectedErrorIndex] : null}
          errorIndex={selectedErrorIndex}
          currentUser={currentUser}
        />
      </Container>
  );
}
