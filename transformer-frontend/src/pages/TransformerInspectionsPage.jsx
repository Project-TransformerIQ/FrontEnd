// src/pages/TransformerInspectionsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Snackbar, Alert, Container, Stack, Avatar, Breadcrumbs, Link, MenuItem,
  Fade, Grow, LinearProgress, Tooltip, Skeleton, CardHeader,
  useTheme, alpha, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from "@mui/material";
import {
  ArrowBack, Add, ElectricalServices, PowerInput,
  Assessment, CheckCircle, Schedule, Engineering, Search,
  CloudUpload, PhotoCamera
} from "@mui/icons-material";

import useSnackbar from "../hooks/useSnackbar";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import BaselineUploadDialog from "../components/dialogs/BaselineUploadDialog";
import MaintenanceUploadDialog from "../components/dialogs/MaintenanceUploadDialog";

import {
  getTransformer, getInspections,
  createInspection, deleteInspection
} from "../services/transformerService";

export default function TransformerInspectionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const locationState = useLocation().state;
  const theme = useTheme();

  // prefilled from navigation state (fast), fallback to API fetch
  const [transformer, setTransformer] = useState(locationState?.transformer || null);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);

  const { snackbar, show, close } = useSnackbar();

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // create-inspection dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ title: "", inspector: "", notes: "", status: "OPEN" });
  const [formErrors, setFormErrors] = useState({});

  // delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [inspectionToDelete, setInspectionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Upload dialogs
  const [openUpload, setOpenUpload] = useState(false); // maintenance
  const [selectedInspection, setSelectedInspection] = useState(null);

  const [openBaseline, setOpenBaseline] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      if (!id) return;
      const [t, ins] = await Promise.all([
        transformer ? Promise.resolve({ data: transformer }) : getTransformer(id).catch(() => ({ data: null })),
        getInspections(id).catch(() => ({ data: [] })),
      ]);
      setTransformer(t?.data || null);
      setInspections(ins?.data || []);
    } catch (e) {
      show(e?.response?.data?.error || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  // stats
  const stats = useMemo(() => ({
    total: inspections.length,
    open: inspections.filter((i) => i.status === "OPEN").length,
    inProgress: inspections.filter((i) => i.status === "IN_PROGRESS").length,
    closed: inspections.filter((i) => i.status === "CLOSED").length,
  }), [inspections]);

  // validation
  const validateField = (name, value) => {
    switch (name) {
      case "title":
        if (!value.trim()) return "Title is required";
        if (value.trim().length < 3) return "Title must be at least 3 characters";
        return "";
      case "inspector":
        if (!value.trim()) return "Inspector name is required";
        return "";
      default:
        return "";
    }
  };
  const handleFieldChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    const err = validateField(name, value);
    setFormErrors((fe) => ({ ...fe, [name]: err }));
  };
  const isFormValid = () => {
    const errs = {};
    ["title", "inspector"].forEach((f) => {
      const e = validateField(f, form[f]);
      if (e) errs[f] = e;
    });
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const resetForm = () => { setForm({ title: "", inspector: "", notes: "", status: "OPEN" }); setFormErrors({}); };

  const addInspection = async () => {
    if (!isFormValid()) return;
    try {
      setFormLoading(true);
      await createInspection(id, {
        title: form.title.trim(),
        inspector: form.inspector.trim(),
        notes: form.notes?.trim() || undefined,
        status: form.status,
      });
      show("Inspection added successfully");
      resetForm();
      await load();
      return true;
    } catch (e) {
      show(e?.response?.data?.error || "Failed to add inspection", "error");
      return false;
    } finally { setFormLoading(false); }
  };

  const confirmDelete = (inspection) => { setInspectionToDelete(inspection); setDeleteDialog(true); };
  const performDelete = async () => {
    if (!inspectionToDelete) return;
    try {
      setDeleting(true);
      await deleteInspection(id, inspectionToDelete.id);
      show("Inspection deleted successfully");
      setDeleteDialog(false);
      setInspectionToDelete(null);
      await load();
    } catch (e) {
      show(e?.response?.data?.error || "Failed to delete inspection", "error");
    } finally { setDeleting(false); }
  };

  const filteredInspections = inspections.filter((it) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      it.title?.toLowerCase().includes(q) ||
      it.inspector?.toLowerCase().includes(q) ||
      it.notes?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "ALL" || it.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Breadcrumbs & Header */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs sx={{ mb: 4 }}>
              <Link component="button" variant="body1" onClick={() => navigate("/")}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <ElectricalServices fontSize="small" />
                Transformers
              </Link>
              <Typography color="text.primary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Assessment fontSize="small" />
                Inspections
              </Typography>
            </Breadcrumbs>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Tooltip title="Back to Home">
                <Button onClick={() => navigate("/")} variant="outlined" startIcon={<ArrowBack />}>
                  Back
                </Button>
              </Tooltip>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  Transformer Inspections
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Monitor and manage thermal inspection records
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" startIcon={<PhotoCamera />} onClick={() => setOpenBaseline(true)}>
                  Upload Baseline
                </Button>
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
                  Create New Inspection
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* Transformer card */}
          <Grow in timeout={800}>
            <Card sx={{
              mb: 4, borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white"
            }}>
              <CardContent sx={{ p: 4 }}>
                {loading ? (
                  <Stack spacing={2}>
                    <Skeleton variant="text" width="30%" height={32} sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
                    <Stack direction="row" spacing={1}>
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} variant="rounded" width={120} height={32} sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
                      ))}
                    </Stack>
                  </Stack>
                ) : (
                  <Stack spacing={3}>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 64, height: 64 }}>
                          <PowerInput />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                            Transformer {transformer?.transformerNo || "Unknown"}
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            ID: {transformer?.id ?? "-"} • Type: {transformer?.transformerType ?? "-"}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Chip label={`Pole: ${transformer?.poleNo || "Not specified"}`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }} />
                        <Chip label={`Region: ${transformer?.region || "Not specified"}`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }} />
                        <Chip label={`Type: ${transformer?.transformerType || "Not specified"}`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }} />
                      </Stack>
                    </Stack>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grow>

          {/* Stats */}
          <Grow in timeout={1000}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { label: "Total Inspections", value: stats.total, color: "#1976d2", icon: <Assessment /> },
                { label: "Open", value: stats.open, color: "#2196f3", icon: <Schedule /> },
                { label: "In Progress", value: stats.inProgress, color: "#ff9800", icon: <Engineering /> },
                { label: "Completed", value: stats.closed, color: "#4caf50", icon: <CheckCircle /> },
              ].map((stat) => (
                <Grid item xs={12} sm={6} md={3} key={stat.label}>
                  <Card sx={{ borderRadius: 3, background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`,
                    border: `1px solid ${stat.color}30` }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: stat.color, color: "white" }}>{stat.icon}</Avatar>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>{stat.value}</Typography>
                          <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grow>

          {/* Inspections list + filters */}
          <Card sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
            <CardHeader
              title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Inspection Records</Typography>}
              subheader={`${filteredInspections.length} of ${inspections.length} inspections`}
              action={
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField size="small" placeholder="Search inspections..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{ startAdornment: <Search sx={{ color: "action.active" }} /> }}
                    sx={{ minWidth: 200 }} />
                  <TextField select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 140 }}>
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="OPEN">Open</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="CLOSED">Closed</MenuItem>
                  </TextField>
                </Stack>
              }
              sx={{ borderBottom: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}` }}
            />

            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <LinearProgress />
              ) : (
                <Box sx={{ p: 2 }}>
                  {filteredInspections.map((it) => (
                    <Paper key={it.id} sx={{ p: 2, mb: 1.5 }} variant="outlined">
                      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle1" fontWeight={600}>{it.title}</Typography>
                          <Typography variant="body2" color="text.secondary">Inspector: {it.inspector}</Typography>
                          {it.notes && <Typography variant="body2" color="text.secondary">Notes: {it.notes}</Typography>}
                        </Stack>

                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => { setSelectedInspection(it); setOpenUpload(true); }}
                          >
                            Upload Maintenance
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(
                              `/transformers/${id}/inspections/${it.id}/compare`,
                              { state: { transformer, inspection: it } }
                            )}
                          >
                            Compare
                          </Button>
                          <Button size="small" variant="text" color="error" onClick={() => { setInspectionToDelete(it); setDeleteDialog(true); }}>
                            Delete
                          </Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Create inspection dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Inspection</DialogTitle>
        {formLoading && <LinearProgress />}
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField label="Title" value={form.title} onChange={(e) => handleFieldChange("title", e.target.value)} error={!!formErrors.title} helperText={formErrors.title} required />
            <TextField label="Inspector" value={form.inspector} onChange={(e) => handleFieldChange("inspector", e.target.value)} error={!!formErrors.inspector} helperText={formErrors.inspector} required />
            <TextField label="Notes (optional)" value={form.notes} onChange={(e) => handleFieldChange("notes", e.target.value)} multiline minRows={2} />
            <TextField select label="Status" value={form.status} onChange={(e) => handleFieldChange("status", e.target.value)}>
              <MenuItem value="OPEN">Open</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="CLOSED">Closed</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={formLoading}>Cancel</Button>
          <Button onClick={addInspection} disabled={formLoading} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Inspection"
        description={`Delete inspection "${inspectionToDelete?.title}"? This cannot be undone.`}
        loading={deleting}
        onCancel={() => setDeleteDialog(false)}
        onConfirm={performDelete}
      />

      {/* Baseline upload */}
      <BaselineUploadDialog
        open={openBaseline}
        transformerId={id}
        onClose={() => setOpenBaseline(false)}
        onUploaded={load}
      />

      {/* Maintenance upload */}
      <MaintenanceUploadDialog
        open={openUpload}
        transformerId={id}
        inspection={selectedInspection}
        onClose={() => setOpenUpload(false)}
        onUploaded={load}
      />

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={close} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={close} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
