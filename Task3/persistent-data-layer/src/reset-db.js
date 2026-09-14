import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

const file = path.resolve(process.cwd(), process.env.DATABASE_FILE || "./data/devflow.db");

for (const suffix of ["", "-shm", "-wal"]) {
  const target = `${file}${suffix}`;
  if (fs.existsSync(target)) fs.unlinkSync(target);
}

console.log("Database removed. Run `npm run dev` to recreate and seed it.");
