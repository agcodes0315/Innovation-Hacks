import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { db } from "./db.js";
export class HttpError extends Error{constructor(status,message,details){super(message);this.status=status;this.details=details}}
export const uid=p=>`${p}-${randomUUID()}`;export const now=()=>new Date().toISOString();
export function parse(schema,body){const r=schema.safeParse(body);if(!r.success)throw new HttpError(400,"Validation failed",r.error.flatten());return r.data}
export function sign(user){return jwt.sign({sub:user.id,email:user.email},process.env.JWT_SECRET||"dev-only-secret",{expiresIn:"7d"})}
export function auth(req,res,next){const h=req.headers.authorization||"";const token=h.startsWith("Bearer ")?h.slice(7):null;if(!token)return next(new HttpError(401,"Authentication required"));try{const p=jwt.verify(token,process.env.JWT_SECRET||"dev-only-secret");const u=db.prepare("SELECT id,name,email,role,created_at FROM users WHERE id=?").get(p.sub);if(!u)throw 0;req.user=u;next()}catch{next(new HttpError(401,"Invalid or expired token"))}}
export function log(userId,type,message,target=null){db.prepare("INSERT INTO activities VALUES(?,?,?,?,?,?)").run(uid("a"),userId,type,message,target,now())}
export function notify(userId,type,title,message,severity="info"){db.prepare("INSERT INTO notifications VALUES(?,?,?,?,?,?,0,?)").run(uid("n"),userId,type,title,message,severity,now())}
export function errorHandler(err,req,res,next){if(res.headersSent)return next(err);let status=err.status||500,msg=err.message||"Internal server error";if(String(msg).includes("UNIQUE constraint failed: users.email")){status=409;msg="An account with this email already exists"}if(status===500)console.error(err);res.status(status).json({error:{message:status===500?"Internal server error":msg,details:err.details}})}
