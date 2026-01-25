// app.js
// Frontend helper for 676Trades
// Website uses JWT access token (Authorization: Bearer <token>)
// EA uses apiKey (copy/paste into MT5 inputs)

const BACKEND = "https://api.676trades.org";

// ---------- Token storage ----------
function setAccessToken(t){ localStorage.setItem("accessToken", t || ""); }
function getAccessToken(){ return localStorage.getItem("accessToken") || ""; }

function setApiKey(k){ localStorage.setItem("apiKey", k || ""); }
function getApiKey(){ return localStorage.getItem("apiKey") || ""; }

// Backward-compat (some pages call getToken/setToken)
function setToken(v){ setAccessToken(v); }
function getToken(){ return getAccessToken(); }

// ---------- Session helpers ----------
function clearSession(){
  localStorage.removeItem("accessToken");
  // keep apiKey for convenience; uncomment if you want to wipe it too:
  // localStorage.removeItem("apiKey");
}

function logout(){
  clearSession();
  window.location.href = "/login.html";
}

function requireLogin(redirectTo="/login.html"){
  if(!getAccessToken()){
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

// ---------- API wrapper ----------
async function api(path, method="GET", body=null){
  const headers = { "Content-Type": "application/json" };

  const token = getAccessToken();
  if(token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(`${BACKEND}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }

  if(!res.ok){
    const msg = data?.error || data?.message || `HTTP ${res.status}`;

    // If JWT expired/invalid, force re-login (keeps UX simple)
    if(res.status === 401){
      // backend returns "Token expired" or "Invalid token"
      clearSession();
    }
    throw new Error(msg);
  }
  return data;
}
