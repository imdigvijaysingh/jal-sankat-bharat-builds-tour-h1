// Config for API URL - supports VITE_API_BASE_URL when hosted on AWS Amplify / Cloud
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
export const apiUrl = (path) => `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
