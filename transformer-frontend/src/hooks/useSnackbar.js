// src/hooks/useSnackbar.js
import { useState, useCallback } from "react";

export default function useSnackbar() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const show = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const close = useCallback(() => setSnackbar((s) => ({ ...s, open: false })), []);

  return { snackbar, show, close };
}
