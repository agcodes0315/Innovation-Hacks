# Task 4 Backend

## Run

```powershell
Copy-Item .env.example .env -Force
npm install
npm run dev
```

Health check:

```text
http://localhost:4000/api/health
```

## Security

- Passwords are hashed with bcrypt.
- Protected routes require a JWT bearer token.
- The SQLite file and `.env` are ignored by Git.
- Project/task queries are scoped to the authenticated owner.

## Optional local AI

Install Ollama, then:

```powershell
ollama pull llama3.2:3b
ollama serve
```

The backend calls `http://localhost:11434` by default.

If Ollama is unavailable, the endpoint still returns a deterministic fallback plan, but the response clearly marks it as `mode: "fallback"`. For the internship AI demonstration, use Ollama so the response shows `mode: "local-ai"`.
