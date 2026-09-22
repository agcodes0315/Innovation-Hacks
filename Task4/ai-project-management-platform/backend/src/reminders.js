import { randomUUID } from "node:crypto";
import { db } from "./db.js";
import { sendEmail,emailConfigured } from "./email.js";
import { dailyBriefing } from "./health.js";

const now=()=>new Date().toISOString();
const inserted=(userId,taskId,kind,channel)=>{try{db.prepare("INSERT INTO reminder_log(id,user_id,task_id,kind,channel,sent_at) VALUES(?,?,?,?,?,?)").run(`r-${randomUUID()}`,userId,taskId,kind,channel,now());return true}catch{return false}};
const digestInserted=(userId,kind,dateKey)=>{try{db.prepare("INSERT INTO digest_log(id,user_id,kind,date_key,sent_at) VALUES(?,?,?,?,?)").run(`d-${randomUUID()}`,userId,kind,dateKey,now());return true}catch{return false}};
const notify=(userId,type,title,message,severity)=>db.prepare("INSERT INTO notifications(id,user_id,type,title,message,severity,is_read,created_at) VALUES(?,?,?,?,?,?,0,?)").run(`n-${randomUUID()}`,userId,type,title,message,severity,now());

export async function processReminders(){
  const users=db.prepare(`SELECT u.id,u.email,u.name,COALESCE(p.email_reminders,0) email_reminders,COALESCE(p.daily_briefing,1) daily_briefing,COALESCE(p.weekly_summary,0) weekly_summary FROM users u LEFT JOIN preferences p ON p.user_id=u.id`).all();
  const local=new Date(),dateKey=local.toISOString().slice(0,10);
  for(const user of users){
    const tasks=db.prepare(`SELECT t.*,p.name project_name FROM tasks t JOIN projects p ON p.id=t.project_id WHERE p.owner_id=? AND t.status!='done' AND t.due_date IS NOT NULL`).all(user.id);
    const today=new Date();today.setHours(0,0,0,0);const tomorrow=new Date(today);tomorrow.setDate(tomorrow.getDate()+1);
    for(const t of tasks){
      const d=new Date(t.due_date),kind=d<today?"overdue":d<=tomorrow?"due-soon":null;if(!kind)continue;
      const title=kind==="overdue"?"Overdue task":"Task due soon",msg=`${t.title} · ${t.project_name} · due ${t.due_date}`,severity=kind==="overdue"?"danger":"warning";
      if(inserted(user.id,t.id,kind,"in-app"))notify(user.id,"deadline",title,msg,severity);
      if(user.email_reminders&&emailConfigured()&&inserted(user.id,t.id,kind,"email")){try{await sendEmail(user.email,`DevFlow: ${title}`,`${msg}\n\nOpen DevFlow to review the task.`)}catch(e){console.error("Email reminder failed:",e.message)}}
    }
    // Local development scheduler: daily digest after 08:00, weekly summary on Monday after 08:00.
    if(emailConfigured()&&local.getHours()>=8&&user.daily_briefing&&digestInserted(user.id,"daily",dateKey)){try{await sendDailyBriefingEmail(user.id)}catch(e){console.error("Daily briefing failed:",e.message)}}
    if(emailConfigured()&&local.getDay()===1&&local.getHours()>=8&&user.weekly_summary&&digestInserted(user.id,"weekly",dateKey)){try{await sendWeeklySummaryEmail(user.id)}catch(e){console.error("Weekly summary failed:",e.message)}}
  }
}

export async function sendDailyBriefingEmail(userId){
  const user=db.prepare("SELECT email,name FROM users WHERE id=?").get(userId);if(!user)return {sent:false,reason:"User not found"};
  const brief=dailyBriefing(userId);const body=`Good morning ${user.name},\n\n${brief.summary}\n\nNext tasks:\n${brief.next.map((t,i)=>`${i+1}. ${t.title} (${t.priority}, ${t.status})`).join("\n")||"No active tasks."}\n\n— DevFlow`;
  return sendEmail(user.email,"DevFlow Daily Briefing",body);
}
export async function sendWeeklySummaryEmail(userId){
  const user=db.prepare("SELECT email,name FROM users WHERE id=?").get(userId);if(!user)return {sent:false,reason:"User not found"};
  const counts=db.prepare(`SELECT COUNT(*) total,SUM(CASE WHEN t.status='done' THEN 1 ELSE 0 END) done,SUM(CASE WHEN t.status='in-progress' THEN 1 ELSE 0 END) progress FROM tasks t JOIN projects p ON p.id=t.project_id WHERE p.owner_id=?`).get(userId);
  return sendEmail(user.email,"DevFlow Weekly Execution Summary",`Hi ${user.name},\n\nTotal tasks: ${counts.total||0}\nCompleted: ${counts.done||0}\nIn progress: ${counts.progress||0}\n\nOpen DevFlow for project health, blockers and deadlines.\n\n— DevFlow`);
}
export function startReminderEngine(){processReminders().catch(console.error);const timer=setInterval(()=>processReminders().catch(console.error),15*60*1000);timer.unref?.();}
