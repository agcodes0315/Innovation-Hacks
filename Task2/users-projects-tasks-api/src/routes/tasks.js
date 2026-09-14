import { Router } from "express";
import { randomUUID } from "node:crypto";
import { store } from "../data/store.js";
import { HttpError } from "../utils/httpError.js";
import { validate } from "../middleware/validate.js";
import { idSchema, taskCreateSchema, taskStatusSchema, taskUpdateSchema } from "../validators/schemas.js";

const router = Router();

function validateReferences(body) {
  if (body.projectId && !store.projects.some((p) => p.id === body.projectId)) throw new HttpError(400, "projectId does not reference an existing project");
  if (body.assigneeId && !store.users.some((u) => u.id === body.assigneeId)) throw new HttpError(400, "assigneeId does not reference an existing user");
}

router.get("/", (req, res) => {
  let data = [...store.tasks];
  const { status, projectId, assigneeId, q } = req.query;
  if (status) data = data.filter((t) => t.status === status);
  if (projectId) data = data.filter((t) => t.projectId === projectId);
  if (assigneeId) data = data.filter((t) => t.assigneeId === assigneeId);
  if (q) {
    const query = String(q).toLowerCase();
    data = data.filter((t) => t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query));
  }
  res.json({ success: true, data });
});

router.post("/", validate(taskCreateSchema), (req, res, next) => {
  try {
    validateReferences(req.body);
    const now = new Date().toISOString();
    const task = { id: randomUUID(), ...req.body, assigneeId: req.body.assigneeId ?? null, dueDate: req.body.dueDate ?? null, createdAt: now, updatedAt: now };
    store.tasks.push(task);
    res.status(201).json({ success: true, data: task });
  } catch (error) { next(error); }
});

router.get("/:id", validate(idSchema), (req, res, next) => {
  try {
    const task = store.tasks.find((t) => t.id === req.params.id);
    if (!task) throw new HttpError(404, "Task not found");
    res.json({ success: true, data: task });
  } catch (error) { next(error); }
});

router.patch("/:id", validate(taskUpdateSchema), (req, res, next) => {
  try {
    const task = store.tasks.find((t) => t.id === req.params.id);
    if (!task) throw new HttpError(404, "Task not found");
    validateReferences(req.body);
    Object.assign(task, req.body, { updatedAt: new Date().toISOString() });
    res.json({ success: true, data: task });
  } catch (error) { next(error); }
});

router.patch("/:id/status", validate(taskStatusSchema), (req, res, next) => {
  try {
    const task = store.tasks.find((t) => t.id === req.params.id);
    if (!task) throw new HttpError(404, "Task not found");
    task.status = req.body.status;
    task.updatedAt = new Date().toISOString();
    res.json({ success: true, data: task });
  } catch (error) { next(error); }
});

router.delete("/:id", validate(idSchema), (req, res, next) => {
  try {
    const index = store.tasks.findIndex((t) => t.id === req.params.id);
    if (index === -1) throw new HttpError(404, "Task not found");
    store.tasks.splice(index, 1);
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
