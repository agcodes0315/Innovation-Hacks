⚡ DevFlow

AI-Powered Developer Execution Workspace

Plan work. Track execution. Preserve context. Generate the next steps locally with AI.

DevFlow is a full-stack developer productivity platform built as one connected product across the four Innovation Hacks Full Stack Development Internship tasks.

It addresses a practical developer problem: work is often scattered across notes, issue trackers, deadlines, status updates, and disconnected tools. DevFlow brings projects, tasks, progress, activity history, and AI-assisted planning into one lightweight workspace.







🌍 The Problem

Developers and small teams frequently lose time because project execution is fragmented across:

task lists

project notes

status updates

deadlines

progress tracking

activity history

separate AI tools

This creates context switching and makes it harder to answer simple questions:

What am I working on?
What is blocked?
What is already complete?
What should I work on next?
What changed recently?
Can AI help me break a project into actionable work without sending project context to a cloud service?

💡 The Solution

DevFlow combines project execution and productivity management into one local-first workspace.

Projects
   ↓
Tasks + Priorities + Due Dates
   ↓
Execution Status
   ↓
Live Progress
   ↓
Activity History
   ↓
AI-Assisted Planning

The product supports:

secure account registration and login

project creation, editing, viewing and deletion

task creation and management

Todo / In Progress / Done workflows

priority and due-date management

search and filtering

live dashboard statistics

project completion percentages

persistent recent activity

SQLite-backed persistence

local AI-assisted task generation with Ollama

responsive desktop / tablet / mobile layouts

🧭 Four-Task Engineering Journey

DevFlow was built incrementally rather than as four disconnected assignments.

┌──────────────────────────────────────┐
│ TASK 1                               │
│ Developer Productivity Dashboard     │
└──────────────────┬───────────────────┘
                   ↓
┌──────────────────────────────────────┐
│ TASK 2                               │
│ Users / Projects / Tasks REST API    │
└──────────────────┬───────────────────┘
                   ↓
┌──────────────────────────────────────┐
│ TASK 3                               │
│ Persistent Relational Data Layer     │
└──────────────────┬───────────────────┘
                   ↓
┌──────────────────────────────────────┐
│ TASK 4                               │
│ AI-Powered Full-Stack Platform       │
└──────────────────────────────────────┘

01 — 🖥️ Developer Productivity Dashboard

Frontend Foundation

Task 1 established the product interface and reusable component system.

Implemented

dashboard / landing page

navigation

user profile section

project cards

task views

progress indicators

search and filtering

loading states

empty states

responsive desktop / tablet / mobile behavior

reusable React component architecture

Suggested Screenshot

<img
  src="devflow-readme-assets/task1-dashboard.png"
  alt="DevFlow Task 1 Dashboard"
  width="100%"
/>

Key Contribution

Designed a production-style developer dashboard with responsive layouts, reusable UI components, meaningful states, project visibility, task tracking, and productivity-focused interactions.

02 — 🔌 Users, Projects & Tasks REST API

Backend Foundation

Task 2 introduced the backend contract used by later stages.

API Capabilities

Users

GET     /api/users
GET     /api/users/:id
POST    /api/users
PATCH   /api/users/:id
DELETE  /api/users/:id

Projects

GET     /api/projects
GET     /api/projects/:id
POST    /api/projects
PATCH   /api/projects/:id
DELETE  /api/projects/:id

Tasks

GET     /api/tasks
GET     /api/tasks/:id
POST    /api/tasks
PATCH   /api/tasks/:id
PATCH   /api/tasks/:id/status
DELETE  /api/tasks/:id

Engineering Included

RESTful resource design

Zod validation

centralized error handling

meaningful HTTP status codes

structured JSON responses

query-based search and filtering

environment configuration

API examples and documentation

Suggested Screenshot

<img
  src="devflow-readme-assets/task2-api.png"
  alt="DevFlow Task 2 REST API"
  width="100%"
/>

Key Contribution

Built a structured REST API for users, projects and tasks with validation, filtering, consistent error responses and explicit HTTP semantics.

03 — 🗄️ Persistent Data Layer

From Temporary Data to Real Persistence

Task 3 replaced temporary in-memory data with a relational SQLite database.

Express REST API
       ↓
Node.js Database Layer
       ↓
SQLite
       ↓
users / projects / tasks

Data Model

User
 ├── owns many Projects
 └── may be assigned many Tasks

Project
 ├── belongs to one User
 └── contains many Tasks

Task
 ├── belongs to one Project
 └── may belong to one User

Database Engineering

primary keys

unique email constraint

foreign-key relationships

project → task cascade deletion

task status constraints

priority constraints

indexes

schema-level checks

persistent file-backed storage

environment-configured database path

Persistence Proof

Create data
   ↓
Stop server
   ↓
Restart server
   ↓
Data still exists

Suggested Screenshot

<img
  src="devflow-readme-assets/task3-persistence.png"
  alt="DevFlow Persistent SQLite Data Layer"
  width="100%"
/>

Key Contribution

Converted the REST API into a persistent relational system with explicit relationships, constraints and durable local storage.

04 — 🤖 AI-Powered Project & Task Management Platform

Full-Stack Integration

Task 4 brings all previous layers together.

React + Vite
      ↓
Protected Frontend
      ↓
Express REST API
      ↓
JWT + Validation
      ↓
SQLite
      +
Local Ollama AI

🔐 Authentication

DevFlow includes:

registration

login

logout

bcrypt password hashing

JWT token issuance

protected API endpoints

protected frontend routes

authenticated user data isolation

Credentials
   ↓
bcrypt verification
   ↓
JWT
   ↓
Protected workspace

📁 Project Management

Users can:

create projects

edit projects

delete projects

view project details

update project status

inspect task totals

track completion percentage

<img
  src="devflow-readme-assets/project-management.png"
  alt="DevFlow Project Management"
  width="100%"
/>

✅ Task Management

Tasks include:

project association

title

description

priority

due date

Todo

In Progress

Done

search

status filtering

priority filtering

persisted updates

deletion

<img
  src="devflow-readme-assets/task-management.png"
  alt="DevFlow Task Management"
  width="100%"
/>

📊 Live Progress Tracking

Dashboard metrics are calculated from backend data.

Active Projects
Total Tasks
Completed Tasks
In-Progress Tasks

Project completion is derived from:

Completed Tasks / Total Project Tasks

Changing task status therefore updates both:

dashboard statistics

project completion percentage

<img
  src="devflow-readme-assets/dashboard-overview.png"
  alt="DevFlow Dashboard Overview"
  width="100%"
/>

🕒 Workspace Activity

DevFlow keeps a persistent trail of meaningful actions.

Examples:

account creation

login

project creation

project update

project deletion

task creation

task update

task deletion

AI generation

<img
  src="devflow-readme-assets/recent-activity.png"
  alt="DevFlow Recent Activity"
  width="100%"
/>

Key Contribution

Connected user actions across authentication, projects, tasks and AI into a persistent workspace activity timeline.

🧠 Local AI-Assisted Task Planning

DevFlow can turn project context into actionable engineering tasks.

Project Name
      +
Project Description
      ↓
Planning Prompt
      ↓
Local Ollama Model
      ↓
Structured Task Suggestions
      ↓
SQLite
      ↓
Project Dashboard

Default configuration:

OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

The AI-generated tasks are saved into the project rather than shown as disposable chat output.

<img
  src="devflow-readme-assets/ai-task-generation.png"
  alt="DevFlow Local AI Task Generation"
  width="100%"
/>

Failure-Safe AI Design

If Ollama is unavailable, the product remains usable.

The backend explicitly labels the result:

FALLBACK PLANNER

When the local model is available:

LOCAL AI

This avoids silently presenting deterministic fallback output as AI-generated content.

🏗️ Architecture

flowchart TD
    A[React + Vite Frontend]
    B[Registration / Login]
    C[Dashboard]
    D[Projects]
    E[Tasks]
    F[AI Task Planner]

    G[Express REST API]
    H[JWT Authentication]
    I[Zod Validation]
    J[Workspace Services]
    K[Activity Logger]
    L[AI Integration]

    M[(SQLite)]
    N[Local Ollama]

    A --> B
    A --> C
    A --> D
    A --> E
    A --> F

    B --> G
    C --> G
    D --> G
    E --> G
    F --> G

    G --> H
    G --> I
    G --> J
    G --> K
    G --> L

    H --> M
    J --> M
    K --> M
    L --> M
    L --> N

🛡️ Engineering & Security Decisions

Problem

DevFlow Approach

Plain-text passwords are unsafe

bcrypt password hashing

Private routes need identity

JWT authentication

Invalid writes can corrupt state

Zod + SQLite constraints

Frontend data must stay current

API-backed state refresh after mutations

Project/task relations must stay valid

Foreign keys

Data should survive restarts

SQLite persistence

AI should not require a paid cloud API

Local Ollama model

AI failure should not break the product

Explicit fallback planner

User actions should be traceable

Persistent recent activity

Internship setup should stay reproducible

Local-first dependencies and .env.example

🛠️ Tech Stack

Layer

Technology

Frontend

React 18 + Vite

Routing

React Router

Styling

Custom responsive CSS

Icons

Lucide React

Backend

Node.js + Express

Validation

Zod

Authentication

JWT

Password Security

bcryptjs

Database

SQLite through Node node:sqlite

AI

Ollama local model

API

REST

Configuration

dotenv

📡 Final Platform API

Authentication

Method

Endpoint

POST

/api/auth/register

POST

/api/auth/login

GET

/api/auth/me

Dashboard

Method

Endpoint

GET

/api/dashboard

Projects

Method

Endpoint

GET

/api/projects

GET

/api/projects/:id

POST

/api/projects

PATCH

/api/projects/:id

DELETE

/api/projects/:id

Tasks

Method

Endpoint

GET

/api/tasks

POST

/api/tasks

PATCH

/api/tasks/:id

DELETE

/api/tasks/:id

AI

Method

Endpoint

POST

/api/ai/generate-tasks

🗂️ Repository Structure

Innovation-Hacks/
│
├── Task1/
│   └── dashboard/
│
├── Task2/
│   └── users-projects-tasks-api/
│
├── Task3/
│   └── persistent-data-layer/
│
├── Task4/
│   └── ai-project-management-platform/
│       ├── backend/
│       └── frontend/
│
├── devflow-readme-assets/
├── package.json
└── README.md

▶️ Run Everything With One Command

First-time setup

From the repository root:

cd "C:\Users\Lenovo\Desktop\Innovation Hacks"
npm install
npm --prefix "Task1/dashboard" install
npm --prefix "Task2/users-projects-tasks-api" install
npm --prefix "Task3/persistent-data-layer" install
npm --prefix "Task4/ai-project-management-platform/backend" install
npm --prefix "Task4/ai-project-management-platform/frontend" install

After the dependencies have been installed once:

npm run dev

Services

Component

URL

Task 1 Dashboard

http://localhost:5173

Task 2 API

http://localhost:4002/api/health

Task 3 Persistent API

http://localhost:4003/api/health

Task 4 Frontend

http://localhost:5174

Task 4 Backend

http://localhost:4004/api/health

Stop everything:

Ctrl + C

🤖 Enable the Real Local AI

ollama pull llama3.2:3b
ollama serve

Verify:

Invoke-RestMethod http://localhost:11434/api/tags

Then click:

AI Generate

inside DevFlow.

📸 Portfolio Screenshot Plan

Create:

devflow-readme-assets/

Recommended screenshots:

01-hero-dashboard.png
02-authentication.png
03-project-management.png
04-task-workflow.png
05-activity-log.png
06-local-ai.png
07-task2-api.png
08-task3-persistence.png
09-responsive-mobile.png

These can be reused both in the README and in a LinkedIn carousel.

🎞️ Showcase Slide Ideas

01 — Developer Command Center

Subtitle: One workspace for project execution and engineering productivity.

Key contribution:
Connected projects, task state and live progress into a responsive developer dashboard.

Tags:

React   Responsive UI   Productivity

02 — Full Task Workflow

Subtitle: Tasks move from planning to execution without losing context.

Key contribution:
Implemented priorities, due dates, status transitions, search, filtering and live project progress.

Tags:

Task Management   REST API   SQLite

03 — Workspace Activity & Audit Trail

Subtitle: A structured history of meaningful workspace actions.

Key contribution:
Connected authentication, project, task and AI events to persistent recent activity.

Tags:

Activity Logs   Persistence   Backend Integration

04 — Local AI Project Planner

Subtitle: Convert project context into actionable engineering tasks.

Key contribution:
Integrated local Ollama inference with project context and persisted generated tasks directly into the workspace.

Tags:

Local AI   Ollama   AI Task Generation

05 — Persistent Data Layer

Subtitle: Project state survives server and application restarts.

Key contribution:
Designed a relational SQLite model with foreign keys, constraints and durable project/task storage.

Tags:

SQLite   Data Modeling   Persistence

🎯 What This Project Demonstrates

DevFlow demonstrates:

frontend engineering

responsive UI design

React component architecture

REST API design

request validation

centralized errors

relational data modelling

persistent storage

authentication

password security

protected routes

project CRUD

task CRUD

search and filtering

live analytics

activity tracking

local AI integration

full-stack system integration

🚧 Current Scope

DevFlow is an internship-scale full-stack product and local development prototype.

SQLite keeps the project:

free

reproducible

persistent

easy to run

independent of external database services

For a larger multi-instance production deployment, the same data model could be migrated to PostgreSQL.

🌱 Planned Product Upgrades

explicit task assignee selector

multi-user project collaboration

workload view

notifications

security alerts

dedicated audit-log page

calendar and deadline view

overdue-task detection

AI task prioritization

AI project summary

AI productivity suggestions

automated tests

CI/CD

cloud deployment

PostgreSQL production data layer

👩‍💻 Author

Agrima Saxena

Full-Stack Development · Applied AI · Backend Systems · Software Engineering




Build. Innovate. Impact.

DevFlow turns four internship tasks into one connected product — from frontend, to API, to persistence, to AI-assisted execution.