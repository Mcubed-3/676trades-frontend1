const BACKEND = "https://api.676trades.org";

// Store token in browser (same key everywhere)
function setToken(token){
  localStorage.setItem("apiKey", token);
}

function getToken(){
  return localStorage.getItem("apiKey") || "";
}

function clearToken(){
  localStorage.removeItem("apiKey");
}

function logout(){
  clearToken();
  window.location.href = "/login.html";
}

// Debug helper (optional): check if token exists
function debugToken(){
  console.log("apiKey in localStorage =", getToken());
}

async function api(path, method="GET", body=null){
  const headers = { "Content-Type": "application/json" };

  const key = getToken();
  if (key) headers["X-API-Key"] = key; // ✅ backend expects this exact header

  const options = { method, headers };

  // ✅ only attach body for non-GET requests
  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BACKEND}${path}`, options);

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); }
  catch (e) { data = { raw: text }; }

  if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  return data;
}
