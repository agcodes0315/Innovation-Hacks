import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
const router=Router(); router.use(requireAuth);
const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY||"");
const schema=z.object({projectName:z.string().min(2).max(120),projectDescription:z.string().max(1200).default(""),count:z.number().int().min(3).max(10).default(5)});
router.post("/generate-tasks",async(req,res,next)=>{try{const p=schema.safeParse(req.body); if(!p.success)return res.status(400).json({success:false,error:{message:"Validation failed",details:p.error.flatten()}}); if(!process.env.GEMINI_API_KEY)return res.status(503).json({success:false,error:{message:"AI feature is not configured"}}); const model=genAI.getGenerativeModel({model:"gemini-1.5-flash"}); const prompt=`Generate exactly ${p.data.count} implementation tasks for project: ${p.data.projectName}. Context: ${p.data.projectDescription}. Return ONLY a JSON array. Each item must contain title, description, priority where priority is LOW, MEDIUM, or HIGH.`; const result=await model.generateContent(prompt); const raw=result.response.text().replace(/```json|```/g,"").trim(); const tasks=JSON.parse(raw); res.json({success:true,data:tasks});}catch(e){next(e);}});
export default router;
