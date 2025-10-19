// src/components/dialogs/ErrorDrawDialog.jsx
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Close, RestartAlt } from "@mui/icons-material";

/**
 * ErrorDrawDialog - Dialog for drawing a new error box on an image
 * User clicks and drags to draw a rectangle
 */
export default function ErrorDrawDialog({ open, onClose, onSave, imageSrc, imageId }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [currentRect, setCurrentRect] = useState(null);
  const [drawnRect, setDrawnRect] = useState(null);

  const [status, setStatus] = useState("FAULTY");
  const [label, setLabel] = useState("Hotspot");
  const [comment, setComment] = useState("");
  const [confidence, setConfidence] = useState(0.95);

  const [layout, setLayout] = useState({ ready: false, naturalW: 0, naturalH: 0, renderW: 0, renderH: 0 });

  useEffect(() => {
    if (open && imgRef.current && imgRef.current.complete) {
      computeLayout();
    }
  }, [open]);

  const computeLayout = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !img.naturalWidth) return;

    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const maxW = 800;
    const maxH = 600;
    const scale = Math.min(maxW / naturalW, maxH / naturalH, 1);
    const renderW = naturalW * scale;
    const renderH = naturalH * scale;

    canvas.width = renderW;
    canvas.height = renderH;

    setLayout({ ready: true, naturalW, naturalH, renderW, renderH });
    redrawCanvas();
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !layout.ready) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, layout.renderW, layout.renderH);

    // Draw the final rectangle if exists
    if (drawnRect) {
      ctx.strokeStyle = status === "FAULTY" ? "red" : "yellow";
      ctx.lineWidth = 2;
      ctx.strokeRect(drawnRect.x, drawnRect.y, drawnRect.w, drawnRect.h);
    }

    // Draw current dragging rectangle
    if (currentRect) {
      ctx.strokeStyle = status === "FAULTY" ? "rgba(255,0,0,0.7)" : "rgba(255,255,0,0.7)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
      ctx.setLineDash([]);
    }
  };

  useEffect(() => {
    redrawCanvas();
  }, [drawnRect, currentRect, layout, status]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !layout.ready) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentRect(null);
    setDrawnRect(null);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !startPos) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const w = x - startPos.x;
    const h = y - startPos.y;

    setCurrentRect({ x: startPos.x, y: startPos.y, w, h });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentRect) {
      setDrawnRect(currentRect);
      setCurrentRect(null);
    }
    setIsDrawing(false);
    setStartPos(null);
  };

  const handleReset = () => {
    setDrawnRect(null);
    setCurrentRect(null);
    setIsDrawing(false);
    setStartPos(null);
    redrawCanvas();
  };

  const handleSave = () => {
    if (!drawnRect || !layout.ready) return;

    const scale = layout.naturalW / layout.renderW;
    
    // Convert to natural image coordinates
    const x = drawnRect.x * scale;
    const y = drawnRect.y * scale;
    const w = Math.abs(drawnRect.w) * scale;
    const h = Math.abs(drawnRect.h) * scale;

    // Calculate center point
    const cx = x + w / 2;
    const cy = y + h / 2;

    const newError = {
      cx,
      cy,
      w,
      h,
      status,
      label,
      comment,
      confidence: parseFloat(confidence),
      colorRgb: status === "FAULTY" ? [255, 0, 0] : [255, 255, 0],
      isManual: true,
      timestamp: new Date().toISOString(),
    };

    onSave(newError);
    handleClose();
  };

  const handleClose = () => {
    setDrawnRect(null);
    setCurrentRect(null);
    setIsDrawing(false);
    setStartPos(null);
    setStatus("FAULTY");
    setLabel("Hotspot");
    setComment("");
    setConfidence(0.95);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Draw New Error</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click and drag on the image to draw a rectangle around the error area.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 2, bgcolor: "#0b0b0b", p: 2, borderRadius: 1 }}>
          <Box sx={{ position: "relative" }}>
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Draw error"
              onLoad={computeLayout}
              style={{ position: "absolute", visibility: "hidden", maxWidth: 800, maxHeight: 600 }}
            />
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: "crosshair", display: "block" }}
            />
            {drawnRect && (
              <Tooltip title="Reset drawing">
                <IconButton
                  onClick={handleReset}
                  sx={{ position: "absolute", top: 8, right: 8, bgcolor: "rgba(0,0,0,0.6)", color: "white" }}
                  size="small"
                >
                  <RestartAlt />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Status">
              <MenuItem value="FAULTY">Faulty</MenuItem>
              <MenuItem value="POTENTIAL">Potential Faulty</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Type/Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Hotspot, Corrosion, Leak"
          />

          <TextField
            fullWidth
            label="Confidence"
            type="number"
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
            inputProps={{ min: 0, max: 1, step: 0.05 }}
          />

          <TextField
            fullWidth
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            rows={3}
            placeholder="Add any notes or observations about this error..."
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!drawnRect}>
          Save Error
        </Button>
      </DialogActions>
    </Dialog>
  );
}
