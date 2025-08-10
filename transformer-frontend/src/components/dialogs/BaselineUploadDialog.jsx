// src/components/dialogs/BaselineUploadDialog.jsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, MenuItem, Box, Avatar, Chip, LinearProgress
} from "@mui/material";
import { ThermostatAuto, WbSunny, Cloud, Umbrella, Person } from "@mui/icons-material";
import { useState } from "react";
import FileDropZone from "../upload/FileDropZone";
import { WEATHER, IMAGE_TYPES } from "../../constants/enums";
import { uploadImage } from "../../services/transformerService";

export default function BaselineUploadDialog({
  open,
  transformerId,
  onClose,
  onUploaded,
}) {
  const [uploader, setUploader] = useState("");
  const [weather, setWeather] = useState("SUNNY");
  const [temperatureC, setTemperatureC] = useState("");
  const [humidity, setHumidity] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (f) => {
    setFile(f || null);
    if (f) {
      const r = new FileReader();
      r.onload = (e) => setPreview(e.target.result);
      r.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const submit = async () => {
    if (!uploader.trim() || !file) return;
    setLoading(true);
    try {
      const meta = {
        imageType: IMAGE_TYPES.BASELINE,
        uploader: uploader.trim(),
        envCondition: {
          weather,
          temperatureC: temperatureC === "" ? undefined : Number(temperatureC),
          humidity: humidity === "" ? undefined : Number(humidity),
          locationNote: locationNote?.trim() || undefined,
        },
      };
      const fd = new FormData();
      fd.append("meta", new Blob([JSON.stringify(meta)], { type: "application/json" }));
      fd.append("file", file);

      await uploadImage(transformerId, fd);
      onUploaded?.();
      onClose?.();
      // reset
      setUploader(""); setWeather("SUNNY"); setTemperatureC(""); setHumidity(""); setLocationNote("");
      setFile(null); setPreview(null);
    } finally { setLoading(false); }
  };

  const WeatherIcon = weather === "SUNNY" ? WbSunny : weather === "CLOUDY" ? Cloud : Umbrella;

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload Baseline</DialogTitle>
      {loading && <LinearProgress />}
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1}>
            <Avatar><ThermostatAuto /></Avatar>
            <Chip label="Baseline" color="success" />
          </Stack>

          <TextField
            label="Uploader"
            value={uploader}
            onChange={(e) => setUploader(e.target.value)}
            required
            InputProps={{ startAdornment: <Person sx={{ mr: 1 }} /> }}
          />

          <TextField select label="Weather" value={weather} onChange={(e) => setWeather(e.target.value)} required>
            {WEATHER.map((w) => (
              <MenuItem key={w} value={w}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <WeatherIcon fontSize="small" />
                  <span>{w[0] + w.slice(1).toLowerCase()}</span>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Temperature (°C)"
              type="number"
              value={temperatureC}
              onChange={(e) => setTemperatureC(e.target.value)}
              fullWidth
            />
            <TextField
              label="Humidity (%)"
              type="number"
              value={humidity}
              onChange={(e) => setHumidity(e.target.value)}
              fullWidth
            />
          </Stack>

          <TextField
            label="Location Note (optional)"
            value={locationNote}
            onChange={(e) => setLocationNote(e.target.value)}
            multiline
            minRows={2}
          />

          <Box onClick={() => document.getElementById("baseline-file-input")?.click()} sx={{ cursor: "pointer" }}>
            <FileDropZone onFile={handleFile}>
              {preview ? (
                <img src={preview} alt="preview" style={{ maxHeight: 160, objectFit: "contain" }} />
              ) : (
                <>Drag & drop image here, or click to select</>
              )}
            </FileDropZone>
          </Box>
          <input
            id="baseline-file-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading} variant="text">Cancel</Button>
        <Button onClick={submit} disabled={loading || !uploader.trim() || !file} variant="contained">Upload</Button>
      </DialogActions>
    </Dialog>
  );
}
