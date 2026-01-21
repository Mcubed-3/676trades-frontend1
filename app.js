const BACKEND = "https://api.676trades.org";

function setToken(token){
  localStorage.setItem("apiKey", token);
}
function getToken(){
  return localStorage.getItem("apiKey") || "";
}
function logout(){
  localStorage.removeItem("apiKey");
  window.location.href = "/login.html";
}

async function api(path, method="GET", body=null){
  const headers = {"Content-Type":"application/json"};
  const key = getToken();
  if(key) headers["X-API-Key"] = key;

  const res = await fetch(`${BACKEND}${path}`,{
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const text = await res.text();
  let data = null;
  try{ data = JSON.parse(text); } catch(e){ data = { raw:text }; }

  if(!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  return data;
}
