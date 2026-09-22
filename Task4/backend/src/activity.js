import {
  randomUUID,
} from "node:crypto";

import {
  execute,
} from "./db.js";

export async function logActivity(
  userId,
  type,
  message
) {
  await execute(
    `
      INSERT INTO activities (
        id,
        user_id,
        type,
        message,
        target,
        created_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        NULL,
        $5
      )
    `,
    [
      `a-${randomUUID()}`,
      userId,
      type,
      message,
      new Date().toISOString(),
    ]
  );
}