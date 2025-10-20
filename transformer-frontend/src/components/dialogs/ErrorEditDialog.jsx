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
  const [comment, setComment] = useState("");
  const [userId, setUserId] = useState(currentUser || "");

  useEffect(() => {
    if (error) {
      setStatus(error.status || "FAULTY");
      setComment(error.comment || "");
      setUserId(error.lastModifiedBy || currentUser || "");
    }
  }, [error, currentUser]);

  const handleSave = () => {
    const updatedError = {
      ...error,
      status,
      comment,
      confidence: null, // Remove confidence for manual edits
      colorRgb: status === "FAULTY" ? [255, 0, 0] : [255, 255, 0],
      lastModified: new Date().toISOString(),
      lastModifiedBy: userId || "Anonymous",
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
        <Button onClick={handleSave} variant="contained" disabled={!userId.trim()}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
