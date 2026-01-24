// app.js
// Frontend helper for 676Trades
// Uses JWT (Authorization: Bearer <token>) for website calls
// Stores apiKey separately for MT5 EA copy/paste

const BACKEND = "https://api.676trades.org";

// ---------- Token storage ----------
function setAccessToken(t){ localStorage.setItem("accessToken", t); }
function getAccessToken(){ return localStorage.getItem("accessToken") || ""; }

function setApiKey(k){ localStorage.setItem("apiKey", k); }
function getApiKey(){ return localStorage.getItem("apiKey") || ""; }

// Backward-compat (your pages already call getToken/setToken)
function setToken(v){ setAccessToken(v); }
function getToken(){ return getAccessToken(); }

// ---------- Session helpers ----------
function logout(){
  localStorage.removeItem("accessToken");
  // Keep apiKey for convenience; uncomment to clear it too
  // localStorage.removeItem("apiKey");
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
  const headers = { "Content-Type":"application/json" };

  const token = getAccessToken();
  if(token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(`${BACKEND}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const text = await res.text();
  let data;
  try{ data = JSON.parse(text); } catch(e){ data = { raw:text }; }

  if(!res.ok){
    throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  }
  return data;
}
