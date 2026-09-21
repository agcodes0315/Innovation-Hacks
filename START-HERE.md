# Start Here

## One command

Open PowerShell in this folder and run:

```powershell
powershell -ExecutionPolicy Bypass -File ".\run-all.ps1"
```

The script installs missing dependencies, copies missing `.env` files, and starts all five development services.

| Service | URL |
|---|---|
| Task 1 dashboard | http://localhost:5173 |
| Task 2 API health | http://localhost:4002/api/health |
| Task 3 persistent API health | http://localhost:4003/api/health |
| Task 4 full-stack application | http://localhost:5174 |
| Task 4 backend health | http://localhost:4004/api/health |

For the final platform, use **Task 4 at http://localhost:5174**.

## Local AI

Ollama is optional while developing, but use it for the final AI demonstration.

```powershell
ollama pull llama3.2:3b
ollama serve
```

The Task 4 backend checks `http://localhost:11434`.
