// app.js
// 676Trades frontend helper
// - Website auth uses JWT: Authorization: Bearer <accessToken>
// - MT5 EA uses API Key: X-API-Key (users copy/paste into EA)
// Stores both separately in localStorage.

const BACKEND = "https://api.676trades.org";

// --------------------
// Storage keys
// --------------------
const LS_ACCESS = "accessToken";
const LS_APIKEY = "apiKey";

// --------------------
// Token helpers
// --------------------
function setAccessToken(t) {
  localStorage.setItem(LS_ACCESS, t || "");
}
function getAccessToken() {
  return localStorage.getItem(LS_ACCESS) || "";
}
function clearAccessToken() {
  localStorage.removeItem(LS_ACCESS);
}

function setApiKey(k) {
  localStorage.setItem(LS_APIKEY, k || "");
}
function getApiKey() {
  return localStorage.getItem(LS_APIKEY) || "";
}
function clearApiKey() {
  localStorage.removeItem(LS_APIKEY);
}

// Backward compatibility helpers (DO NOT use for EA key copying)
function setToken(v) { setAccessToken(v); }
function getToken() { return getAccessToken(); }

// --------------------
// Session helpers
// --------------------
function logout() {
  clearAccessToken();
  // keep EA key for convenience; uncomment to clear it too:
  // clearApiKey();
  window.location.href = "/login.html?m=loggedout";
}

function requireLogin(redirectTo = "/login.html") {
  if (!getAccessToken()) {
    window.location.href = redirectTo + "?m=login";
    return false;
  }
  return true;
}

// --------------------
// Small helpers
// --------------------
function isJwtLike(value) {
  // JWTs usually have 3 parts separated by dots.
  return typeof value === "string" && value.split(".").length === 3;
}

function setAuthFromResponse(data) {
  // Expect: { access_token, api_key }
  if (data && data.access_token) setAccessToken(data.access_token);
  if (data && data.api_key) setApiKey(data.api_key);
}

// --------------------
// API wrapper (JWT)
// --------------------
async function api(path, method = "GET", body = null) {
  const headers = { "Content-Type": "application/json" };

  const token = getAccessToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(`${BACKEND}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }

  // Auto-handle auth expiry for normal users
  if (res.status === 401) {
    // Only clear if we were actually using a Bearer token
    if (token) {
      clearAccessToken();
      window.location.href = "/login.html?m=expired";
      throw new Error("Session expired. Please login again.");
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  }
  return data;
}

// --------------------
// EA helper (X-API-Key) - optional for your own testing
// (Your EA calls the backend directly; this is for web tools if needed.)
// --------------------
async function eaApi(path, method = "GET", body = null) {
  const headers = { "Content-Type": "application/json" };
  const key = getApiKey();
  if (!key) throw new Error("Missing API key. Login and copy your API key.");

  headers["X-API-Key"] = key;

  const res = await fetch(`${BACKEND}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }

  if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  return data;
}

// --------------------
// Profile helper (prevents 'profile undefined' errors)
// --------------------
async function getProfile() {
  // returns { ok:true, profile:{...} }
  return await api("/auth/me", "GET");
}

// --------------------
// Message banner helper (optional use in pages)
// --------------------
function readMsgParam() {
  const u = new URL(window.location.href);
  return u.searchParams.get("m") || "";
}
