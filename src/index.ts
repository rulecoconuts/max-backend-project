import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  //
  // Here's how to run a query.  See more here:
  //	https://developers.cloudflare.com/d1
  //
  //const { results } = await c.env.DB.prepare(
  //  "SELECT * FROM table WHERE name = ?",
  //)
  //  .bind("foo")
  //  .all();
  //

  return c.json({ success: true });
});

export default app;
