export const projects = [
  {
    id: 1,
    title: "AI Project Manager",
    shortCode: "AI",
    description:
      "AI-assisted workspace for planning tasks, tracking progress and improving project execution.",
    progress: 78,
    status: "On Track",
    dueDate: "Aug 30",
    completedTasks: 18,
    totalTasks: 23,
    members: ["AS", "RK", "NM"],
  },
  {
    id: 2,
    title: "Developer API Platform",
    shortCode: "API",
    description:
      "Backend architecture and REST services powering the productivity workspace.",
    progress: 54,
    status: "In Progress",
    dueDate: "Sep 04",
    completedTasks: 12,
    totalTasks: 22,
    members: ["AS", "DP"],
  },
  {
    id: 3,
    title: "DevFlow Design System",
    shortCode: "DS",
    description:
      "Reusable UI components and responsive visual standards for the DevFlow platform.",
    progress: 91,
    status: "Almost Done",
    dueDate: "Aug 28",
    completedTasks: 20,
    totalTasks: 22,
    members: ["AS", "KS", "RM"],
  },
];

export const initialTasks = [
  {
    id: 1,
    title: "Build dashboard analytics cards",
    project: "AI Project Manager",
    priority: "High",
    status: "In Progress",
    dueDate: "Today",
  },
  {
    id: 2,
    title: "Create responsive sidebar navigation",
    project: "DevFlow Design System",
    priority: "Medium",
    status: "Done",
    dueDate: "Aug 24",
  },
  {
    id: 3,
    title: "Document REST API response contracts",
    project: "Developer API Platform",
    priority: "High",
    status: "Todo",
    dueDate: "Aug 27",
  },
  {
    id: 4,
    title: "Design loading and empty states",
    project: "AI Project Manager",
    priority: "Medium",
    status: "In Progress",
    dueDate: "Aug 28",
  },
  {
    id: 5,
    title: "Prepare backend integration hooks",
    project: "Developer API Platform",
    priority: "Low",
    status: "Todo",
    dueDate: "Aug 30",
  },
  {
    id: 6,
    title: "Review mobile dashboard layout",
    project: "DevFlow Design System",
    priority: "Medium",
    status: "Done",
    dueDate: "Aug 23",
  },
];

export const activities = [
  {
    id: 1,
    title: "Task completed",
    description: "Responsive sidebar navigation was completed.",
    time: "18 min ago",
    type: "success",
  },
  {
    id: 2,
    title: "Project updated",
    description: "AI Project Manager progress increased to 78%.",
    time: "1 hr ago",
    type: "project",
  },
  {
    id: 3,
    title: "New task created",
    description: "REST API documentation task was added.",
    time: "3 hrs ago",
    type: "task",
  },
  {
    id: 4,
    title: "Focus session completed",
    description: "A 72 minute development session was completed.",
    time: "Yesterday",
    type: "focus",
  },
];

export const productivityData = [
  {
    name: "Completed",
    value: 54,
  },
  {
    name: "In Progress",
    value: 29,
  },
  {
    name: "Todo",
    value: 17,
  },
];

export const weeklyActivityData = {
  week: [
    { name: "Mon", focus: 42, tasks: 30 },
    { name: "Tue", focus: 55, tasks: 45 },
    { name: "Wed", focus: 48, tasks: 52 },
    { name: "Thu", focus: 72, tasks: 58 },
    { name: "Fri", focus: 84, tasks: 77 },
    { name: "Sat", focus: 62, tasks: 54 },
    { name: "Sun", focus: 76, tasks: 68 },
  ],

  month: [
    { name: "W1", focus: 48, tasks: 39 },
    { name: "W2", focus: 63, tasks: 51 },
    { name: "W3", focus: 71, tasks: 64 },
    { name: "W4", focus: 83, tasks: 76 },
  ],

  quarter: [
    { name: "Jun", focus: 58, tasks: 45 },
    { name: "Jul", focus: 71, tasks: 62 },
    { name: "Aug", focus: 83, tasks: 74 },
  ],
};

export const schedule = [
  {
    id: 1,
    time: "10:00",
    title: "UI Review",
    type: "Design",
  },
  {
    id: 2,
    time: "12:30",
    title: "API Planning",
    type: "Backend",
  },
  {
    id: 3,
    time: "15:00",
    title: "Focus Session",
    type: "Focus",
  },
];