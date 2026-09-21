function extract(text){const a=text.indexOf("["),b=text.lastIndexOf("]");if(a<0||b<a)throw new Error("No JSON array");return JSON.parse(text.slice(a,b+1))}
export async function plan(project,count){
 const url=process.env.OLLAMA_URL||"http://localhost:11434",model=process.env.OLLAMA_MODEL||"llama3.2:3b";
 const prompt=`Return ONLY a valid JSON array of exactly ${count} software project tasks. Each item: {"title":"...","description":"...","priority":"low|medium|high"}. Project: ${project.name}. Context: ${project.description||"No description."}`;
 try{
  const r=await fetch(`${url}/api/generate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model,prompt,stream:false}),signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw new Error("Ollama unavailable");
  const d=await r.json(),items=extract(d.response||"").slice(0,count).map((x,i)=>({title:String(x.title||`Task ${i+1}`).slice(0,180),description:String(x.description||"").slice(0,1000),priority:["low","medium","high"].includes(x.priority)?x.priority:"medium"}));
  if(items.length<3)throw new Error("Too few");
  return {mode:"local-ai",model,tasks:items};
 }catch{
  const n=project.name;
  return {mode:"fallback",model:null,tasks:[
   {title:`Define ${n} requirements`,description:"Clarify users, scope, acceptance criteria and success metrics.",priority:"high"},
   {title:`Design ${n} architecture`,description:"Define components, data flow, interfaces and technical boundaries.",priority:"high"},
   {title:`Implement core ${n} workflow`,description:"Build the primary end-to-end user flow.",priority:"high"},
   {title:"Add validation and failure states",description:"Handle invalid input, loading, empty and error states.",priority:"medium"},
   {title:`Test and document ${n}`,description:"Verify important scenarios and update technical documentation.",priority:"medium"}
  ].slice(0,count)};
 }
}
