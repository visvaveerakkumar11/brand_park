// Runs a local PostgreSQL server for development (no Docker or system install needed).
// Data persists in .data/postgres. Stop with Ctrl+C.
import { existsSync } from "node:fs";
import EmbeddedPostgres from "embedded-postgres";

const port = Number(process.env.DEV_DB_PORT ?? 5433);
const pg = new EmbeddedPostgres({
  databaseDir: ".data/postgres",
  user: "postgres",
  password: "postgres",
  port,
  persistent: true,
});

if (!existsSync(".data/postgres/PG_VERSION")) await pg.initialise();
await pg.start();
try {
  await pg.createDatabase("brandpark");
} catch {
  // Already exists.
}
console.log(`Postgres ready: postgres://postgres:postgres@localhost:${port}/brandpark`);

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
