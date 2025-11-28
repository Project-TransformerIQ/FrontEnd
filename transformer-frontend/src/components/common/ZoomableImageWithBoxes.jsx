
import { Box, Stack, Tooltip, IconButton } from "@mui/material";
import { ZoomIn, ZoomOut, RestartAlt } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";

export default function ZoomableImageWithBoxes({ src, alt, boxes, topLeft, showControls = true }) {
  const viewportRef = useRef(null);
  const imgRef = useRef(null);

  const [layout, setLayout] = useState({
    ready: false,
    naturalW: 0, naturalH: 0,
    renderW: 0, renderH: 0,
    offsetX: 0, offsetY: 0,
  });

  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const dragging = useRef(false);
  const lastPt = useRef({ x: 0, y: 0 });

  const MIN_SCALE = 1;
  const MAX_SCALE = 8;
  const ZOOM_STEP = 1.2;

  const computeLayout = () => {
    const v = viewportRef.current;
    const img = imgRef.current;
    if (!v || !img || !img.naturalWidth || !img.naturalHeight) return;

    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const vw = v.clientWidth;
    const vh = v.clientHeight;

    const fit = Math.min(vw / naturalW, vh / naturalH);
    const renderW = naturalW * fit;
    const renderH = naturalH * fit;
    const offsetX = (vw - renderW) / 2;
    const offsetY = (vh - renderH) / 2;

    setLayout({ ready: true, naturalW, naturalH, renderW, renderH, offsetX, offsetY });
    setScale(1);
    setTx(0);
    setTy(0);
  };

  useEffect(() => {
    const onResize = () => computeLayout();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e) => {
      if (!layout.ready) return;
      e.preventDefault();

      const rect = viewport.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const gx = mx - layout.offsetX;
      const gy = my - layout.offsetY;

      const dir = e.deltaY > 0 ? -1 : 1;
      const targetScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, scale * (dir > 0 ? ZOOM_STEP : 1 / ZOOM_STEP))
      );
      if (targetScale === scale) return;

      const nx = gx - (targetScale / scale) * (gx - tx);
      const ny = gy - (targetScale / scale) * (gy - ty);

      setScale(targetScale);
      setTx(nx);
      setTy(ny);
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [layout, scale, tx, ty]);

  const triggerWheelZoom = (dir) => {
    const rect = viewportRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    if (!layout.ready) return;

    const gx = cx - rect.left - layout.offsetX;
    const gy = cy - rect.top - layout.offsetY;

    const targetScale = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, scale * (dir > 0 ? ZOOM_STEP : 1 / ZOOM_STEP))
    );
    if (targetScale === scale) return;

    const nx = gx - (targetScale / scale) * (gx - tx);
    const ny = gy - (targetScale / scale) * (gy - ty);

    setScale(targetScale);
    setTx(nx);
    setTy(ny);
  };

  const onMouseDown = (e) => {
    dragging.current = true;
    lastPt.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPt.current.x;
    const dy = e.clientY - lastPt.current.y;
    lastPt.current = { x: e.clientX, y: e.clientY };
    setTx((p) => p + dx);
    setTy((p) => p + dy);
  };
  const endDrag = () => { dragging.current = false; };
  const resetView = () => { setScale(1); setTx(0); setTy(0); };

  const renderScale = layout.renderW / (layout.naturalW || 1);
  const toRenderBox = (b) => {
    if (!layout.ready) return null;
    const normalized =
      b.cx >= 0 && b.cx <= 1 &&
      b.cy >= 0 && b.cy <= 1 &&
      b.w >= 0 && b.w <= 1 &&
      b.h >= 0 && b.h <= 1;
    const cx = normalized ? b.cx * layout.naturalW : b.cx;
    const cy = normalized ? b.cy * layout.naturalH : b.cy;
    const bw = normalized ? b.w * layout.naturalW : b.w;
    const bh = normalized ? b.h * layout.naturalH : b.h;
    return {
      left: (cx - bw / 2) * renderScale,
      top: (cy - bh / 2) * renderScale,
      width: bw * renderScale,
      height: bh * renderScale,
    };
  };

  return (
    <Box
      ref={viewportRef}
      sx={{
        position: "relative",
        width: "100%",
        height: 360,
        overflow: "hidden",
        backgroundColor: "#0b0b0b",
        borderRadius: 1,
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseLeave={endDrag}
      onMouseUp={endDrag}
    >
      {topLeft}

      {showControls && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            zIndex: 2,
            bgcolor: "rgba(0,0,0,0.35)",
            p: 0.5,
            borderRadius: 1,
          }}
        >
          <Tooltip title="Zoom out">
            <span>
              <IconButton
                size="small"
                onClick={() => triggerWheelZoom(1)}
                disabled={scale <= MIN_SCALE}
                sx={{ color: "white" }}
              >
                <ZoomOut fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Zoom in">
            <IconButton
              size="small"
              onClick={() => triggerWheelZoom(-1)}
              sx={{ color: "white" }}
            >
              <ZoomIn fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset view">
            <IconButton
              size="small"
              onClick={resetView}
              sx={{ color: "white" }}
            >
              <RestartAlt fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )}

      {layout.ready && (
        <Box
          sx={{
            position: "absolute",
            left: layout.offsetX,
            top: layout.offsetY,
            width: layout.renderW,
            height: layout.renderH,
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            onLoad={computeLayout}
            style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
          />

          {Array.isArray(boxes) &&
            boxes.map((b, i) => {
              if (b.isDeleted) return null;
              const r = toRenderBox(b);
              if (!r) return null;

              const status = String(b.status || "").toUpperCase();
              const borderColor = status === "FAULTY" ? "red" : "yellow";
              const fillColor =
                status === "FAULTY" ? "rgba(255,0,0,0.15)" : "rgba(255,255,0,0.15)";
              const badgeColor =
                status === "FAULTY" ? "rgba(255,0,0,0.95)" : "rgba(255,255,0,0.95)";

              return (
                <Box key={b.idx ?? i}>
                  <Box
                    sx={{
                      position: "absolute",
                      left: r.left,
                      top: r.top,
                      width: r.width,
                      height: r.height,
                      border: `2px solid ${borderColor}`,
                      borderRadius: 0.5,
                      backgroundColor: "transparent",
                      boxShadow: "0 0 0 1px rgba(0,0,0,0.25) inset",
                      pointerEvents: "none",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      left: r.left - 15,
                      top: r.top - 15,
                      width: 20,
                      height: 20,
                      borderRadius: "999px",
                      backgroundColor: badgeColor,
                      color: "white",
                      fontSize: 12,
                      fontWeight: 700,
                      lineHeight: "20px",
                      textAlign: "center",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    {b.idx ?? i + 1}
                  </Box>
                </Box>
              );
            })}
        </Box>
      )}

      {!layout.ready && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={computeLayout}
          style={{
            visibility: "hidden",
            position: "absolute",
            inset: 0,
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
      )}
    </Box>
  );
}
