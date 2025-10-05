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

// Compare helpers (base64 endpoints) — note the /images segment
export const getBaselineBase64 = (id) => axiosClient.get(`${apiBase}/${id}/images/baseline/base64`);
export const getMaintenanceBase64 = (id) => axiosClient.get(`${apiBase}/${id}/images/maintenance/base64`);

// Helper for <img> src (uses the same base as axios)
export const buildImageRawUrl = (imageId) => {
  const apiPrefix = (axiosClient.defaults.baseURL || "/api").replace(/\/$/, "");
  return `${apiPrefix}${apiBase}/images/${imageId}/raw`;
};
