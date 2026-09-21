import {useEffect,useMemo,useState} from "react";
import {
  LayoutDashboard,FolderKanban,ListTodo,BarChart3,CalendarDays,Settings,Search,Plus,
  Bell,LogOut,Activity,ShieldAlert,CheckCircle2,Clock3,Flame,Target,Play,RotateCcw,
  Bot,Pencil,Trash2,UserPlus,ChevronRight,AlertTriangle
} from "lucide-react";
import {useAuth} from "../auth.jsx";import {api} from "../api.js";import Modal from "../components/Modal.jsx";

const nav=[["Overview",LayoutDashboard],["Projects",FolderKanban],["My Tasks",ListTodo],["Analytics",BarChart3],["Calendar",CalendarDays],["Activity Log",Activity],["Notifications",ShieldAlert],["Settings",Settings]];
const blankProject={name:"",description:"",status:"active"};
const blankTask={projectId:"",assigneeId:"",title:"",description:"",status:"todo",priority:"medium",dueDate:""};

export default function Workspace(){
 const{user,logout}=useAuth();const[view,setView]=useState("Overview"),[dashboard,setDashboard]=useState({stats:{},activities:[]}),[projects,setProjects]=useState([]),[tasks,setTasks]=useState([]),[members,setMembers]=useState([]),[analytics,setAnalytics]=useState({status:[],priority:[],members:[]}),[activity,setActivity]=useState([]),[notifications,setNotifications]=useState([]),[loading,setLoading]=useState(true),[err,setErr]=useState(""),[q,setQ]=useState(""),[status,setStatus]=useState("all"),[priority,setPriority]=useState("all");
 const[projectModal,setProjectModal]=useState(null),[projectForm,setProjectForm]=useState(blankProject),[taskModal,setTaskModal]=useState(false),[taskForm,setTaskForm]=useState(blankTask),[aiProject,setAiProject]=useState(null),[aiResult,setAiResult]=useState(null),[memberModal,setMemberModal]=useState(false),[memberForm,setMemberForm]=useState({name:"",email:"",role:"Developer"}),[busy,setBusy]=useState(false),[seconds,setSeconds]=useState(1500),[running,setRunning]=useState(false);

 useEffect(()=>{if(!running)return;const id=setInterval(()=>setSeconds(s=>{if(s<=1){setRunning(false);return 1500}return s-1}),1000);return()=>clearInterval(id)},[running]);

 async function load(){setErr("");try{const[d,p,t,m,a,act,n]=await Promise.all([api("/dashboard"),api("/projects"),api("/tasks"),api("/members"),api("/analytics"),api("/activity"),api("/notifications")]);setDashboard(d);setProjects(p);setTasks(t);setMembers(m);setAnalytics(a);setActivity(act);setNotifications(n);setTaskForm(x=>({...x,projectId:x.projectId||p[0]?.id||"",assigneeId:x.assigneeId||m[0]?.id||""}))}catch(e){setErr(e.message)}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);

 const filtered=useMemo(()=>tasks.filter(t=>(!q||`${t.title} ${t.project_name} ${t.assignee_name||""}`.toLowerCase().includes(q.toLowerCase()))&&(status==="all"||t.status===status)&&(priority==="all"||t.priority===priority)),[tasks,q,status,priority]);
 const s=dashboard.stats||{}, unread=notifications.filter(n=>!n.is_read).length;

 function openProject(p=null){setProjectForm(p?{name:p.name,description:p.description,status:p.status}:blankProject);setProjectModal(p||{__new:true})}
 async function saveProject(e){e.preventDefault();setBusy(true);try{if(projectModal && !projectModal.__new)await api(`/projects/${projectModal.id}`,{method:"PATCH",body:JSON.stringify(projectForm)});else await api("/projects",{method:"POST",body:JSON.stringify(projectForm)});setProjectModal(null);setProjectForm(blankProject);await load()}catch(x){setErr(x.message)}finally{setBusy(false)}}
 async function delProject(p){if(!confirm(`Delete "${p.name}" and its tasks?`))return;await api(`/projects/${p.id}`,{method:"DELETE"});await load()}
 function openTask(projectId=projects[0]?.id||""){setTaskForm({...blankTask,projectId,assigneeId:members[0]?.id||""});setTaskModal(true)}
 async function saveTask(e){e.preventDefault();setBusy(true);try{await api("/tasks",{method:"POST",body:JSON.stringify({...taskForm,dueDate:taskForm.dueDate||null,assigneeId:taskForm.assigneeId||null})});setTaskModal(false);await load()}catch(x){setErr(x.message)}finally{setBusy(false)}}
 async function patchTask(t,patch){await api(`/tasks/${t.id}`,{method:"PATCH",body:JSON.stringify(patch)});await load()}
 async function delTask(t){if(confirm(`Delete "${t.title}"?`)){await api(`/tasks/${t.id}`,{method:"DELETE"});await load()}}
 async function addMember(e){e.preventDefault();setBusy(true);try{await api("/members",{method:"POST",body:JSON.stringify(memberForm)});setMemberModal(false);setMemberForm({name:"",email:"",role:"Developer"});await load()}catch(x){setErr(x.message)}finally{setBusy(false)}}
 async function generate(){setBusy(true);setAiResult(null);try{const r=await api("/ai/generate-tasks",{method:"POST",body:JSON.stringify({projectId:aiProject.id,count:5})});setAiResult(r);await load()}catch(x){setErr(x.message)}finally{setBusy(false)}}
 async function markRead(n){if(n.derived)return;await api(`/notifications/${n.id}/read`,{method:"PATCH"});await load()}

 return <div className="workspace-shell">
  <aside className="sidebar">
   <div className="brand"><div className="brand-mark">✦</div><div><h1>DevFlow</h1><span>Productivity OS</span></div></div>
   <div className="workspace-card"><span>IH</span><div><small>WORKSPACE</small><strong>Innovation Hacks</strong></div><i/></div>
   <nav>{nav.map(([label,Icon])=><button key={label} className={view===label?"active":""} onClick={()=>setView(label)}><Icon size={19}/>{label}{label==="My Tasks"&&<b>{tasks.length}</b>}{label==="Notifications"&&unread>0&&<b>{unread}</b>}</button>)}</nav>
   <div className="focus-mini"><div><Target size={18}/><strong>Focus Mode</strong></div><span>Deep work without distractions</span><progress value="72" max="100"/></div>
   <div className="profile"><div className="avatar">AS</div><div><strong>{user.name}</strong><span>{user.role}</span></div><button className="icon" onClick={logout}><LogOut size={17}/></button></div>
  </aside>

  <main>
   <header className="topbar"><label><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search your workspace..."/><kbd>Ctrl K</kbd></label><div><button className="quick" onClick={()=>openTask()}><Plus size={16}/> Quick action</button><button className="icon notify" onClick={()=>setView("Notifications")}><Bell size={18}/>{unread>0&&<i/>}</button><div className="avatar">AS</div><strong>{user.name}</strong></div></header>

   <section className="content">
    {err&&<div className="page-error">{err}<button onClick={()=>setErr("")}>Dismiss</button></div>}
    {loading?<div className="loading">Loading workspace…</div>:<>
     {view==="Overview"&&<Overview s={s} tasks={tasks} projects={projects} seconds={seconds} running={running} setRunning={setRunning} setSeconds={setSeconds} onTask={()=>openTask()} />}
     {view==="Projects"&&<Projects projects={projects} onNew={()=>openProject()} onEdit={openProject} onDelete={delProject} onAI={p=>{setAiProject(p);setAiResult(null)}} onTask={openTask}/>}
     {view==="My Tasks"&&<Tasks tasks={filtered} q={q} setQ={setQ} status={status} setStatus={setStatus} priority={priority} setPriority={setPriority} members={members} onPatch={patchTask} onDelete={delTask} onNew={()=>openTask()}/>}
     {view==="Analytics"&&<Analytics analytics={analytics} s={s}/>}
     {view==="Calendar"&&<Calendar tasks={tasks}/>}
     {view==="Activity Log"&&<ActivityLog items={activity}/>}
     {view==="Notifications"&&<Notifications items={notifications} onRead={markRead}/>}
     {view==="Settings"&&<SettingsPage user={user} members={members} onAddMember={()=>setMemberModal(true)}/>}
    </>}
   </section>
  </main>

  {projectModal&&<Modal title={projectModal.__new?"Create project":"Edit project"} onClose={()=>setProjectModal(null)}><form className="form" onSubmit={saveProject}>
   <label>Project name<input value={projectForm.name} onChange={e=>setProjectForm({...projectForm,name:e.target.value})} required/></label>
   <label>Description<textarea rows="4" value={projectForm.description} onChange={e=>setProjectForm({...projectForm,description:e.target.value})}/></label>
   <label>Status<select value={projectForm.status} onChange={e=>setProjectForm({...projectForm,status:e.target.value})}><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option></select></label>
   <button className="primary wide" disabled={busy}>{busy?"Saving…":"Save project"}</button>
  </form></Modal>}

  {taskModal&&<Modal title="Create task" onClose={()=>setTaskModal(false)}><form className="form" onSubmit={saveTask}>
   <label>Project<select value={taskForm.projectId} onChange={e=>setTaskForm({...taskForm,projectId:e.target.value})} required>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
   <label>Task title<input value={taskForm.title} onChange={e=>setTaskForm({...taskForm,title:e.target.value})} required minLength={2}/></label>
   <label>Description<textarea rows="3" value={taskForm.description} onChange={e=>setTaskForm({...taskForm,description:e.target.value})}/></label>
   <div className="form-row"><label>Assignee<select value={taskForm.assigneeId} onChange={e=>setTaskForm({...taskForm,assigneeId:e.target.value})}><option value="">Unassigned</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label><label>Priority<select value={taskForm.priority} onChange={e=>setTaskForm({...taskForm,priority:e.target.value})}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label></div>
   <div className="form-row"><label>Status<select value={taskForm.status} onChange={e=>setTaskForm({...taskForm,status:e.target.value})}><option value="todo">Todo</option><option value="in-progress">In progress</option><option value="done">Done</option></select></label><label>Due date<input type="date" value={taskForm.dueDate} onChange={e=>setTaskForm({...taskForm,dueDate:e.target.value})}/></label></div>
   <button className="primary wide" disabled={busy||!projects.length}>{busy?"Creating…":"Create task"}</button>
  </form></Modal>}

  {memberModal&&<Modal title="Add workspace member" onClose={()=>setMemberModal(false)}><form className="form" onSubmit={addMember}><label>Name<input value={memberForm.name} onChange={e=>setMemberForm({...memberForm,name:e.target.value})} required/></label><label>Email<input type="email" value={memberForm.email} onChange={e=>setMemberForm({...memberForm,email:e.target.value})} required/></label><label>Role<input value={memberForm.role} onChange={e=>setMemberForm({...memberForm,role:e.target.value})}/></label><button className="primary wide" disabled={busy}>{busy?"Adding…":"Add member"}</button></form></Modal>}

  {aiProject&&<Modal title={`AI plan · ${aiProject.name}`} onClose={()=>setAiProject(null)}><div className="ai-box"><div className="ai-orb"><Bot/></div><h3>Generate a five-task project plan</h3><p>Uses your local Ollama model when available. Generated tasks are persisted into this project.</p>{!aiResult?<button className="primary wide" onClick={generate} disabled={busy}>{busy?"Generating…":"Generate tasks"}</button>:<div className="ai-result"><span className={aiResult.mode}>{aiResult.mode==="local-ai"?"LOCAL AI":"FALLBACK PLANNER"}</span><p>{aiResult.message}</p><ul>{aiResult.tasks.map(t=><li key={t.id}>{t.title}</li>)}</ul><button className="quick wide" onClick={()=>setAiProject(null)}>Done</button></div>}</div></Modal>}

 </div>
}

function Overview({s,tasks,projects,seconds,running,setRunning,setSeconds,onTask}){
 const waiting=tasks.filter(t=>t.status!=="done").length;
 return <><div className="hero"><div><small>DEVELOPER WORKSPACE</small><h2>Good afternoon, Agrima ✦</h2><p>You have <b>{waiting} tasks</b> waiting. DevFlow keeps execution, deadlines and local AI planning in one place.</p></div><button className="primary" onClick={onTask}><Plus size={18}/> Create task</button></div>
 <div className="stats">
  <Stat icon={<CheckCircle2/>} value={s.completed_count||0} label="Completed" sub="Finished tasks"/>
  <Stat icon={<Clock3/>} value={`${s.task_count||0}`} label="Total tasks" sub="Across your workspace"/>
  <Stat icon={<FolderKanban/>} value={s.project_count||0} label="Active projects" sub="Owned workspaces"/>
  <Stat icon={<AlertTriangle/>} value={s.overdue_count||0} label="Overdue" sub="Need attention"/>
 </div>
 <div className="overview-grid"><article className="panel chart-panel"><div className="section-title"><div><small>PRODUCTIVITY</small><h3>Execution snapshot</h3></div><span>Live</span></div><div className="big-metric">{s.completed_count||0}<small> completed</small></div><div className="fake-chart">{[30,45,38,64,78,58,72].map((v,i)=><div key={i}><i style={{height:`${v}%`}}/><span>{["M","T","W","T","F","S","S"][i]}</span></div>)}</div></article><article className="panel timer"><small>DEEP WORK</small><h3>Focus timer</h3><div className="timer-ring"><strong>{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</strong><span>Focus session</span></div><div className="timer-actions"><button className="primary" onClick={()=>setRunning(!running)}><Play size={17}/>{running?"Pause":"Start"}</button><button className="icon" onClick={()=>{setRunning(false);setSeconds(1500)}}><RotateCcw size={17}/></button></div></article></div>
 <section className="mini-section"><div className="section-title"><div><small>PORTFOLIO</small><h3>Active projects</h3></div></div><div className="project-grid">{projects.slice(0,3).map(p=><ProjectCard p={p} key={p.id}/>)}</div></section></>
}
function Stat({icon,value,label,sub}){return <article className="stat-card"><div className="stat-icon">{icon}</div><strong>{value}</strong><span>{label}</span><small>{sub}</small></article>}
function ProjectCard({p,onEdit,onDelete,onAI,onTask}){const total=Number(p.task_count||0),done=Number(p.done_count||0),pc=total?Math.round(done/total*100):0;return <article className="panel project-card"><div><small>{p.status.toUpperCase()}</small><b>{pc}%</b></div><h3>{p.name}</h3><p>{p.description||"No description yet."}</p><progress value={pc} max="100"/><span>{done} of {total} tasks completed</span>{onEdit&&<footer><button onClick={()=>onAI(p)}><Bot size={15}/> AI Generate</button><button onClick={()=>onEdit(p)}><Pencil size={15}/> Edit</button><button onClick={()=>onDelete(p)}><Trash2 size={15}/> Delete</button><button onClick={()=>onTask(p.id)}><Plus size={15}/> Task</button></footer>}</article>}
function Projects({projects,onNew,onEdit,onDelete,onAI,onTask}){return <Page kicker="PORTFOLIO" title="Projects" action={<button className="primary" onClick={onNew}><Plus size={16}/> New project</button>}>{projects.length?<div className="project-grid">{projects.map(p=><ProjectCard key={p.id} p={p} onEdit={onEdit} onDelete={onDelete} onAI={onAI} onTask={onTask}/>)}</div>:<Empty text="Create your first project to start tracking work."/ >}</Page>}
function Tasks({tasks,q,setQ,status,setStatus,priority,setPriority,members,onPatch,onDelete,onNew}){return <Page kicker="EXECUTION" title="My Tasks" action={<button className="primary" onClick={onNew}><Plus size={16}/> New task</button>}><div className="panel task-panel"><div className="filters"><label><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tasks..."/></label><select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option><option value="todo">Todo</option><option value="in-progress">In progress</option><option value="done">Done</option></select><select value={priority} onChange={e=>setPriority(e.target.value)}><option value="all">All priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>{tasks.length?tasks.map(t=><div className="task-row" key={t.id}><i className={`p-${t.priority}`}/><div><strong>{t.title}</strong><span>{t.project_name} · {t.assignee_name||"Unassigned"}{t.overdue?" · OVERDUE":""}</span></div><select value={t.assignee_id||""} onChange={e=>onPatch(t,{assigneeId:e.target.value||null})}><option value="">Unassigned</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select><select value={t.status} onChange={e=>onPatch(t,{status:e.target.value})}><option value="todo">Todo</option><option value="in-progress">In progress</option><option value="done">Done</option></select><button className="icon" onClick={()=>onDelete(t)}><Trash2 size={15}/></button></div>):<Empty text="No tasks match your filters."/>}</div></Page>}
function Analytics({analytics,s}){return <Page kicker="INSIGHTS" title="Analytics"><div className="stats"><Stat icon={<CheckCircle2/>} value={s.completed_count||0} label="Completed" sub="Current workspace"/><Stat icon={<Clock3/>} value={s.in_progress_count||0} label="In progress" sub="Currently moving"/><Stat icon={<AlertTriangle/>} value={s.overdue_count||0} label="Overdue" sub="Need attention"/><Stat icon={<FolderKanban/>} value={s.project_count||0} label="Projects" sub="Owned workspaces"/></div><div className="analytics-grid"><BarCard title="Task status" data={analytics.status}/><BarCard title="Priority mix" data={analytics.priority}/><BarCard title="Workload by assignee" data={analytics.members}/></div></Page>}
function BarCard({title,data}){const max=Math.max(1,...data.map(x=>Number(x.value)));return <article className="panel bar-card"><h3>{title}</h3>{data.length?data.map(x=><div className="bar-row" key={x.label}><span>{x.label}</span><div><i style={{width:`${Number(x.value)/max*100}%`}}/></div><b>{x.value}</b></div>):<p className="muted">No data yet.</p>}</article>}
function Calendar({tasks}){const dated=tasks.filter(t=>t.due_date).sort((a,b)=>String(a.due_date).localeCompare(String(b.due_date)));return <Page kicker="SCHEDULE" title="Calendar & Deadlines"><div className="panel deadline-list">{dated.length?dated.map(t=><div key={t.id}><CalendarDays size={18}/><span><strong>{t.title}</strong><small>{t.project_name} · {t.assignee_name||"Unassigned"}</small></span><b className={t.overdue?"overdue":""}>{t.due_date}{t.overdue?" · overdue":""}</b></div>):<Empty text="Add due dates to tasks to build your schedule."/ >}</div></Page>}
function ActivityLog({items}){return <Page kicker="AUDITABILITY" title="Activity & Audit Log"><div className="stats"><Stat icon={<Activity/>} value={items.length} label="Recorded events" sub="Latest workspace activity"/><Stat icon={<ShieldAlert/>} value={new Set(items.map(x=>x.type)).size} label="Event types" sub="Across the workspace"/><Stat icon={<Clock3/>} value="100" label="Log capacity" sub="Latest retained events"/><Stat icon={<CheckCircle2/>} value="Live" label="Tracking" sub="Backend integrated"/></div><div className="panel audit-table"><header><span>Time</span><span>Type</span><span>Action</span><span>Target</span></header>{items.map(x=><div key={x.id}><time>{new Date(x.created_at).toLocaleString()}</time><b>{x.type}</b><span>{x.message}</span><small>{x.target||"—"}</small></div>)}</div></Page>}
function Notifications({items,onRead}){return <Page kicker="REAL-TIME UPDATES" title="Notifications & Security Alerts">{items.length?<div className="notification-list">{items.map(n=><button className={`notification ${n.severity} ${n.is_read?"read":""}`} key={n.id} onClick={()=>onRead(n)}><div><Bell size={18}/></div><span><strong>{n.title}</strong><p>{n.message}</p><small>{new Date(n.created_at).toLocaleString()}</small></span>{!n.is_read&&<i/>}</button>)}</div>:<Empty text="No notifications yet."/ >}</Page>}
function SettingsPage({user,members,onAddMember}){return <Page kicker="WORKSPACE" title="Settings"><div className="settings-grid"><article className="panel settings-card"><h3>Profile</h3><label>Name<input value={user.name} readOnly/></label><label>Email<input value={user.email} readOnly/></label><p className="muted">Profile editing can be added as a future account feature.</p></article><article className="panel settings-card"><div className="section-title"><h3>Workspace members</h3><button className="quick" onClick={onAddMember}><UserPlus size={15}/> Add</button></div>{members.map(m=><div className="member" key={m.id}><div className="avatar">{m.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</div><span><strong>{m.name}</strong><small>{m.email} · {m.role}</small></span></div>)}</article></div></Page>}
function Page({kicker,title,action,children}){return <><div className="page-head"><div><small>{kicker}</small><h2>{title}</h2></div>{action}</div>{children}</>}
function Empty({text}){return <div className="empty"><FolderKanban size={28}/><strong>Nothing here yet</strong><p>{text}</p></div>}
