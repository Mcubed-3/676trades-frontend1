// app.js (frontend helper)

// Your backend API base
window.BACKEND = "https://api.676trades.org";

// Token helpers
function getToken() {
  return localStorage.getItem("apiKey") || "";
}
function setToken(t) {
  localStorage.setItem("apiKey", t);
}
function logout() {
  localStorage.removeItem("apiKey");
  window.location.href = "/login.html";
}

// Core API helper
async function api(path, method = "GET", body = null) {
  const headers = { "Content-Type": "application/json" };

  const token = getToken();
  if (token) headers["X-API-Key"] = token;

  const res = await fetch(`${window.BACKEND}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    // Non-json error
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  }

  return data;
}
