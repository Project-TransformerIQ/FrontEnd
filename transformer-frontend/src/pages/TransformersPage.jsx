// src/pages/TransformersPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getTransformers,
  createTransformer,
  updateTransformer,
  deleteTransformer,
  getImages,
} from "../services/transformerService";

import {
  Box,
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert,
  Stack,
  Container,
  Fade,
  Grow,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  MenuItem,
} from "@mui/material";
import {
  Add,
  ElectricalServices,
  Search,
  Refresh,
  Map,
  Apartment,
  Grid3x3,
  Logout,
} from "@mui/icons-material";

import TransformerFormDialog from "../components/TransformerFormDialog";
import TransformerTable from "../components/TransformerTable";
import EmptyState from "../components/EmptyState";
import ImagePreviewDialog from "./ImagePreviewDialog";
import useSnackbar from "../hooks/useSnackbar";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import { useUser } from "../contexts/UserContext";

/** Pretty stat card (gradient, glass, hover lift) */
function StatCard({ title, value, icon, gradient, accent }) {
  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
        px: 3,
        py: 2.5,
        minHeight: 110,
        display: "flex",
        alignItems: "center",
        gap: 2.5,
        backdropFilter: "blur(6px)",
        background: gradient,
        color: "#fff",
        boxShadow:
          "0 10px 25px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.15)",
        border: `1px solid ${accent}33`,
        transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow:
            "0 18px 40px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.18)",
          borderColor: `${accent}55`,
        },
        "&:before": {
          content: '""',
          position: "absolute",
          right: -40,
          top: -40,
          width: 180,
          height: 180,
          background: "#ffffff22",
          borderRadius: "50%",
          filter: "blur(10px)",
        },
      }}
    >
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: "18px",
          display: "grid",
          placeItems: "center",
          background: "#ffffff1f",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.25)",
          backdropFilter: "blur(4px)",
          flexShrink: 0,
        }}
      >
        <Box sx={{ "& svg": { fontSize: 32, color: "#fff" } }}>{icon}</Box>
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: ".5px",
            textShadow: "0 2px 14px rgba(0,0,0,.15)",
          }}
        >
          {value}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.92, mt: 0.5, fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
    </Card>
  );
}

export default function TransformersPage() {
  const { currentUser, logout } = useUser();
  const [transformers, setTransformers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [initialForm, setInitialForm] = useState({
    transformerNo: "",
    poleNo: "",
    region: "",
    transformerType: "",
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    transformer: null,
  });

  // Images viewer
  const [imagesOpen, setImagesOpen] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [viewT, setViewT] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  const navigate = useNavigate();
  const { snackbar, show, close } = useSnackbar();

  const load = async (withSpinner = true) => {
    try {
      if (withSpinner) setLoading(true);
      const res = await getTransformers();
      setTransformers(res.data || []);
    } catch (e) {
      show(e?.response?.data?.error || "Failed to load transformers", "error");
    } finally {
      if (withSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memoized filtering and natural sort by transformerNo
  const filtered = useMemo(() => {
    let arr = Array.isArray(transformers) ? transformers : [];

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      arr = arr.filter((t) => {
        const fields = [
          t.transformerNo ?? "",
          t.poleNo ?? "",
          t.region ?? "",
          t.transformerType ?? "",
        ].map((s) => String(s).toLowerCase());
        return fields.some((f) => f.includes(q));
      });
    }

    if (selectedRegion !== "All") {
      const want = selectedRegion.toLowerCase();
      arr = arr.filter((t) => (t.region ?? "").toLowerCase() === want);
    }

    if (selectedType !== "All") {
      const want = selectedType.toLowerCase();
      arr = arr.filter((t) => (t.transformerType ?? "").toLowerCase() === want);
    }

    const nat = (s) => String(s ?? "");
    return [...arr].sort((a, b) => {
      const aa = nat(a.transformerNo);
      const bb = nat(b.transformerNo);

      const pa = aa.match(/\d+/)?.[0];
      const pb = bb.match(/\d+/)?.[0];
      const prefixA = aa.replace(/\d+/g, "");
      const prefixB = bb.replace(/\d+/g, "");

      if (prefixA === prefixB && (pa || pb)) {
        const na = parseInt(pa ?? "0", 10);
        const nb = parseInt(pb ?? "0", 10);
        if (na !== nb) return na - nb;
      }

      return aa.localeCompare(bb, undefined, { numeric: true, sensitivity: "base" });
    });
  }, [transformers, searchTerm, selectedRegion, selectedType]);

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setInitialForm({
      transformerNo: "",
      poleNo: "",
      region: "",
      transformerType: "",
    });
    setFormDialogOpen(true);
  };

  const openEdit = (t) => {
    setMode("edit");
    setEditingId(t.id);
    setInitialForm({
      transformerNo: t.transformerNo || "",
      poleNo: t.poleNo || "",
      region: t.region || "",
      transformerType: t.transformerType || "",
    });
    setFormDialogOpen(true);
  };

  const submitForm = async (payload) => {
    try {
      if (mode === "edit" && editingId) {
        await updateTransformer(editingId, payload);
        show("Transformer updated successfully");
      } else {
        await createTransformer(payload);
        show("Transformer created successfully");
      }
      setFormDialogOpen(false);
      setEditingId(null);
      load(false);
    } catch (e) {
      show(e?.response?.data?.error || "Failed to save transformer", "error");
    }
  };

  const handleDeleteClick = (t) => setDeleteDialog({ open: true, transformer: t });

  const confirmDelete = async () => {
    try {
      await deleteTransformer(deleteDialog.transformer.id);
      show("Transformer deleted successfully");
      setDeleteDialog({ open: false, transformer: null });
      load(false);
    } catch (e) {
      show(e?.response?.data?.error || "Failed to delete transformer", "error");
    }
  };

  /**
   * View Image button -> fetch baseline exactly like ComparePage:
   * - GET all images for transformer
   * - filter imageType === "BASELINE" (case-robust)
   * - sort newest first by createdAt (or uploadDate fallback)
   * - show latest baseline only
   */
  const openImages = async (t) => {
    setImagesLoading(true);
    setViewT(t);
    try {
      const res = await getImages(t.id);
      const all = Array.isArray(res?.data) ? res.data : [];

      const baselines = all.filter(
        (x) => String(x?.imageType ?? x?.type ?? "").toUpperCase() === "BASELINE"
      );

      baselines.sort(
        (a, b) =>
          new Date(b.createdAt || b.uploadDate || 0) -
          new Date(a.createdAt || a.uploadDate || 0)
      );

      const baseline = baselines[0] || null;

      if (!baseline) {
        setImages([]);
        setImagesOpen(false);
        show("No Baseline image found for this transformer", "warning");
        return;
      }

      setImages([baseline]);
      setPreviewIndex(0);
      setImagesOpen(true);
    } catch (e) {
      show(e?.response?.data?.error || "Failed to load images", "error");
    } finally {
      setImagesLoading(false);
    }
  };



  const stats = {
    total: transformers.length,
    bulk: transformers.filter((t) => t.transformerType === "BULK").length,
    distribution: transformers.filter((t) => t.transformerType === "DISTRIBUTION").length,
    regions: [...new Set(transformers.map((t) => t.region).filter(Boolean))].length,
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Fade in timeout={600}>
        <Box>
          <Card
            sx={{
              mb: 4,
              background: "linear-gradient(135deg, #1565c0 0%, #1976d2 35%, #0ea5e9 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,.15), 0 18px 40px rgba(2,90,160,.25)",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems="center"
                spacing={3}
              >
                <Stack spacing={1} alignItems={{ xs: "center", md: "flex-start" }}>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <ElectricalServices sx={{ fontSize: 48 }} />
                    Transformer Management
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Monitor and manage electrical transformers with thermal inspection data
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500 }}>
                    Logged in as: {currentUser}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Logout />}
                    onClick={logout}
                    sx={{ 
                      color: "white", 
                      borderColor: "rgba(255,255,255,0.5)",
                      "&:hover": { 
                        borderColor: "white",
                        bgcolor: "rgba(255,255,255,0.1)"
                      } 
                    }}
                  >
                    Logout
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Refresh />}
                    onClick={() => load()}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Add />}
                    onClick={openCreate}
                    sx={{ bgcolor: "#ff6b35", "&:hover": { bgcolor: "#e55a2b" } }}
                  >
                    Add Transformer
                  </Button>
                </Stack>
              </Stack>

              {/* Fancy Stats */}
              <Box sx={{ mt: 3 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ "& > *": { flex: 1 } }}
                >
                  <Grow in timeout={900}>
                    <Box>
                      <StatCard
                        title="Total Transformers"
                        value={stats.total}
                        icon={<Grid3x3 />}
                        gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                        accent="#4facfe"
                      />
                    </Box>
                  </Grow>
                  <Grow in timeout={1050}>
                    <Box>
                      <StatCard
                        title="Bulk Type"
                        value={stats.bulk}
                        icon={<Apartment />}
                        gradient="linear-gradient(135deg, #f7971e 0%, #ffd200 100%)"
                        accent="#f7971e"
                      />
                    </Box>
                  </Grow>
                  <Grow in timeout={1200}>
                    <Box>
                      <StatCard
                        title="Distribution Type"
                        value={stats.distribution}
                        icon={<ElectricalServices />}
                        gradient="linear-gradient(135deg, #ff5858 0%, #f09819 100%)"
                        accent="#ff5858"
                      />
                    </Box>
                  </Grow>
                  <Grow in timeout={1350}>
                    <Box>
                      <StatCard
                        title="Regions Covered"
                        value={stats.regions}
                        icon={<Map />}
                        gradient="linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)"
                        accent="#78ffd6"
                      />
                    </Box>
                  </Grow>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          <Grow in timeout={800}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                <TextField
                  placeholder="Search transformers..."
                  variant="outlined"
                  size="medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ flex: 1, minWidth: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  select
                  label="Region"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  sx={{ minWidth: 140 }}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="All">All</MenuItem>
                  {["Colombo", "Gampaha", "Kandy", "Galle", "Jaffna"].map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  sx={{ minWidth: 160 }}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="All">All</MenuItem>
                  {["BULK", "DISTRIBUTION"].map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Paper>
          </Grow>

          {filtered.length ? (
            <TransformerTable
              items={filtered}
              editingId={editingId}
              onRowClick={(t) =>
                navigate(`/transformers/${t.id}/inspections`, { state: { transformer: t } })
              }
              onOpenImages={openImages}
              onEdit={openEdit}
              onDelete={handleDeleteClick}
            />
          ) : (
            <EmptyState
              title="No transformers yet"
              subtitle="Add your first transformer to get started."
              actionText="Add Transformer"
              onAction={openCreate}
            />
          )}
        </Box>
      </Fade>

      <TransformerFormDialog
        open={formDialogOpen}
        mode={mode}
        initialValues={initialForm}
        regions={["Colombo", "Gampaha", "Kandy", "Galle", "Jaffna"]}
        types={["BULK", "DISTRIBUTION"]}
        onClose={() => setFormDialogOpen(false)}
        onSubmit={submitForm}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        title="Delete Transformer"
        description={`Delete transformer "${deleteDialog.transformer?.transformerNo}"? This cannot be undone.`}
        onCancel={() => setDeleteDialog({ open: false, transformer: null })}
        onConfirm={confirmDelete}
      />

      {imagesOpen && (
        <ImagePreviewDialog
          open={imagesOpen}
          onClose={() => setImagesOpen(false)}
          images={images}
          index={previewIndex}
          setIndex={setPreviewIndex}
          apiBase="/api/transformers"
          transformer={viewT}
          loading={imagesLoading}
        />
      )}

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
  );
}
