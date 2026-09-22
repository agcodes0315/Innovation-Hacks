const BASE=import.meta.env.VITE_API_URL||"http://localhost:4000/api";
export const token=()=>localStorage.getItem("devflow_token");
export const setToken=t=>t?localStorage.setItem("devflow_token",t):localStorage.removeItem("devflow_token");
export async function api(path,options={}){const headers=new Headers(options.headers||{});headers.set("Content-Type","application/json");if(token())headers.set("Authorization",`Bearer ${token()}`);const r=await fetch(`${BASE}${path}`,{...options,headers});if(r.status===204)return null;const d=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(d?.error?.message||"Request failed");e.status=r.status;e.details=d?.error?.details;throw e}return d}
