import "dotenv/config";
import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const app = express();
const port = Number(process.env.PORT || 4000);
app.use(cors({origin:process.env.CLIENT_ORIGIN || "*"}));
app.use(express.json());

const users=[{id:"u-demo",name:"Agrima Saxena",email:"agrima@example.com",role:"Developer"}];
const projects=[{id:"p-demo",name:"DevFlow",description:"Developer productivity workspace",ownerId:"u-demo",status:"active"}];
const tasks=[{id:"t-demo",projectId:"p-demo",assigneeId:"u-demo",title:"Build REST API",description:"Users/projects/tasks API",status:"in-progress",priority:"high",dueDate:null}];

const userSchema=z.object({name:z.string().min(2),email:z.string().email(),role:z.string().default("Developer")});
const projectSchema=z.object({name:z.string().min(2),description:z.string().default(""),ownerId:z.string(),status:z.enum(["active","paused","completed"]).default("active")});
const taskSchema=z.object({projectId:z.string(),assigneeId:z.string().nullable().optional(),title:z.string().min(2),description:z.string().default(""),status:z.enum(["todo","in-progress","done"]).default("todo"),priority:z.enum(["low","medium","high"]).default("medium"),dueDate:z.string().nullable().optional()});

function parse(schema,body){const r=schema.safeParse(body);if(!r.success){const e=new Error("Validation failed");e.status=400;e.details=r.error.flatten();throw e}return r.data}
function find(arr,id,label){const v=arr.find(x=>x.id===id);if(!v){const e=new Error(`${label} not found`);e.status=404;throw e}return v}

app.get("/api/health",(req,res)=>res.json({status:"ok",task:2,persistence:"in-memory"}));

app.get("/api/users",(req,res)=>res.json(users));
app.get("/api/users/:id",(req,res)=>res.json(find(users,req.params.id,"User")));
app.post("/api/users",(req,res)=>{const d=parse(userSchema,req.body);if(users.some(u=>u.email===d.email))return res.status(409).json({error:{message:"Email already exists"}});const row={id:`u-${randomUUID()}`,...d};users.push(row);res.status(201).json(row)});
app.patch("/api/users/:id",(req,res)=>{const row=find(users,req.params.id,"User");Object.assign(row,parse(userSchema.partial(),req.body));res.json(row)});
app.delete("/api/users/:id",(req,res)=>{find(users,req.params.id,"User");const i=users.findIndex(x=>x.id===req.params.id);users.splice(i,1);res.status(204).end()});

app.get("/api/projects",(req,res)=>{const q=String(req.query.q||"").toLowerCase();res.json(projects.filter(p=>!q||`${p.name} ${p.description}`.toLowerCase().includes(q)))});
app.get("/api/projects/:id",(req,res)=>res.json({...find(projects,req.params.id,"Project"),tasks:tasks.filter(t=>t.projectId===req.params.id)}));
app.post("/api/projects",(req,res)=>{const d=parse(projectSchema,req.body);find(users,d.ownerId,"Owner");const row={id:`p-${randomUUID()}`,...d};projects.push(row);res.status(201).json(row)});
app.patch("/api/projects/:id",(req,res)=>{const row=find(projects,req.params.id,"Project");Object.assign(row,parse(projectSchema.partial(),req.body));res.json(row)});
app.delete("/api/projects/:id",(req,res)=>{find(projects,req.params.id,"Project");projects.splice(projects.findIndex(x=>x.id===req.params.id),1);for(let i=tasks.length-1;i>=0;i--)if(tasks[i].projectId===req.params.id)tasks.splice(i,1);res.status(204).end()});

app.get("/api/tasks",(req,res)=>{const q=String(req.query.q||"").toLowerCase();const {status,priority}=req.query;res.json(tasks.filter(t=>(!q||`${t.title} ${t.description}`.toLowerCase().includes(q))&&(!status||t.status===status)&&(!priority||t.priority===priority)))});
app.get("/api/tasks/:id",(req,res)=>res.json(find(tasks,req.params.id,"Task")));
app.post("/api/tasks",(req,res)=>{const d=parse(taskSchema,req.body);find(projects,d.projectId,"Project");const row={id:`t-${randomUUID()}`,assigneeId:null,dueDate:null,...d};tasks.push(row);res.status(201).json(row)});
app.patch("/api/tasks/:id",(req,res)=>{const row=find(tasks,req.params.id,"Task");Object.assign(row,parse(taskSchema.partial(),req.body));res.json(row)});
app.patch("/api/tasks/:id/status",(req,res)=>{const row=find(tasks,req.params.id,"Task");row.status=parse(z.object({status:z.enum(["todo","in-progress","done"])}),req.body).status;res.json(row)});
app.delete("/api/tasks/:id",(req,res)=>{find(tasks,req.params.id,"Task");tasks.splice(tasks.findIndex(x=>x.id===req.params.id),1);res.status(204).end()});

app.use((req,res)=>res.status(404).json({error:{message:"Route not found"}}));
app.use((err,req,res,next)=>res.status(err.status||500).json({error:{message:err.status?err.message:"Internal server error",details:err.details}}));
app.listen(port,()=>console.log(`Task 2 API: http://localhost:${port}`));
