function extractJsonArray(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start < 0 || end < start) throw new Error("No JSON array in model output");
  return JSON.parse(text.slice(start, end + 1));
}

function normalizeTasks(items, count) {
  return items
    .slice(0, count)
    .map((item, index) => ({
      title: String(item.title || `Project task ${index + 1}`).slice(0, 180),
      description: String(item.description || "").slice(0, 1500),
      priority: ["low", "medium", "high"].includes(item.priority)
        ? item.priority
        : "medium"
    }));
}

export async function generateTasksWithLocalAI(project, count) {
  const url = process.env.OLLAMA_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.2:3b";

  const prompt = `
You are a software project planning assistant.
Return ONLY a valid JSON array with exactly ${count} task objects.
Each object must contain:
- "title": concise engineering task title
- "description": one sentence
- "priority": "low", "medium", or "high"

Project: ${project.name}
Description: ${project.description || "No description provided."}
`;

  try {
    const response = await fetch(`${url}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: "json"
      }),
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) throw new Error(`Ollama responded ${response.status}`);

    const data = await response.json();
    const parsed = extractJsonArray(data.response || "");
    const tasks = normalizeTasks(parsed, count);
    if (tasks.length < 3) throw new Error("Model returned too few tasks");

    return { mode: "local-ai", model, tasks };
  } catch {
    const base = project.name;
    const fallback = [
      {
        title: `Define ${base} requirements`,
        description: "Clarify scope, acceptance criteria, users, and expected outcomes.",
        priority: "high"
      },
      {
        title: `Design ${base} architecture`,
        description: "Define the main components, data flow, interfaces, and technical boundaries.",
        priority: "high"
      },
      {
        title: `Implement core ${base} workflow`,
        description: "Build the primary end-to-end workflow and connect the required components.",
        priority: "high"
      },
      {
        title: `Add validation and error handling`,
        description: "Handle invalid input, empty states, failures, and edge cases consistently.",
        priority: "medium"
      },
      {
        title: `Test and document ${base}`,
        description: "Verify key scenarios and update setup, API, and usage documentation.",
        priority: "medium"
      },
      {
        title: `Polish responsive experience`,
        description: "Review accessibility, mobile behavior, loading states, and visual consistency.",
        priority: "medium"
      },
      {
        title: `Prepare deployment`,
        description: "Configure production environment variables and verify the release build.",
        priority: "low"
      },
      {
        title: `Record final demonstration`,
        description: "Prepare a concise end-to-end demo of the completed project.",
        priority: "low"
      }
    ];

    return {
      mode: "fallback",
      model: null,
      tasks: fallback.slice(0, count)
    };
  }
}
