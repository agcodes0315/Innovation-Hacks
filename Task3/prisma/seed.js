import { PrismaClient, TaskPriority, TaskStatus } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({ data: { name: "Agrima Saxena", email: "agrima@example.com", role: "Developer" } });
  const project = await prisma.project.create({ data: { name: "DevFlow Dashboard", description: "Developer productivity workspace", ownerId: user.id } });
  await prisma.task.createMany({ data: [
    { title: "Connect frontend to API", projectId: project.id, assigneeId: user.id, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH },
    { title: "Persist project data", projectId: project.id, assigneeId: user.id, status: TaskStatus.DONE, priority: TaskPriority.MEDIUM },
  ] });
}

main().finally(() => prisma.$disconnect());
