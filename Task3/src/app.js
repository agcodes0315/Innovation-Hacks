import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import users from "./routes/users.js";
import projects from "./routes/projects.js";
import tasks from "./routes/tasks.js";

import {
  errorHandler,
  notFound,
} from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      database: "postgresql",
      service: "task3-api",
    },
  });
});

app.use("/api/users", users);
app.use("/api/projects", projects);
app.use("/api/tasks", tasks);

app.use(notFound);
app.use(errorHandler);

export default app;