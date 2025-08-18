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