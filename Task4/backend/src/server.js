import "dotenv/config";
import express from "express";
import app from "./express-app.js";
import {
  startReminderEngine,
} from "./reminders.js";

void express;

const port =
  Number(
    process.env.PORT ||
      4000
  );

app.listen(
  port,
  () => {
    console.log(
      `Task 4 backend running on port ${port}`
    );

    if (
      !process.env.VERCEL
    ) {
      startReminderEngine();
    }
  }
);