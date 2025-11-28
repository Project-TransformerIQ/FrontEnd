// src/services/transformerService.js
import axiosClient from "../api/axiosClient";

const apiBase = "/transformers"; // axiosClient.baseURL should be "/api"

// Transformers
export const getTransformers = () => axiosClient.get(apiBase);
export const createTransformer = (data) => axiosClient.post(apiBase, data);
export const updateTransformer = (id, data) => axiosClient.put(`${apiBase}/${id}`, data);
export const deleteTransformer = (id) => axiosClient.delete(`${apiBase}/${id}`);
export const getTransformer = (id) => axiosClient.get(`${apiBase}/${id}`);

// Inspections
export const getInspections = (id) => axiosClient.get(`${apiBase}/${id}/inspections`);
export const createInspection = (id, payload) => axiosClient.post(`${apiBase}/${id}/inspections`, payload);
export const deleteInspection = (id, inspectionId) => axiosClient.delete(`${apiBase}/${id}/inspections/${inspectionId}`);

// Images
export const getImages = (id) => axiosClient.get(`${apiBase}/${id}/images`);

export const anomalyResults = (id) => axiosClient.get(`${apiBase}/images/${id}/anomaly-results`);
// IMPORTANT: omit Content-Type so the browser sets boundary
export const uploadImage = (id, formData) =>
  axiosClient.post(`${apiBase}/${id}/images`, formData);

// Error Management APIs
export const saveError = (imageId, errorData) => 
  axiosClient.post(`${apiBase}/images/${imageId}/errors`, errorData);

export const updateError = (imageId, errorId, errorData) => 
  axiosClient.put(`${apiBase}/images/${imageId}/errors/${errorId}`, errorData);

export const deleteError = (imageId, errorId) => 
  axiosClient.delete(`${apiBase}/images/${imageId}/errors/${errorId}`);

export const getErrors = (imageId) => 
  axiosClient.get(`${apiBase}/images/${imageId}/errors`);

// Download Anomaly Comparison
export const downloadAnomalyComparison = (imageId) => 
  axiosClient.get(`${apiBase}/images/${imageId}/anomaly-comparison`, {
    responseType: 'blob' // Important for file download
  });

// Train Model API
export const trainModel = (transformerId, data) => 
  axiosClient.post(`${apiBase}/${transformerId}/train`, data);

// Compare helpers (base64 endpoints) — note the /images segment
export const getBaselineBase64 = (id) => axiosClient.get(`${apiBase}/${id}/images/baseline/base64`);
export const getMaintenanceBase64 = (id) => axiosClient.get(`${apiBase}/${id}/images/maintenance/base64`);

// Helper for <img> src (uses the same base as axios)
export const buildImageRawUrl = (imageId) => {
  const apiPrefix = (axiosClient.defaults.baseURL || "/api").replace(/\/$/, "");
  return `${apiPrefix}${apiBase}/images/${imageId}/raw`;
};

// FR4.1 — Generate Maintenance Record Form
export const getMaintenanceRecordForm = (
  transformerId,
  { inspectionId = null, imageId = null } = {}
) => {
  let url = `${apiBase}/${transformerId}/maintenance-record-form`;

  const params = new URLSearchParams();
  if (inspectionId) params.append("inspectionId", inspectionId);
  if (imageId) params.append("imageId", imageId);

  if (params.toString().length > 0) url += `?${params.toString()}`;

  return axiosClient.get(url);
};

// FR4.2 / FR4.3 — Create new maintenance record
export const createMaintenanceRecord = (transformerId, payload) =>
  axiosClient.post(`${apiBase}/${transformerId}/maintenance-records`, payload);

// Update an existing record
export const updateMaintenanceRecord = (recordId, payload) =>
  axiosClient.put(`${apiBase}/maintenance-records/${recordId}`, payload);

// FR4.3 — List all records for a transformer
export const listMaintenanceRecords = (transformerId) =>
  axiosClient.get(`${apiBase}/${transformerId}/maintenance-records`);

// Retrieve single maintenance record (optional but useful)
export const getMaintenanceRecord = (recordId) =>
  axiosClient.get(`${apiBase}/maintenance-records/${recordId}`);
