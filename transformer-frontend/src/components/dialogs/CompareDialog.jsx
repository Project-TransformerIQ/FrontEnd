// src/components/dialogs/CompareDialog.jsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, IconButton, Box, Chip, LinearProgress, Typography
} from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import { useEffect, useState, useMemo } from "react";
import { getImages, buildImageRawUrl } from "../../services/transformerService";

export default function CompareDialog({
  open,
  transformerId,
  inspection, 
  onClose,
}) {
  const [loading, setLoading] = useState(false);
  const [baseline, setBaseline] = useState(null);
  const [maint, setMaint] = useState([]);
  const [idx, setIdx] = useState(0);

  const title = useMemo(() => {
    if (inspection?.title) return `Compare: ${inspection.title}`;
    return "Compare: Baseline vs Maintenance";
  }, [inspection]);

  useEffect(() => {
    if (!open || !transformerId) return;
    (async () => {
      setLoading(true);
      try {

        const [baselineRes, maintRes] = await Promise.all([
          getImages(transformerId, { type: "BASELINE" }),
          inspection?.id
            ? getImages(transformerId, { type: "MAINTENANCE", inspectionId: inspection.id })
            : getImages(transformerId, { type: "MAINTENANCE" }),
        ]);


        const baselines = Array.isArray(baselineRes?.data) ? baselineRes.data : [];
        baselines.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setBaseline(baselines[0] || null);


        const m = Array.isArray(maintRes?.data) ? maintRes.data : [];
        m.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setMaint(m);
        setIdx(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, transformerId, inspection]);

  const next = () => setIdx((i) => (i + 1) % Math.max(maint.length || 1, 1));
  const prev = () => setIdx((i) => (i - 1 + Math.max(maint.length || 1, 1)) % Math.max(maint.length || 1, 1));

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      {loading && <LinearProgress />}
      <DialogContent>
        <Stack spacing={2} direction={{ xs: "column", md: "row" }}>
          {/* Baseline */}
          <Box sx={{ flex: 1, p: 1, bgcolor: "grey.100", borderRadius: 2, minHeight: 260 }}>
            <Typography variant="subtitle2">Baseline</Typography>
            {baseline ? (
              <img
                src={buildImageRawUrl(baseline.id)}
                alt={baseline.filename || `baseline-${baseline.id}`}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">No baseline available</Typography>
            )}
            {baseline?.createdAt && (
              <Chip size="small" sx={{ mt: 1 }} label={`Taken: ${new Date(baseline.createdAt).toLocaleString()}`} />
            )}
          </Box>

          {/* Maintenance */}
          <Box sx={{ flex: 1, p: 1, bgcolor: "grey.100", borderRadius: 2, position: "relative", minHeight: 260 }}>
            <Typography variant="subtitle2">Maintenance {maint.length ? `(${idx + 1}/${maint.length})` : ""}</Typography>
            {maint.length ? (
              <>
                <IconButton onClick={prev} size="small" sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }}>
                  <ArrowBackIosNew fontSize="small" />
                </IconButton>
                <img
                  src={buildImageRawUrl(maint[idx].id)}
                  alt={maint[idx].filename || `maintenance-${maint[idx].id}`}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
                <IconButton onClick={next} size="small" sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}>
                  <ArrowForwardIos fontSize="small" />
                </IconButton>
                {maint[idx]?.createdAt && (
                  <Chip size="small" sx={{ mt: 1 }} label={`Taken: ${new Date(maint[idx].createdAt).toLocaleString()}`} />
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">No maintenance images for this inspection</Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
