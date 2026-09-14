import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const schema = z.object({
  projectName: z.string().min(2).max(120),
  projectDescription: z.string().max(1200).default(""),
  count: z.number().int().min(3).max(10).default(5),
});

router.post("/generate-tasks", async (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          details: parsed.error.flatten(),
        },
      });
    }

    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL || "llama3.2:3b";

    const prompt = `Generate exactly ${parsed.data.count} practical software implementation tasks for this project.\nProject: ${parsed.data.projectName}\nContext: ${parsed.data.projectDescription}\nReturn ONLY valid JSON as an array. Each item must contain: title, description, priority. priority must be LOW, MEDIUM, or HIGH. Do not include markdown fences or any explanation.`;

    let response;
    try {
      response = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          format: "json",
        }),
      });
    } catch {
      return res.status(503).json({
        success: false,
        error: {
          message:
            "Local AI is not running. Start Ollama with `ollama serve` and make sure the configured model is installed.",
        },
      });
    }

    if (!response.ok) {
      const body = await response.text();
      return res.status(503).json({
        success: false,
        error: {
          message: `Ollama returned ${response.status}`,
          details: body,
        },
      });
    }

    const result = await response.json();
    const raw = String(result.response || "").trim();
    let generated = JSON.parse(raw);

    if (!Array.isArray(generated)) {
      generated = generated.tasks;
    }

    if (!Array.isArray(generated)) {
      throw new Error("AI response did not contain a task array");
    }

    const tasks = generated.slice(0, parsed.data.count).map((task, index) => ({
      title: String(task.title || `Generated Task ${index + 1}`).slice(0, 180),
      description: String(task.description || "").slice(0, 1000),
      priority: ["LOW", "MEDIUM", "HIGH"].includes(
        String(task.priority || "MEDIUM").toUpperCase()
      )
        ? String(task.priority).toUpperCase()
        : "MEDIUM",
    }));

    return res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
});

export default router;
