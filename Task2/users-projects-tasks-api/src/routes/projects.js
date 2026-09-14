import { Router } from "express";
import { randomUUID } from "node:crypto";
import { store } from "../data/store.js";
import { HttpError } from "../utils/httpError.js";
import { validate } from "../middleware/validate.js";
import { idSchema, projectCreateSchema, projectUpdateSchema } from "../validators/schemas.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ success: true, data: store.projects });
});

router.post("/", validate(projectCreateSchema), (req, res, next) => {
  try {
    if (!store.users.some((u) => u.id === req.body.ownerId)) throw new HttpError(400, "ownerId does not reference an existing user");
    const now = new Date().toISOString();
    const project = { id: randomUUID(), ...req.body, createdAt: now, updatedAt: now };
    store.projects.push(project);
    res.status(201).json({ success: true, data: project });
  } catch (error) { next(error); }
});

router.get("/:id", validate(idSchema), (req, res, next) => {
  try {
    const project = store.projects.find((p) => p.id === req.params.id);
    if (!project) throw new HttpError(404, "Project not found");
    const tasks = store.tasks.filter((t) => t.projectId === project.id);
    res.json({ success: true, data: { ...project, tasks } });
  } catch (error) { next(error); }
});

router.patch("/:id", validate(projectUpdateSchema), (req, res, next) => {
  try {
    const project = store.projects.find((p) => p.id === req.params.id);
    if (!project) throw new HttpError(404, "Project not found");
    if (req.body.ownerId && !store.users.some((u) => u.id === req.body.ownerId)) throw new HttpError(400, "ownerId does not reference an existing user");
    Object.assign(project, req.body, { updatedAt: new Date().toISOString() });
    res.json({ success: true, data: project });
  } catch (error) { next(error); }
});

router.delete("/:id", validate(idSchema), (req, res, next) => {
  try {
    const index = store.projects.findIndex((p) => p.id === req.params.id);
    if (index === -1) throw new HttpError(404, "Project not found");
    if (store.tasks.some((t) => t.projectId === req.params.id)) throw new HttpError(409, "Delete project tasks before deleting the project");
    store.projects.splice(index, 1);
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
