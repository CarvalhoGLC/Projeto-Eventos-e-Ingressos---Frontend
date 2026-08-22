export const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Helper genérico de requisição. Lança um Error com a mensagem vinda de
 * `detail` (padrão do FastAPI/HTTPException) quando a resposta não é ok.
 */
async function request(path, { method = "GET", json, form, token, query } = {}) {
  const headers = {};
  let body;

  if (json) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }
  if (form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(form).toString();
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const qs = query ? `?${new URLSearchParams(query).toString()}` : "";
  const res = await fetch(`${API_BASE}${path}${qs}`, { method, headers, body });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* resposta sem corpo JSON (ex.: 204 No Content) */
  }

  if (!res.ok) {
    throw new Error(data?.detail || `Erro ${res.status}`);
  }
  return data;
}

export const api = {
  register: (email, password, role) =>
    request("/register", { method: "POST", json: { email, password, role } }),

  login: (email, password) =>
    request("/token", {
      method: "POST",
      form: { grant_type: "password", username: email, password },
    }),

  me: (token) => request("/me", { token }),

  createEvent: (token, event) =>
    request("/events", { method: "POST", token, json: event }),

  getEvents: (token) => request("/events", { method: "GET", token }),

  updateEvent: (token, eventId, updates) =>
    request(`/events/${eventId}`, { method: "PUT", token, json: updates }),

  deleteEvent: (token, eventId) =>
    request(`/events/${eventId}`, { method: "DELETE", token }),

  searchMovies: (query) => request("/external/movies", { query: { query } }),

  bookTicket: (token, booking) =>
    request("/bookings", { method: "POST", token, json: booking }),

  myTickets: (token) => request("/bookings/me", { token }),

  sharedTicket: (token) => request(`/tickets/share/${token}`),

  validateGate: (token, qrPayload, gateEventId) =>
    request("/gate/validate", {
      method: "POST",
      token,
      query: { qr_payload: qrPayload, gate_event_id: gateEventId },
    }),
};