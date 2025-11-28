import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useUser } from "../contexts/UserContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  TextField,
  MenuItem,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Snackbar,
  Alert,
  Grid,
  IconButton,
} from "@mui/material";
import {
  ElectricalServices,
  Assessment,
  ArrowBack,
  History,
  Engineering,
  CheckCircle,
  Add,
  Remove,
  Description,
} from "@mui/icons-material";

import {
  getMaintenanceRecordForm,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  listMaintenanceRecords,
  buildImageRawUrl,
} from "../services/transformerService";

import useSnackbar from "../hooks/useSnackbar";
import ZoomableImageWithBoxes from "../components/common/ZoomableImageWithBoxes";

export default function MaintenanceRecordPage() {
  const { id, inspectionId } = useParams();
  const { currentUser } = useUser();
  const canEdit =
    currentUser?.occupation === "MAINTENANCE_ENGINEER" ||
    currentUser?.occupation === "ADMIN";
  const navigate = useNavigate();
  const locationState = useLocation().state;
  const pdfRef = useRef(null);

  const [formPayload, setFormPayload] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { snackbar, show, close } = useSnackbar();

  const [inspectorName, setInspectorName] = useState("");
  const [status, setStatus] = useState("");
  const [inspectionTimestamp, setInspectionTimestamp] = useState("");
  const [recommendedAction, setRecommendedAction] = useState("");
  const [additionalRemarks, setAdditionalRemarks] = useState("");

  const [readings, setReadings] = useState([
    { key: "voltage", value: "" },
    { key: "current", value: "" },
  ]);

  const [pdfMode, setPdfMode] = useState(false);

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

  const toDateTimeLocal = (iso) => {
    if (!iso) return "";
    const noMs = iso.split(".")[0];
    return noMs.length >= 16 ? noMs.slice(0, 16) : noMs;
  };

  const loadForm = async () => {
    try {
      setLoadingForm(true);
      const res = await getMaintenanceRecordForm(id, {
        inspectionId,
      });
      const data = res.data;
      setFormPayload(data);

      const record = data.existingRecord;
      const inspection = data.inspection || inspectionFromState;

      setInspectorName(record?.inspectorName || inspection?.inspector || "");
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
          setReadings(entries.map(([key, value]) => ({ key, value })));
        }
      }
    } catch (e) {
      console.error(e);
      show(
        e?.response?.data?.error || "Failed to load maintenance record form",
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
        e?.response?.data?.error || "Failed to load maintenance history",
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
  }, [id, inspectionId]);

  const handleReadingChange = (index, field, value) => {
    setReadings((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
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
        const payload = {
          transformerId: Number(id),
          inspectionId: inspection?.id || null,
          maintenanceImageId: formPayload.maintenanceImage.id,
          inspectionTimestamp: inspectionTimestamp || null,
          inspectorName: inspectorName.trim(),
          status,
          electricalReadings: readingsObj,
          recommendedAction: recommendedAction?.trim() || null,
          additionalRemarks: additionalRemarks?.trim() || null,
        };
        await createMaintenanceRecord(id, payload);
        show("Maintenance record created successfully");
      } else {
        const payload = {
          id: existingRecord.id,
          inspectionId: inspection?.id || null,
          inspectionTimestamp: inspectionTimestamp || null,
          inspectorName: inspectorName.trim(),
          status,
          electricalReadings: readingsObj,
          recommendedAction: recommendedAction?.trim() || null,
          additionalRemarks: additionalRemarks?.trim() || null,
        };
        await updateMaintenanceRecord(existingRecord.id, payload);
        show("Maintenance record updated successfully");
      }

      await loadForm();
      await loadHistory();
    } catch (e) {
      console.error(e);
      show(
        e?.response?.data?.error || "Failed to save maintenance record",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const transformer = formPayload?.transformer || transformerFromState;
  const inspection = formPayload?.inspection || inspectionFromState;
  const maintenanceImage = formPayload?.maintenanceImage;
  console.log("formPayload", formPayload);
  const filteredAnomalies = useMemo(() => {
    if (!formPayload?.anomalies) return [];
    return formPayload.anomalies.filter(
      (a) => !a.isDeleted && !a.deleted && !a.markedDeleted
    );
  }, [formPayload?.anomalies]);

  const maintenanceBoxes = useMemo(() => {
    if (!filteredAnomalies.length) return [];

    return filteredAnomalies
      .map((a, i) => {
        if (!a.boundingBox) return null;
        const { x, y, width, height } = a.boundingBox;

        const cx = x + width / 2;
        const cy = y + height / 2;

        return {
          idx: i + 1,
          cx,
          cy,
          w: width,
          h: height,
          status: String(a.tag || a.type || "")
            .toUpperCase()
            .includes("FAULT")
            ? "FAULTY"
            : "POTENTIAL",
        };
      })
      .filter(Boolean);
  }, [filteredAnomalies]);

  const filteredHistory = useMemo(() => {
    if (!inspectionId) return history;
    return history;
  }, [history, inspectionId]);

  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case "OK":
        return "#e8f5e9";
      case "NEEDS_MAINTENANCE":
        return "#fff3e0";
      case "URGENT_ATTENTION":
        return "#ffebee";
      default:
        return "#f5f5f5";
    }
  };

  const getStatusLabel = (statusValue) => {
    switch (statusValue) {
      case "OK":
        return "Operational";
      case "NEEDS_MAINTENANCE":
        return "Maintenance Required";
      case "URGENT_ATTENTION":
        return "Urgent Attention";
      default:
        return statusValue;
    }
  };

  const anomalySummary = useMemo(() => {
    const total = filteredAnomalies.length;
    const faulty = filteredAnomalies.filter((a) =>
      String(a.tag || a.type || "").toUpperCase().includes("FAULT")
    ).length;
    const potential = total - faulty;
    return { total, faulty, potential };
  }, [filteredAnomalies]);

 const formatAnnotator = (a) => {
  const createdBy =
    a.createdBy ??
    a.created_by ??
    null;

  if (createdBy) return createdBy;
  return "AI_Model";
};
  const formatAnnotatedAt = (a) => {
    const ts = a.lastModifiedAt || a.createdAt || a.timestamp;
    if (!ts) return "-";
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;

    try {
      setPdfMode(true);
      await new Promise((resolve) => setTimeout(resolve, 0));

      const element = pdfRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let position = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const pdfBlob = pdf.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      window.open(url);
    } catch (e) {
      console.error("Failed to generate PDF", e);
      show("Failed to generate PDF", "error");
    } finally {
      setPdfMode(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {loadingForm && <LinearProgress sx={{ mb: 2 }} />}

        {/* Everything inside this Box will be captured into the PDF */}
        <Box ref={pdfRef}>
          {/* Report Header */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 3,
              borderTop: "4px solid #1565c0",
              bgcolor: "white",
            }}
          >
            <Stack
              direction="row"
              spacing={3}
              alignItems="flex-start"
              sx={{ mb: 3 }}
            >
              <Description sx={{ fontSize: 48, color: "#1565c0", mt: 0.5 }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{
                    color: "#1565c0",
                    mb: 1,
                    letterSpacing: "0.5px",
                  }}
                >
                  TRANSFORMER MAINTENANCE REPORT
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Official technical inspection and maintenance documentation
                </Typography>
                <Breadcrumbs separator="/" sx={{ fontSize: "0.875rem" }}>
                  <Link
                    component="button"
                    onClick={() => !pdfMode && navigate("/")}
                    underline={pdfMode ? "none" : "hover"}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: "#1565c0",
                      pointerEvents: pdfMode ? "none" : "auto",
                    }}
                  >
                    <ElectricalServices fontSize="small" />
                    Transformers
                  </Link>
                  <Link
                    component="button"
                    onClick={() =>
                      !pdfMode &&
                      navigate(`/transformers/${id}/inspections`, {
                        state: { transformer },
                      })
                    }
                    underline={pdfMode ? "none" : "hover"}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: "#1565c0",
                      pointerEvents: pdfMode ? "none" : "auto",
                    }}
                  >
                    <Assessment fontSize="small" />
                    Inspections
                  </Link>
                  <Typography
                    color="text.primary"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    Maintenance Record
                  </Typography>
                </Breadcrumbs>
              </Box>

              {/* Back + View PDF buttons (hidden in pdfMode) */}
              {!pdfMode && (
                <Stack spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() =>
                      navigate(`/transformers/${id}/inspections`, {
                        state: { transformer },
                      })
                    }
                    sx={{
                      borderColor: "#1565c0",
                      color: "#1565c0",
                      borderWidth: 2,
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "#0d47a1",
                        borderWidth: 2,
                        bgcolor: "#e3f2fd",
                      },
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Description />}
                    onClick={handleDownloadPdf}
                    sx={{
                      mt: 1,
                      bgcolor: "#1565c0",
                      fontWeight: 700,
                      "&:hover": {
                        bgcolor: "#0d47a1",
                      },
                    }}
                  >
                    View PDF
                  </Button>
                </Stack>
              )}
            </Stack>
          </Paper>

          {/* Section 1: Transformer Information */}
          <Paper elevation={0} sx={{ mb: 3, border: "1px solid #e0e0e0" }}>
            <Box sx={{ bgcolor: "#1565c0", px: 3, py: 2 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: "white", letterSpacing: "0.5px" }}
              >
                1. TRANSFORMER INFORMATION
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              {transformer ? (
                <TableContainer>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          sx={{
                            width: "35%",
                            fontWeight: 700,
                            bgcolor: "#f8f9fa",
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          Transformer Number
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {transformer.transformerNo}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            bgcolor: "#f8f9fa",
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          Equipment ID
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {transformer.id ?? "-"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            bgcolor: "#f8f9fa",
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          Transformer Type
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {transformer.transformerType ?? "-"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            bgcolor: "#f8f9fa",
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          Pole Number
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {transformer.poleNo ?? "-"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            bgcolor: "#f8f9fa",
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          Region
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {transformer.region ?? "-"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">
                  Transformer information not available.
                </Typography>
              )}

              {inspection && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box
                    sx={{
                      bgcolor: "#f8f9fa",
                      p: 2,
                      borderRadius: 1,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      gutterBottom
                      sx={{
                        color: "#1565c0",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Inspection Reference
                    </Typography>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      {inspection.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Inspector:</strong> {inspection.inspector}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Inspection Date:</strong>{" "}
                      {inspection.createdAt
                        ? new Date(inspection.createdAt).toLocaleString()
                        : "-"}
                    </Typography>
                    {inspection.notes && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        <strong>Notes:</strong> {inspection.notes}
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </Paper>

          {/* Section 2: Thermal Imaging Analysis */}
          <Paper elevation={0} sx={{ mb: 3, border: "1px solid #e0e0e0" }}>
            <Box sx={{ bgcolor: "#1565c0", px: 3, py: 2 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: "white", letterSpacing: "0.5px" }}
              >
                2. THERMAL IMAGING ANALYSIS
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              {maintenanceImage ? (
                <Box>
                  {/* Full-width image */}
                  <Box
                    sx={{
                      border: "2px solid #e0e0e0",
                      borderRadius: 1,
                      overflow: "hidden",
                      bgcolor: "#000",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: 380,
                      }}
                    >
                      <ZoomableImageWithBoxes
                        src={buildImageRawUrl(maintenanceImage.id)}
                        alt={maintenanceImage.filename}
                        boxes={maintenanceBoxes}
                        showControls={!pdfMode}
                      />
                    </Box>
                  </Box>

                  {/* AI Anomaly Summary (full width under image) */}
                  <Box
                    sx={{
                      mt: 2.5,
                      p: 2,
                      bgcolor: "#f8f9fa",
                      borderRadius: 1,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      gutterBottom
                      sx={{
                        textTransform: "uppercase",
                        color: "#1565c0",
                        letterSpacing: "0.5px",
                        mb: 1,
                      }}
                    >
                      AI Anomaly Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2">
                          <strong>Total Anomalies:</strong>{" "}
                          {anomalySummary.total}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Faulty:</strong> {anomalySummary.faulty}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Potential:</strong>{" "}
                          {anomalySummary.potential}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2">
                          <strong>Image Type:</strong>{" "}
                          {maintenanceImage.imageType || "-"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Uploaded By:</strong>{" "}
                          {maintenanceImage.uploader || "-"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Captured:</strong>{" "}
                          {maintenanceImage.createdAt
                            ? new Date(
                                maintenanceImage.createdAt
                              ).toLocaleString()
                            : "-"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" gutterBottom>
                          <strong>File:</strong>{" "}
                          {maintenanceImage.filename || "-"}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Content Type:</strong>{" "}
                          {maintenanceImage.contentType || "-"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Size:</strong>{" "}
                          {maintenanceImage.sizeBytes != null
                            ? `${maintenanceImage.sizeBytes} bytes`
                            : "-"}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Environmental metadata if present */}
                    {maintenanceImage.envCondition && (
                      <Box
                        sx={{
                          mt: 2,
                          pt: 2,
                          borderTop: "1px dashed #ccc",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            textTransform: "uppercase",
                            fontWeight: 700,
                            color: "#555",
                            mb: 1,
                          }}
                        >
                          Environmental Conditions
                        </Typography>
                        {typeof maintenanceImage.envCondition === "object" ? (
                          <Grid container spacing={1.5}>
                            {Object.entries(maintenanceImage.envCondition).map(
                              ([k, v]) => (
                                <Grid item xs={12} md={4} key={k}>
                                  <Typography variant="body2">
                                    <strong>{k}:</strong> {String(v)}
                                  </Typography>
                                </Grid>
                              )
                            )}
                          </Grid>
                        ) : (
                          <Typography variant="body2">
                            {String(maintenanceImage.envCondition)}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>

                  {/* Detected Anomalies (full width, under summary) */}
                  <Box
                    sx={{
                      mt: 2.5,
                      p: 2,
                      bgcolor: "#f8f9fa",
                      borderRadius: 1,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      gutterBottom
                      sx={{
                        textTransform: "uppercase",
                        color: "#1565c0",
                        letterSpacing: "0.5px",
                        mb: 2,
                      }}
                    >
                      Detected Anomalies
                    </Typography>
                    {filteredAnomalies.length > 0 ? (
                      <TableContainer
                        sx={{
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                        }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: "#1565c0" }}>
                              <TableCell
                                sx={{ fontWeight: 700, color: "white" }}
                              >
                                Region ID
                              </TableCell>
                              <TableCell
                                sx={{ fontWeight: 700, color: "white" }}
                              >
                                Type
                              </TableCell>
                              <TableCell
                                sx={{ fontWeight: 700, color: "white" }}
                              >
                                Classification
                              </TableCell>
                              <TableCell
                                sx={{ fontWeight: 700, color: "white" }}
                              >
                                Annotator
                              </TableCell>
                              
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredAnomalies.map((a, i) => {
                              const isFault = String(
                                a.tag || a.type || ""
                              )
                                .toUpperCase()
                                .includes("FAULT");

                              const classificationContent = pdfMode ? (
                                <Box
                                  sx={{
                                    display: "inline-block",
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 999,
                                    border: "1px solid",
                                    borderColor: isFault
                                      ? "#ef9a9a"
                                      : "#ffcc80",
                                    bgcolor: isFault
                                      ? "#ffebee"
                                      : "#fff3e0",
                                    color: isFault
                                      ? "#c62828"
                                      : "#e65100",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                  }}
                                >
                                  {a.tag || a.type || "Anomaly"}
                                </Box>
                              ) : (
                                <Chip
                                  size="small"
                                  label={a.tag || a.type || "Anomaly"}
                                  sx={{
                                    height: 24,
                                    fontWeight: 600,
                                    bgcolor: isFault ? "#ffebee" : "#fff3e0",
                                    color: isFault ? "#c62828" : "#e65100",
                                    border: "1px solid",
                                    borderColor: isFault
                                      ? "#ef9a9a"
                                      : "#ffcc80",
                                  }}
                                />
                              );

                              return (
                                <TableRow
                                  key={a.dbId ?? a.regionId ?? a.id}
                                  sx={{
                                    "&:nth-of-type(odd)": {
                                      bgcolor: "#f8f9fa",
                                    },
                                  }}
                                >
                                  <TableCell sx={{ fontFamily: "monospace" }}>
                                      {i + 1}
                                    </TableCell>
                                  <TableCell sx={{ fontWeight: 500 }}>
                                    {a.type || "Anomaly"}
                                  </TableCell>
                                  <TableCell>{classificationContent}</TableCell>
                                  <TableCell>{formatAnnotator(a)}</TableCell>
                                  
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box
                        sx={{
                          p: 3,
                          bgcolor: "#ffffff",
                          borderRadius: 1,
                          border: "1px solid #e0e0e0",
                          textAlign: "center",
                        }}
                      >
                        <Typography color="text.secondary" variant="body2">
                          No anomalies detected in thermal scan.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No thermal image available.
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Section 3: Inspection Details */}
          <Paper elevation={0} sx={{ mb: 3, border: "1px solid #e0e0e0" }}>
            <Box sx={{ bgcolor: "#1565c0", px: 3, py: 2 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: "white", letterSpacing: "0.5px" }}
              >
                3. MAINTENANCE DETAILS 
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: "#555",
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Maintenance PERSONNEL *
                  </Typography>
                  <TextField
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    required
                    fullWidth
                    placeholder="Maintenance Personnel"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "white",
                        fontWeight: 500,
                      },
                    }}
                    InputProps={{
                      readOnly: pdfMode,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: "#555",
                      display: "block",
                      mb: 1,
                    }}
                  >
                    MAINTENANCE DUE*
                  </Typography>
                  <TextField
                    type="datetime-local"
                    value={inspectionTimestamp}
                    onChange={(e) => setInspectionTimestamp(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "white",
                        fontWeight: 500,
                      },
                    }}
                    InputProps={{
                      readOnly: pdfMode,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: "#555",
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Transformer Status *
                  </Typography>
                  <TextField
                    select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: status ? getStatusColor(status) : "white",
                        fontWeight: 600,
                      },
                    }}
                    SelectProps={{
                      readOnly: pdfMode,
                    }}
                  >
                    {allowedStatuses.map((s) => (
                      <MenuItem key={s} value={s} sx={{ fontWeight: 500 }}>
                        {getStatusLabel(s)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Section 4: Electrical Measurements */}
          <Paper elevation={0} sx={{ mb: 3, border: "1px solid #e0e0e0" }}>
            <Box sx={{ bgcolor: "#1565c0", px: 3, py: 2 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: "white", letterSpacing: "0.5px" }}
              >
                4. ELECTRICAL MEASUREMENTS
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <TableContainer
                sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                      <TableCell sx={{ fontWeight: 700, width: "40%" }}>
                        Parameter
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Measured Value
                      </TableCell>
                      {!pdfMode && <TableCell width={100}></TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {readings.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <TextField
                            value={r.key}
                            onChange={(e) =>
                              handleReadingChange(idx, "key", e.target.value)
                            }
                            fullWidth
                            placeholder="e.g., Voltage, Current, Temperature"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                bgcolor: "white",
                                fontWeight: 500,
                              },
                            }}
                            InputProps={{
                              readOnly: pdfMode,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={r.value}
                            onChange={(e) =>
                              handleReadingChange(
                                idx,
                                "value",
                                e.target.value
                              )
                            }
                            fullWidth
                            placeholder="e.g., 230V, 15A, 75°C"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                bgcolor: "white",
                                fontWeight: 500,
                              },
                            }}
                            InputProps={{
                              readOnly: pdfMode,
                            }}
                          />
                        </TableCell>
                        {!pdfMode && (
                          <TableCell align="center">
                            <IconButton
                              onClick={() => removeReadingRow(idx)}
                              sx={{
                                color: "#d32f2f",
                                "&:hover": { bgcolor: "#ffebee" },
                              }}
                            >
                              <Remove />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {!pdfMode && (
                <Button
                  startIcon={<Add />}
                  onClick={addReadingRow}
                  sx={{ mt: 2, color: "#1565c0", fontWeight: 600 }}
                >
                  Add Measurement Row
                </Button>
              )}
            </Box>
          </Paper>

          {/* Section 5: Recommendations */}
          <Paper elevation={0} sx={{ mb: 3, border: "1px solid #e0e0e0" }}>
            <Box sx={{ bgcolor: "#1565c0", px: 3, py: 2 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: "white", letterSpacing: "0.5px" }}
              >
                5. RECOMMENDATIONS & REMARKS
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: "#555",
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Recommended Action
                  </Typography>
                  <TextField
                    value={recommendedAction}
                    onChange={(e) => setRecommendedAction(e.target.value)}
                    multiline
                    minRows={4}
                    fullWidth
                    placeholder="Describe recommended maintenance actions, repairs, or follow-up procedures required..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "white",
                      },
                    }}
                    InputProps={{
                      readOnly: pdfMode,
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: "#555",
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Additional Remarks
                  </Typography>
                  <TextField
                    value={additionalRemarks}
                    onChange={(e) => setAdditionalRemarks(e.target.value)}
                    multiline
                    minRows={4}
                    fullWidth
                    placeholder="Any additional observations, safety concerns, or technical notes..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "white",
                      },
                    }}
                    InputProps={{
                      readOnly: pdfMode,
                    }}
                  />
                </Box>
              </Stack>
            </Box>
          </Paper>

          {/* Save Button (hidden in PDF) */}
          {!pdfMode && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mb: 3,
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={existingRecord ? <CheckCircle /> : <Engineering />}
                onClick={handleSave}
                disabled={!canEdit || saving || loadingForm}
                sx={{
                  bgcolor: "#1565c0",
                  px: 5,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1rem",
                  letterSpacing: "0.5px",
                  "&:hover": {
                    bgcolor: "#0d47a1",
                  },
                  "&:disabled": {
                    bgcolor: "#90caf9",
                  },
                }}
              >
                {existingRecord ? "UPDATE REPORT" : "SUBMIT REPORT"}
              </Button>
            </Box>
          )}

          {/* Section 6: Maintenance History */}
          <Paper elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
            <Box sx={{ bgcolor: "#1565c0", px: 3, py: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <History sx={{ color: "white" }} />
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: "white", letterSpacing: "0.5px" }}
                >
                  6. MAINTENANCE HISTORY
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 3 }}>
              {loadingHistory ? (
                <LinearProgress />
              ) : filteredHistory.length > 0 ? (
                <TableContainer
                  sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                        <TableCell sx={{ fontWeight: 700 }}>
                          Date & Time
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          Inspector
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredHistory.map((rec) => (
                        <TableRow
                          key={rec.id}
                          sx={{
                            "&:nth-of-type(odd)": { bgcolor: "#f8f9fa" },
                            bgcolor:
                              String(rec.inspectionId) ===
                              String(inspectionId)
                                ? "#e3f2fd"
                                : undefined,
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>
                            {rec.inspectionTimestamp
                              ? new Date(
                                  rec.inspectionTimestamp
                                ).toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {rec.inspectorName || "-"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(rec.status)}
                              size="small"
                              sx={{
                                bgcolor: getStatusColor(rec.status),
                                fontWeight: 600,
                                border: "1px solid",
                                borderColor:
                                  rec.status === "OK"
                                    ? "#81c784"
                                    : rec.status === "NEEDS_MAINTENANCE"
                                    ? "#ffb74d"
                                    : "#e57373",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {String(rec.inspectionId) ===
                              String(inspectionId) && (
                              <Chip
                                label="Current"
                                size="small"
                                sx={{
                                  bgcolor: "#1565c0",
                                  color: "white",
                                  fontWeight: 600,
                                }}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  sx={{
                    p: 4,
                    bgcolor: "#f8f9fa",
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                    textAlign: "center",
                  }}
                >
                  <Typography color="text.secondary" variant="body1">
                    No previous maintenance records found for this transformer.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Snackbar (not included in PDF) */}
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
    </Box>
  );
}
