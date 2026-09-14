const API=import.meta.env.VITE_API_URL||"http://localhost:4000/api";
export function getToken(){return localStorage.getItem("devflow_token");}
export function setToken(token){if(token)localStorage.setItem("devflow_token",token);else localStorage.removeItem("devflow_token");}
export async function api(path,options={}){const headers=new Headers(options.headers||{}); if(options.body)headers.set("Content-Type","application/json"); const token=getToken(); if(token)headers.set("Authorization",`Bearer ${token}`); const res=await fetch(`${API}${path}`,{...options,headers}); if(res.status===204)return null; const body=await res.json(); if(!res.ok)throw new Error(body?.error?.message||"Request failed"); return body.data;}
