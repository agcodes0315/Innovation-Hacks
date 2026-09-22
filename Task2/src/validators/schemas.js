import { z } from "zod";

const idParams = z.object({ id: z.string().uuid() });

export const userCreateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email(),
    role: z.string().trim().min(2).max(80).default("Developer"),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const userUpdateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    email: z.string().trim().email().optional(),
    role: z.string().trim().min(2).max(80).optional(),
  }).refine((v) => Object.keys(v).length > 0, "Provide at least one field"),
  params: idParams,
  query: z.object({}),
});

export const projectCreateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(500).default(""),
    ownerId: z.string().uuid(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const projectUpdateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(500).optional(),
    ownerId: z.string().uuid().optional(),
  }).refine((v) => Object.keys(v).length > 0, "Provide at least one field"),
  params: idParams,
  query: z.object({}),
});

export const taskCreateSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(180),
    description: z.string().trim().max(1000).default(""),
    projectId: z.string().uuid(),
    assigneeId: z.string().uuid().nullable().optional(),
    status: z.enum(["todo", "in-progress", "done"]).default("todo"),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    dueDate: z.string().datetime().nullable().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const taskUpdateSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(180).optional(),
    description: z.string().trim().max(1000).optional(),
    projectId: z.string().uuid().optional(),
    assigneeId: z.string().uuid().nullable().optional(),
    status: z.enum(["todo", "in-progress", "done"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    dueDate: z.string().datetime().nullable().optional(),
  }).refine((v) => Object.keys(v).length > 0, "Provide at least one field"),
  params: idParams,
  query: z.object({}),
});

export const taskStatusSchema = z.object({
  body: z.object({ status: z.enum(["todo", "in-progress", "done"]) }),
  params: idParams,
  query: z.object({}),
});

export const idSchema = z.object({ body: z.object({}), params: idParams, query: z.object({}) });
