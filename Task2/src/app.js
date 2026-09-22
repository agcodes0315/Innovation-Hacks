import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import userRoutes from "./routes/users.js";
import projectRoutes from "./routes/projects.js";
import taskRoutes from "./routes/tasks.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

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
      service: "task2-api",
    },
  });
});

app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;