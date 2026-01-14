-- ====================
-- Users Table
-- ====================
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon_post_id INTEGER,                      -- post used as avatar
    user_name TEXT NOT NULL UNIQUE,            -- can be changed
    user_email TEXT NOT NULL UNIQUE,           -- login
    user_password_hash TEXT NOT NULL,          -- hashed password
    user_description TEXT,
    joined_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    deletion_requested_on DATETIME,            -- auto-delete after 1 week if set
    FOREIGN KEY(icon_post_id) REFERENCES posts(post_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_name ON users(user_name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(user_email);

-- ====================
-- Taxonomy Tables
-- ====================
CREATE TABLE IF NOT EXISTS genres (
    genre_id INTEGER PRIMARY KEY AUTOINCREMENT,
    genre_label TEXT NOT NULL UNIQUE,         -- lowercase with underscores
    genre_popularity INTEGER DEFAULT 0,
    genre_shunning INTEGER DEFAULT 0,
    genre_first_used DATETIME,
    genre_last_used DATETIME
);
CREATE INDEX IF NOT EXISTS idx_genres_label ON genres(genre_label);

CREATE TABLE IF NOT EXISTS tags (
    tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag_label TEXT NOT NULL UNIQUE,           -- lowercase with underscores
    tag_popularity INTEGER DEFAULT 0,
    tag_shunning INTEGER DEFAULT 0,
    tag_first_used DATETIME,
    tag_last_used DATETIME
);
CREATE INDEX IF NOT EXISTS idx_tags_label ON tags(tag_label);

CREATE TABLE IF NOT EXISTS species (
    species_id INTEGER PRIMARY KEY AUTOINCREMENT,
    species_label TEXT NOT NULL UNIQUE,       -- lowercase with underscores
    species_popularity INTEGER DEFAULT 0,
    species_shunning INTEGER DEFAULT 0,
    species_first_used DATETIME,
    species_last_used DATETIME
);
CREATE INDEX IF NOT EXISTS idx_species_label ON species(species_label);

CREATE TABLE IF NOT EXISTS characters (
    character_id INTEGER PRIMARY KEY AUTOINCREMENT,
    species_id INTEGER,                        -- optional link to species
    character_label TEXT NOT NULL UNIQUE,      -- lowercase with underscores
    character_popularity INTEGER DEFAULT 0,
    character_shunning INTEGER DEFAULT 0,
    character_first_used DATETIME,
    character_last_used DATETIME,
    FOREIGN KEY(species_id) REFERENCES species(species_id)
);
CREATE INDEX IF NOT EXISTS idx_characters_label ON characters(character_label);

-- ====================
-- Posts Table
-- ====================
CREATE TABLE IF NOT EXISTS posts (
    post_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    genre_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_image_url TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_viewed DATETIME DEFAULT CURRENT_TIMESTAMP,
    visits INTEGER DEFAULT 0,
    favourites INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY(genre_id) REFERENCES genres(genre_id)
);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_genre ON posts(genre_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_visits ON posts(visits);

-- ====================
-- Taxonomy Join Tables
-- ====================
CREATE TABLE IF NOT EXISTS post_tags (
    post_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY(post_id, tag_id),
    FOREIGN KEY(post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY(tag_id) REFERENCES tags(tag_id)
);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id);

CREATE TABLE IF NOT EXISTS post_species (
    post_id INTEGER NOT NULL,
    species_id INTEGER NOT NULL,
    PRIMARY KEY(post_id, species_id),
    FOREIGN KEY(post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY(species_id) REFERENCES species(species_id)
);
CREATE INDEX IF NOT EXISTS idx_post_species_species ON post_species(species_id);

CREATE TABLE IF NOT EXISTS post_characters (
    post_id INTEGER NOT NULL,
    character_id INTEGER NOT NULL,
    PRIMARY KEY(post_id, character_id),
    FOREIGN KEY(post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY(character_id) REFERENCES characters(character_id)
);
CREATE INDEX IF NOT EXISTS idx_post_characters_character ON post_characters(character_id);

-- ====================
-- Post Comments
-- ====================
CREATE TABLE IF NOT EXISTS post_comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    reference_id INTEGER,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(reference_id) REFERENCES post_comments(comment_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user ON post_comments(user_id);

-- ====================
-- Direct Messages
-- ====================
CREATE TABLE IF NOT EXISTS direct_messages (
    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    sent_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_on DATETIME,
    FOREIGN KEY(sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY(recipient_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_dm_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_recipient ON direct_messages(recipient_id);

-- ====================
-- Blacklists
-- ====================
CREATE TABLE IF NOT EXISTS user_genre_blacklist (
    user_id INTEGER NOT NULL,
    genre_id INTEGER NOT NULL,
    PRIMARY KEY(user_id, genre_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY(genre_id) REFERENCES genres(genre_id)
);

CREATE TABLE IF NOT EXISTS user_tag_blacklist (
    user_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY(user_id, tag_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY(tag_id) REFERENCES tags(tag_id)
);

CREATE TABLE IF NOT EXISTS user_character_blacklist (
    user_id INTEGER NOT NULL,
    character_id INTEGER NOT NULL,
    PRIMARY KEY(user_id, character_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY(character_id) REFERENCES characters(character_id)
);

CREATE TABLE IF NOT EXISTS user_author_blacklist (
    user_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    PRIMARY KEY(user_id, author_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY(author_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS user_user_blacklist (
    user_id INTEGER NOT NULL,
    other_user_id INTEGER NOT NULL,
    PRIMARY KEY(user_id, other_user_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY(other_user_id) REFERENCES users(user_id)
);

-- ====================
-- Reserved Usernames
-- ====================
CREATE TABLE IF NOT EXISTS reserved_user_name (
    user_id INTEGER NOT NULL,
    old_user_name TEXT NOT NULL,
    reserved_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, old_user_name),
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reserved_user_name_old ON reserved_user_name(old_user_name);
