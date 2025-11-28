import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  IconButton,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  History,
  Description,
  ElectricalServices,
  ArrowBack,
  OpenInNew,
} from "@mui/icons-material";

import { listMaintenanceRecords } from "../services/transformerService";
import useSnackbar from "../hooks/useSnackbar";

export default function MaintenanceRecordsListPage() {
  const { id } = useParams(); // transformerId
  const navigate = useNavigate();
  const location = useLocation();
  const { snackbar, show, close } = useSnackbar();

  const transformerFromState = location.state?.transformer || null;
  const [transformer] = useState(transformerFromState);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

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
        return statusValue || "-";
    }
  };

  const loadRecords = async () => {
    try {
      setLoading(true);
      const res = await listMaintenanceRecords(id);
      setRecords(res.data || []);
    } catch (e) {
      console.error(e);
      show(
        e?.response?.data?.error || "Failed to load maintenance records",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadRecords();
  }, [id]);

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const ta = a.inspectionTimestamp
        ? new Date(a.inspectionTimestamp).getTime()
        : 0;
      const tb = b.inspectionTimestamp
        ? new Date(b.inspectionTimestamp).getTime()
        : 0;
      return tb - ta;
    });
  }, [records]);

  const handleViewRecord = (rec) => {
    if (!rec.inspectionId) {
      show(
        "This maintenance record is not linked to an inspection.",
        "warning"
      );
      return;
    }

    navigate(
      `/transformers/${id}/inspections/${rec.inspectionId}/maintenance-records`,
      {
        state: {
          transformer: transformer || null,
        },
      }
    );
  };

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Header / breadcrumbs */}
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
            <History sx={{ fontSize: 48, color: "#1565c0", mt: 0.5 }} />
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ color: "#1565c0", mb: 1, letterSpacing: "0.5px" }}
              >
                MAINTENANCE RECORDS
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Historical maintenance reports for the selected transformer.
              </Typography>

              <Breadcrumbs separator="/" sx={{ fontSize: "0.875rem" }}>
                <Link
                  component="button"
                  onClick={() => navigate("/")}
                  underline="hover"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: "#1565c0",
                  }}
                >
                  <ElectricalServices fontSize="small" />
                  Transformers
                </Link>
                <Typography
                  color="text.primary"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <Description fontSize="small" />
                  Maintenance Records
                </Typography>
              </Breadcrumbs>
            </Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/")}
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
              Back to list
            </Button>
          </Stack>

          {transformer && (
            <Box
              sx={{
                mt: 1,
                p: 2,
                borderRadius: 2,
                bgcolor: "#f5f9ff",
                border: "1px solid #e0ecff",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: "#1565c0", mb: 0.5 }}
              >
                Transformer
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {transformer.transformerNo}{" "}
                {transformer.transformerType
                  ? `(${transformer.transformerType})`
                  : ""}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Pole: {transformer.poleNo || "-"} | Region:{" "}
                {transformer.region || "-"}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Records table */}
        <Paper elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
          <Box sx={{ p: 3 }}>
            {sortedRecords.length === 0 ? (
              <Box
                sx={{
                  p: 4,
                  bgcolor: "#f8f9fa",
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                  textAlign: "center",
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No maintenance records found for this transformer.
                </Typography>
              </Box>
            ) : (
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
                      <TableCell
                        sx={{ fontWeight: 700 }}
                        align="right"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedRecords.map((rec) => (
                      <TableRow
                        key={rec.id}
                        hover
                        sx={{
                          cursor: "pointer",
                          "&:nth-of-type(odd)": { bgcolor: "#fafafa" },
                        }}
                        onClick={() => handleViewRecord(rec)}
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
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewRecord(rec);
                            }}
                            sx={{
                              color: "#1565c0",
                              "&:hover": { bgcolor: "#e3f2fd" },
                            }}
                          >
                            <OpenInNew fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
          onClose={close}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert onClose={close} severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
