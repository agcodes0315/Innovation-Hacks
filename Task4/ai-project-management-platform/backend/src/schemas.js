import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100)
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

export const projectCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1200).default(""),
  status: z.enum(["active", "paused", "completed"]).default("active")
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const taskCreateSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(1500).default(""),
  status: z.enum(["todo", "in-progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().nullable().optional()
});

export const taskUpdateSchema = taskCreateSchema.partial();

export const aiGenerateSchema = z.object({
  projectId: z.string().min(1),
  count: z.number().int().min(3).max(8).default(5)
});
