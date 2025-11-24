// src/pages/MaintenanceRecordPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  TextField,
  MenuItem,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Snackbar,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  ElectricalServices,
  Assessment,
  ArrowBack,
  History,
  Engineering,
  CheckCircle,
} from "@mui/icons-material";

import {
  getMaintenanceRecordForm,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  listMaintenanceRecords,
  buildImageRawUrl,
} from "../services/transformerService";

import useSnackbar from "../hooks/useSnackbar";

export default function MaintenanceRecordPage() {
  const { id, inspectionId } = useParams();
  const navigate = useNavigate();
  const locationState = useLocation().state;

  const [formPayload, setFormPayload] = useState(null); // data from form endpoint
  const [loadingForm, setLoadingForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { snackbar, show, close } = useSnackbar();

  // Local editable state
  const [inspectorName, setInspectorName] = useState("");
  const [status, setStatus] = useState("");
  const [inspectionTimestamp, setInspectionTimestamp] = useState(""); // ISO string for datetime-local
  const [recommendedAction, setRecommendedAction] = useState("");
  const [additionalRemarks, setAdditionalRemarks] = useState("");

  // simple key/value electrical readings
  const [readings, setReadings] = useState([
    { key: "voltage", value: "" },
    { key: "current", value: "" },
  ]);

  const transformerFromState = locationState?.transformer || null;
  const inspectionFromState = locationState?.inspection || null;

  const existingRecord = useMemo(
    () => formPayload?.existingRecord || null,
    [formPayload]
  );

  const allowedStatuses = useMemo(
    () => formPayload?.allowedStatuses || [],
    [formPayload]
  );

  // Helper to convert backend ISO timestamp to datetime-local compatible value
  const toDateTimeLocal = (iso) => {
    if (!iso) return "";
    // e.g. "2025-11-24T21:13:45.123" -> "2025-11-24T21:13"
    const noMs = iso.split(".")[0];
    // ensure at least minutes
    return noMs.length >= 16 ? noMs.slice(0, 16) : noMs;
  };

  const loadForm = async () => {
    try {
      setLoadingForm(true);
      const res = await getMaintenanceRecordForm(id, {
        inspectionId,
        // imageId not provided -> backend picks latest maintenance image for this transformer/inspection
      });
      const data = res.data;
      setFormPayload(data);

      // init editable fields
      const record = data.existingRecord;
      const inspection = data.inspection || inspectionFromState;

      setInspectorName(
        record?.inspectorName ||
          inspection?.inspector ||
          ""
      );
      setStatus(record?.status || data.allowedStatuses?.[0] || "");
      const ts =
        record?.inspectionTimestamp ||
        inspection?.createdAt ||
        data.maintenanceImage?.createdAt;
      setInspectionTimestamp(toDateTimeLocal(ts));
      setRecommendedAction(record?.recommendedAction || "");
      setAdditionalRemarks(record?.additionalRemarks || "");

      if (record?.electricalReadings) {
        const entries = Object.entries(record.electricalReadings);
        if (entries.length > 0) {
          setReadings(
            entries.map(([key, value]) => ({ key, value }))
          );
        }
      }
    } catch (e) {
      console.error(e);
      show(
        e?.response?.data?.error ||
          "Failed to load maintenance record form",
        "error"
      );
    } finally {
      setLoadingForm(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await listMaintenanceRecords(id);
      setHistory(res.data || []);
    } catch (e) {
      console.error(e);
      show(
        e?.response?.data?.error ||
          "Failed to load maintenance history",
        "error"
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadForm();
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, inspectionId]);

  const handleReadingChange = (index, field, value) => {
    setReadings((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      )
    );
  };

  const addReadingRow = () => {
    setReadings((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeReadingRow = (index) => {
    setReadings((prev) => prev.filter((_, i) => i !== index));
  };

  const buildReadingsObject = () => {
    const obj = {};
    readings.forEach((r) => {
      if (r.key && r.value) {
        obj[r.key] = r.value;
      }
    });
    return obj;
  };

  const handleSave = async () => {
    if (!formPayload?.maintenanceImage) {
      show("No maintenance image selected for this record", "error");
      return;
    }
    if (!status) {
      show("Please select a status", "error");
      return;
    }
    if (!inspectorName.trim()) {
      show("Inspector name is required", "error");
      return;
    }

    try {
      setSaving(true);
      const readingsObj = buildReadingsObject();
      const inspection = formPayload.inspection || inspectionFromState;

      if (!existingRecord) {
        // CREATE
        const payload = {
          transformerId: Number(id),
          inspectionId: inspection?.id || null,
          maintenanceImageId: formPayload.maintenanceImage.id,
          inspectionTimestamp:
            inspectionTimestamp || null,
          inspectorName: inspectorName.trim(),
          status,
          electricalReadings: readingsObj,
          recommendedAction:
            recommendedAction?.trim() || null,
          additionalRemarks:
            additionalRemarks?.trim() || null,
        };
        await createMaintenanceRecord(id, payload);
        show("Maintenance record created successfully");
      } else {
        // UPDATE
        const payload = {
          id: existingRecord.id,
          inspectionId: inspection?.id || null,
          inspectionTimestamp:
            inspectionTimestamp || null,
          inspectorName: inspectorName.trim(),
          status,
          electricalReadings: readingsObj,
          recommendedAction:
            recommendedAction?.trim() || null,
          additionalRemarks:
            additionalRemarks?.trim() || null,
        };
        await updateMaintenanceRecord(
          existingRecord.id,
          payload
        );
        show("Maintenance record updated successfully");
      }

      await loadForm();
      await loadHistory();
    } catch (e) {
      console.error(e);
      show(
        e?.response?.data?.error ||
          "Failed to save maintenance record",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const transformer = formPayload?.transformer || transformerFromState;
  const inspection = formPayload?.inspection || inspectionFromState;
  const maintenanceImage = formPayload?.maintenanceImage;

  const filteredHistory = useMemo(() => {
    if (!inspectionId) return history;
    // show all records, but visually mark those that belong to this inspection
    return history;
  }, [history, inspectionId]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {loadingForm && <LinearProgress sx={{ mb: 2 }} />}

      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          onClick={() => navigate("/")}
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <ElectricalServices fontSize="small" />
          Transformers
        </Link>
        <Link
          component="button"
          onClick={() =>
            navigate(`/transformers/${id}/inspections`, {
              state: { transformer },
            })
          }
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <Assessment fontSize="small" />
          Inspections
        </Link>
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <History fontSize="small" />
          Maintenance Record
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() =>
            navigate(`/transformers/${id}/inspections`, {
              state: { transformer },
            })
          }
        >
          Back
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={700}>
            Maintenance Record
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review system-detected anomalies and add engineer
            comments and actions.
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Left: System-generated + Editable form */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Transformer & Inspection"
              subheader="System-generated metadata (read-only)"
            />
            <CardContent>
              {transformer ? (
                <Stack spacing={1}>
                  <Typography variant="subtitle1">
                    Transformer {transformer.transformerNo}
                  </Typography>
                  <Typography variant="body2">
                    ID: {transformer.id ?? "-"} • Type:{" "}
                    {transformer.transformerType ?? "-"}
                  </Typography>
                  <Typography variant="body2">
                    Pole: {transformer.poleNo ?? "-"} • Region:{" "}
                    {transformer.region ?? "-"}
                  </Typography>
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  Transformer information not available.
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              {inspection ? (
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">
                    Inspection: {inspection.title}
                  </Typography>
                  <Typography variant="body2">
                    Inspector: {inspection.inspector}
                  </Typography>
                  {inspection.notes && (
                    <Typography variant="body2">
                      Notes: {inspection.notes}
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  Inspection details not available.
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Maintenance Image & Anomalies"
              subheader="Thermal image and detected anomaly regions"
            />
            <CardContent>
              {maintenanceImage ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={5}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: 200,
                      }}
                    >
                      <img
                        src={buildImageRawUrl(
                          maintenanceImage.id
                        )}
                        alt={maintenanceImage.filename}
                        style={{
                          maxWidth: "100%",
                          maxHeight: 260,
                          objectFit: "contain",
                        }}
                      />
                    </Paper>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      {maintenanceImage.filename} • Uploaded:{" "}
                      {new Date(
                        maintenanceImage.createdAt
                      ).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={7}>
                    {formPayload?.anomalies &&
                    formPayload.anomalies.length > 0 ? (
                      <List dense>
                        {formPayload.anomalies.map((a) => (
                          <ListItem key={a.dbId}>
                            <ListItemText
                              primary={
                                <>
                                  {a.type || "Anomaly"}{" "}
                                  {a.tag && (
                                    <Chip
                                      size="small"
                                      label={a.tag}
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </>
                              }
                              secondary={
                                a.boundingBox
                                  ? `Region ID: ${
                                      a.regionId ?? "N/A"
                                    } • Box: (${a.boundingBox.x}, ${
                                      a.boundingBox.y
                                    }) ${a.boundingBox.width}x${
                                      a.boundingBox.height
                                    }`
                                  : `Region ID: ${
                                      a.regionId ?? "N/A"
                                    }`
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography color="text.secondary">
                        No anomaly regions found for this image.
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  No maintenance image available for this form.
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Engineer Input"
              subheader="Editable maintenance record fields"
            />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="Inspector Name"
                  value={inspectorName}
                  onChange={(e) =>
                    setInspectorName(e.target.value)
                  }
                  required
                  fullWidth
                />

                <TextField
                  label="Inspection Timestamp"
                  type="datetime-local"
                  value={inspectionTimestamp}
                  onChange={(e) =>
                    setInspectionTimestamp(e.target.value)
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />

                <TextField
                  select
                  label="Status of Transformer"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                  fullWidth
                >
                  {allowedStatuses.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s === "OK"
                        ? "OK"
                        : s === "NEEDS_MAINTENANCE"
                        ? "Needs Maintenance"
                        : s === "URGENT_ATTENTION"
                        ? "Urgent Attention"
                        : s}
                    </MenuItem>
                  ))}
                </TextField>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1 }}
                  >
                    Electrical Readings
                  </Typography>
                  <Stack spacing={1}>
                    {readings.map((r, idx) => (
                      <Stack
                        key={idx}
                        direction="row"
                        spacing={1}
                      >
                        <TextField
                          label="Key"
                          value={r.key}
                          onChange={(e) =>
                            handleReadingChange(
                              idx,
                              "key",
                              e.target.value
                            )
                          }
                          size="small"
                          sx={{ minWidth: 140 }}
                        />
                        <TextField
                          label="Value"
                          value={r.value}
                          onChange={(e) =>
                            handleReadingChange(
                              idx,
                              "value",
                              e.target.value
                            )
                          }
                          size="small"
                          sx={{ flex: 1 }}
                        />
                        <Button
                          size="small"
                          color="error"
                          onClick={() =>
                            removeReadingRow(idx)
                          }
                        >
                          Remove
                        </Button>
                      </Stack>
                    ))}
                    <Button
                      size="small"
                      onClick={addReadingRow}
                    >
                      Add Reading
                    </Button>
                  </Stack>
                </Box>

                <TextField
                  label="Recommended Action"
                  value={recommendedAction}
                  onChange={(e) =>
                    setRecommendedAction(e.target.value)
                  }
                  multiline
                  minRows={3}
                  fullWidth
                />

                <TextField
                  label="Additional Remarks"
                  value={additionalRemarks}
                  onChange={(e) =>
                    setAdditionalRemarks(e.target.value)
                  }
                  multiline
                  minRows={3}
                  fullWidth
                />

                <Box sx={{ textAlign: "right", mt: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={
                      existingRecord ? (
                        <CheckCircle />
                      ) : (
                        <Engineering />
                      )
                    }
                    onClick={handleSave}
                    disabled={saving || loadingForm}
                  >
                    {existingRecord
                      ? "Update Record"
                      : "Save Record"}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: History */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              avatar={
                <Avatar>
                  <History />
                </Avatar>
              }
              title="Maintenance History"
              subheader="All records for this transformer"
            />
            <CardContent>
              {loadingHistory ? (
                <LinearProgress />
              ) : filteredHistory.length > 0 ? (
                <List dense>
                  {filteredHistory.map((rec) => (
                    <ListItem
                      key={rec.id}
                      disableGutters
                      sx={{ mb: 1 }}
                    >
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1,
                          width: "100%",
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Box>
                            <Typography
                              variant="subtitle2"
                            >
                              {rec.status}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Inspector:{" "}
                              {rec.inspectorName ||
                                "-"}
                            </Typography>
                            {rec.inspectionTimestamp && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(
                                  rec.inspectionTimestamp
                                ).toLocaleString()}
                              </Typography>
                            )}
                          </Box>
                          {String(rec.inspectionId) ===
                            String(
                              inspectionId
                            ) && (
                            <Tooltip title="This record belongs to the current inspection">
                              <Chip
                                size="small"
                                color="primary"
                                label="Current Inspection"
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </Paper>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No maintenance records found yet for this
                  transformer.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={close}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          onClose={close}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
