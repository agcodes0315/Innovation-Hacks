import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
const router=Router(); router.use(requireAuth);
router.get("/",async(req,res,next)=>{try{const projects=await prisma.project.findMany({where:{ownerId:req.user.id},include:{tasks:true},orderBy:{updatedAt:"desc"}}); const tasks=projects.flatMap(p=>p.tasks); const completed=tasks.filter(t=>t.status==="DONE").length; res.json({success:true,data:{projects:projects.length,totalTasks:tasks.length,completedTasks:completed,inProgressTasks:tasks.filter(t=>t.status==="IN_PROGRESS").length,completionRate:tasks.length?Math.round(completed/tasks.length*100):0,recentProjects:projects.slice(0,5)}});}catch(e){next(e);}});
export default router;
