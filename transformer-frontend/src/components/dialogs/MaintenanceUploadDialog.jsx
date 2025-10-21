// src/components/dialogs/MaintenanceUploadDialog.jsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, MenuItem, Box, Chip, LinearProgress
} from "@mui/material";
import { useState } from "react";
import FileDropZone from "../upload/FileDropZone";
import { WEATHER, IMAGE_TYPES } from "../../constants/enums";
import { uploadImage } from "../../services/transformerService";

export default function MaintenanceUploadDialog({
  open,
  transformerId,
  inspection,
  onClose,
  onUploaded,
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [weather, setWeather] = useState("SUNNY");
  const [loading, setLoading] = useState(false);

  const handleFile = (f) => {
    setFile(f || null);
    if (f) {
      const r = new FileReader();
      r.onload = (e) => setPreview(e.target.result);
      r.readAsDataURL(f);
    } else setPreview(null);
  };

  const submit = async () => {
    if (!file || !inspection) return;
    setLoading(true);
    try {
      const meta = {
        imageType: IMAGE_TYPES.MAINTENANCE,
        uploader: inspection.inspector || "",
        inspectionId: inspection.id,
        envCondition: { weather },
      };
      const fd = new FormData();
      fd.append("meta", new Blob([JSON.stringify(meta)], { type: "application/json" }));
      fd.append("file", file);

      await uploadImage(transformerId, fd);
      onUploaded?.();
      onClose?.();
      setFile(null); setPreview(null);
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload Maintenance Image</DialogTitle>
      {loading && <LinearProgress />}
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <Chip label={`Inspection: ${inspection?.title || "-"}`} color="primary" />
          <TextField select label="Weather" value={weather} onChange={(e) => setWeather(e.target.value)}>
            {WEATHER.map((w) => <MenuItem key={w} value={w}>{w}</MenuItem>)}
          </TextField>
          <Box onClick={() => document.getElementById("maint-file-input")?.click()} sx={{ cursor: "pointer" }}>
            <FileDropZone onFile={handleFile}>
              {preview ? (
                <img src={preview} alt="preview" style={{ maxHeight: 160, objectFit: "contain" }} />
              ) : (
                <>Drag & drop image here, or click to select</>
              )}
            </FileDropZone>
          </Box>
          <input
            id="maint-file-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} variant="text">Cancel</Button>
        <Button onClick={submit} disabled={loading || !file} variant="contained">Upload</Button>
      </DialogActions>
    </Dialog>
  );
}
