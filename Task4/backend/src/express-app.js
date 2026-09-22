import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";

import {
  one,
  many,
  execute,
  withTransaction,
} from "./db.js";

import {
  HttpError,
  uid,
  now,
  parse,
  sign,
  auth,
  log,
  notify,
  errorHandler,
} from "./lib.js";

import * as S from "./schemas.js";

import {
  plan,
  explainHealth,
} from "./ai.js";

import {
  projectHealth,
  dailyBriefing,
} from "./health.js";

import {
  emailConfigured,
  sendEmail,
} from "./email.js";

import {
  processReminders,
  sendDailyBriefingEmail,
  sendWeeklySummaryEmail,
} from "./reminders.js";

const app =
  express();

const allowedOrigin =
  process.env.CLIENT_ORIGIN ||
  "http://localhost:5174";

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) {
        return cb(
          null,
          true
        );
      }

      const ok =
        origin ===
          allowedOrigin ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(
          origin
        );

      return ok
        ? cb(
            null,
            true
          )
        : cb(
            new Error(
              `CORS blocked origin: ${origin}`
            )
          );
    },

    credentials: true,
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

async function ownedProject(
  id,
  userId
) {
  const row =
    await one(
      `
        SELECT *
        FROM projects
        WHERE
          id = $1
          AND owner_id = $2
      `,
      [
        id,
        userId,
      ]
    );

  if (!row) {
    throw new HttpError(
      404,
      "project not found"
    );
  }

  return row;
}

async function taskOwned(
  id,
  userId
) {
  const row =
    await one(
      `
        SELECT t.*
        FROM tasks t
        JOIN projects p
          ON p.id =
             t.project_id
        WHERE
          t.id = $1
          AND p.owner_id = $2
      `,
      [
        id,
        userId,
      ]
    );

  if (!row) {
    throw new HttpError(
      404,
      "Task not found"
    );
  }

  return row;
}

app.get(
  "/api/health",
  async (
    req,
    res
  ) => {
    await one(
      "SELECT 1 AS ok"
    );

    res.json({
      status: "ok",
      task: 4,
      database:
        "Neon PostgreSQL",
      auth: "JWT",
      ai:
        "Ollama local + explicit fallback",
      email:
        emailConfigured()
          ? "configured"
          : "optional / not configured",
      reminders:
        "enabled",
    });
  }
);

app.post(
  "/api/auth/register",
  async (
    req,
    res
  ) => {
    const d =
      parse(
        S.register,
        req.body
      );

    const existing =
      await one(
        `
          SELECT id
          FROM users
          WHERE
            lower(email) =
            lower($1)
        `,
        [d.email]
      );

    if (existing) {
      throw new HttpError(
        409,
        "An account with this email already exists"
      );
    }

    const id =
      uid("u");

    const ts =
      now();

    const hash =
      await bcrypt.hash(
        d.password,
        12
      );

    await withTransaction(
      async (
        client
      ) => {
        await client.query(
          `
            INSERT INTO users (
              id,
              name,
              email,
              password_hash,
              role,
              created_at
            )
            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6
            )
          `,
          [
            id,
            d.name,
            d.email,
            hash,
            "Developer",
            ts,
          ]
        );

        await client.query(
          `
            INSERT INTO members (
              id,
              owner_id,
              name,
              email,
              role,
              created_at
            )
            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6
            )
          `,
          [
            uid("m"),
            id,
            d.name,
            d.email,
            "Developer",
            ts,
          ]
        );

        await client.query(
          `
            INSERT INTO preferences (
              user_id,
              updated_at
            )
            VALUES (
              $1,
              $2
            )
            ON CONFLICT (
              user_id
            )
            DO NOTHING
          `,
          [
            id,
            ts,
          ]
        );
      }
    );

    const user =
      await one(
        `
          SELECT
            id,
            name,
            email,
            role,
            created_at
          FROM users
          WHERE id = $1
        `,
        [id]
      );

    await log(
      id,
      "account",
      "Created a DevFlow account",
      "Account"
    );

    await notify(
      id,
      "welcome",
      "Welcome to DevFlow",
      "Your execution workspace is ready.",
      "success"
    );

    res
      .status(201)
      .json({
        token:
          sign(user),
        user,
      });
  }
);

app.post(
  "/api/auth/login",
  async (
    req,
    res
  ) => {
    const d =
      parse(
        S.login,
        req.body
      );

    const row =
      await one(
        `
          SELECT *
          FROM users
          WHERE
            lower(email) =
            lower($1)
        `,
        [d.email]
      );

    if (
      !row ||
      !(
        await bcrypt.compare(
          d.password,
          row.password_hash
        )
      )
    ) {
      throw new HttpError(
        401,
        "Invalid email or password"
      );
    }

    const user = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      created_at:
        row.created_at,
    };

    await log(
      user.id,
      "account",
      "Signed in",
      "Account"
    );

    res.json({
      token:
        sign(user),
      user,
    });
  }
);

app.get(
  "/api/auth/me",
  auth,
  async (
    req,
    res
  ) => {
    res.json(
      req.user
    );
  }
);

app.get(
  "/api/dashboard",
  auth,
  async (
    req,
    res
  ) => {
    const s =
      await one(
        `
          SELECT

            (
              SELECT COUNT(*)::int
              FROM projects
              WHERE owner_id = $1
            )
            AS project_count,

            (
              SELECT COUNT(*)::int
              FROM tasks t
              JOIN projects p
                ON p.id =
                   t.project_id
              WHERE p.owner_id = $1
            )
            AS task_count,

            (
              SELECT COUNT(*)::int
              FROM tasks t
              JOIN projects p
                ON p.id =
                   t.project_id
              WHERE
                p.owner_id = $1
                AND t.status =
                  'done'
            )
            AS completed_count,

            (
              SELECT COUNT(*)::int
              FROM tasks t
              JOIN projects p
                ON p.id =
                   t.project_id
              WHERE
                p.owner_id = $1
                AND t.status =
                  'in-progress'
            )
            AS in_progress_count,

            (
              SELECT COUNT(*)::int
              FROM tasks t
              JOIN projects p
                ON p.id =
                   t.project_id
              WHERE
                p.owner_id = $1
                AND t.status !=
                  'done'
                AND t.due_date
                  IS NOT NULL
                AND
                  t.due_date::date
                  < CURRENT_DATE
            )
            AS overdue_count,

            (
              SELECT COUNT(*)::int
              FROM tasks t

              JOIN projects p
                ON p.id =
                   t.project_id

              LEFT JOIN tasks b
                ON b.id =
                   t.blocked_by_task_id

              WHERE
                p.owner_id = $1
                AND t.status !=
                  'done'
                AND
                  t.blocked_by_task_id
                  IS NOT NULL
                AND COALESCE(
                  b.status,
                  'todo'
                ) != 'done'
            )
            AS blocked_count
        `,
        [
          req.user.id,
        ]
      );

    const activities =
      await many(
        `
          SELECT *
          FROM activities
          WHERE user_id = $1
          ORDER BY
            created_at DESC
          LIMIT 8
        `,
        [
          req.user.id,
        ]
      );

    res.json({
      stats: s,
      activities,
    });
  }
);

app.get(
  "/api/members",
  auth,
  async (
    req,
    res
  ) => {
    const rows =
      await many(
        `
          SELECT *
          FROM members
          WHERE owner_id = $1
          ORDER BY
            created_at
        `,
        [
          req.user.id,
        ]
      );

    res.json(rows);
  }
);

app.post(
  "/api/members",
  auth,
  async (
    req,
    res
  ) => {
    const d =
      parse(
        S.member,
        req.body
      );

    const id =
      uid("m");

    const ts =
      now();

    await execute(
      `
        INSERT INTO members (
          id,
          owner_id,
          name,
          email,
          role,
          created_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
      `,
      [
        id,
        req.user.id,
        d.name,
        d.email,
        d.role,
        ts,
      ]
    );

    await log(
      req.user.id,
      "member",
      `Added ${d.name} to the workspace`,
      d.name
    );

    const member =
      await one(
        `
          SELECT *
          FROM members
          WHERE id = $1
        `,
        [id]
      );

    res
      .status(201)
      .json(
        member
      );
  }
);

app.get(
  "/api/projects",
  auth,
  async (
    req,
    res
  ) => {
    const q =
      `%${String(
        req.query.q ||
          ""
      )}%`;

    const status =
      req.query.status ||
      null;

    const rows =
      await many(
        `
          SELECT
            p.*,
            COUNT(
              t.id
            )::int
              AS task_count,

            COUNT(
              t.id
            ) FILTER (
              WHERE
                t.status =
                  'done'
            )::int
              AS done_count

          FROM projects p

          LEFT JOIN tasks t
            ON t.project_id =
               p.id

          WHERE
            p.owner_id = $1

            AND (
              $2 = '%%'
              OR p.name
                ILIKE $2
              OR p.description
                ILIKE $2
            )

            AND (
              $3::text
                IS NULL
              OR p.status =
                 $3
            )

          GROUP BY p.id

          ORDER BY
            p.updated_at DESC
        `,
        [
          req.user.id,
          q,
          status,
        ]
      );

    res.json(rows);
  }
);

app.get(
  "/api/projects/:id",
  auth,
  async (
    req,
    res
  ) => {
    const p =
      await ownedProject(
        req.params.id,
        req.user.id
      );

    const tasks =
      await many(
        `
          SELECT
            t.*,
            m.name
              AS assignee_name,
            b.title
              AS blocker_title,
            b.status
              AS blocker_status

          FROM tasks t

          LEFT JOIN members m
            ON m.id =
               t.assignee_id

          LEFT JOIN tasks b
            ON b.id =
               t.blocked_by_task_id

          WHERE
            t.project_id =
            $1

          ORDER BY
            t.created_at DESC
        `,
        [p.id]
      );

    res.json({
      ...p,
      tasks,
    });
  }
);

app.post(
  "/api/projects",
  auth,
  async (
    req,
    res
  ) => {
    const d =
      parse(
        S.project,
        req.body
      );

    const id =
      uid("p");

    const ts =
      now();

    await execute(
      `
        INSERT INTO projects (
          id,
          owner_id,
          name,
          description,
          status,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7
        )
      `,
      [
        id,
        req.user.id,
        d.name,
        d.description,
        d.status,
        ts,
        ts,
      ]
    );

    await log(
      req.user.id,
      "project",
      `Created project "${d.name}"`,
      d.name
    );

    await notify(
      req.user.id,
      "project",
      "Project created",
      `${d.name} is ready for planning.`,
      "success"
    );

    const project =
      await one(
        `
          SELECT *
          FROM projects
          WHERE id = $1
        `,
        [id]
      );

    res
      .status(201)
      .json(project);
  }
);

app.patch(
  "/api/projects/:id",
  auth,
  async (
    req,
    res
  ) => {
    const c =
      await ownedProject(
        req.params.id,
        req.user.id
      );

    const d =
      parse(
        S.project.partial(),
        req.body
      );

    await execute(
      `
        UPDATE projects

        SET
          name = $1,
          description = $2,
          status = $3,
          updated_at = $4

        WHERE id = $5
      `,
      [
        d.name ??
          c.name,

        d.description ??
          c.description,

        d.status ??
          c.status,

        now(),

        c.id,
      ]
    );

    await log(
      req.user.id,
      "project",
      `Updated project "${d.name ?? c.name}"`,
      d.name ??
        c.name
    );

    const updated =
      await one(
        `
          SELECT *
          FROM projects
          WHERE id = $1
        `,
        [c.id]
      );

    res.json(updated);
  }
);

app.delete(
  "/api/projects/:id",
  auth,
  async (
    req,
    res
  ) => {
    const c =
      await ownedProject(
        req.params.id,
        req.user.id
      );

    await execute(
      `
        DELETE FROM tasks
        WHERE project_id = $1
      `,
      [c.id]
    );

    await execute(
      `
        DELETE FROM projects
        WHERE id = $1
      `,
      [c.id]
    );

    await log(
      req.user.id,
      "project",
      `Deleted project "${c.name}"`,
      c.name
    );

    res
      .status(204)
      .end();
  }
);

app.get(
  "/api/tasks",
  auth,
  async (
    req,
    res
  ) => {
    const q =
      `%${String(
        req.query.q ||
          ""
      )}%`;

    const status =
      req.query.status ||
      null;

    const priority =
      req.query.priority ||
      null;

    const projectId =
      req.query.projectId ||
      null;

    const rows =
      await many(
        `
          SELECT
            t.*,
            p.name
              AS project_name,
            m.name
              AS assignee_name,
            b.title
              AS blocker_title,
            b.status
              AS blocker_status,

            CASE
              WHEN
                t.status !=
                  'done'
                AND
                  t.due_date
                  IS NOT NULL
                AND
                  t.due_date::date
                  < CURRENT_DATE
              THEN 1
              ELSE 0
            END
              AS overdue,

            CASE
              WHEN
                t.status !=
                  'done'
                AND
                  t.blocked_by_task_id
                  IS NOT NULL
                AND COALESCE(
                  b.status,
                  'todo'
                ) != 'done'
              THEN 1
              ELSE 0
            END
              AS blocked,

            CASE
              WHEN
                t.status =
                  'in-progress'
                AND
                  t.updated_at::timestamptz
                  <
                  NOW()
                  -
                  INTERVAL '3 days'
              THEN 1
              ELSE 0
            END
              AS stale

          FROM tasks t

          JOIN projects p
            ON p.id =
               t.project_id

          LEFT JOIN members m
            ON m.id =
               t.assignee_id

          LEFT JOIN tasks b
            ON b.id =
               t.blocked_by_task_id

          WHERE
            p.owner_id = $1

            AND (
              $2 = '%%'
              OR t.title
                ILIKE $2
              OR t.description
                ILIKE $2
            )

            AND (
              $3::text
                IS NULL
              OR t.status =
                 $3
            )

            AND (
              $4::text
                IS NULL
              OR t.priority =
                 $4
            )

            AND (
              $5::text
                IS NULL
              OR t.project_id =
                 $5
            )

          ORDER BY
            overdue DESC,
            blocked DESC,

            CASE
              t.priority
              WHEN 'high'
                THEN 1
              WHEN 'medium'
                THEN 2
              ELSE 3
            END,

            t.created_at DESC
        `,
        [
          req.user.id,
          q,
          status,
          priority,
          projectId,
        ]
      );

    res.json(rows);
  }
);

app.post(
  "/api/tasks",
  auth,
  async (
    req,
    res
  ) => {
    const d =
      parse(
        S.task,
        req.body
      );

    const p =
      await ownedProject(
        d.projectId,
        req.user.id
      );

    if (
      d.assigneeId
    ) {
      const member =
        await one(
          `
            SELECT id
            FROM members
            WHERE
              id = $1
              AND owner_id = $2
          `,
          [
            d.assigneeId,
            req.user.id,
          ]
        );

      if (!member) {
        throw new HttpError(
          400,
          "Assignee is not in this workspace"
        );
      }
    }

    if (
      d.blockedByTaskId
    ) {
      const b =
        await taskOwned(
          d.blockedByTaskId,
          req.user.id
        );

      if (
        b.project_id !==
        p.id
      ) {
        throw new HttpError(
          400,
          "Blocker must belong to the same project"
        );
      }
    }

    const id =
      uid("t");

    const ts =
      now();

    await execute(
      `
        INSERT INTO tasks (
          id,
          project_id,
          assignee_id,
          blocked_by_task_id,
          title,
          description,
          status,
          priority,
          due_date,
          ai_generated,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          0,
          $10,
          $11
        )
      `,
      [
        id,
        p.id,
        d.assigneeId ??
          null,
        d.blockedByTaskId ??
          null,
        d.title,
        d.description,
        d.status,
        d.priority,
        d.dueDate ||
          null,
        ts,
        ts,
      ]
    );

    await log(
      req.user.id,
      "task",
      `Created task "${d.title}"`,
      d.title
    );

    const task =
      await one(
        `
          SELECT *
          FROM tasks
          WHERE id = $1
        `,
        [id]
      );

    res
      .status(201)
      .json(task);
  }
);

app.patch(
  "/api/tasks/:id",
  auth,
  async (
    req,
    res
  ) => {
    const c =
      await taskOwned(
        req.params.id,
        req.user.id
      );

    const d =
      parse(
        S.task.partial(),
        req.body
      );

    const projectId =
      d.projectId ??
      c.project_id;

    await ownedProject(
      projectId,
      req.user.id
    );

    const assignee =
      d.assigneeId !==
      undefined
        ? d.assigneeId
        : c.assignee_id;

    if (assignee) {
      const member =
        await one(
          `
            SELECT id
            FROM members
            WHERE
              id = $1
              AND owner_id = $2
          `,
          [
            assignee,
            req.user.id,
          ]
        );

      if (!member) {
        throw new HttpError(
          400,
          "Assignee is not in this workspace"
        );
      }
    }

    const blocker =
      d.blockedByTaskId !==
      undefined
        ? d.blockedByTaskId
        : c.blocked_by_task_id;

    if (
      blocker ===
      c.id
    ) {
      throw new HttpError(
        400,
        "A task cannot block itself"
      );
    }

    if (blocker) {
      const b =
        await taskOwned(
          blocker,
          req.user.id
        );

      if (
        b.project_id !==
        projectId
      ) {
        throw new HttpError(
          400,
          "Blocker must belong to the same project"
        );
      }
    }

    await execute(
      `
        UPDATE tasks

        SET
          project_id = $1,
          assignee_id = $2,
          blocked_by_task_id = $3,
          title = $4,
          description = $5,
          status = $6,
          priority = $7,
          due_date = $8,
          updated_at = $9

        WHERE id = $10
      `,
      [
        projectId,
        assignee,
        blocker,

        d.title ??
          c.title,

        d.description ??
          c.description,

        d.status ??
          c.status,

        d.priority ??
          c.priority,

        d.dueDate !==
        undefined
          ? d.dueDate ||
            null
          : c.due_date,

        now(),
        c.id,
      ]
    );

    const title =
      d.title ??
      c.title;

    const nextStatus =
      d.status ??
      c.status;

    await log(
      req.user.id,
      "task",
      `Updated task "${title}"`,
      title
    );

    if (
      nextStatus ===
        "done" &&
      c.status !==
        "done"
    ) {
      await notify(
        req.user.id,
        "task",
        "Task completed",
        title,
        "success"
      );
    }

    const updated =
      await one(
        `
          SELECT *
          FROM tasks
          WHERE id = $1
        `,
        [c.id]
      );

    res.json(updated);
  }
);

app.delete(
  "/api/tasks/:id",
  auth,
  async (
    req,
    res
  ) => {
    const c =
      await taskOwned(
        req.params.id,
        req.user.id
      );

    await execute(
      `
        UPDATE tasks
        SET
          blocked_by_task_id =
            NULL
        WHERE
          blocked_by_task_id =
          $1
      `,
      [c.id]
    );

    await execute(
      `
        DELETE FROM tasks
        WHERE id = $1
      `,
      [c.id]
    );

    await log(
      req.user.id,
      "task",
      `Deleted task "${c.title}"`,
      c.title
    );

    res
      .status(204)
      .end();
  }
);

app.get(
  "/api/activity",
  auth,
  async (
    req,
    res
  ) => {
    const type =
      req.query.type ||
      null;

    const rows =
      await many(
        `
          SELECT *
          FROM activities
          WHERE
            user_id = $1
            AND (
              $2::text
                IS NULL
              OR type = $2
            )
          ORDER BY
            created_at DESC
          LIMIT 100
        `,
        [
          req.user.id,
          type,
        ]
      );

    res.json(rows);
  }
);

app.get(
  "/api/notifications",
  auth,
  async (
    req,
    res
  ) => {
    const rows =
      await many(
        `
          SELECT *
          FROM notifications
          WHERE user_id = $1
          ORDER BY
            created_at DESC
          LIMIT 100
        `,
        [
          req.user.id,
        ]
      );

    res.json(rows);
  }
);

app.patch(
  "/api/notifications/:id/read",
  auth,
  async (
    req,
    res
  ) => {
    await execute(
      `
        UPDATE notifications
        SET is_read = 1
        WHERE
          id = $1
          AND user_id = $2
      `,
      [
        req.params.id,
        req.user.id,
      ]
    );

    res.json({
      ok: true,
    });
  }
);

app.post(
  "/api/notifications/run-reminders",
  auth,
  async (
    req,
    res
  ) => {
    await processReminders();

    res.json({
      ok: true,
    });
  }
);

app.get(
  "/api/preferences",
  auth,
  async (
    req,
    res
  ) => {
    const p =
      await one(
        `
          SELECT *
          FROM preferences
          WHERE user_id = $1
        `,
        [
          req.user.id,
        ]
      );

    res.json({
      browserNotifications:
        Boolean(
          p?.browser_notifications
        ),

      emailReminders:
        Boolean(
          p?.email_reminders
        ),

      dailyBriefing:
        Boolean(
          p?.daily_briefing
        ),

      weeklySummary:
        Boolean(
          p?.weekly_summary
        ),

      emailConfigured:
        emailConfigured(),
    });
  }
);

app.patch(
  "/api/preferences",
  auth,
  async (
    req,
    res
  ) => {
    const d =
      parse(
        S.preferences,
        req.body
      );

    const p =
      (await one(
        `
          SELECT *
          FROM preferences
          WHERE user_id = $1
        `,
        [
          req.user.id,
        ]
      )) || {};

    const browserNotifications =
      d.browserNotifications ??
      Boolean(
        p.browser_notifications
      );

    const emailReminders =
      d.emailReminders ??
      Boolean(
        p.email_reminders
      );

    const daily =
      d.dailyBriefing ??
      Boolean(
        p.daily_briefing
      );

    const weekly =
      d.weeklySummary ??
      Boolean(
        p.weekly_summary
      );

    await execute(
      `
        INSERT INTO preferences (
          user_id,
          browser_notifications,
          email_reminders,
          daily_briefing,
          weekly_summary,
          updated_at
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
          user_id
        )

        DO UPDATE SET

          browser_notifications =
            EXCLUDED.browser_notifications,

          email_reminders =
            EXCLUDED.email_reminders,

          daily_briefing =
            EXCLUDED.daily_briefing,

          weekly_summary =
            EXCLUDED.weekly_summary,

          updated_at =
            EXCLUDED.updated_at
      `,
      [
        req.user.id,
        browserNotifications
          ? 1
          : 0,
        emailReminders
          ? 1
          : 0,
        daily
          ? 1
          : 0,
        weekly
          ? 1
          : 0,
        now(),
      ]
    );

    res.json({
      ok: true,
    });
  }
);

app.get(
  "/api/reminders/status",
  auth,
  async (
    req,
    res
  ) => {
    res.json({
      emailConfigured:
        emailConfigured(),

      smtpHost:
        process.env
          .SMTP_HOST ||
        "smtp.gmail.com",
    });
  }
);

app.post(
  "/api/reminders/test-email",
  auth,
  async (
    req,
    res
  ) => {
    const result =
      await sendEmail(
        req.user.email,
        "DevFlow test reminder",
        "Email reminders are configured correctly for your DevFlow workspace."
      );

    res.json(result);
  }
);

app.post(
  "/api/reminders/daily-briefing",
  auth,
  async (
    req,
    res
  ) => {
    res.json(
      await sendDailyBriefingEmail(
        req.user.id
      )
    );
  }
);

app.post(
  "/api/reminders/weekly-summary",
  auth,
  async (
    req,
    res
  ) => {
    res.json(
      await sendWeeklySummaryEmail(
        req.user.id
      )
    );
  }
);

app.get(
  "/api/analytics",
  auth,
  async (
    req,
    res
  ) => {
    const status =
      await many(
        `
          SELECT
            t.status
              AS label,
            COUNT(*)::int
              AS value

          FROM tasks t

          JOIN projects p
            ON p.id =
               t.project_id

          WHERE
            p.owner_id = $1

          GROUP BY
            t.status
        `,
        [
          req.user.id,
        ]
      );

    const priority =
      await many(
        `
          SELECT
            t.priority
              AS label,
            COUNT(*)::int
              AS value

          FROM tasks t

          JOIN projects p
            ON p.id =
               t.project_id

          WHERE
            p.owner_id = $1

          GROUP BY
            t.priority
        `,
        [
          req.user.id,
        ]
      );

    const membersRaw =
      await many(
        `
          SELECT
            COALESCE(
              m.name,
              'Unassigned'
            )
              AS label,

            COUNT(
              t.id
            )::int
              AS value,

            COUNT(
              t.id
            ) FILTER (
              WHERE
                t.status !=
                  'done'
            )::int
              AS active,

            COUNT(
              t.id
            ) FILTER (
              WHERE
                t.status !=
                  'done'
                AND
                  t.priority =
                  'high'
            )::int
              AS high_active

          FROM tasks t

          JOIN projects p
            ON p.id =
               t.project_id

          LEFT JOIN members m
            ON m.id =
               t.assignee_id

          WHERE
            p.owner_id =
            $1

          GROUP BY
            m.name

          ORDER BY
            active DESC
        `,
        [
          req.user.id,
        ]
      );

    const members =
      membersRaw.map(
        (x) => ({
          ...x,

          overloaded:
            Number(
              x.active
            ) >= 7 ||
            Number(
              x.high_active
            ) >= 4,
        })
      );

    res.json({
      status,
      priority,
      members,
    });
  }
);

app.get(
  "/api/project-health",
  auth,
  async (
    req,
    res
  ) => {
    res.json(
      await projectHealth(
        req.user.id
      )
    );
  }
);

app.get(
  "/api/briefing",
  auth,
  async (
    req,
    res
  ) => {
    res.json(
      await dailyBriefing(
        req.user.id
      )
    );
  }
);

app.post(
  "/api/ai/generate-tasks",
  auth,
  async (
    req,
    res
  ) => {
    const d =
      parse(
        S.ai,
        req.body
      );

    const p =
      await ownedProject(
        d.projectId,
        req.user.id
      );

    const result =
      await plan(
        p,
        d.count
      );

    const member =
      await one(
        `
          SELECT id
          FROM members
          WHERE owner_id = $1
          ORDER BY
            created_at
          LIMIT 1
        `,
        [
          req.user.id,
        ]
      );

    const ts =
      now();

    const saved =
      await withTransaction(
        async (
          client
        ) => {
          const created =
            [];

          for (
            const t of
            result.tasks
          ) {
            const id =
              uid("t");

            const inserted =
              await client.query(
                `
                  INSERT INTO tasks (
                    id,
                    project_id,
                    assignee_id,
                    blocked_by_task_id,
                    title,
                    description,
                    status,
                    priority,
                    due_date,
                    ai_generated,
                    created_at,
                    updated_at
                  )

                  VALUES (
                    $1,
                    $2,
                    $3,
                    NULL,
                    $4,
                    $5,
                    'todo',
                    $6,
                    NULL,
                    $7,
                    $8,
                    $9
                  )

                  RETURNING *
                `,
                [
                  id,
                  p.id,
                  member?.id ||
                    null,
                  t.title,
                  t.description,
                  t.priority,

                  result.mode ===
                  "local-ai"
                    ? 1
                    : 0,

                  ts,
                  ts,
                ]
              );

            created.push(
              inserted
                .rows[0]
            );
          }

          return created;
        }
      );

    await log(
      req.user.id,
      "ai",
      `Generated ${saved.length} tasks for "${p.name}" using ${
        result.mode ===
        "local-ai"
          ? "local AI"
          : "fallback planner"
      }`,
      p.name
    );

    await notify(
      req.user.id,
      "ai",

      result.mode ===
      "local-ai"
        ? "AI plan generated"
        : "Local AI unavailable",

      result.mode ===
      "local-ai"
        ? `${saved.length} tasks were generated locally for ${p.name}.`
        : "Ollama was unavailable, so DevFlow used its fallback planner.",

      result.mode ===
      "local-ai"
        ? "success"
        : "warning"
    );

    res
      .status(201)
      .json({
        mode:
          result.mode,

        model:
          result.model,

        tasks:
          saved,

        message:
          result.mode ===
          "local-ai"
            ? "Tasks generated by local Ollama."
            : "Ollama unavailable; fallback planner used.",
      });
  }
);

app.get(
  "/api/ai/project-health/:id",
  auth,
  async (
    req,
    res
  ) => {
    await ownedProject(
      req.params.id,
      req.user.id
    );

    const all =
      await projectHealth(
        req.user.id
      );

    const h =
      all.find(
        (x) =>
          x.id ===
          req.params.id
      );

    res.json(
      await explainHealth(
        h
      )
    );
  }
);

app.use(
  (
    req,
    res
  ) => {
    res
      .status(404)
      .json({
        error: {
          message:
            "Route not found",
        },
      });
  }
);

app.use(
  errorHandler
);

export default app;