import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  role: z.string().trim().min(2).max(60).default("Developer")
});
export const userUpdateSchema = userCreateSchema.partial();

export const projectCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).default(""),
  ownerId: z.string().min(1),
  status: z.enum(["active", "paused", "completed"]).default("active")
});
export const projectUpdateSchema = projectCreateSchema.partial();

export const taskCreateSchema = z.object({
  projectId: z.string().min(1),
  assigneeId: z.string().min(1).nullable().optional(),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(1500).default(""),
  status: z.enum(["todo", "in-progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().datetime().nullable().optional()
});
export const taskUpdateSchema = taskCreateSchema.partial();
export const taskStatusSchema = z.object({
  status: z.enum(["todo", "in-progress", "done"])
});
