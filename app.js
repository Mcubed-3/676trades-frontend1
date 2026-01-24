const BACKEND = "https://api.676trades.org";

function getToken(){ return localStorage.getItem("apiKey") || ""; }
function setToken(t){ localStorage.setItem("apiKey", t); }

function getJwt(){ return localStorage.getItem("jwt") || ""; }
function setJwt(t){ localStorage.setItem("jwt", t); }

function logout(){
  localStorage.removeItem("apiKey");
  localStorage.removeItem("jwt");
  window.location.href="/login.html";
}

async function api(path, method="GET", body=null){
  const headers = { "Content-Type":"application/json" };

  const jwt = getJwt();
  const apiKey = getToken();

  if(jwt){
    headers["Authorization"] = "Bearer " + jwt;
  } else if(apiKey){
    headers["X-API-Key"] = apiKey;
  }

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
