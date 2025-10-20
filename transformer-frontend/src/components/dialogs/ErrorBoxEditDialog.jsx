// src/components/dialogs/ErrorBoxEditDialog.jsx
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
  Chip,
} from "@mui/material";
import { Close, RestartAlt, ZoomIn, ZoomOut } from "@mui/icons-material";

/**
 * ErrorBoxEditDialog - Dialog for editing error box position and size
 * Allows dragging to reposition and handles for resizing
 */
export default function ErrorBoxEditDialog({ open, onClose, onSave, imageSrc, imageId, error, errorIndex, currentUser = "User" }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  
  const [currentBox, setCurrentBox] = useState(null);
  const [layout, setLayout] = useState({ ready: false, naturalW: 0, naturalH: 0, renderW: 0, renderH: 0 });
  
  // Form fields
  const [status, setStatus] = useState("FAULTY");
  const [comment, setComment] = useState("");
  const [userId, setUserId] = useState(currentUser || "");

  useEffect(() => {
    if (open && error) {
      setStatus(error.status || "FAULTY");
      setComment(error.comment || "");
      setUserId(error.lastModifiedBy || currentUser || "");
      
      // Initialize current box from error
      setCurrentBox({
        cx: error.cx,
        cy: error.cy,
        w: error.w,
        h: error.h,
      });
    }
  }, [open, error]);

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
    const maxW = 900;
    const maxH = 650;
    const scale = Math.min(maxW / naturalW, maxH / naturalH, 1);
    const renderW = naturalW * scale;
    const renderH = naturalH * scale;

    canvas.width = renderW;
    canvas.height = renderH;

    setLayout({ ready: true, naturalW, naturalH, renderW, renderH, scale });
    redrawCanvas();
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !layout.ready || !currentBox) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, layout.renderW, layout.renderH);

    const scale = layout.scale || (layout.renderW / layout.naturalW);
    
    // Convert natural coords to render coords
    const renderCx = currentBox.cx * scale;
    const renderCy = currentBox.cy * scale;
    const renderW = currentBox.w * scale;
    const renderH = currentBox.h * scale;
    const renderX = renderCx - renderW / 2;
    const renderY = renderCy - renderH / 2;

    // Draw the box
    ctx.strokeStyle = status === "FAULTY" ? "red" : "yellow";
    ctx.lineWidth = 3;
    ctx.strokeRect(renderX, renderY, renderW, renderH);

    // Draw semi-transparent fill
    ctx.fillStyle = status === "FAULTY" ? "rgba(255,0,0,0.1)" : "rgba(255,255,0,0.1)";
    ctx.fillRect(renderX, renderY, renderW, renderH);

    // Draw resize handles
    const handleSize = 10;
    ctx.fillStyle = status === "FAULTY" ? "red" : "yellow";
    
    // Corner handles
    const corners = [
      { x: renderX, y: renderY, cursor: "nw-resize", name: "nw" },
      { x: renderX + renderW, y: renderY, cursor: "ne-resize", name: "ne" },
      { x: renderX, y: renderY + renderH, cursor: "sw-resize", name: "sw" },
      { x: renderX + renderW, y: renderY + renderH, cursor: "se-resize", name: "se" },
    ];
    
    corners.forEach(corner => {
      ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
    });

    // Edge handles (for precise resizing)
    ctx.fillRect(renderX + renderW / 2 - handleSize / 2, renderY - handleSize / 2, handleSize, handleSize); // top
    ctx.fillRect(renderX + renderW / 2 - handleSize / 2, renderY + renderH - handleSize / 2, handleSize, handleSize); // bottom
    ctx.fillRect(renderX - handleSize / 2, renderY + renderH / 2 - handleSize / 2, handleSize, handleSize); // left
    ctx.fillRect(renderX + renderW - handleSize / 2, renderY + renderH / 2 - handleSize / 2, handleSize, handleSize); // right

    // Draw center point
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(renderCx, renderCy, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = status === "FAULTY" ? "red" : "yellow";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  useEffect(() => {
    redrawCanvas();
  }, [currentBox, layout, status]);

  const getHandle = (mx, my) => {
    if (!currentBox || !layout.ready) return null;

    const scale = layout.scale || (layout.renderW / layout.naturalW);
    const renderCx = currentBox.cx * scale;
    const renderCy = currentBox.cy * scale;
    const renderW = currentBox.w * scale;
    const renderH = currentBox.h * scale;
    const renderX = renderCx - renderW / 2;
    const renderY = renderCy - renderH / 2;

    const handleSize = 15; // Hit area larger than visual size

    const handles = [
      { x: renderX, y: renderY, type: "nw" },
      { x: renderX + renderW, y: renderY, type: "ne" },
      { x: renderX, y: renderY + renderH, type: "sw" },
      { x: renderX + renderW, y: renderY + renderH, type: "se" },
      { x: renderX + renderW / 2, y: renderY, type: "n" },
      { x: renderX + renderW / 2, y: renderY + renderH, type: "s" },
      { x: renderX, y: renderY + renderH / 2, type: "w" },
      { x: renderX + renderW, y: renderY + renderH / 2, type: "e" },
    ];

    for (const handle of handles) {
      if (Math.abs(mx - handle.x) <= handleSize && Math.abs(my - handle.y) <= handleSize) {
        return handle.type;
      }
    }

    // Check if inside box (for dragging)
    if (mx >= renderX && mx <= renderX + renderW && my >= renderY && my <= renderY + renderH) {
      return "move";
    }

    return null;
  };

  const getCursor = (handleType) => {
    const cursors = {
      nw: "nw-resize",
      ne: "ne-resize",
      sw: "sw-resize",
      se: "se-resize",
      n: "n-resize",
      s: "s-resize",
      e: "e-resize",
      w: "w-resize",
      move: "move",
    };
    return cursors[handleType] || "default";
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !layout.ready || !currentBox) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const handle = getHandle(mx, my);
    if (handle === "move") {
      setIsDragging(true);
      setDragStart({ mx, my, box: { ...currentBox } });
    } else if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      setDragStart({ mx, my, box: { ...currentBox } });
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !layout.ready || !currentBox) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isDragging && dragStart) {
      const scale = layout.scale || (layout.renderW / layout.naturalW);
      const dx = (mx - dragStart.mx) / scale;
      const dy = (my - dragStart.my) / scale;

      setCurrentBox({
        ...dragStart.box,
        cx: dragStart.box.cx + dx,
        cy: dragStart.box.cy + dy,
      });
    } else if (isResizing && dragStart && resizeHandle) {
      const scale = layout.scale || (layout.renderW / layout.naturalW);
      const dx = (mx - dragStart.mx) / scale;
      const dy = (my - dragStart.my) / scale;

      const origBox = dragStart.box;
      let newBox = { ...origBox };

      // Calculate new dimensions based on handle
      switch (resizeHandle) {
        case "nw":
          newBox.w = Math.max(20, origBox.w - dx);
          newBox.h = Math.max(20, origBox.h - dy);
          newBox.cx = origBox.cx + dx / 2;
          newBox.cy = origBox.cy + dy / 2;
          break;
        case "ne":
          newBox.w = Math.max(20, origBox.w + dx);
          newBox.h = Math.max(20, origBox.h - dy);
          newBox.cx = origBox.cx + dx / 2;
          newBox.cy = origBox.cy + dy / 2;
          break;
        case "sw":
          newBox.w = Math.max(20, origBox.w - dx);
          newBox.h = Math.max(20, origBox.h + dy);
          newBox.cx = origBox.cx + dx / 2;
          newBox.cy = origBox.cy + dy / 2;
          break;
        case "se":
          newBox.w = Math.max(20, origBox.w + dx);
          newBox.h = Math.max(20, origBox.h + dy);
          newBox.cx = origBox.cx + dx / 2;
          newBox.cy = origBox.cy + dy / 2;
          break;
        case "n":
          newBox.h = Math.max(20, origBox.h - dy);
          newBox.cy = origBox.cy + dy / 2;
          break;
        case "s":
          newBox.h = Math.max(20, origBox.h + dy);
          newBox.cy = origBox.cy + dy / 2;
          break;
        case "w":
          newBox.w = Math.max(20, origBox.w - dx);
          newBox.cx = origBox.cx + dx / 2;
          break;
        case "e":
          newBox.w = Math.max(20, origBox.w + dx);
          newBox.cx = origBox.cx + dx / 2;
          break;
      }

      setCurrentBox(newBox);
    } else {
      // Update cursor based on handle
      const handle = getHandle(mx, my);
      canvas.style.cursor = getCursor(handle);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setDragStart(null);
  };

  const handleReset = () => {
    if (error) {
      setCurrentBox({
        cx: error.cx,
        cy: error.cy,
        w: error.w,
        h: error.h,
      });
    }
  };

  const handleSave = () => {
    if (!currentBox) return;

    const updatedError = {
      ...error,
      cx: currentBox.cx,
      cy: currentBox.cy,
      w: currentBox.w,
      h: currentBox.h,
      status,
      comment,
      confidence: null, // Remove confidence for manual edits
      colorRgb: status === "FAULTY" ? [255, 0, 0] : [255, 255, 0],
      lastModified: new Date().toISOString(),
      lastModifiedBy: userId || "Anonymous",
      lastModifiedAt: new Date().toISOString(),
    };

    onSave(updatedError);
    handleClose();
  };

  const handleClose = () => {
    setCurrentBox(null);
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setDragStart(null);
    setUserId(currentUser || "");
    onClose();
  };

  if (!error) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Edit Error Box #{errorIndex + 1}</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Drag the box to reposition, or drag the handles to resize. Click inside to move, or grab corners/edges to resize.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 2, bgcolor: "#0b0b0b", p: 2, borderRadius: 1 }}>
          <Box sx={{ position: "relative" }}>
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Edit error box"
              onLoad={computeLayout}
              style={{ position: "absolute", visibility: "hidden", maxWidth: 900, maxHeight: 650 }}
            />
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ display: "block", cursor: "default" }}
            />
            {currentBox && (
              <Tooltip title="Reset to original position">
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

        {currentBox && (
          <Stack direction="row" spacing={2} sx={{ mb: 2, p: 1, bgcolor: "rgba(102,120,255,0.05)", borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Center:</strong> ({Math.round(currentBox.cx)}, {Math.round(currentBox.cy)})
            </Typography>
            <Typography variant="body2">
              <strong>Size:</strong> {Math.round(currentBox.w)} × {Math.round(currentBox.h)}
            </Typography>
          </Stack>
        )}

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your user ID"
            required
            helperText="Your user ID will be recorded as the last modifier of this error"
          />

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Status">
              <MenuItem value="FAULTY">Faulty</MenuItem>
              <MenuItem value="POTENTIAL">Potential Faulty</MenuItem>
              <MenuItem value="NORMAL">Normal</MenuItem>
            </Select>
          </FormControl>

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
        <Button onClick={handleSave} variant="contained" disabled={!userId.trim()}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
