import { randomUUID } from "node:crypto";

const now = () => new Date().toISOString();

export const users = [
  {
    id: "u-demo",
    name: "Agrima Saxena",
    email: "agrima@example.com",
    role: "Developer",
    createdAt: now()
  }
];

export const projects = [
  {
    id: "p-demo",
    name: "DevFlow",
    description: "Developer productivity dashboard and project workspace.",
    ownerId: "u-demo",
    status: "active",
    createdAt: now(),
    updatedAt: now()
  }
];

export const tasks = [
  {
    id: "t-demo",
    projectId: "p-demo",
    assigneeId: "u-demo",
    title: "Build REST API",
    description: "Create endpoints for users, projects and tasks.",
    status: "in-progress",
    priority: "high",
    dueDate: null,
    createdAt: now(),
    updatedAt: now()
  }
];

export function createId(prefix) {
  return `${prefix}-${randomUUID()}`;
}

export function timestamp() {
  return now();
}
