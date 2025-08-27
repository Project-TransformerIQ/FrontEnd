// src/components/upload/FileDropZone.jsx
import { Box, Typography } from "@mui/material";
import { useCallback, useState } from "react";

export default function FileDropZone({
  onFile,
  accept = "image/*",
  height = 180,
  children,
}) {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f && (!accept || f.type.match(accept.replace("*", ".*")))) {
      onFile?.(f);
    }
  }, [accept, onFile]);

  return (
    <Box
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      sx={{
        border: "1px dashed",
        borderColor: dragOver ? "primary.main" : "divider",
        borderRadius: 2,
        height,
        display: "grid",
        placeItems: "center",
        bgcolor: dragOver ? "primary.50" : "background.paper",
        transition: "border-color .15s, background-color .15s",
        p: 2
      }}
    >
      {children || (
        <Typography variant="body2" color="text.secondary">
          Drag & drop image here, or click to select
        </Typography>
      )}
    </Box>
  );
}
