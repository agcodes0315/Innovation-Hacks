# Task 3 persistence demo

After starting the server:

```powershell
$users = Invoke-RestMethod http://localhost:4000/api/users
$projects = Invoke-RestMethod http://localhost:4000/api/projects

$body = @{
  projectId = $projects[0].id
  assigneeId = $users[0].id
  title = "Persistence proof"
  description = "This row should remain after server restart."
  status = "todo"
  priority = "high"
  dueDate = $null
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:4000/api/tasks `
  -ContentType "application/json" `
  -Body $body

Invoke-RestMethod http://localhost:4000/api/tasks
```

Stop the server with `Ctrl+C`, start it again, then run the final GET again. The row remains in SQLite.
