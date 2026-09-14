# Quick API examples

PowerShell examples:

```powershell
Invoke-RestMethod http://localhost:4000/api/health
Invoke-RestMethod http://localhost:4000/api/users
Invoke-RestMethod http://localhost:4000/api/projects
Invoke-RestMethod http://localhost:4000/api/tasks
```

Create a user:

```powershell
$body = @{
  name = "Test User"
  email = "test@example.com"
  role = "Developer"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:4000/api/users `
  -ContentType "application/json" `
  -Body $body
```
