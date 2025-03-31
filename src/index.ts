import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const app = new Hono<{ Bindings: Env }>();
const artistIdRegex = /artist_\d+/

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

// Get artist data in presentation format
function getArtistPresentation(record: Record<string, unknown>): Record<string, unknown> {
  let presentation = {
    ...record
  };
  presentation["id"] = "artist_" + presentation["id"];
  return presentation;
}

function getReleasePresentation(record: Record<string, unknown>): Record<string, unknown> {
  let presentation = {
    ...record
  };

  presentation["id"] = "release_" + presentation["id"];
  presentation["artist_id"] = "artist_" + presentation["artist_id"];

  return presentation;
}

// Add artist
app.post("/artists", zValidator('json', z.object({
  name: z.string({ required_error: "name is required" }).min(1),
  bio: z.string({ required_error: "bio is required" }).min(1),
  genre: z.string({ required_error: "genre is required" }).min(1)
})), async (c) => {
  try {
    const { name, bio, genre } = c.req.valid("json");

    // clean artist values
    let genreClean = genre.toLowerCase();


    // create record in tablec
    const result = await c.env.DB.prepare("INSERT INTO artists(name, bio, genre) VALUES(?, ?, ?)")
      .bind(name, bio, genreClean)
      .run();

    const record = await c.env.DB.prepare("SELECT * FROM artists WHERE id = ?")
      .bind(result.meta.last_row_id)
      .first();

    if (!record) {
      return c.json({ error: "Could not find created artist" }, 500);
    }

    console.log(record);

    // prep newly created artist record for presentation
    const presentation = getArtistPresentation(record)

    // return presentation
    return c.json(presentation, 200);
  } catch (e: any) {
    if (e instanceof Error && e.message.includes("UNIQUE constraint failed: artists.name")) {
      throw new HTTPException(400, { message: "name already exists" });
    }
    throw e;
  }
});

// Get list of artists
app.get("/artists", zValidator("query", z.object({
  genre: z.optional(z.string()),
  name: z.optional(z.string())
})), async (c) => {
  const { genre, name } = c.req.valid("query");

  // Build query
  let query = "SELECT * FROM artists";
  let args = [];
  if (name && genre) {
    query += " WHERE LOWER(name) = ? and genre = ?";
    args.push(name.toLowerCase());
    args.push(genre.toLowerCase());
  } else if (name && !genre) {
    query += " WHERE LOWER(name) = ?";
    args.push(name.toLowerCase());
  } else if (genre && !name) {
    query += " WHERE genre = ?";
    args.push(genre.toLowerCase());
  }

  let statement = c.env.DB.prepare(
    query,
  );

  if (genre || name) {
    statement = statement.bind(...args);
  }

  const { results } = await statement.all();
  const presentation = results.map(getArtistPresentation);

  return c.json(presentation, 200);

})

// Add release
app.post("/releases", zValidator('json', z.object({
  title: z.string({ required_error: "title is required" }).min(1),
  release_date: z.string({ required_error: "release_date is required" }).date(),
  status: z.string({ required_error: "status is required" }).min(1),
  genre: z.string({ required_error: "genre is required" }).min(1),
  artist_id: z.string({ required_error: "artist_id is required" }).regex(artistIdRegex, "artist_id should be in the format: artist_[integer]")

})), async (c) => {
  try {
    const { title, release_date, status, genre, artist_id } = c.req.valid("json");

    const numericArtistId = parseInt(artist_id.split("_")[1]);

    // create record in table
    const result = await c.env.DB.prepare("INSERT INTO releases(title, release_date, status, genre, artist_id) VALUES(?, ?, ?, ?, ?)")
      .bind(title, release_date, status.toLowerCase(), genre.toLowerCase(), numericArtistId)
      .run();

    const record = await c.env.DB.prepare("SELECT * FROM releases WHERE id = ?")
      .bind(result.meta.last_row_id)
      .first();

    if (!record) {
      return c.json({ error: "Could not find created release" }, 500);
    }

    console.log(record);

    // prep newly created release record for presentation
    const presentation = getReleasePresentation(record)

    // return presentation
    return c.json(presentation, 200);
  } catch (e: any) {
    if (e instanceof Error && e.message.includes("UNIQUE constraint failed: releases.title")) {
      throw new HTTPException(400, { message: "Title already exists in artist's releases" });
    }
    throw e;
  }
});

// Get list of releases
app.get("/releases", zValidator("query", z.object({
  genre: z.optional(z.string()),
  status: z.optional(z.string()),
  artist_id: z.string({ required_error: "artist_id is required" }).regex(artistIdRegex, "artist_id should be in the format: artist_[integer]")
})), async (c) => {
  const { artist_id, genre, status } = c.req.valid("query");
  const numericArtistId = parseInt(artist_id.split("_")[1]);

  // Build query
  let query = "SELECT * FROM releases WHERE artist_id = ?";
  let args: any[] = [numericArtistId];
  if (status && genre) {
    query += " and status = ? and genre = ?";
    args.push(status.toLowerCase());
    args.push(genre.toLowerCase());
  } else if (status && !genre) {
    query += " and status = ?";
    args.push(status.toLowerCase());
  } else if (genre && !status) {
    query += " and genre = ?";
    args.push(genre.toLowerCase());
  }

  let statement = c.env.DB.prepare(
    query,
  );


  const { results } = await statement.bind(...args).all();
  const presentation = results.map(getReleasePresentation);

  return c.json(presentation, 200);
})

app.onError((err) => {
  if (err instanceof HTTPException) {
    // Get the custom response
    return err.getResponse()
  }
  console.log(err);

  return new Response("Internal Server Error", { status: 500 })
})

export default app;
