# START HERE — Windows / VS Code

Unzip this package into:

```text
C:\Users\Lenovo\Desktop\Innovation Hacks\
```

so you end up with `Task2`, `Task3`, and `Task4` alongside your existing `Task1`.

## Task 2

```powershell
cd "C:\Users\Lenovo\Desktop\Innovation Hacks\Task2\users-projects-tasks-api"
Copy-Item .env.example .env -Force
npm install
npm run dev
```

Test:

```text
http://localhost:4000/api/health
```

## Task 3

Stop Task 2 first with `Ctrl+C`, then:

```powershell
cd "C:\Users\Lenovo\Desktop\Innovation Hacks\Task3\persistent-data-layer"
Copy-Item .env.example .env -Force
npm install
npm run dev
```

The SQLite database is created automatically at `data/devflow.db`.

Test:

```text
http://localhost:4000/api/health
```

## Task 4

Open **two terminals**.

Backend:

```powershell
cd "C:\Users\Lenovo\Desktop\Innovation Hacks\Task4\ai-project-management-platform\backend"
Copy-Item .env.example .env -Force
npm install
npm run dev
```

Frontend:

```powershell
cd "C:\Users\Lenovo\Desktop\Innovation Hacks\Task4\ai-project-management-platform\frontend"
Copy-Item .env.example .env -Force
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

Register a new account and use the application.

### Optional local AI

The platform works without Ollama by using a clearly identified fallback task planner. For a genuine local LLM demo, install Ollama and run:

```powershell
ollama pull llama3.2:3b
ollama serve
```

Then use the **AI Generate** button on a project. No cloud API key is needed.
