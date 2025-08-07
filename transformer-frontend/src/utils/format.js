// src/utils/format.js
export const fmtMB = (b) =>
  typeof b === "number" ? `${(b / 1024 / 1024).toFixed(2)} MB` : "-";

export const fmtDateTime = (iso) => {
  if (!iso) return "";
  try { return new Date(iso).toLocaleString(); } catch { return ""; }
};
