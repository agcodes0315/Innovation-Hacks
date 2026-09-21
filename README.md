⚡ DevFlow

AI-Powered Developer Productivity & Project Management Platform

A full-stack developer workspace for planning projects, managing tasks, tracking progress, preserving activity history, and generating project tasks with local AI.







<br/>

Built as a connected four-stage full-stack development project for the Innovation Hacks Full Stack Development Internship.

🚀 What DevFlow Does

DevFlow is a developer-focused productivity workspace that evolves across four internship tasks:

Task 1
Responsive Developer Productivity Dashboard
        |
        v
Task 2
Users, Projects & Tasks REST API
        |
        v
Task 3
Persistent SQLite Data Layer
        |
        v
Task 4
AI-Powered Full-Stack Project & Task Management Platform

Instead of treating each task as an isolated assignment, the project follows one continuous product architecture.

DevFlow allows a user to:

register and sign in securely

create and manage projects

create and manage project tasks

assign priorities and due dates

move tasks between Todo, In Progress and Done

search and filter tasks

view project completion progress

view dashboard statistics

review recent workspace activity

generate project-specific tasks using a local Ollama model

retain data across application restarts using SQLite

🖥️ Product at a Glance

<img src="devflow-readme-assets/dashboard-overview.png"
  alt="DevFlow Dashboard Overview"
  width="100%"/>

Product Capability

Implementation

Responsive frontend

React + Vite

REST API

Node.js + Express

Input validation

Zod

Persistent database

SQLite

Authentication

JWT

Password security

bcryptjs

Project management

Create, view, edit, delete

Task management

Create, update, delete, search, filter

Progress tracking

Live project completion percentage

Activity timeline

Persistent recent activity

AI capability

Local Ollama-assisted task generation

Local-first development

No external database required

🧩 Internship Task Progression

Task 1 — Developer Productivity Dashboard

Task 1 establishes the product interface and interaction model.

The dashboard includes:

developer profile section

clear navigation

project cards

task views

project progress indicators

productivity statistics

search and filtering

loading states

empty states

responsive desktop, tablet and mobile layouts

reusable React component architecture

<img src="devflow-readme-assets/task1-dashboard.png"
  alt="DevFlow Task 1 Developer Productivity Dashboard"
  width="100%"/>

Task 2 — Users, Projects & Tasks REST API

Task 2 introduces the backend layer that powers application data.

Users

GET    /api/users
GET    /api/users/:id
POST   /api/users
PATCH  /api/users/:id
DELETE /api/users/:id

Projects

GET    /api/projects
GET    /api/projects/:id
POST   /api/projects
PATCH  /api/projects/:id
DELETE /api/projects/:id

Tasks

GET    /api/tasks
GET    /api/tasks/:id
POST   /api/tasks
PATCH  /api/tasks/:id
PATCH  /api/tasks/:id/status
DELETE /api/tasks/:id

Backend Engineering Included

consistent REST endpoint design

input validation using Zod

centralized error handling

meaningful HTTP status codes

search and query filtering

environment-based configuration

structured JSON responses

API documentation and examples

<img src="devflow-readme-assets/task2-api.png"
  alt="DevFlow Task 2 REST API"
  width="100%"/>

Task 3 — Persistent Data Layer

Task 3 replaces temporary in-memory data with a real relational database.

DevFlow uses SQLite directly through Node.js.

REST API
   |
   v
Node.js + Express
   |
   v
SQLite
   |
   +------ users
   |
   +------ projects
   |
   +------ tasks

Relational Model

User
 ├── owns many Projects
 └── may be assigned many Tasks

Project
 ├── belongs to one User
 └── contains many Tasks

Task
 ├── belongs to one Project
 └── may belong to one User

Database Features

persistent local storage

primary keys

unique user email constraint

project-owner relationship

task-project relationship

optional task assignee relationship

task status constraints

priority constraints

foreign keys

cascading project-task deletion

indexes for common lookups

schema-level validation

environment-configured database file path

The application database is generated locally at:

Task3/persistent-data-layer/data/devflow.db

<img src="devflow-readme-assets/task3-persistence.png"
  alt="DevFlow Task 3 Persistent SQLite Data Layer"
  width="100%"/>

🤖 Task 4 — AI-Powered Project & Task Management Platform

Task 4 combines the frontend, REST API, authentication, database and AI capability into one full-stack application.

<img src="devflow-readme-assets/task4-dashboard.png"
  alt="DevFlow Task 4 Full Stack Dashboard"
  width="100%"/>

Authentication

DevFlow supports:

account registration

login

logout

bcrypt password hashing

JWT-based authentication

protected backend endpoints

protected frontend routes

Register / Login
      |
      v
Password Hashing
      |
      v
JWT Issued
      |
      v
Protected Frontend + API Routes

📁 Project Management

Users can:

create projects

edit projects

delete projects

open project details

set project status

track project task totals

view completion percentages

<img src="devflow-readme-assets/project-management.png"
  alt="DevFlow Project Management"
  width="100%"/>

✅ Task Management

Tasks support:

project association

task title and description

priority

due date

Todo status

In Progress status

Done status

search

status filtering

priority filtering

deletion

persisted updates

<img src="devflow-readme-assets/task-management.png"
  alt="DevFlow Task Management"
  width="100%"/>

📈 Dashboard & Progress Tracking

The DevFlow dashboard summarizes the current workspace using live backend data.

Metrics include:

active projects

total tasks

completed tasks

tasks in progress

<img src="devflow-readme-assets/dashboard-stats.png"
  alt="DevFlow Dashboard Statistics"
  width="100%"/>

🕒 Recent Activity

DevFlow stores a simple activity timeline for meaningful user actions.

Tracked actions can include:

account creation

login

project creation

project update

project deletion

task creation

task updates

task deletion

AI task generation

<img src="devflow-readme-assets/recent-activity.png"
  alt="DevFlow Recent Activity Timeline"
  width="100%"/>

🧠 AI-Assisted Task Generation

DevFlow includes a local AI-assisted project planning feature.

<img src="devflow-readme-assets/ai-task-generation.png"
  alt="DevFlow AI-Assisted Task Generation"
  width="100%"/>

The user selects a project and clicks:

AI Generate

The backend prepares project context and passes it to the configured local Ollama model.

Project Name + Description
          |
          v
Task Planning Prompt
          |
          v
Local Ollama Model
          |
          v
Structured Task Suggestions
          |
          v
SQLite
          |
          v
Dashboard

Default configuration:

OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

If Ollama is unavailable, DevFlow does not crash. The backend falls back to a deterministic project planner and labels the result as Fallback Planner rather than presenting it as AI output.

🏗️ Full-Stack Architecture

flowchart TD
    A[React + Vite Frontend]
    B[Authentication UI]
    C[Dashboard]
    D[Project Management]
    E[Task Management]
    F[AI Generate UI]

    G[Express REST API]
    H[JWT Authentication]
    I[Zod Validation]
    J[Project and Task Services]
    K[Activity Logging]
    L[AI Task Generation]

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

    J --> M
    H --> M
    K --> M
    L --> M
    L --> N

🔐 Security & Data Handling

Concern

DevFlow Approach

Password storage

bcrypt hashing

Protected API access

JWT bearer authentication

Input validation

Zod schemas

Database relationships

SQLite foreign keys

Secrets/configuration

.env files

Public repository safety

.env and database files ignored

Invalid requests

Centralized error responses

User data isolation

Project/task queries scoped to authenticated user

⚙️ Key Engineering Decisions

Challenge

DevFlow Approach

Keep local setup simple

Built-in SQLite instead of an external DB server

Maintain real persistence

File-backed relational database

Protect user passwords

bcrypt hashing

Protect application routes

JWT authentication

Prevent invalid writes

Zod validation + DB constraints

Keep UI data current

Dashboard reloads live API state after mutations

Support project planning

Local Ollama task generation

Avoid AI failure breaking the product

Explicit fallback planner

Maintain traceability

Recent activity log

Support different screen sizes

Responsive custom CSS

🛠️ Tech Stack

Layer

Technology

Frontend

React 18, Vite

UI

Custom CSS, responsive dark interface

Icons

Lucide React

Routing

React Router

Backend

Node.js, Express

Validation

Zod

Authentication

JSON Web Tokens

Password Hashing

bcryptjs

Database

SQLite via Node node:sqlite

AI

Ollama local model

API Style

REST

Environment Configuration

dotenv

📡 API Surface — Final Platform

Authentication

Method

Endpoint

Purpose

POST

/api/auth/register

Create account

POST

/api/auth/login

Authenticate user

GET

/api/auth/me

Return authenticated profile

Dashboard

Method

Endpoint

Purpose

GET

/api/dashboard

Statistics and recent activity

Projects

Method

Endpoint

Purpose

GET

/api/projects

List authenticated user's projects

GET

/api/projects/:id

Project details and tasks

POST

/api/projects

Create project

PATCH

/api/projects/:id

Update project

DELETE

/api/projects/:id

Delete project

Tasks

Method

Endpoint

Purpose

GET

/api/tasks

Search/filter tasks

POST

/api/tasks

Create task

PATCH

/api/tasks/:id

Update task

DELETE

/api/tasks/:id

Delete task

AI

Method

Endpoint

Purpose

POST

/api/ai/generate-tasks

Generate and persist project tasks

📁 Repository Structure

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
└── README.md

Generated .env files, node_modules, and SQLite database files should not be committed.

⚙️ Running Locally

Requirements

Node.js 22.5+
npm

Check your Node version:

node -v

Run All Tasks Together

From the repository root:

cd "C:\Users\Lenovo\Desktop\Innovation Hacks"
npm install
npm run dev

Development services:

Service

URL

Task 1 Dashboard

http://localhost:5173

Task 2 REST API

http://localhost:4002/api/health

Task 3 Persistent API

http://localhost:4003/api/health

Task 4 Full-Stack Frontend

http://localhost:5174

Task 4 Backend

http://localhost:4004/api/health

Press Ctrl + C to stop all services.

🤖 Running Local AI with Ollama

Install Ollama and pull the configured model:

ollama pull llama3.2:3b

Start the local server:

ollama serve

Verify:

Invoke-RestMethod http://localhost:11434/api/tags

Then open DevFlow and click AI Generate. When Ollama is connected, the result is labelled Local AI.

🧪 Demonstrating Persistence

1. Register / sign in
2. Create a project
3. Create tasks
4. Change task statuses
5. Stop the backend
6. Restart the backend
7. Sign in again
8. Confirm the same projects and tasks still exist

📸 Suggested Product Screenshots

Create this folder in the repository root:

devflow-readme-assets/

Add:

dashboard-overview.png
task1-dashboard.png
task2-api.png
task3-persistence.png
task4-dashboard.png
project-management.png
task-management.png
dashboard-stats.png
recent-activity.png
ai-task-generation.png
auth-login.png
responsive-mobile.png

Filename

What to capture

dashboard-overview.png

Best populated Task 4 dashboard

task1-dashboard.png

Original Task 1 dashboard

task2-api.png

Task 2 health or REST endpoint response

task3-persistence.png

Task 3 persistent API / persistence proof

task4-dashboard.png

Final integrated application

project-management.png

Project cards, progress and actions

task-management.png

Search, filters, priority and status controls

dashboard-stats.png

Live summary metrics

recent-activity.png

Activity timeline

ai-task-generation.png

Local AI generation result

auth-login.png

Login or registration screen

responsive-mobile.png

Mobile-width responsive interface

🎬 Suggested Demo Flow

1. Introduce DevFlow and the four-task architecture
2. Show registration/login
3. Show dashboard statistics
4. Create a project
5. Add tasks
6. Change Todo → In Progress → Done
7. Show project progress update
8. Demonstrate search and priority filters
9. Show recent activity
10. Generate tasks using local Ollama AI
11. Restart the backend and prove persistence
12. Briefly show Task 2 and Task 3 API health endpoints

🎯 What This Project Demonstrates

DevFlow brings together:

responsive frontend development

reusable React components

REST API design

input validation

HTTP status handling

relational data modelling

persistent storage

authentication

password security

protected application routes

project management

task management

search and filtering

dashboard analytics

activity tracking

local AI integration

full-stack system integration

⚠️ Scope

DevFlow is an internship project and development prototype.

The current SQLite implementation is intentionally optimized for simple local development, reproducible demos, persistent project data and minimal external infrastructure.

For a larger multi-instance production deployment, the data layer could later be migrated to PostgreSQL or another server-based relational database.

🌱 Future Improvements

multi-user project collaboration

explicit task-assignee selector

role-based permissions

comments and task discussions

notifications

calendar view

advanced analytics

AI task prioritization

project summarization

AI productivity suggestions

automated tests

CI/CD workflow

cloud deployment

PostgreSQL production migration

👩‍💻 Author

Agrima Saxena

Full-Stack Development · Applied AI · Backend Systems · Software Engineering

<a href="https://www.linkedin.com/in/agrima-saxena-142960426/">
<img src="https://img.shields.io/badge/LinkedIn-Agrima_Saxena-0A66C2?style=flat-square&logo=linkedin&logoColor=white"
     alt="LinkedIn"/>
</a>

<a href="https://github.com/agcodes0315">
<img src="https://img.shields.io/badge/GitHub-agcodes0315-181717?style=flat-square&logo=github&logoColor=white"
     alt="GitHub"/>
</a>

Build. Innovate. Impact.

DevFlow turns the internship's four technical tasks into one connected full-stack product journey — from interface, to API, to persistence, to AI-powered project execution.