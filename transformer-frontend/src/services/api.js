// src/services/api.js

import axiosClient from "../api/axiosClient";

// Re-export axiosClient so both UserContext and service files use same instance
export default axiosClient;
