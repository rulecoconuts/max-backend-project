-- DROP TABLE releases;
-- DROP TABLE artists;
CREATE TABLE artists(
    id INTEGER PRIMARY KEY,
    name NVARCHAR(512) NOT NULL,
    bio NVARCHAR(6000) NOT NULL,
    genre NVARCHAR(256) NOT NULL,
    UNIQUE (name)
);

CREATE TABLE releases(
    id INTEGER PRIMARY KEY,
    title NVARCHAR(512) NOT NULL,
    release_date DATETIME NOT NULL,
    status VARCHAR(100) NOT NULL,
    genre NVARCHAR(256) NOT NULL,
    artist_id INTEGER NOT NULL,
    FOREIGN KEY (artist_id) REFERENCES artists(id),
    UNIQUE (title, artist_id)
);

CREATE INDEX artist_lower_name_idx ON artists(LOWER(name));
CREATE INDEX artist_genre_idx ON artists(genre);
CREATE INDEX releases_genre_idx ON releases(genre);
CREATE INDEX releases_status_idx ON releases(status);

