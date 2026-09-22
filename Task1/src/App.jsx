import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, FolderKanban, ListTodo, BarChart3, CalendarDays,
  Settings, Search, Plus, Clock3, CheckCircle2, Flame, Target,
  Bell, UserRound, Play, RotateCcw, ChevronRight
} from "lucide-react";

const initialProjects = [
  { id: 1, name: "AI Project Manager", progress: 78, status: "On Track", tasks: 23, done: 18 },
  { id: 2, name: "Developer API Platform", progress: 54, status: "In Progress", tasks: 22, done: 12 },
  { id: 3, name: "DevFlow Design System", progress: 91, status: "Almost Done", tasks: 22, done: 20 }
];

const initialTasks = [
  { id: 1, title: "Build dashboard analytics cards", project: "AI Project Manager", priority: "High", status: "In Progress", due: "Today" },
  { id: 2, title: "Create responsive sidebar navigation", project: "Design System", priority: "Medium", status: "Done", due: "Aug 24" },
  { id: 3, title: "Document REST API response contracts", project: "Developer API Platform", priority: "High", status: "Todo", due: "Aug 27" },
  { id: 4, title: "Design loading and empty states", project: "AI Project Manager", priority: "Medium", status: "In Progress", due: "Aug 28" },
  { id: 5, title: "Prepare backend integration hooks", project: "Developer API Platform", priority: "Low", status: "Todo", due: "Aug 30" }
];

function Stat({ icon, value, label, sub }) {
  return <article className="stat-card"><div className="stat-icon">{icon}</div><strong>{value}</strong><span>{label}</span><small>{sub}</small></article>
}

export default function App() {
  const [view, setView] = useState("Overview");
  const [tasks, setTasks] = useState(initialTasks);
  const [projects] = useState(initialProjects);
  const [query, setQuery] = useState("");
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(s => {
      if (s <= 1) { setRunning(false); return 25 * 60; }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [running]);

  const shownTasks = useMemo(() => tasks.filter(t =>
    `${t.title} ${t.project}`.toLowerCase().includes(query.toLowerCase())
  ), [tasks, query]);

  const nav = [
    ["Overview", LayoutDashboard], ["Projects", FolderKanban], ["My Tasks", ListTodo],
    ["Analytics", BarChart3], ["Calendar", CalendarDays], ["Settings", Settings]
  ];

  function toggleTask(id) {
    setTasks(items => items.map(t => t.id === id ? {...t, status: t.status === "Done" ? "Todo" : "Done"} : t));
  }

  return <div className="task1-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">✦</div><div><h1>DevFlow</h1><span>Productivity OS</span></div></div>
      <div className="workspace"><span>IH</span><div><small>WORKSPACE</small><strong>Innovation Hacks</strong></div><i/></div>
      <nav>{nav.map(([label, Icon]) =>
        <button key={label} className={view===label?"active":""} onClick={() => setView(label)}><Icon size={19}/>{label}{label==="My Tasks" && <b>{tasks.length}</b>}</button>
      )}</nav>
      <div className="focus-mini"><div><Target size={18}/><strong>Focus Mode</strong></div><span>Deep work without distractions</span><progress value="72" max="100"/></div>
      <div className="profile"><div className="avatar">AS</div><div><strong>Agrima Saxena</strong><span>Developer</span></div></div>
    </aside>

    <main>
      <header className="topbar">
        <label><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your workspace..."/><kbd>Ctrl K</kbd></label>
        <div><button className="ghost"><Bell size={18}/></button><div className="avatar">AS</div><strong>Agrima Saxena</strong></div>
      </header>

      <section className="content">
        {view==="Overview" && <>
          <div className="hero"><div><small>TUESDAY · AUGUST 25</small><h2>Good afternoon, Agrima ✦</h2><p>You have <b>{tasks.filter(t=>t.status!=="Done").length} tasks</b> waiting and your productivity is up <b>12%</b> this week.</p></div><button className="primary"><Plus size={18}/> Create task</button></div>
          <div className="stats">
            <Stat icon={<CheckCircle2/>} value={tasks.filter(t=>t.status==="Done").length} label="Completed" sub="Tasks finished this week"/>
            <Stat icon={<Clock3/>} value="14.5h" label="Focus time" sub="2.4 hours today"/>
            <Stat icon={<FolderKanban/>} value={projects.length} label="Active projects" sub="Across your workspace"/>
            <Stat icon={<Flame/>} value="7" label="Focus streak" sub="Consecutive productive days"/>
          </div>
          <div className="overview-grid">
            <article className="panel chart-panel"><div className="section-title"><div><small>PRODUCTIVITY</small><h3>Weekly activity</h3></div><span>7 Days</span></div><div className="fake-chart">{[42,55,48,72,84,62,76].map((v,i)=><div key={i}><i style={{height:`${v}%`}}/><span>{["M","T","W","T","F","S","S"][i]}</span></div>)}</div></article>
            <article className="panel timer"><small>DEEP WORK</small><h3>Focus timer</h3><div className="timer-ring"><strong>{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</strong><span>Focus session</span></div><div className="timer-actions"><button className="primary" onClick={()=>setRunning(!running)}><Play size={17}/>{running?"Pause":"Start"}</button><button className="ghost" onClick={()=>{setRunning(false);setSeconds(1500)}}><RotateCcw size={17}/></button></div></article>
          </div>
        </>}

        {view==="Projects" && <Page title="Projects" kicker="PORTFOLIO">
          <div className="project-grid">{projects.map(p=><article className="panel project-card" key={p.id}><small>{p.status.toUpperCase()}</small><h3>{p.name}</h3><p>{p.done} of {p.tasks} tasks complete</p><progress value={p.progress} max="100"/><strong>{p.progress}%</strong></article>)}</div>
        </Page>}

        {view==="My Tasks" && <Page title="My Tasks" kicker="EXECUTION">
          <div className="panel task-list">{shownTasks.length ? shownTasks.map(t=><button className="task-row" key={t.id} onClick={()=>toggleTask(t.id)}><span className={t.status==="Done"?"done":""}>{t.title}<small>{t.project} · {t.priority}</small></span><b>{t.status}</b><ChevronRight size={16}/></button>) : <div className="empty">No tasks match your search.</div>}</div>
        </Page>}

        {view==="Analytics" && <Page title="Analytics" kicker="INSIGHTS"><div className="stats"><Stat icon={<CheckCircle2/>} value="71%" label="Completion rate" sub="This month"/><Stat icon={<Clock3/>} value="62h" label="Deep work" sub="This month"/><Stat icon={<Target/>} value="84%" label="Goal adherence" sub="Last 30 days"/><Stat icon={<Flame/>} value="7" label="Best streak" sub="Current streak"/></div></Page>}
        {view==="Calendar" && <Page title="Calendar" kicker="SCHEDULE"><div className="panel calendar"><h3>August 2026</h3><div>{Array.from({length:31},(_,i)=><span className={i+1===25?"today":""} key={i}>{i+1}</span>)}</div></div></Page>}
        {view==="Settings" && <Page title="Settings" kicker="WORKSPACE"><div className="panel settings-card"><label>Display name<input defaultValue="Agrima Saxena"/></label><label>Workspace<input defaultValue="Innovation Hacks"/></label><label><input type="checkbox" defaultChecked/> Enable focus reminders</label><button className="primary">Save settings</button></div></Page>}
      </section>
    </main>
  </div>
}

function Page({title,kicker,children}) {
  return <><div className="page-head"><small>{kicker}</small><h2>{title}</h2></div>{children}</>;
}
