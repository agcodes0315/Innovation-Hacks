# Task 3 — Persistent Data Layer

Task 2 API upgraded to PostgreSQL + Prisma.

## Data model
- User owns Projects
- Project has Tasks
- Task optionally has an assignee User
- Project deletion cascades to Tasks
- User deletion is restricted while the user owns a Project; task assignee deletion sets the reference to null

## Run
1. Create a PostgreSQL database named `devflow`.
2. `npm install`
3. `copy .env.example .env`
4. Update `DATABASE_URL` in `.env`
5. `npx prisma generate`
6. `npx prisma migrate dev --name init`
7. `npm run prisma:seed`
8. `npm run dev`

Never commit `.env`; `.env.example` contains only placeholders.
