import {
  randomUUID,
} from "node:crypto";

import {
  one,
  many,
  execute,
} from "./db.js";

import {
  sendEmail,
  emailConfigured,
} from "./email.js";

import {
  dailyBriefing,
} from "./health.js";

const now = () =>
  new Date().toISOString();

async function inserted(
  userId,
  taskId,
  kind,
  channel
) {
  const result =
    await execute(
      `
        INSERT INTO reminder_log (
          id,
          user_id,
          task_id,
          kind,
          channel,
          sent_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
        ON CONFLICT (
          user_id,
          task_id,
          kind,
          channel
        )
        DO NOTHING
        RETURNING id
      `,
      [
        `r-${randomUUID()}`,
        userId,
        taskId,
        kind,
        channel,
        now(),
      ]
    );

  return (
    result.rows.length > 0
  );
}

async function digestInserted(
  userId,
  kind,
  dateKey
) {
  const result =
    await execute(
      `
        INSERT INTO digest_log (
          id,
          user_id,
          kind,
          date_key,
          sent_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5
        )
        ON CONFLICT (
          user_id,
          kind,
          date_key
        )
        DO NOTHING
        RETURNING id
      `,
      [
        `d-${randomUUID()}`,
        userId,
        kind,
        dateKey,
        now(),
      ]
    );

  return (
    result.rows.length > 0
  );
}

async function notify(
  userId,
  type,
  title,
  message,
  severity
) {
  await execute(
    `
      INSERT INTO notifications (
        id,
        user_id,
        type,
        title,
        message,
        severity,
        is_read,
        created_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        0,
        $7
      )
    `,
    [
      `n-${randomUUID()}`,
      userId,
      type,
      title,
      message,
      severity,
      now(),
    ]
  );
}

export async function processReminders() {
  const users =
    await many(`
      SELECT
        u.id,
        u.email,
        u.name,
        COALESCE(
          p.email_reminders,
          0
        ) AS email_reminders,
        COALESCE(
          p.daily_briefing,
          1
        ) AS daily_briefing,
        COALESCE(
          p.weekly_summary,
          0
        ) AS weekly_summary
      FROM users u
      LEFT JOIN preferences p
        ON p.user_id = u.id
    `);

  const local =
    new Date();

  const dateKey =
    local
      .toISOString()
      .slice(0, 10);

  for (const user of users) {
    const tasks =
      await many(
        `
          SELECT
            t.*,
            p.name AS project_name
          FROM tasks t
          JOIN projects p
            ON p.id = t.project_id
          WHERE
            p.owner_id = $1
            AND t.status != 'done'
            AND t.due_date IS NOT NULL
        `,
        [user.id]
      );

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const tomorrow =
      new Date(today);

    tomorrow.setDate(
      tomorrow.getDate() + 1
    );

    for (const t of tasks) {
      const d =
        new Date(
          t.due_date
        );

      const kind =
        d < today
          ? "overdue"
          : d <= tomorrow
            ? "due-soon"
            : null;

      if (!kind) {
        continue;
      }

      const title =
        kind === "overdue"
          ? "Overdue task"
          : "Task due soon";

      const msg =
        `${t.title} · ` +
        `${t.project_name} · ` +
        `due ${t.due_date}`;

      const severity =
        kind === "overdue"
          ? "danger"
          : "warning";

      if (
        await inserted(
          user.id,
          t.id,
          kind,
          "in-app"
        )
      ) {
        await notify(
          user.id,
          "deadline",
          title,
          msg,
          severity
        );
      }

      if (
        Number(
          user.email_reminders
        ) === 1 &&
        emailConfigured() &&
        (await inserted(
          user.id,
          t.id,
          kind,
          "email"
        ))
      ) {
        try {
          await sendEmail(
            user.email,
            `DevFlow: ${title}`,
            `${msg}\n\nOpen DevFlow to review the task.`
          );
        } catch (error) {
          console.error(
            "Email reminder failed:",
            error.message
          );
        }
      }
    }

    if (
      emailConfigured() &&
      local.getHours() >= 8 &&
      Number(
        user.daily_briefing
      ) === 1 &&
      (await digestInserted(
        user.id,
        "daily",
        dateKey
      ))
    ) {
      try {
        await sendDailyBriefingEmail(
          user.id
        );
      } catch (error) {
        console.error(
          "Daily briefing failed:",
          error.message
        );
      }
    }

    if (
      emailConfigured() &&
      local.getDay() === 1 &&
      local.getHours() >= 8 &&
      Number(
        user.weekly_summary
      ) === 1 &&
      (await digestInserted(
        user.id,
        "weekly",
        dateKey
      ))
    ) {
      try {
        await sendWeeklySummaryEmail(
          user.id
        );
      } catch (error) {
        console.error(
          "Weekly summary failed:",
          error.message
        );
      }
    }
  }
}

export async function sendDailyBriefingEmail(
  userId
) {
  const user =
    await one(
      `
        SELECT
          email,
          name
        FROM users
        WHERE id = $1
      `,
      [userId]
    );

  if (!user) {
    return {
      sent: false,
      reason:
        "User not found",
    };
  }

  const brief =
    await dailyBriefing(
      userId
    );

  const body =
    `Good morning ${user.name},\n\n` +
    `${brief.summary}\n\n` +
    `Next tasks:\n` +
    `${
      brief.next
        .map(
          (t, i) =>
            `${i + 1}. ${t.title} (${t.priority}, ${t.status})`
        )
        .join("\n") ||
      "No active tasks."
    }\n\n— DevFlow`;

  return sendEmail(
    user.email,
    "DevFlow Daily Briefing",
    body
  );
}

export async function sendWeeklySummaryEmail(
  userId
) {
  const user =
    await one(
      `
        SELECT
          email,
          name
        FROM users
        WHERE id = $1
      `,
      [userId]
    );

  if (!user) {
    return {
      sent: false,
      reason:
        "User not found",
    };
  }

  const counts =
    await one(
      `
        SELECT
          COUNT(*)::int AS total,

          COUNT(*) FILTER (
            WHERE t.status = 'done'
          )::int AS done,

          COUNT(*) FILTER (
            WHERE t.status = 'in-progress'
          )::int AS progress

        FROM tasks t

        JOIN projects p
          ON p.id = t.project_id

        WHERE p.owner_id = $1
      `,
      [userId]
    );

  return sendEmail(
    user.email,
    "DevFlow Weekly Execution Summary",
    `Hi ${user.name},\n\n` +
      `Total tasks: ${counts?.total || 0}\n` +
      `Completed: ${counts?.done || 0}\n` +
      `In progress: ${counts?.progress || 0}\n\n` +
      `Open DevFlow for project health, blockers and deadlines.\n\n` +
      `— DevFlow`
  );
}

export function startReminderEngine() {
  processReminders().catch(
    console.error
  );

  const timer =
    setInterval(
      () =>
        processReminders().catch(
          console.error
        ),
      15 * 60 * 1000
    );

  timer.unref?.();
}