import { Router } from "express";
import { randomUUID } from "node:crypto";
import { store } from "../data/store.js";
import { HttpError } from "../utils/httpError.js";
import { validate } from "../middleware/validate.js";
import { idSchema, userCreateSchema, userUpdateSchema } from "../validators/schemas.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ success: true, data: store.users });
});

router.post("/", validate(userCreateSchema), (req, res, next) => {
  try {
    const input = req.validated.body;
    if (store.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new HttpError(409, "A user with this email already exists");
    }
    const now = new Date().toISOString();
    const user = { id: randomUUID(), ...input, createdAt: now, updatedAt: now };
    store.users.push(user);
    res.status(201).json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.get("/:id", validate(idSchema), (req, res, next) => {
  try {
    const user = store.users.find((u) => u.id === req.params.id);
    if (!user) throw new HttpError(404, "User not found");
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.patch("/:id", validate(userUpdateSchema), (req, res, next) => {
  try {
    const user = store.users.find((u) => u.id === req.params.id);
    if (!user) throw new HttpError(404, "User not found");
    if (req.body.email && store.users.some((u) => u.id !== user.id && u.email.toLowerCase() === req.body.email.toLowerCase())) {
      throw new HttpError(409, "A user with this email already exists");
    }
    Object.assign(user, req.body, { updatedAt: new Date().toISOString() });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.delete("/:id", validate(idSchema), (req, res, next) => {
  try {
    const index = store.users.findIndex((u) => u.id === req.params.id);
    if (index === -1) throw new HttpError(404, "User not found");
    if (store.projects.some((p) => p.ownerId === req.params.id) || store.tasks.some((t) => t.assigneeId === req.params.id)) {
      throw new HttpError(409, "User is referenced by an existing project or task");
    }
    store.users.splice(index, 1);
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
