⚡ DevFlow

Developer Execution Intelligence — Projects, Risk, Reminders & Local AI

A local-first full-stack workspace that helps developers turn project plans into execution, detect delivery risk early, and act before deadlines become failures.







🌍 The Problem DevFlow Solves

Modern software teams rarely fail because they do not have a task list. They fail because execution context is scattered.

A developer may know what needs to be built, but still lack a clear answer to questions such as:

Which task is actually blocking delivery?

Which deadline is becoming risky?

Which project is unhealthy before it becomes late?

Who is overloaded?

Which in-progress task has quietly gone stale?

What should be worked on next?

How can a project manager understand delivery health without manually reading every task?

How can AI help without becoming the source of truth?

Typical project tools record work. DevFlow is designed to interpret execution signals around that work.

The result is a single workspace for:

planning → ownership → dependencies → execution → risk detection → reminders → AI-assisted action

💡 Core Product Idea

Project Context
      ↓
Tasks + Assignees + Priorities + Deadlines
      ↓
Dependencies / Blockers
      ↓
Todo → In Progress → Done
      ↓
Deterministic Risk Signals
      ↓
Project Health + Workload Intelligence
      ↓
In-App + Browser + Optional Email Reminders
      ↓
Local AI Explanation & Planning

Deterministic systems identify risk. AI explains and assists — it does not invent the underlying score.

That separation is intentional.

Project-health signals are calculated from real workspace data. The local AI layer is then used to explain those signals, generate project tasks, and suggest next actions.

💼 Why This Matters

DevFlow targets a common operational problem in software delivery: teams often discover risk too late.

Without execution visibility, organisations can spend time on:

manual project-status checks,

repeated follow-ups,

identifying who owns blocked work,

discovering overdue tasks after deadlines pass,

redistributing overloaded developers,

rebuilding context across multiple tools,

creating repetitive project plans.

DevFlow brings those signals together in one workflow.

Potential Business Impact

For a real engineering organisation, a platform following this model could help:

Business Need

DevFlow Capability

Potential Impact

Earlier delivery-risk visibility

Project Health

Risks can be surfaced before a deadline is missed

Less manual project follow-up

Daily Briefing + reminders

Reduces repetitive status-checking work

Faster blocker identification

Task dependencies

Teams can see what is preventing downstream work

Better workload visibility

Workload Intelligence

Makes uneven task distribution easier to identify

Faster project setup

Local AI task generation

Reduces repetitive planning effort

Better accountability

Assignees + Activity Log

Clearer ownership and traceability

Deadline awareness

Calendar + due-soon/overdue signals

Important work is less likely to disappear in a backlog

Lower AI operating cost for demos/local use

Ollama

AI features can run without a paid cloud API

Privacy-friendly AI experimentation

Local model execution

Project context can stay on the local machine

DevFlow does not claim to replace enterprise project-management platforms. It demonstrates how project tracking can evolve into execution intelligence.

🎓 Internship Task Progression

DevFlow was built as one product across four Innovation Hacks Full Stack Development Internship tasks.

Task

Deliverable

DevFlow Implementation

Task 1

Developer Productivity Dashboard

Responsive React dashboard, navigation, task/project widgets, progress and analytics

Task 2

Users, Projects & Tasks REST API

Express REST API, CRUD, validation, filtering, centralized errors

Task 3

Persistent Data Layer

SQLite persistence, relationships, constraints and durable CRUD

Task 4

AI-Powered Project & Task Management Platform

Authentication, projects, tasks, assignments, dependencies, analytics, reminders, risk intelligence and local AI

Task 1: Interface
        ↓
Task 2: API
        ↓
Task 3: Persistence
        ↓
Task 4: Authenticated + AI-Assisted Execution Intelligence

🖥️ Final Product Experience

The Task 4 workspace contains:

WORKSPACE
├── Overview
├── Projects
├── My Tasks
├── Analytics
├── Calendar
├── Project Health
├── AI Briefing
├── Activity Log
├── Notifications
└── Settings

Overview

The command centre shows:

completed tasks,

total tasks,

overdue work,

blocked work,

daily execution risk,

project-health context,

focus timer.

Projects

Users can:

create projects,

update projects,

delete projects,

track completion,

inspect delivery health,

generate structured project tasks using local AI.

Tasks

Each task can contain:

title,

description,

project,

assignee,

priority,

due date,

status,

dependency / blocker,

AI-generated flag.

Workflow:

Todo → In Progress → Done

🔗 Dependency & Blocker Intelligence

A task can depend on another task from the same project.

Database Schema
      ↓ blocks
Authentication API
      ↓ blocks
Frontend Login Integration

If the prerequisite task is unfinished, DevFlow can identify the downstream work as blocked.

This answers a practical delivery question:

Which unfinished task is preventing other work from moving?

❤️ Deterministic Project Health

Project health is calculated from execution signals including:

completion percentage,

overdue tasks,

tasks due soon,

blocked tasks,

stale in-progress tasks.

Health bands:

80–100  Healthy
60–79   Watch
0–59    At Risk

Example:

Secure Developer Portal
Health: 67 / 100 — WATCH

72% complete
2 overdue
1 blocked
1 due soon
0 stale

The score itself is not generated by an LLM.

Ollama receives the deterministic health result and can explain why the project is at risk and recommend the next practical action.

👥 Workload Intelligence

DevFlow analyses active work by assignee.

A workspace member is flagged for workload pressure when they have either:

7+ active tasks
OR
4+ active high-priority tasks

The purpose is to make workload imbalance visible before more work is assigned.

⏰ Deadline & Reminder Engine

The backend contains a reminder engine that checks deadlines every 15 minutes while the server is running.

It detects:

Due tomorrow → Task Due Soon
Past due     → Overdue Task

Reminder channels:

Deadline Signal
      ↓
┌───────────────┬─────────────────────┬─────────────────────┐
│ In-App Alert  │ Browser / OS Popup  │ Optional Email      │
└───────────────┴─────────────────────┴─────────────────────┘

A reminder log is used to avoid repeatedly producing the same deadline event.

🔔 Browser Notifications

DevFlow uses the browser Notification API.

From Settings or Notifications:

Enable browser alerts

Once permission is granted, unread DevFlow notifications can surface as desktop notifications while the web application is open.

✉️ Optional Email Reminders

Email delivery is optional.

When SMTP is configured, DevFlow supports:

due-soon reminders,

overdue reminders,

daily execution briefings,

weekly execution summaries,

test email delivery.

Backend environment example:

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-google-app-password
EMAIL_FROM=DevFlow <your-email@gmail.com>

Use a Google App Password rather than your normal Gmail password. Never commit .env.

🧠 Daily Developer Briefing

The briefing combines deterministic delivery signals:

overdue tasks,

due-soon tasks,

blocked tasks,

stale in-progress tasks,

recommended next work.

Example:

2 overdue · 1 due soon · 1 blocked · 0 stale

Recommended execution order
1. Fix authentication API       High
2. Complete database migration  High
3. Integrate login frontend     Medium

The goal is simple: make the next important action visible without manually inspecting every task.

🤖 Local AI

DevFlow uses Ollama to run AI locally.

AI Task Generation

Project Name + Description
          ↓
Local Ollama
          ↓
Structured Engineering Tasks
          ↓
Persisted in SQLite
          ↓
Normal DevFlow Workflow

Generated tasks become normal project tasks rather than temporary chat output.

AI Health Explanation

DevFlow passes deterministic health data to the local model.

The model can explain:

why a project is at risk,

what deserves attention first,

what next action can reduce delivery risk.

If Ollama is unavailable, DevFlow explicitly labels the result as a fallback instead of pretending AI ran.

🧾 Activity & Audit Log

Meaningful workspace events are persisted, including:

registration and login,

project creation/update/deletion,

task creation/update/deletion,

member addition,

AI task generation,

task completion.

This gives the workspace traceability beyond a simple task board.

🔐 Authentication & Security

DevFlow includes:

registration,

login/logout,

bcrypt password hashing,

JWT authentication,

protected backend routes,

protected frontend routes,

Zod request validation,

SQLite constraints,

user-scoped project/task queries,

.env configuration.

Credentials
    ↓
bcrypt
    ↓
JWT
    ↓
Protected API + Workspace

🗄️ Persistent Data Layer

The final platform stores:

users
members
projects
tasks
activities
notifications
preferences
reminder_log
digest_log

Relationships:

User
 ├── Workspace Members
 ├── Projects
 ├── Activity
 ├── Notifications
 └── Preferences

Project
 └── Tasks
      ├── Assignee
      └── Optional Blocker Task

SQLite persistence allows workspace data to survive application/server restarts.

🏗️ Architecture

flowchart TD
    UI[React + Vite Frontend]
    API[Express REST API]
    AUTH[JWT + bcrypt]
    VALID[Zod Validation]
    DB[(SQLite)]
    HEALTH[Project Health Engine]
    REMIND[Reminder Engine]
    BROWSER[Browser Notifications]
    EMAIL[Optional SMTP Email]
    AI[Local Ollama]

    UI --> API
    API --> AUTH
    API --> VALID
    API --> DB
    API --> HEALTH
    API --> REMIND
    REMIND --> DB
    REMIND --> EMAIL
    UI --> BROWSER
    API --> AI
    AI --> DB

🛠️ Tech Stack

Layer

Technology

Frontend

React + Vite

Routing

React Router

UI

Custom responsive CSS

Icons

Lucide React

Backend

Node.js + Express

Validation

Zod

Authentication

JWT

Password Hashing

bcryptjs

Database

SQLite using Node node:sqlite

Email

Nodemailer + optional SMTP

Browser Alerts

Web Notification API

AI

Ollama local model

Configuration

dotenv

📡 Task 4 API Surface

Authentication

Method

Endpoint

Purpose

POST

/api/auth/register

Register

POST

/api/auth/login

Login

GET

/api/auth/me

Current authenticated user

Workspace

Method

Endpoint

Purpose

GET

/api/dashboard

Dashboard metrics

GET/POST

/api/members

Workspace members

GET

/api/analytics

Status, priority and workload analytics

GET

/api/project-health

Deterministic project-health scores

GET

/api/briefing

Daily execution briefing

GET

/api/activity

Audit/activity history

Projects & Tasks

Method

Endpoint

Purpose

GET/POST

/api/projects

List/create projects

GET/PATCH/DELETE

/api/projects/:id

Project operations

GET/POST

/api/tasks

Search/create tasks

PATCH/DELETE

/api/tasks/:id

Update/delete tasks

Notifications & Reminders

Method

Endpoint

Purpose

GET

/api/notifications

Notification centre

PATCH

/api/notifications/:id/read

Mark notification read

POST

/api/notifications/run-reminders

Run reminder scan

GET/PATCH

/api/preferences

Reminder preferences

POST

/api/reminders/test-email

Test SMTP

POST

/api/reminders/daily-briefing

Send daily briefing

POST

/api/reminders/weekly-summary

Send weekly summary

AI

Method

Endpoint

Purpose

POST

/api/ai/generate-tasks

Generate project tasks

GET

/api/ai/project-health/:id

Explain deterministic health

📁 Repository Structure

Innovation-Hacks/
├── Task1/
│   └── dashboard/
├── Task2/
│   └── users-projects-tasks-api/
├── Task3/
│   └── persistent-data-layer/
├── Task4/
│   └── ai-project-management-platform/
│       ├── backend/
│       └── frontend/
├── .gitignore
├── package-lock.json
├── package.json
└── README.md

▶️ Run the Entire Project

Requirements

Node.js 22.5+
npm

From the repository root:

npm install
npm run dev

Services:

Component

URL

Task 1 Dashboard

http://localhost:5173

Task 2 REST API

http://localhost:4002/api/health

Task 3 Persistent API

http://localhost:4003/api/health

Task 4 Final Product

http://localhost:5174

Task 4 Backend

http://localhost:4004/api/health

Stop services using:

Ctrl + C

🤖 Run Ollama Locally

Download the model:

ollama pull llama3.2:3b

Verify that Ollama is running:

Invoke-RestMethod http://localhost:11434/api/tags

If the Ollama service is not already running:

ollama serve

Optionally warm the model:

ollama run llama3.2:3b "Reply with exactly: OK"

Then open DevFlow and use:

Projects → AI Generate

or:

Project Health → Explain

Successful local generation is identified as:

LOCAL AI

If Ollama is unavailable, the application explicitly displays:

FALLBACK PLANNER

🎥 Recommended Demo Flow

1. Login
2. Overview dashboard
3. Create a project
4. Add workspace members
5. Create and assign tasks
6. Add priorities and deadlines
7. Add a dependency
8. Move work through Todo → In Progress → Done
9. Show Analytics
10. Show Calendar
11. Show Project Health
12. Explain health using local AI
13. Show AI Briefing
14. Generate project tasks using Ollama
15. Show Notifications
16. Show Activity Log
17. Show Settings / browser notifications
18. Restart the backend and demonstrate persistence

🚧 Scope & Production Evolution

DevFlow is an internship-scale full-stack product and local development prototype.

SQLite and local Ollama keep the application reproducible and free to run.

A larger production implementation could evolve toward:

PostgreSQL,

background queues,

service workers / web push,

OAuth,

richer RBAC,

automated testing,

observability,

CI/CD,

cloud deployment,

team-level historical delivery analytics.

👩‍💻 Author

Agrima Saxena

Solo Developer · Full-Stack Engineering · AI/ML · Cloud · Security

<table>
<tr>
<td width="60" align="center">
<a href="https://www.linkedin.com/in/agrima-saxena-142960426/" title="LinkedIn">
<img src="https://img.icons8.com/color/48/linkedin.png" width="32" height="32" alt="LinkedIn"/>
</a>
</td>

<td width="60" align="center">
<a href="mailto:agrimalc@gmail.com" title="Email">
<img src="https://img.icons8.com/color/48/gmail-new.png" width="32" height="32" alt="Email"/>
</a>
</td>

<td width="60" align="center">
<a href="https://github.com/agcodes0315" title="GitHub">
<img src="https://img.icons8.com/ios-glyphs/48/ffffff/github.png" width="32" height="32" alt="GitHub"/>
</a>
</td>
</tr>
</table>

Built independently as a full-stack internship project for Innovation Hacks, progressing from dashboard design to REST APIs, persistent data, authentication, execution intelligence and local AI-assisted project management.

⭐ If you found DevFlow useful or interesting, consider starring the repository.

🔗 DevFlow is not just another task manager.

It is designed to help developers understand what needs attention before delivery problems become failures.

Execution visibility · Dependency awareness · Delivery risk · Proactive reminders · Local AI assistance