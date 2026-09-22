# Task 4 — AI-Powered Developer Execution Platform

The final DevFlow platform adds secure authentication, project/task CRUD, explicit assignees, deadlines, dependencies, workload analytics, deterministic project-health scoring, activity/audit logging, in-app notifications, browser desktop alerts, optional SMTP email reminders, a daily briefing and local Ollama planning/explanations.

Run from the repository root:

```powershell
npm install
npm run dev
```

Open `http://localhost:5174`.

For local AI:

```powershell
ollama pull llama3.2:3b
ollama serve
```

For optional Gmail reminders, copy `.env.example` to `.env` and fill `SMTP_USER`, `SMTP_PASS` (Google App Password), and `EMAIL_FROM`.
