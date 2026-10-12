// All calls to the Spring Boot backend live here. Pages never call fetch() directly.
const BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the Spring Boot backend running on port 8080?");
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.fieldErrors = data?.fieldErrors || {};
    throw err;
  }
  return data;
}

const qs = (p) => {
  const u = new URLSearchParams();
  Object.entries(p || {}).forEach(([k, v]) => v && u.set(k, v));
  const s = u.toString();
  return s ? "?" + s : "";
};
const send = (method, path, body) => request(path, { method, body });

export const api = {
  summary: () => request("/dashboard/summary"),
  byStatus: () => request("/reports/challans-by-status"),
  fines: () => request("/reports/fine-collection"),
  occupancy: () => request("/reports/parking-occupancy"),
  challans: (p) => request("/challans" + qs(p)),
  createChallan: (b) => send("POST", "/challans", b),
  updateChallan: (id, b) => send("PUT", `/challans/${id}`, b),
  deleteChallan: (id) => send("DELETE", `/challans/${id}`),
  slots: () => request("/slots"),
  createSlot: (b) => send("POST", "/slots", b),
  updateSlot: (id, b) => send("PUT", `/slots/${id}`, b),
  deleteSlot: (id) => send("DELETE", `/slots/${id}`),
  entry: (b) => send("POST", "/parking/entry", b),
  exit: (b) => send("POST", "/parking/exit", b),
  active: () => request("/parking/active"),
  history: () => request("/parking/history"),
};
