# MAX Artists API

This file contains the specifications for the API we're asking you to build out
as part of our interview process. All you really need to know to complete this
project (besides how to write code) is:

1. How to create a simple API via HTTP and
2. How to work with databases (in this case, SQL)

The API should support:

1. Creating and managing artists, including a bio and genre.
2. Releasing and managing music, tracking status (e.g., unreleased, released, trending).

## Project Overview

This project is set up to run as a [Cloudflare Worker], utilizing a [D1]
database and [Hono]. If you are not familiar with Cloudflare, don't worry!
Here is a quick intro:

> Cloudflare is a global cloud platform that provides security, performance, and reliability services for websites, APIs, and applications. Cloudflare Workers is a serverless computing platform that allows developers to run JavaScript, TypeScript, and WebAssembly code at the edge, enabling ultra-fast, scalable applications without managing infrastructure. Cloudflare D1 is a lightweight, serverless SQL database (based on SQLite) designed to work seamlessly with Workers, providing persistent storage with fast, distributed access. Together, these tools enable developers to build and deploy highly performant, globally distributed applications with ease.

Thanks ChatGPT. Oh, and Hono is a simple web framework (similar to [Express])
that should make things quicker and easier to build.

We're using Cloudflare for this project primarily because their `wrangler` tool
provides a very easy way to get up and running (we also use their platform as
one of the tools in our toolkit). Once you've installed the dependencies you
can fire up the dev server via:

```shell
yarn dev
```

This transpiles (and bundles) the typescript code and launches an http server
and D1 database locally.

There is a simple script in the `package.json` for working with the local D1
database (the dev server does not need to be running) which can be useful for
initialization and debugging:

```shell
yarn sql "CREATE TABLE ..."
```

> [!NOTE]
> You do not need to create a Cloudflare account or deploy anything for this project.

[Cloudflare Worker]: https://developers.cloudflare.com/workers/
[D1]: https://developers.cloudflare.com/d1/
[Hono]: https://hono.dev/
[Express]: https://expressjs.com/

## Core Features

1. Artists API
   - Register a new artist with a name, bio, and genre.
   - Fetch all artists, optionally filtering by genre.
2. Releases API
   - Artists can create a release (album/single) with a title, release date, and status.
   - Filter releases by artist_id, genre, or status.

## Endpoints

### Create an Artist

`POST` `/artists`

Request:

```json
{
  "name": "Jane Doe",
  "bio": "Indie pop sensation",
  "genre": "Indie Pop"
}
```

Response:

```json
{
  "id": "artist_123",
  "name": "Jane Doe",
  "bio": "Indie pop sensation",
  "genre": "Indie Pop"
}
```

### Get Artists (with optional filters)

`GET` `/artists?genre=Indie+Pop`

Filters:

- `genre` - case insensitive match
- `name` - case insensitive match

Response:

```json
[
  {
    "id": "artist_123",
    "name": "Jane Doe",
    "genre": "Indie Pop"
  },
  {
    "id": "artist_456",
    "name": "John Smith",
    "genre": "Indie Pop"
  }
]
```

### Create a Release

`POST` `/releases`

Request:

```json
{
  "title": "Breaking Free",
  "release_date": "2025-04-01",
  "status": "unreleased",
  "genre": "Indie Pop",
  "artist_id": "artist_123"
}
```

Response:

```json
{
  "id": "release_123",
  "title": "Breaking Free",
  "release_date": "2025-04-01",
  "status": "unreleased",
  "genre": "Indie Pop",
  "artist_id": "artist_123"
}
```

### Get All Releases (with Filters)

`GET` `/releases?artist_id=artist_123&genre=Indie+Pop`

Filters:

- `artist_id` - exact match
- `genre` - case insensitive match
- `status` - case insensitive match

Response:

```json
[
  {
    "id": "release_123",
    "title": "Breaking Free",
    "status": "unreleased",
    "artist_id": "artist_123"
  },
  {
    "id": "release_456",
    "title": "Next Level",
    "status": "released",
    "artist_id": "artist_123"
  }
]
```

## Evaluation Criteria

- Data Relationships: Proper linkage between artists and releases.
- Querying: Ability to filter data.
- Performance Considerations: Efficient database queries.

## Submission & Setup

Candidates should provide a GitHub repo with:

- README.md (setup instructions). Make sure to include instructions for how to perform any necessary setup step such as database initialization. We've added a `sql-file` command to `package.json` that might be useful for this purpose.
- API implementation

> [!IMPORTANT]
> Make sure your README has everything we need to run your code.

### Other Notes

- Pagination of the endpoints is not necessary
- You do not need to worry about authentication
- Tests won’t be part of the evaluation criteria
- You can use an ORM if you want
- Sorting results is not required
