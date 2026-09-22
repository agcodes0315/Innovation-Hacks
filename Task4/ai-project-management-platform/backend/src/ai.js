function extractJsonArray(text) {
  const cleaned = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start < 0 || end < start) {
    throw new Error(`Ollama response did not contain a JSON array: ${cleaned.slice(0, 300)}`);
  }

  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  if (!Array.isArray(parsed)) throw new Error("Ollama response JSON was not an array.");
  return parsed;
}

async function callOllama(prompt) {
  const baseUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.2:3b";

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      keep_alive: "10m",
      options: { temperature: 0.2 }
    }),
    signal: AbortSignal.timeout(120000)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Ollama HTTP ${response.status}: ${body.slice(0, 400)}`);
  }

  const data = await response.json();
  if (!data?.response) throw new Error("Ollama returned an empty response.");

  return { model, text: String(data.response).trim() };
}

export async function plan(project, count = 5) {
  const requestedCount = Math.max(1, Math.min(Number(count) || 5, 10));

  const prompt = `
You are a software project planning assistant.
Return ONLY a valid JSON array.
Do not use markdown fences.
Create exactly ${requestedCount} practical implementation tasks.

Every task must have:
{
  "title": "short actionable engineering task",
  "description": "one concise implementation description",
  "priority": "low" | "medium" | "high"
}

Project name:
${project?.name || "Untitled Project"}

Project description:
${project?.description || "No project description provided."}
`.trim();

  try {
    const result = await callOllama(prompt);

    const tasks = extractJsonArray(result.text)
      .slice(0, requestedCount)
      .map((item, index) => ({
        title: String(item?.title || `Task ${index + 1}`).slice(0, 180),
        description: String(item?.description || "").slice(0, 1200),
        priority: ["low", "medium", "high"].includes(String(item?.priority || "").toLowerCase())
          ? String(item.priority).toLowerCase()
          : "medium"
      }));

    if (!tasks.length) throw new Error("Ollama returned no usable tasks.");

    console.log(`[AI] Ollama generation succeeded with ${result.model}: ${tasks.length} task(s)`);

    return {
      mode: "local-ai",
      source: "ollama",
      model: result.model,
      tasks
    };
  } catch (error) {
    console.error("[AI] Ollama generation failed:", error.message);

    const name = project?.name || "project";
    return {
      mode: "fallback",
      source: "fallback",
      model: null,
      error: error.message,
      tasks: [
        { title: `Define ${name} requirements`, description: "Clarify scope, users, constraints, acceptance criteria and success metrics.", priority: "high" },
        { title: `Design ${name} architecture`, description: "Define components, data flow, interfaces and technical boundaries.", priority: "high" },
        { title: `Implement core ${name} workflow`, description: "Build the primary end-to-end workflow for the project.", priority: "high" },
        { title: "Add validation and failure states", description: "Handle invalid input, empty states, loading states and failures.", priority: "medium" },
        { title: `Test and document ${name}`, description: "Verify important scenarios and document setup, usage and decisions.", priority: "medium" }
      ].slice(0, requestedCount)
    };
  }
}

export async function explainHealth(health) {
  const fallback = `${health?.name || "This project"} is ${String(health?.label || "At Risk").toLowerCase()} with a health score of ${health?.score ?? 0}/100. It has ${health?.overdue ?? 0} overdue, ${health?.blocked ?? 0} blocked, ${health?.dueSoon ?? 0} due-soon, and ${health?.stale ?? 0} stale in-progress task(s). Prioritize overdue and blocked high-priority work before starting additional tasks.`;

  const prompt = `
You are a concise software delivery coach.
Explain this deterministic project-health result in 3 to 4 sentences.
Recommend the next practical action.
Do NOT change or invent the health score.

Project: ${health?.name || "Unknown"}
Score: ${health?.score ?? 0}/100
Label: ${health?.label || "Unknown"}
Completion: ${health?.completion ?? 0}%
Overdue: ${health?.overdue ?? 0}
Due soon: ${health?.dueSoon ?? 0}
Blocked: ${health?.blocked ?? 0}
Stale: ${health?.stale ?? 0}
`.trim();

  try {
    const result = await callOllama(prompt);
    console.log(`[AI] Health explanation succeeded with ${result.model}`);
    return { mode: "local-ai", source: "ollama", model: result.model, text: result.text || fallback };
  } catch (error) {
    console.error("[AI] Health explanation failed:", error.message);
    return { mode: "fallback", source: "fallback", model: null, error: error.message, text: fallback };
  }
}
