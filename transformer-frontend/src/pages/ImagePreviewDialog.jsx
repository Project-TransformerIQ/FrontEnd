import { useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Chip,
  Typography,
  Button,
  Stack,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Close, ArrowBack, ArrowForward, Download } from "@mui/icons-material";

export default function ImagePreviewDialog({
  open,
  onClose,
  images = [],
  index = 0,
  setIndex,
  apiBase = "/api/transformers",
  transformer
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  if (!open || !images?.length) return null;

  const img = images[index];

  const mime =
    img?.contentType ||
    img?.mimeType ||
    (typeof img?.filename === "string" && img.filename.toLowerCase().endsWith(".png")
      ? "image/png"
      : "image/jpeg");

  const rawUrl = useMemo(() => {
    if (transformer?.id != null && img?.id != null) {
      return `${apiBase}/${transformer.id}/images/${img.id}/raw`;
    }
    if (img?.id != null) {
      return `${apiBase}/images/${img.id}/raw`;
    }
    return undefined;
  }, [apiBase, transformer?.id, img?.id]);

  const displaySrc = img?.imageBase64
    ? `data:${mime};base64,${img.imageBase64}`
    : rawUrl;

  const prev = () => setIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  const next = () => setIndex((i) => (i < images.length - 1 ? i + 1 : 0));

  const fmtMB = (b) =>
    typeof b === "number" ? `${(b / 1024 / 1024).toFixed(2)} MB` : "-";
  const ts = img?.createdAt ? new Date(img.createdAt).toLocaleString() : "";

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  useEffect(() => {
    if (!open) return;
    let startX = null;
    const onTouchStart = (e) => (startX = e.touches[0].clientX);
    const onTouchEnd = (e) => {
      if (startX == null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) (dx > 0 ? prev : next)();
      startX = null;
    };
    const el = document.getElementById("image-preview-touch-zone");
    if (!el) return;
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [open, index, images.length]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: fullScreen ? "100%" : "min(1100px, 96vw)",
          m: 0
        }
      }}
    >
      <DialogTitle sx={{ pr: 7, display: "flex", alignItems: "center", gap: 1 }}>
        {/* Use span to avoid heading-inside-heading */}
        <Typography
          variant="h6"
          component="span"
          sx={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          title={img?.filename || "Image Preview"}
        >
          {img?.filename || "Image Preview"}
        </Typography>

        <IconButton onClick={onClose} aria-label="Close">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          display: "grid",
          gap: 2,
          p: { xs: 1.5, sm: 2 },
        }}
      >
        {/* Image stage */}
        <Box
          id="image-preview-touch-zone"
          sx={{
            width: "100%",
            maxHeight: { xs: "70vh", md: "75vh" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.100",
            borderRadius: 2,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Prev */}
          <IconButton
            onClick={prev}
            aria-label="Previous"
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "background.paper",
              boxShadow: 1,
              "&:hover": { bgcolor: "background.paper" }
            }}
          >
            <ArrowBack />
          </IconButton>

          {/* Image */}
          <Box
            component="img"
            src={displaySrc}
            alt={img?.filename || `image-${img?.id ?? "unknown"}`}
            loading="lazy"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />

          {/* Next */}
          <IconButton
            onClick={next}
            aria-label="Next"
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "background.paper",
              boxShadow: 1,
              "&:hover": { bgcolor: "background.paper" }
            }}
          >
            <ArrowForward />
          </IconButton>
        </Box>

        {/* Meta */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {img?.imageType && <Chip label={String(img.imageType).toUpperCase()} color="primary" />}
          {img?.envCondition?.weather && <Chip label={img.envCondition.weather} variant="outlined" />}
          {img?.envCondition?.temperatureC != null && <Chip label={`${img.envCondition.temperatureC} °C`} variant="outlined" />}
          {img?.envCondition?.humidity != null && <Chip label={`${img.envCondition.humidity} %`} variant="outlined" />}
          {img?.uploader && <Chip label={`by: ${img.uploader}`} variant="outlined" />}
          {img?.contentType && <Chip label={img.contentType} variant="outlined" />}
          {img?.sizeBytes != null && <Chip label={fmtMB(img.sizeBytes)} variant="outlined" />}
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
          {img?.filename} {ts ? `• ${ts}` : ""}
        </Typography>

        {img?.envCondition?.locationNote && (
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            Note: {img.envCondition.locationNote}
          </Typography>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          flexWrap: "wrap",
          gap: 1,
          px: { xs: 1.5, sm: 3 },
          py: { xs: 1, sm: 1.5 },
        }}
      >
        {rawUrl && (
          <Button
            variant="outlined"
            startIcon={<Download />}
            component="a"
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open / Download
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
