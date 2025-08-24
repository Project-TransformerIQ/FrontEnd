// src/pages/ComparePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    Box, Container, Stack, Typography, Button, Card, CardContent, Chip,
    Breadcrumbs, Link, Avatar, LinearProgress, IconButton, Paper
} from "@mui/material";
import {
    ArrowBack, ElectricalServices, Assessment, PowerInput,
    ArrowBackIosNew, ArrowForwardIos
} from "@mui/icons-material";

import {
    getTransformer,
    getInspections,
    getImages,
    buildImageRawUrl
} from "../services/transformerService";
import useSnackbar from "../hooks/useSnackbar";

/**
 * Extract an inspection id from an image item, being resilient to different backend shapes.
 */
function getImageInspectionId(img) {
    if (!img || typeof img !== "object") return undefined;

    // common flat keys
    if (img.inspectionId != null) return String(img.inspectionId);
    if (img.inspection_id != null) return String(img.inspection_id);
    if (img.inspectionID != null) return String(img.inspectionID);

    // nested object
    if (img.inspection && (img.inspection.id != null || img.inspectionId != null)) {
        return String(img.inspection.id ?? img.inspectionId);
    }

    // sometimes meta is returned
    if (img.meta && (img.meta.inspectionId != null || img.meta.inspection_id != null)) {
        return String(img.meta.inspectionId ?? img.meta.inspection_id);
    }

    return undefined;
}

export default function ComparePage() {
    const { id, inspectionId } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation() || {};
    const { snackbar, show, close } = useSnackbar();

    // State seeded from router state for instant render; API is fallback
    const [transformer, setTransformer] = useState(state?.transformer || null);
    const [inspection, setInspection] = useState(state?.inspection || null);

    const [loading, setLoading] = useState(false);
    const [baseline, setBaseline] = useState(null);
    const [maint, setMaint] = useState([]);
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                // Ensure we have transformer + inspection
                const [tRes, insRes, imgRes] = await Promise.all([
                    transformer ? Promise.resolve({ data: transformer }) : getTransformer(id).catch(() => ({ data: null })),
                    inspection ? Promise.resolve({ data: [inspection] }) : getInspections(id).catch(() => ({ data: [] })),
                    getImages(id).catch(() => ({ data: [] })),
                ]);

                if (!mounted) return;

                const t = tRes?.data || null;
                setTransformer(t);

                let ins =
                    inspection ||
                    (insRes?.data || []).find((x) => String(x.id) === String(inspectionId)) ||
                    null;
                setInspection(ins);

                const all = Array.isArray(imgRes?.data) ? imgRes.data : [];

                // Latest baseline for this transformer
                const baselines = all.filter((x) => x.imageType === "BASELINE");
                baselines.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                setBaseline(baselines[0] || null);

                // Maintenance images ONLY for this inspection (robust id extraction)
                const wantedId = String(inspectionId);
                let m = all.filter((x) => x.imageType === "MAINTENANCE");
                m = m.filter((x) => getImageInspectionId(x) === wantedId);

                // Sort newest first
                m.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                setMaint(m);
                setIdx(0);
            } catch (e) {
                show(e?.response?.data?.error || "Failed to load comparison data", "error");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, inspectionId]);

    const title = useMemo(() => {
        if (inspection?.title) return `Compare: ${inspection.title}`;
        return "Compare: Baseline vs Maintenance";
    }, [inspection]);

    const next = () => setIdx((i) => (i + 1) % Math.max(maint.length || 1, 1));
    const prev = () => setIdx((i) => (i - 1 + Math.max(maint.length || 1, 1)) % Math.max(maint.length || 1, 1));

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link component="button" onClick={() => navigate("/")} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <ElectricalServices fontSize="small" /> Transformers
                </Link>
                <Link
                    component="button"
                    onClick={() => navigate(`/transformers/${id}/inspections`, { state: { transformer } })}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                    <Assessment fontSize="small" /> Inspections
                </Link>
                <Typography color="text.primary">Compare</Typography>
            </Breadcrumbs>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                    <Typography variant="h5">{title}</Typography>
                </Stack>
            </Stack>

            {/* Transformer header */}
            <Card sx={{ mb: 3, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", borderRadius: 3 }}>
                <CardContent>
                    <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" gap={2}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                                <PowerInput />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Transformer {transformer?.transformerNo || "Unknown"}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    ID: {transformer?.id ?? "-"} • Type: {transformer?.transformerType ?? "-"}
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip label={`Pole: ${transformer?.poleNo || "-"}`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }} />
                            <Chip label={`Region: ${transformer?.region || "-"}`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }} />
                            <Chip label={`Type: ${transformer?.transformerType || "-"}`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }} />
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Compare panes */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                {/* Baseline */}
                <Paper sx={{ flex: 1, p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Baseline</Typography>
                    {baseline ? (
                        <img
                            src={buildImageRawUrl(baseline.id)}
                            alt={baseline.filename || `baseline-${baseline.id}`}
                            style={{ width: "100%", height: 360, objectFit: "contain" }}
                        />
                    ) : (
                        <Typography variant="body2" color="text.secondary">No baseline available</Typography>
                    )}
                    {baseline?.createdAt && (
                        <Chip
                            size="small"
                            sx={{ mt: 1 }}
                            label={`Taken: ${new Date(baseline.createdAt).toLocaleString()}`}
                        />
                    )}
                </Paper>

                {/* Maintenance */}
                <Paper sx={{ flex: 1, p: 2, borderRadius: 2, position: "relative" }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle2" gutterBottom>
                            Maintenance {maint.length ? `(${idx + 1}/${maint.length})` : ""}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <IconButton onClick={prev} disabled={!maint.length}><ArrowBackIosNew fontSize="small" /></IconButton>
                            <IconButton onClick={next} disabled={!maint.length}><ArrowForwardIos fontSize="small" /></IconButton>
                        </Stack>
                    </Stack>

                    {maint.length ? (
                        <>
                            <img
                                src={buildImageRawUrl(maint[idx].id)}
                                alt={maint[idx].filename || `maintenance-${maint[idx].id}`}
                                style={{ width: "100%", height: 360, objectFit: "contain" }}
                            />
                            {maint[idx]?.createdAt && (
                                <Chip
                                    size="small"
                                    sx={{ mt: 1 }}
                                    label={`Taken: ${new Date(maint[idx].createdAt).toLocaleString()}`}
                                />
                            )}
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No maintenance images for this inspection
                        </Typography>
                    )}
                </Paper>
            </Stack>
        </Container>
    );
}
