import { db } from "./db.js";

const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
export function projectHealth(userId){
  const projects=db.prepare("SELECT * FROM projects WHERE owner_id=? ORDER BY updated_at DESC").all(userId);
  return projects.map(p=>{
    const tasks=db.prepare(`SELECT t.*,b.status blocker_status FROM tasks t LEFT JOIN tasks b ON b.id=t.blocked_by_task_id WHERE t.project_id=?`).all(p.id);
    const total=tasks.length,done=tasks.filter(t=>t.status==="done").length,completion=total?done/total:0;
    const today=new Date();today.setHours(0,0,0,0);const soon=new Date(today);soon.setDate(soon.getDate()+2);
    const overdue=tasks.filter(t=>t.status!=="done"&&t.due_date&&new Date(t.due_date)<today).length;
    const dueSoon=tasks.filter(t=>t.status!=="done"&&t.due_date&&new Date(t.due_date)>=today&&new Date(t.due_date)<=soon).length;
    const blocked=tasks.filter(t=>t.blocked_by_task_id&&t.blocker_status!=="done").length;
    const stale=tasks.filter(t=>t.status==="in-progress"&&(Date.now()-new Date(t.updated_at).getTime())>3*86400000).length;
    const score=clamp((total?45+completion*55:75)-overdue*18-dueSoon*5-blocked*12-stale*7);
    const label=score>=80?"Healthy":score>=60?"Watch":"At Risk";
    return {...p,total,done,completion:Math.round(completion*100),overdue,dueSoon,blocked,stale,score,label};
  });
}

export function dailyBriefing(userId){
  const tasks=db.prepare(`SELECT t.*,p.name project_name,m.name assignee_name,b.status blocker_status FROM tasks t JOIN projects p ON p.id=t.project_id LEFT JOIN members m ON m.id=t.assignee_id LEFT JOIN tasks b ON b.id=t.blocked_by_task_id WHERE p.owner_id=?`).all(userId);
  const today=new Date();today.setHours(0,0,0,0);const tomorrow=new Date(today);tomorrow.setDate(tomorrow.getDate()+1);
  const active=tasks.filter(t=>t.status!=="done");
  const overdue=active.filter(t=>t.due_date&&new Date(t.due_date)<today);
  const dueSoon=active.filter(t=>t.due_date&&new Date(t.due_date)>=today&&new Date(t.due_date)<=tomorrow);
  const blocked=active.filter(t=>t.blocked_by_task_id&&t.blocker_status!=="done");
  const stale=active.filter(t=>t.status==="in-progress"&&(Date.now()-new Date(t.updated_at).getTime())>3*86400000);
  const next=[...active].sort((a,b)=>Number(Boolean(b.overdue))-Number(Boolean(a.overdue))||({high:0,medium:1,low:2}[a.priority]-({high:0,medium:1,low:2}[b.priority]))).slice(0,5);
  return {overdue,dueSoon,blocked,stale,next,summary:`${overdue.length} overdue · ${dueSoon.length} due soon · ${blocked.length} blocked · ${stale.length} stale in-progress`};
}
