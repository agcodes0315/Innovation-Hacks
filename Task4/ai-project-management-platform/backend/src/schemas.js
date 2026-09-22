import { z } from "zod";

export const register=z.object({name:z.string().trim().min(2).max(80),email:z.string().email(),password:z.string().min(8).max(100)});
export const login=z.object({email:z.string().email(),password:z.string().min(1)});
export const project=z.object({name:z.string().trim().min(2).max(120),description:z.string().trim().max(1200).default(""),status:z.enum(["active","paused","completed"]).default("active")});
export const member=z.object({name:z.string().trim().min(2).max(80),email:z.string().email(),role:z.string().trim().min(2).max(60).default("Developer")});
export const task=z.object({
  projectId:z.string(),
  assigneeId:z.string().nullable().optional(),
  blockedByTaskId:z.string().nullable().optional(),
  title:z.string().trim().min(2).max(180),
  description:z.string().trim().max(1500).default(""),
  status:z.enum(["todo","in-progress","done"]).default("todo"),
  priority:z.enum(["low","medium","high"]).default("medium"),
  dueDate:z.string().nullable().optional()
});
export const ai=z.object({projectId:z.string(),count:z.number().int().min(3).max(8).default(5)});
export const preferences=z.object({browserNotifications:z.boolean().optional(),emailReminders:z.boolean().optional(),dailyBriefing:z.boolean().optional(),weeklySummary:z.boolean().optional()});
