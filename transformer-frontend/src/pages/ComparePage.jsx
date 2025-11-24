// src/pages/ComparePage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box, Container, Stack, Typography, Button, Card, CardContent, Chip,
  Breadcrumbs, Link, Avatar, LinearProgress, IconButton, Paper, Tooltip, CircularProgress,
  Switch, FormControlLabel
} from "@mui/material";
import {
  ArrowBack, ElectricalServices, Assessment, PowerInput,
  ArrowBackIosNew, ArrowForwardIos, ZoomIn, ZoomOut, RestartAlt,
  Add, Delete, Comment as CommentIcon, ModelTraining, Edit, Download
} from "@mui/icons-material";

import {
  getTransformer,
  getInspections,
  getImages,
  buildImageRawUrl,
  saveError,
  updateError,
  deleteError as deleteErrorApi,
  getErrors,
  trainModel,
  downloadAnomalyComparison
} from "../services/transformerService";
import useSnackbar from "../hooks/useSnackbar";
import ErrorDrawDialog from "../components/dialogs/ErrorDrawDialog";
import ErrorBoxEditDialog from "../components/dialogs/ErrorBoxEditDialog";
import { useUser } from "../contexts/UserContext";

import ZoomableImageWithBoxes from "../components/common/ZoomableImageWithBoxes";

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
function AIFaultList({ 
  boxes, 
  onDelete, 
  onEditBox, 
  onAddError, 
  onDownload, 
  onTrainModel, 
  autoTrain,
  onAutoTrainChange,
  hasUnsavedEdits,
  canAddError = false, 
  isDownloading = false, 
  isTraining = false 
}) {
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
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6">Detected Errors</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {onDownload && (
              <Button
                size="small"
                variant="outlined"
                startIcon={isDownloading ? <CircularProgress size={16} /> : <Download />}
                onClick={onDownload}
                disabled={isDownloading}
              >
                Download
              </Button>
            )}
            {onTrainModel && (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoTrain}
                      onChange={(e) => onAutoTrainChange(e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography variant="caption">Auto-train</Typography>}
                  sx={{ mr: 0, ml: 1 }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={isTraining ? <CircularProgress size={16} /> : <ModelTraining />}
                  onClick={onTrainModel}
                  disabled={isTraining || !hasUnsavedEdits}
                >
                  Train Model
                </Button>
              </>
            )}
            {canAddError && (
              <>
                <Box sx={{ width: 16 }} /> {/* Spacer */}
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={onAddError}
                >
                  Add Error
                </Button>
              </>
            )}
          </Stack>
        </Stack>

        {rows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No anomalies detected (Normal)
            </Typography>
        ) : (
            <Stack spacing={0.75}>
              {rows.map((b, mapIndex) => {
                const num = b?.idx ?? (mapIndex + 1);
                const tag = String(b?.status || "").toUpperCase() === "FAULTY" ? "Faulty" : "Potential";
                
                // Determine color based on status only
                const status = String(b?.status || "").toUpperCase();
                const colorDot = status === "FAULTY" ? "rgb(255,0,0)" : "rgb(255,255,0)";

                const coords = isNormalized(b)
                    ? `cx=${(b.cx * 100).toFixed(1)}%, cy=${(b.cy * 100).toFixed(1)}%, w=${(b.w * 100).toFixed(1)}%, h=${(b.h * 100).toFixed(1)}%`
                    : `cx=${Math.round(b.cx)}, cy=${Math.round(b.cy)}, w=${Math.round(b.w)}, h=${Math.round(b.h)}`;

                const kind = b?.isPoint ? "point" : "box";
                const isDeleted = b?.isDeleted;

                // Determine annotation type
                const getAnnotationType = () => {
                  if (!b?.isManual || b?.isManual === false) {
                    // AI-detected, not modified
                    if (b?.createdBy === "ai-system" || !b?.createdBy) {
                      return null; // No annotation tag
                    }
                  }
                  
                  if (b?.isManual === true) {
                    if (b?.createdBy === "ai-system") {
                      // AI-detected but manually edited
                      return { label: "EDITED", color: "warning" };
                    } else {
                      // Manually added by user
                      return { label: "ADDED", color: "success" };
                    }
                  }
                  
                  return null;
                };

                const annotationType = getAnnotationType();

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
                            {annotationType && (
                              <Chip 
                                size="small" 
                                label={annotationType.label} 
                                color={annotationType.color} 
                                variant="outlined" 
                                sx={{ height: 22 }} 
                              />
                            )}
                            {b?.label && b.label !== "Unknown" && (
                              <Chip size="small" label={b.label} variant="outlined" sx={{ height: 22 }} />
                            )}
                            {typeof b?.confidence === "number" && !b?.isManual && !b?.lastModifiedBy && (
                                <Chip size="small" label={`Conf ${(b.confidence * 100).toFixed(0)}%`} variant="outlined" sx={{ height: 22 }} />
                            )}
                            <Box sx={{ width: 12, height: 12, borderRadius: 999, background: colorDot, ml: 0.5 }} />
                            <Typography variant="body2" sx={{ opacity: 0.85 }}>
                              {kind} • {coords}
                            </Typography>
                          </Stack>

                          {!isDeleted && (
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Edit box position/size">
                                <IconButton size="small" onClick={() => onEditBox(mapIndex)} color="primary">
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


export default function ComparePage() {
  const { id, inspectionId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const { show } = useSnackbar();
  const { currentUser } = useUser();

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
  const [boxEditDialogOpen, setBoxEditDialogOpen] = useState(false);
  const [selectedErrorIndex, setSelectedErrorIndex] = useState(null);
  const [savingError, setSavingError] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Edit tracking and auto-train state
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);
  const [autoTrain, setAutoTrain] = useState(() => {
    const saved = localStorage.getItem('autoTrainEnabled');
    return saved ? JSON.parse(saved) : false;
  });

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

  // Auto-train on navigation away if enabled and has unsaved edits
  useEffect(() => {
    return () => {
      // Cleanup function runs when component unmounts (navigating away)
      if (autoTrain && hasUnsavedEdits && transformer?.id && baseline?.id && maint[idx]?.id) {
        const requestBody = {
          transformerId: transformer.id,
          baselineImageId: baseline.id,
          maintenanceImageId: maint[idx].id
        };
        
        // Use fetch instead of async/await since cleanup can't be async
        trainModel(transformer.id, requestBody).catch(err => {
          console.error("Auto-train failed on navigation:", err);
        });
      }
    };
  }, [autoTrain, hasUnsavedEdits, transformer?.id, baseline?.id, maint, idx]);

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
      // Save to backend - ensure imageId is in the request body
      const errorWithImageId = { ...newError, imageId };
      const response = await saveError(imageId, errorWithImageId);
      const savedError = response?.data?.data || response?.data;
      
      // Update local state with server response (includes ID)
      const updatedBoxes = [...currentBoxes, { 
        ...newError, 
        ...savedError,
        idx: currentBoxes.length + 1 
      }];
      
      setBoxesById(prev => ({ ...prev, [imageId]: updatedBoxes }));
      setHasUnsavedEdits(true); // Mark as having unsaved edits
      show("Error added and saved successfully", "success");
    } catch (error) {
      console.error("Failed to save error:", error);
      show(error?.response?.data?.error || error?.message || "Failed to save error to server", "error");
    } finally {
      setSavingError(false);
    }
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
      setHasUnsavedEdits(true); // Mark as having unsaved edits
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
      setHasUnsavedEdits(true); // Mark as having unsaved edits
      show("Error marked as deleted", "warning");
    } catch (error) {
      console.error("Failed to delete error:", error);
      show(error?.response?.data?.error || error?.message || "Failed to delete error on server", "error");
    } finally {
      setSavingError(false);
    }
  };

  const handleAutoTrainChange = (checked) => {
    setAutoTrain(checked);
    localStorage.setItem('autoTrainEnabled', JSON.stringify(checked));
  };

  const handleTrainModel = async () => {
    if (!transformer?.id || !baseline?.id || !maint[idx]?.id) {
      show("Cannot train: Missing transformer, baseline, or maintenance image", "error");
      return;
    }

    setIsTraining(true);
    try {
      const requestBody = {
        transformerId: transformer.id,
        baselineImageId: baseline.id,
        maintenanceImageId: maint[idx].id
      };

      await trainModel(transformer.id, requestBody);
      setHasUnsavedEdits(false); // Reset unsaved edits after successful training
      show("Model training started successfully", "success");
    } catch (error) {
      console.error("Failed to train model:", error);
      show(error?.response?.data?.error || error?.message || "Failed to start model training", "error");
    } finally {
      setIsTraining(false);
    }
  };

  const handleDownloadComparison = async () => {
    if (!maint[idx]?.id) {
      show("No maintenance image selected", "error");
      return;
    }

    const imageId = maint[idx].id;
    setIsDownloading(true);
    try {
      const response = await downloadAnomalyComparison(imageId);
      
      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/json' });
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `anomaly-comparison-image-${imageId}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      show("Anomaly comparison downloaded successfully", "success");
    } catch (error) {
      console.error("Failed to download anomaly comparison:", error);
      show(error?.response?.data?.error || error?.message || "Failed to download anomaly comparison", "error");
    } finally {
      setIsDownloading(false);
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
                    Transformer {transformer?.transformerNo || ""}
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
            onEditBox={handleEditBox}
            onDelete={handleDeleteError}
            onAddError={() => setDrawDialogOpen(true)}
            onDownload={handleDownloadComparison}
            onTrainModel={handleTrainModel}
            canAddError={maint.length > 0}
            isDownloading={isDownloading}
            isTraining={isTraining}
            autoTrain={autoTrain}
            onAutoTrainChange={handleAutoTrainChange}
            hasUnsavedEdits={hasUnsavedEdits}
          />
        </Box>

        {/* Dialogs */}
        <ErrorDrawDialog
          open={drawDialogOpen}
          onClose={() => setDrawDialogOpen(false)}
          onSave={handleAddError}
          imageSrc={maint[idx] ? buildImageRawUrl(maint[idx].id) : ""}
          imageId={maint[idx]?.id}
          existingErrors={numberedBoxes}
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
          existingErrors={numberedBoxes}
        />
      </Container>
  );
}
