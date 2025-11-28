import { Card, Box, Typography } from "@mui/material";


export default function StatCard({ title, value, icon, color, gradient, accent }) {

  const base =
    color ||
    extractFirstColorFromGradient(gradient) ||
    "#1976d2"; 

  const bg = withAlpha(base, 0.12);   
  const br = withAlpha(base, 0.35);   
  const tile = withAlpha(base, 0.16); 
  const text = base;              

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 2,
        px: 3,
        py: 2.5,
        minHeight: 100,
        display: "flex",
        alignItems: "center",
        gap: 2,
        backgroundColor: bg,
        border: `1px solid ${br}`,
        boxShadow: "none",
        "&:before, &:after": { display: "none" },
      }}
    >
      {/* Icon tile */}
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "12px",
          display: "grid",
          placeItems: "center",
          backgroundColor: tile,
          flexShrink: 0,
        }}
      >
        <Box sx={{ "& svg": { fontSize: 28, color: text } }}>{icon}</Box>
      </Box>

      {/* Values */}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: text, lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.3, color: text, opacity: 0.9 }}>
          {title}
        </Typography>
      </Box>
    </Card>
  );
}


function extractFirstColorFromGradient(gradient) {
  if (!gradient || typeof gradient !== "string") return undefined;
  const m =
    gradient.match(/#([0-9a-f]{3,8})/i) ||
    gradient.match(/rgba?\([^)]+\)/i) ||
    gradient.match(/hsla?\([^)]+\)/i);
  return m ? m[0] : undefined;
}

function withAlpha(color, alpha) {
  if (/^rgba?\(/i.test(color)) {
    const nums = color.match(/[\d.]+/g) || [];
    const [r, g, b] = nums.map(Number);
    return `rgba(${clamp255(r)}, ${clamp255(g)}, ${clamp255(b)}, ${alpha})`;
  }
  if (/^hsla?\(/i.test(color)) {
    const nums = color.match(/[\d.]+/g) || [];
    const [h, s, l] = nums.map(Number);
    return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
  }
  const rgb = hexToRgb(color) || { r: 25, g: 118, b: 210 }; // default #1976d2
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function hexToRgb(hex) {
  if (!hex) return null;
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function clamp255(n) {
  n = Number(n);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(255, Math.round(n)));
}
