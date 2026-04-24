import axios from "axios";
import * as SecureStore from "expo-secure-store";

// If using GitHub Codespaces, change this to your forwarded port URL (e.g., "https://<codespace-name>-8000.app.github.dev")
// If running locally on Wi-Fi, change to your computer's IPv4 address.
export const BASE_URL = "https://glorious-xylophone-69v5vx7xjqgrcxq6w-8000.app.github.dev"; // Ensure there is no trailing slash (/)

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (error) {
    console.warn("SecureStore Error:", error);
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = await SecureStore.getItemAsync("refresh_token");
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refresh,
        });
        await SecureStore.setItemAsync("access_token", data.access_token);
        await SecureStore.setItemAsync("refresh_token", data.refresh_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch {
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── API Helpers ─────────────────────────────────────────────────────────────

export const authApi = {
  login: (phone: string, password: string) =>
    api.post("/auth/login", { phone, password }),
  refresh: (refresh_token: string) =>
    api.post("/auth/refresh", { refresh_token }),
};

export const userApi = {
  me: () => api.get("/users/me"),
  updateMe: (data: any) => api.patch("/users/me", data),
  updateFcmToken: (token: string) =>
    api.patch(`/notifications/fcm-token?token=${token}`),
};

export const loanApi = {
  dashboard: () => api.get("/loans/dashboard"),
  applyLoan: (amount: number, note?: string) =>
    api.post("/loans/request", { amount_requested: amount, note }),
  myRequests: () => api.get("/loans/my-requests"),
  myLoans: () => api.get("/loans/my-loans"),
  emiSchedule: (loanId: number) => api.get(`/loans/${loanId}/emi`),
  // Admin
  allRequests: (status?: string) =>
    api.get("/loans/admin/requests", { params: { status_filter: status } }),
  approveLoan: (id: number, months: number) =>
    api.post(`/loans/admin/requests/${id}/approve`, { repayment_months: months }),
  rejectLoan: (id: number, reason: string) =>
    api.post(`/loans/admin/requests/${id}/reject`, { rejection_reason: reason }),
  confirmPayment: (paymentId: number) =>
    api.post(`/loans/admin/payments/confirm/${paymentId}`),
};

export const adminApi = {
  createUser: (data: any) => api.post("/admin/users", data),
  listUsers: () => api.get("/admin/users"),
  getUser: (id: number) => api.get(`/admin/users/${id}`),
  toggleUser: (id: number) => api.patch(`/admin/users/${id}/toggle-active`),
  assignShares: (data: any) => api.post("/admin/shares", data),
  getShares: (userId: number) => api.get(`/admin/shares/${userId}`),
};

export const themeApi = {
  activeTheme: () => api.get("/themes/active"),
  listThemes: () => api.get("/themes/"),
  activateTheme: (id: number) => api.patch(`/themes/${id}/activate`),
  updateTheme: (id: number, data: any) => api.patch(`/themes/${id}`, data),
  seedDefaults: () => api.post("/themes/seed-defaults"),
  // Banners
  listBanners: () => api.get("/themes/banners"),
  trackView: (data: any) => api.post("/themes/banners/view", data),
  toggleBanner: (id: number) => api.patch(`/themes/banners/${id}/toggle`),
};

export const notificationApi = {
  send: (data: any) => api.post("/notifications/send", data),
  list: () => api.get("/notifications/"),
};
