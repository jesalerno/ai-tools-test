import { buildApp } from "./app.js";
import { env } from "./env.js";

const app = buildApp();

app.listen(env.port, () => {
  console.log(`backend listening on ${env.port}`);
});
