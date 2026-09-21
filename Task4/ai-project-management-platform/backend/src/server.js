import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { db } from "./db.js";
import { HttpError,uid,now,parse,sign,auth,log,notify,errorHandler } from "./lib.js";
import * as S from "./schemas.js";
import { plan } from "./ai.js";

const app=express();const port=Number(process.env.PORT||4000);
const allowedOrigin=process.env.CLIENT_ORIGIN||"http://localhost:5174";
app.use(cors({
 origin(origin,callback){
  if(!origin)return callback(null,true);
  const configured=origin===allowedOrigin;
  const local=/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  return configured||local?callback(null,true):callback(new Error(`CORS blocked origin: ${origin}`));
 }
}));
app.use(express.json({limit:"1mb"}));
const owned=(table,id,userId)=>{const row=db.prepare(`SELECT * FROM ${table} WHERE id=? AND owner_id=?`).get(id,userId);if(!row)throw new HttpError(404,`${table.slice(0,-1)} not found`);return row};

app.get("/api/health",(req,res)=>res.json({status:"ok",task:4,database:"SQLite",auth:"JWT",ai:"Ollama local + explicit fallback"}));

app.post("/api/auth/register",async(req,res)=>{
 const d=parse(S.register,req.body);if(db.prepare("SELECT id FROM users WHERE lower(email)=lower(?)").get(d.email))throw new HttpError(409,"An account with this email already exists");
 const id=uid("u"),ts=now(),hash=await bcrypt.hash(d.password,12);
 db.prepare("INSERT INTO users VALUES(?,?,?,?,?,?)").run(id,d.name,d.email,hash,"Developer",ts);
 const memberId=uid("m");db.prepare("INSERT INTO members VALUES(?,?,?,?,?,?)").run(memberId,id,d.name,d.email,"Developer",ts);
 const user=db.prepare("SELECT id,name,email,role,created_at FROM users WHERE id=?").get(id);
 log(id,"account","Created a DevFlow account","Account");notify(id,"welcome","Welcome to DevFlow","Your workspace is ready. Create your first project.","success");
 res.status(201).json({token:sign(user),user});
});
app.post("/api/auth/login",async(req,res)=>{
 const d=parse(S.login,req.body),row=db.prepare("SELECT * FROM users WHERE lower(email)=lower(?)").get(d.email);
 if(!row||!(await bcrypt.compare(d.password,row.password_hash)))throw new HttpError(401,"Invalid email or password");
 const user={id:row.id,name:row.name,email:row.email,role:row.role,created_at:row.created_at};log(user.id,"account","Signed in","Account");res.json({token:sign(user),user});
});
app.get("/api/auth/me",auth,(req,res)=>res.json(req.user));

app.get("/api/dashboard",auth,(req,res)=>{
 const s=db.prepare(`SELECT
 (SELECT COUNT(*) FROM projects WHERE owner_id=?) project_count,
 (SELECT COUNT(*) FROM tasks t JOIN projects p ON p.id=t.project_id WHERE p.owner_id=?) task_count,
 (SELECT COUNT(*) FROM tasks t JOIN projects p ON p.id=t.project_id WHERE p.owner_id=? AND t.status='done') completed_count,
 (SELECT COUNT(*) FROM tasks t JOIN projects p ON p.id=t.project_id WHERE p.owner_id=? AND t.status='in-progress') in_progress_count,
 (SELECT COUNT(*) FROM tasks t JOIN projects p ON p.id=t.project_id WHERE p.owner_id=? AND t.status!='done' AND t.due_date IS NOT NULL AND date(t.due_date)<date('now')) overdue_count
 `).get(req.user.id,req.user.id,req.user.id,req.user.id,req.user.id);
 const activities=db.prepare("SELECT * FROM activities WHERE user_id=? ORDER BY created_at DESC LIMIT 8").all(req.user.id);
 res.json({stats:s,activities});
});

app.get("/api/members",auth,(req,res)=>res.json(db.prepare("SELECT * FROM members WHERE owner_id=? ORDER BY created_at").all(req.user.id)));
app.post("/api/members",auth,(req,res)=>{const d=parse(S.member,req.body),id=uid("m"),ts=now();db.prepare("INSERT INTO members VALUES(?,?,?,?,?,?)").run(id,req.user.id,d.name,d.email,d.role,ts);log(req.user.id,"member",`Added ${d.name} to the workspace`,d.name);res.status(201).json(db.prepare("SELECT * FROM members WHERE id=?").get(id))});

app.get("/api/projects",auth,(req,res)=>{
 const q=`%${String(req.query.q||"")}%`,status=req.query.status||null;
 res.json(db.prepare(`SELECT p.*,COUNT(t.id) task_count,SUM(CASE WHEN t.status='done' THEN 1 ELSE 0 END) done_count
 FROM projects p LEFT JOIN tasks t ON t.project_id=p.id
 WHERE p.owner_id=? AND (?='%%' OR p.name LIKE ? OR p.description LIKE ?) AND (? IS NULL OR p.status=?)
 GROUP BY p.id ORDER BY p.updated_at DESC`).all(req.user.id,q,q,q,status,status));
});
app.get("/api/projects/:id",auth,(req,res)=>{const p=owned("projects",req.params.id,req.user.id);res.json({...p,tasks:db.prepare("SELECT t.*,m.name assignee_name FROM tasks t LEFT JOIN members m ON m.id=t.assignee_id WHERE t.project_id=? ORDER BY t.created_at DESC").all(p.id)})});
app.post("/api/projects",auth,(req,res)=>{const d=parse(S.project,req.body),id=uid("p"),ts=now();db.prepare("INSERT INTO projects VALUES(?,?,?,?,?,?,?)").run(id,req.user.id,d.name,d.description,d.status,ts,ts);log(req.user.id,"project",`Created project "${d.name}"`,d.name);notify(req.user.id,"project","Project created",`${d.name} is ready for planning.`,"success");res.status(201).json(db.prepare("SELECT * FROM projects WHERE id=?").get(id))});
app.patch("/api/projects/:id",auth,(req,res)=>{const c=owned("projects",req.params.id,req.user.id),d=parse(S.project.partial(),req.body);db.prepare("UPDATE projects SET name=?,description=?,status=?,updated_at=? WHERE id=?").run(d.name??c.name,d.description??c.description,d.status??c.status,now(),c.id);log(req.user.id,"project",`Updated project "${d.name??c.name}"`,d.name??c.name);res.json(db.prepare("SELECT * FROM projects WHERE id=?").get(c.id))});
app.delete("/api/projects/:id",auth,(req,res)=>{const c=owned("projects",req.params.id,req.user.id);db.prepare("DELETE FROM projects WHERE id=?").run(c.id);log(req.user.id,"project",`Deleted project "${c.name}"`,c.name);res.status(204).end()});

app.get("/api/tasks",auth,(req,res)=>{
 const q=`%${String(req.query.q||"")}%`,status=req.query.status||null,priority=req.query.priority||null,projectId=req.query.projectId||null;
 res.json(db.prepare(`SELECT t.*,p.name project_name,m.name assignee_name,
 CASE WHEN t.status!='done' AND t.due_date IS NOT NULL AND date(t.due_date)<date('now') THEN 1 ELSE 0 END overdue
 FROM tasks t JOIN projects p ON p.id=t.project_id LEFT JOIN members m ON m.id=t.assignee_id
 WHERE p.owner_id=? AND (?='%%' OR t.title LIKE ? OR t.description LIKE ?) AND (? IS NULL OR t.status=?) AND (? IS NULL OR t.priority=?) AND (? IS NULL OR t.project_id=?)
 ORDER BY overdue DESC,CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,t.created_at DESC`).all(req.user.id,q,q,q,status,status,priority,priority,projectId,projectId));
});
app.post("/api/tasks",auth,(req,res)=>{
 const d=parse(S.task,req.body),p=owned("projects",d.projectId,req.user.id);if(d.assigneeId&&!db.prepare("SELECT id FROM members WHERE id=? AND owner_id=?").get(d.assigneeId,req.user.id))throw new HttpError(400,"Assignee is not in this workspace");
 const id=uid("t"),ts=now();db.prepare("INSERT INTO tasks VALUES(?,?,?,?,?,?,?,?,?,?,?)").run(id,p.id,d.assigneeId??null,d.title,d.description,d.status,d.priority,d.dueDate||null,0,ts,ts);
 log(req.user.id,"task",`Created task "${d.title}"`,d.title);res.status(201).json(db.prepare("SELECT * FROM tasks WHERE id=?").get(id));
});
app.patch("/api/tasks/:id",auth,(req,res)=>{
 const c=db.prepare("SELECT t.* FROM tasks t JOIN projects p ON p.id=t.project_id WHERE t.id=? AND p.owner_id=?").get(req.params.id,req.user.id);if(!c)throw new HttpError(404,"Task not found");
 const d=parse(S.task.partial(),req.body),projectId=d.projectId??c.project_id;owned("projects",projectId,req.user.id);
 const assignee=d.assigneeId!==undefined?d.assigneeId:c.assignee_id;if(assignee&&!db.prepare("SELECT id FROM members WHERE id=? AND owner_id=?").get(assignee,req.user.id))throw new HttpError(400,"Assignee is not in this workspace");
 db.prepare("UPDATE tasks SET project_id=?,assignee_id=?,title=?,description=?,status=?,priority=?,due_date=?,updated_at=? WHERE id=?").run(projectId,assignee,d.title??c.title,d.description??c.description,d.status??c.status,d.priority??c.priority,d.dueDate!==undefined?(d.dueDate||null):c.due_date,now(),c.id);
 const title=d.title??c.title,status=d.status??c.status;log(req.user.id,"task",`Updated task "${title}"`,title);if(status==="done"&&c.status!=="done")notify(req.user.id,"task","Task completed",title,"success");res.json(db.prepare("SELECT * FROM tasks WHERE id=?").get(c.id));
});
app.delete("/api/tasks/:id",auth,(req,res)=>{const c=db.prepare("SELECT t.* FROM tasks t JOIN projects p ON p.id=t.project_id WHERE t.id=? AND p.owner_id=?").get(req.params.id,req.user.id);if(!c)throw new HttpError(404,"Task not found");db.prepare("DELETE FROM tasks WHERE id=?").run(c.id);log(req.user.id,"task",`Deleted task "${c.title}"`,c.title);res.status(204).end()});

app.get("/api/activity",auth,(req,res)=>{const type=req.query.type||null;res.json(db.prepare("SELECT * FROM activities WHERE user_id=? AND (? IS NULL OR type=?) ORDER BY created_at DESC LIMIT 100").all(req.user.id,type,type))});
app.get("/api/notifications",auth,(req,res)=>{
 const overdue=db.prepare(`SELECT t.title,t.due_date FROM tasks t JOIN projects p ON p.id=t.project_id WHERE p.owner_id=? AND t.status!='done' AND t.due_date IS NOT NULL AND date(t.due_date)<date('now') LIMIT 10`).all(req.user.id);
 const stored=db.prepare("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50").all(req.user.id);
 const derived=overdue.map((t,i)=>({id:`overdue-${i}`,user_id:req.user.id,type:"deadline",title:"Overdue task",message:`${t.title} was due ${t.due_date}.`,severity:"warning",is_read:0,created_at:now(),derived:true}));
 res.json([...derived,...stored]);
});
app.patch("/api/notifications/:id/read",auth,(req,res)=>{if(req.params.id.startsWith("overdue-"))return res.json({ok:true});db.prepare("UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?").run(req.params.id,req.user.id);res.json({ok:true})});

app.get("/api/analytics",auth,(req,res)=>{
 const status=db.prepare(`SELECT t.status label,COUNT(*) value FROM tasks t JOIN projects p ON p.id=t.project_id WHERE p.owner_id=? GROUP BY t.status`).all(req.user.id);
 const priority=db.prepare(`SELECT t.priority label,COUNT(*) value FROM tasks t JOIN projects p ON p.id=t.project_id WHERE p.owner_id=? GROUP BY t.priority`).all(req.user.id);
 const members=db.prepare(`SELECT COALESCE(m.name,'Unassigned') label,COUNT(t.id) value FROM tasks t JOIN projects p ON p.id=t.project_id LEFT JOIN members m ON m.id=t.assignee_id WHERE p.owner_id=? GROUP BY m.name ORDER BY value DESC`).all(req.user.id);
 res.json({status,priority,members});
});

app.post("/api/ai/generate-tasks",auth,async(req,res)=>{
 const d=parse(S.ai,req.body),p=owned("projects",d.projectId,req.user.id),result=await plan(p,d.count);const member=db.prepare("SELECT id FROM members WHERE owner_id=? ORDER BY created_at LIMIT 1").get(req.user.id);const insert=db.prepare("INSERT INTO tasks VALUES(?,?,?,?,?,'todo',?,NULL,?,?,?)"),saved=[],ts=now();
 db.exec("BEGIN");try{for(const t of result.tasks){const id=uid("t");insert.run(id,p.id,member?.id||null,t.title,t.description,t.priority,result.mode==="local-ai"?1:0,ts,ts);saved.push(db.prepare("SELECT * FROM tasks WHERE id=?").get(id))}db.exec("COMMIT")}catch(e){db.exec("ROLLBACK");throw e}
 log(req.user.id,"ai",`Generated ${saved.length} tasks for "${p.name}" using ${result.mode==="local-ai"?"local AI":"fallback planner"}`,p.name);
 if(result.mode==="fallback")notify(req.user.id,"ai","Local AI unavailable","Ollama was unavailable, so DevFlow used its fallback planner. Start Ollama for genuine local AI.","warning");
 else notify(req.user.id,"ai","AI plan generated",`${saved.length} tasks were generated locally for ${p.name}.`,"success");
 res.status(201).json({mode:result.mode,model:result.model,tasks:saved,message:result.mode==="local-ai"?"Tasks generated by local Ollama.":"Ollama unavailable; fallback planner used."});
});

app.use((req,res)=>res.status(404).json({error:{message:"Route not found"}}));app.use(errorHandler);
app.listen(port,()=>console.log(`Task 4 backend: http://localhost:${port}`));
