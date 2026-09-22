import jwt from "jsonwebtoken";
import {
  one,
} from "./db.js";
import {
  HttpError,
} from "./http.js";

function secret() {
  return (
    process.env.JWT_SECRET ||
    "development-only-secret-change-me"
  );
}

export function signToken(
  user
) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    secret(),
    {
      expiresIn: "7d",
    }
  );
}

export async function requireAuth(
  req,
  res,
  next
) {
  const header =
    req.headers.authorization ||
    "";

  const token =
    header.startsWith(
      "Bearer "
    )
      ? header.slice(7)
      : null;

  if (!token) {
    return next(
      new HttpError(
        401,
        "Authentication required"
      )
    );
  }

  try {
    const payload =
      jwt.verify(
        token,
        secret()
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
        [payload.sub]
      );

    if (!user) {
      throw new Error(
        "User missing"
      );
    }

    req.user = user;
    next();
  } catch {
    next(
      new HttpError(
        401,
        "Invalid or expired token"
      )
    );
  }
}