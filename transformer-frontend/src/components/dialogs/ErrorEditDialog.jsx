// src/components/dialogs/ErrorEditDialog.jsx
import { useState, useEffect } from "react";
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
  Stack,
  IconButton,
  Box,
  Chip,
} from "@mui/material";
import { Close } from "@mui/icons-material";

/**
 * ErrorEditDialog - Dialog for editing an existing error
 */
export default function ErrorEditDialog({ open, onClose, onSave, error, errorIndex, currentUser = "User" }) {
  const [status, setStatus] = useState("FAULTY");
  const [label, setLabel] = useState("");
  const [comment, setComment] = useState("");
  const [confidence, setConfidence] = useState(0.95);

  useEffect(() => {
    if (error) {
      setStatus(error.status || "FAULTY");
      setLabel(error.label || "");
      setComment(error.comment || "");
      setConfidence(error.confidence ?? 0.95);
    }
  }, [error]);

  const handleSave = () => {
    const updatedError = {
      ...error,
      status,
      label,
      comment,
      confidence: parseFloat(confidence),
      colorRgb: status === "FAULTY" ? [255, 0, 0] : [255, 255, 0],
      lastModified: new Date().toISOString(),
      lastModifiedBy: currentUser,
      lastModifiedAt: new Date().toISOString(),
    };

    onSave(updatedError);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!error) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Edit Error #{errorIndex + 1}</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error.isManual && (
            <Chip label="Manual Entry" color="info" size="small" sx={{ width: "fit-content" }} />
          )}

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Position
            </Typography>
            <Typography variant="body2">
              Center: ({Math.round(error.cx)}, {Math.round(error.cy)}) • 
              Size: {Math.round(error.w)} × {Math.round(error.h)}
            </Typography>
          </Box>

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
            rows={4}
            placeholder="Add any notes or observations about this error..."
          />

          {error.timestamp && (
            <Typography variant="caption" color="text.secondary">
              Created: {new Date(error.timestamp).toLocaleString()}
              {error.createdBy && ` by ${error.createdBy}`}
            </Typography>
          )}

          {error.lastModified && (
            <Typography variant="caption" color="text.secondary">
              Last modified: {new Date(error.lastModified).toLocaleString()}
              {error.lastModifiedBy && ` by ${error.lastModifiedBy}`}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
