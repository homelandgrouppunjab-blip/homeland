import axios from "axios";

// Same-origin by default (the Node API serves the site under /api on Hostinger).
// If REACT_APP_BACKEND_URL is set (e.g. Emergent preview), it is used as the base.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API });

client.interceptors.request.use((config) => {
  // Bearer token for the stateless JWT API. Stored in localStorage so it can be
  // attached as an Authorization header (see AuthContext for the storage rationale
  // and the httpOnly-cookie migration note). Guarded in case storage is blocked.
  try {
    const token = localStorage.getItem("hg_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    console.warn("api: localStorage unavailable for auth token", e);
  }
  return config;
});

// ---- Public ----
export const getProjects = (params = {}) => client.get("/projects", { params }).then((r) => r.data);
export const getProject = (slug) => client.get(`/projects/${slug}`).then((r) => r.data);
export const getContent = () => client.get("/content").then((r) => r.data);
export const getTeam = () => client.get("/team").then((r) => r.data);
export const getFaqs = () => client.get("/faqs").then((r) => r.data);
export const getRera = () => client.get("/rera").then((r) => r.data);
export const getBrochures = () => client.get("/brochures").then((r) => r.data);
export const createLead = (payload) => client.post("/leads", payload).then((r) => r.data);
export const createSiteVisit = (payload) => client.post("/site-visits", payload).then((r) => r.data);
export const getPosts = (category) => client.get("/posts", { params: category ? { category } : {} }).then((r) => r.data);
export const getPost = (slug) => client.get(`/posts/${slug}`).then((r) => r.data);
export const getUpdates = () => client.get("/updates").then((r) => r.data);
export const sendChat = (messages) => client.post("/chat", { messages }).then((r) => r.data);
export const authSession = (sessionId) => client.post("/auth/session", {}, { headers: { "X-Session-ID": sessionId }, withCredentials: true }).then((r) => r.data);
export const authMe = () => client.get("/auth/me", { withCredentials: true }).then((r) => r.data);
export const authLogout = () => client.post("/auth/logout", {}, { withCredentials: true }).then((r) => r.data);

// ---- Member area ----
export const getFavoriteSlugs = () => client.get("/me/favorites", { withCredentials: true }).then((r) => r.data.slugs || []);
export const getFavoriteProjects = () => client.get("/me/favorites/projects", { withCredentials: true }).then((r) => r.data);
export const addFavorite = (slug) => client.post("/me/favorites", { slug }, { withCredentials: true }).then((r) => r.data.slugs || []);
export const removeFavorite = (slug) => client.delete(`/me/favorites/${slug}`, { withCredentials: true }).then((r) => r.data.slugs || []);
export const getMyInquiries = () => client.get("/me/inquiries", { withCredentials: true }).then((r) => r.data);

// ---- Admin ----
export const adminLogin = (payload) => client.post("/admin/login", payload).then((r) => r.data);
export const adminMe = () => client.get("/admin/me").then((r) => r.data);
export const adminStats = () => client.get("/admin/stats").then((r) => r.data);
export const adminGetProjects = () => client.get("/admin/projects").then((r) => r.data);
export const adminCreateProject = (p) => client.post("/admin/projects", p).then((r) => r.data);
export const adminUpdateProject = (id, p) => client.put(`/admin/projects/${id}`, p).then((r) => r.data);
export const adminDeleteProject = (id) => client.delete(`/admin/projects/${id}`).then((r) => r.data);
export const adminGetLeads = () => client.get("/admin/leads").then((r) => r.data);
export const adminUpdateLead = (id, status) => client.put(`/admin/leads/${id}`, { status }).then((r) => r.data);
export const adminDeleteLead = (id) => client.delete(`/admin/leads/${id}`).then((r) => r.data);
export const adminGetVisits = () => client.get("/admin/site-visits").then((r) => r.data);
export const adminUpdateVisit = (id, status) => client.put(`/admin/site-visits/${id}`, { status }).then((r) => r.data);
export const adminDeleteVisit = (id) => client.delete(`/admin/site-visits/${id}`).then((r) => r.data);
export const adminUpdateContent = (body) => client.put("/admin/content", body).then((r) => r.data);
export const adminCreateTeam = (m) => client.post("/admin/team", m).then((r) => r.data);
export const adminUpdateTeam = (id, m) => client.put(`/admin/team/${id}`, m).then((r) => r.data);
export const adminDeleteTeam = (id) => client.delete(`/admin/team/${id}`).then((r) => r.data);

export const adminGetPosts = () => client.get("/admin/posts").then((r) => r.data);
export const adminCreatePost = (p) => client.post("/admin/posts", p).then((r) => r.data);
export const adminUpdatePost = (id, p) => client.put(`/admin/posts/${id}`, p).then((r) => r.data);
export const adminDeletePost = (id) => client.delete(`/admin/posts/${id}`).then((r) => r.data);

export const adminGetUpdates = () => client.get("/admin/updates").then((r) => r.data);export const adminCreateUpdate = (p) => client.post("/admin/updates", p).then((r) => r.data);
export const adminUpdateUpdate = (id, p) => client.put(`/admin/updates/${id}`, p).then((r) => r.data);
export const adminDeleteUpdate = (id) => client.delete(`/admin/updates/${id}`).then((r) => r.data);
export const adminAiDesign = (prompt) => client.post("/admin/ai/design", { prompt }).then((r) => r.data);

export const uploadFile = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return client.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
};

export default client;
