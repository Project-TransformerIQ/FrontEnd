// src/pages/ImageUploadPage.jsx
import { useEffect, useState } from "react";
import {
  Alert, Avatar, Box, Button, Card, CardContent, Chip, FormControl,
  Grid, InputLabel, LinearProgress, MenuItem, Paper, Select, Snackbar,
  TextField, Typography
} from "@mui/material";
import {
  CheckCircle, Cloud, Image as ImageIcon, LocationOn, Person,
  ThermostatAuto, Umbrella, WbSunny
} from "@mui/icons-material";
import axiosClient from "../api/axiosClient";
import FileDropZone from "../components/upload/FileDropZone";
import useSnackbar from "../hooks/useSnackbar";
import { WEATHER, IMAGE_TYPES } from "../constants/enums";

export default function ImageUploadPage() {
  const [transformers, setTransformers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [imageType, setImageType] = useState(IMAGE_TYPES.BASELINE);
  const [env, setEnv] = useState({ weather: "SUNNY", temperatureC: "", humidity: "", locationNote: "" });
  const [file, setFile] = useState(null);
  const [uploader, setUploader] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const { snackbar, show, close } = useSnackbar();
  const apiBase = "/transformers";

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosClient.get(apiBase);
        setTransformers(res.data);
      } catch {
        show("Failed to load transformers", "error");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toNumberOrUndefined = (v) => v === "" || v === null ? undefined : Number(v);

  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else setPreview(null);
  };

  const upload = async () => {
    if (!selectedId || !file || !uploader.trim()) {
      show("Please fill in all required fields", "error");
      return;
    }
    if (imageType === IMAGE_TYPES.BASELINE && !env.weather) {
      show("Baseline requires an environment weather", "error");
      return;
    }

    setUploading(true);
    try {
      const meta = {
        imageType,
        uploader: uploader.trim(),
        ...(imageType === IMAGE_TYPES.BASELINE
          ? {
              envCondition: {
                weather: env.weather,
                temperatureC: toNumberOrUndefined(env.temperatureC),
                humidity: toNumberOrUndefined(env.humidity),
                locationNote: env.locationNote?.trim() || undefined,
              },
            }
          : {}),
      };

      const formData = new FormData();
      formData.append("meta", new Blob([JSON.stringify(meta)], { type: "application/json" }));
      formData.append("file", file);
      await axiosClient.post(`${apiBase}/${selectedId}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } });

      show("Image uploaded successfully!");
      // reset
      setFile(null); setPreview(null); setUploader("");
      setSelectedId(null); setImageType(IMAGE_TYPES.BASELINE);
      setEnv({ weather: "SUNNY", temperatureC: "", humidity: "", locationNote: "" });
    } catch (error) {
      show(error?.response?.data?.error || "Failed to upload image", "error");
    } finally { setUploading(false); }
  };

  const selectedTransformer = transformers.find((t) => t.id === selectedId);
  const WeatherIcon = env.weather === "SUNNY" ? WbSunny : env.weather === "CLOUDY" ? Cloud : Umbrella;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: "#1976d2", fontWeight: 600, display: "flex", alignItems: "center", gap: 1, fontSize: { xs: "1.6rem", sm: "2rem" } }}>
          <ThermostatAuto sx={{ flex: "0 0 auto" }} />
          Upload Thermal Images
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload baseline and maintenance thermal images for transformer inspection
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#1976d2", mb: 3 }}>
                Image Details
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Transformer select */}
                <FormControl fullWidth required>
                  <InputLabel>Select Transformer</InputLabel>
                  <Select value={selectedId ?? ""} label="Select Transformer" onChange={(e) => setSelectedId(Number(e.target.value))}>
                    {transformers.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                          <LocationOn fontSize="small" color="action" />
                          <strong>{t.transformerNo}</strong>
                          <Box component="span" sx={{ color: "text.secondary", mx: 0.5 }}>—</Box>
                          <Box component="span" sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={`${t.poleNo || "-"} (${t.region ?? "-"})`}>
                            {t.poleNo || "-"} ({t.region ?? "-"})
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Selected transformer chips */}
                {selectedTransformer && (
                  <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                    <Typography variant="subtitle2" gutterBottom>Selected Transformer:</Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Chip label={selectedTransformer.transformerNo} color="primary" size="small" />
                      <Chip label={selectedTransformer.poleNo || "-"} variant="outlined" size="small" />
                      <Chip label={`${selectedTransformer.region ?? "-"}`} variant="outlined" size="small" />
                    </Box>
                  </Paper>
                )}

                {/* Image Type */}
                <FormControl fullWidth required>
                  <InputLabel>Image Type</InputLabel>
                  <Select value={imageType} label="Image Type" onChange={(e) => setImageType(e.target.value)}>
                    <MenuItem value={IMAGE_TYPES.BASELINE}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircle fontSize="small" color="success" />
                        Baseline Image
                      </Box>
                    </MenuItem>
                    <MenuItem value={IMAGE_TYPES.MAINTENANCE}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <ThermostatAuto fontSize="small" color="warning" />
                        Maintenance Image
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Baseline env fields */}
                {imageType === IMAGE_TYPES.BASELINE && (
                  <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                    <FormControl fullWidth required>
                      <InputLabel>Weather</InputLabel>
                      <Select value={env.weather} label="Weather" onChange={(e) => setEnv({ ...env, weather: e.target.value })}>
                        {WEATHER.map((w) => (
                          <MenuItem key={w} value={w}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <WeatherIcon fontSize="small" />
                              {w[0] + w.slice(1).toLowerCase()}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField label="Temperature (°C)" type="number" value={env.temperatureC} onChange={(e) => setEnv({ ...env, temperatureC: e.target.value })} fullWidth />
                    <TextField label="Humidity (%)" type="number" value={env.humidity} onChange={(e) => setEnv({ ...env, humidity: e.target.value })} fullWidth />
                    <TextField label="Location Note (optional)" value={env.locationNote} onChange={(e) => setEnv({ ...env, locationNote: e.target.value })} fullWidth multiline minRows={2} sx={{ gridColumn: { xs: "1", sm: "1 / span 2" } }} />
                  </Box>
                )}

                {/* Uploader */}
                <TextField
                  label="Uploader"
                  value={uploader}
                  onChange={(e) => setUploader(e.target.value)}
                  InputProps={{ startAdornment: <Person sx={{ mr: 1 }} /> }}
                  required
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Dropzone / Preview */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#1976d2", mb: 1 }}>
                Image File
              </Typography>
              <Box onClick={() => document.getElementById("upload-file-input")?.click()} sx={{ cursor: "pointer" }}>
                <FileDropZone onFile={handleFile}>
                  {preview ? (
                    <img src={preview} alt="preview" style={{ maxHeight: 240, objectFit: "contain" }} />
                  ) : (
                    <>Drag & drop image here, or click to select</>
                  )}
                </FileDropZone>
              </Box>
              <input
                id="upload-file-input"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />

              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Button onClick={upload} disabled={uploading} variant="contained">Upload</Button>
                {uploading && <LinearProgress sx={{ flex: 1 }} />}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={close} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={close} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
