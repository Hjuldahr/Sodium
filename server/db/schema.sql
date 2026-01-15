-- ======================
-- USERS
-- ======================

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    icon_post_id INT NULL,
    icon_image_url TEXT,
    name VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    password_hash VARBINARY(255) NOT NULL,
    joined_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletion_requested_on TIMESTAMP NULL,
    n_followers INT NOT NULL DEFAULT 0,
    n_comments INT NOT NULL DEFAULT 0,
    n_posts INT NOT NULL DEFAULT 0,
    score INT NOT NULL DEFAULT 0,
    FOREIGN KEY (icon_post_id) REFERENCES posts(post_id) ON DELETE SET NULL
);

-- ======================
-- TAXONOMY
-- ======================

CREATE TABLE taxonomy (
    taxonomy_id INT AUTO_INCREMENT PRIMARY KEY,
    contributor_id INT,
    type ENUM('tag','theme','species','character') NOT NULL,
    n_posts INT NOT NULL DEFAULT 0,
    n_blacklist INT NOT NULL DEFAULT 0,
    n_favourite INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contributor_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE tags (
    tag_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    FOREIGN KEY (tag_id) REFERENCES taxonomy(taxonomy_id) ON DELETE CASCADE
);

CREATE TABLE themes (
    theme_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    intended_age_rating ENUM('safe','mature','adult') NOT NULL,
    FOREIGN KEY (theme_id) REFERENCES taxonomy(taxonomy_id) ON DELETE CASCADE
);

CREATE TABLE species (
    species_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    FOREIGN KEY (species_id) REFERENCES taxonomy(taxonomy_id) ON DELETE CASCADE
);

CREATE TABLE characters (
    character_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    species_id INT,
    intended_age_rating ENUM('safe','mature','adult') NOT NULL,
    FOREIGN KEY (character_id) REFERENCES taxonomy(taxonomy_id) ON DELETE CASCADE,
    FOREIGN KEY (species_id) REFERENCES species(species_id) ON DELETE SET NULL
);

-- ======================
-- POSTS
-- ======================

CREATE TABLE posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    title VARCHAR(100),
    description TEXT,
    thumbnail_image_url TEXT,
    image_url TEXT,
    age_rating ENUM('safe','mature','adult') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    n_views INT NOT NULL DEFAULT 0,
    n_favourite INT NOT NULL DEFAULT 0,
    score INT NOT NULL DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE post_votes (
    post_id INT,
    voter_id INT,
    polarity TINYINT NOT NULL,
    voted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, voter_id),
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (voter_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE post_tags (
    post_id INT,
    tag_id INT,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

CREATE TABLE post_themes (
    post_id INT,
    theme_id INT,
    PRIMARY KEY (post_id, theme_id),
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (theme_id) REFERENCES themes(theme_id) ON DELETE CASCADE
);

CREATE TABLE post_characters (
    post_id INT,
    character_id INT,
    PRIMARY KEY (post_id, character_id),
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(character_id) ON DELETE CASCADE
);

-- ======================
-- POST COMMENTS
-- ======================

CREATE TABLE post_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    commenter_id INT NOT NULL,
    post_id INT NOT NULL,
    content TEXT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    commented_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_on TIMESTAMP NULL,
    FOREIGN KEY (commenter_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);

CREATE TABLE post_comment_votes (
    comment_id INT,
    voter_id INT,
    polarity TINYINT NOT NULL,
    voted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (comment_id, voter_id),
    FOREIGN KEY (comment_id) REFERENCES post_comments(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (voter_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ======================
-- COAUTHORS
-- ======================

CREATE TABLE coauthors (
    post_id INT,
    coauthor_id INT,
    PRIMARY KEY (post_id, coauthor_id),
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (coauthor_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ======================
-- COLLECTIONS
-- ======================

CREATE TABLE collections (
    collection_id INT AUTO_INCREMENT PRIMARY KEY,
    collector_id INT NOT NULL,
    title VARCHAR(100),
    description TEXT,
    score INT NOT NULL DEFAULT 0,
    FOREIGN KEY (collector_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE collection_votes (
    collection_id INT,
    voter_id INT,
    polarity TINYINT NOT NULL,
    voted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, voter_id),
    FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE,
    FOREIGN KEY (voter_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE collection_posts (
    collection_id INT,
    post_id INT,
    position INT NOT NULL,
    PRIMARY KEY (collection_id, post_id),
    FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);

CREATE TABLE collection_tags (
    collection_id INT,
    tag_id INT,
    PRIMARY KEY (collection_id, tag_id),
    FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

CREATE TABLE collection_themes (
    collection_id INT,
    theme_id INT,
    PRIMARY KEY (collection_id, theme_id),
    FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE,
    FOREIGN KEY (theme_id) REFERENCES themes(theme_id) ON DELETE CASCADE
);

CREATE TABLE collection_characters (
    collection_id INT,
    character_id INT,
    PRIMARY KEY (collection_id, character_id),
    FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(character_id) ON DELETE CASCADE
);

CREATE TABLE collection_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    commenter_id INT NOT NULL,
    collection_id INT NOT NULL,
    content TEXT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    commented_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_on TIMESTAMP NULL,
    FOREIGN KEY (commenter_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE
);

CREATE TABLE collection_comment_votes (
    comment_id INT,
    voter_id INT,
    polarity TINYINT NOT NULL,
    voted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (comment_id, voter_id),
    FOREIGN KEY (comment_id) REFERENCES collection_comments(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (voter_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ======================
-- FAVORITES
-- ======================

CREATE TABLE user_favourited_posts (
    user_id INT,
    post_id INT,
    favourited_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);

CREATE TABLE user_favourited_collections (
    user_id INT,
    collection_id INT,
    favourited_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, collection_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE
);

CREATE TABLE user_favourited_tags (
    user_id INT,
    tag_id INT,
    favourited_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, tag_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

CREATE TABLE user_favourited_themes (
    user_id INT,
    theme_id INT,
    favourited_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, theme_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (theme_id) REFERENCES themes(theme_id) ON DELETE CASCADE
);

CREATE TABLE user_favourited_characters (
    user_id INT,
    character_id INT,
    favourited_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, character_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(character_id) ON DELETE CASCADE
);

-- ======================
-- BLACKLISTS
-- ======================

CREATE TABLE user_blacklisted_taxonomy (
    user_id INT,
    taxonomy_id INT,
    blacklisted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, taxonomy_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (taxonomy_id) REFERENCES taxonomy(taxonomy_id) ON DELETE CASCADE
);

CREATE TABLE user_blacklisted_users (
    user_id INT,
    other_user_id INT,
    hide_posts_only BOOLEAN DEFAULT FALSE,
    blacklisted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, other_user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (other_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ======================
-- DIRECT MESSAGES
-- ======================

CREATE TABLE direct_messages (
    dm_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    target_id INT NOT NULL,
    sent_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_on TIMESTAMP NULL,
    content TEXT NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ======================
-- RESERVED USER NAMES
-- ======================

CREATE TABLE reserved_user_names (
    user_id INT,
    old_name VARCHAR(100) NOT NULL,
    reserved_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, old_name),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

DELIMITER //

-- ======================
-- TAXONOMY COUNTS
-- ======================

-- Post tags
CREATE TRIGGER trg_post_tags_insert
AFTER INSERT ON post_tags
FOR EACH ROW
BEGIN
    UPDATE taxonomy
    SET n_posts = n_posts + 1,
        last_selected_at = CURRENT_TIMESTAMP
    WHERE taxonomy_id = NEW.tag_id;
END//

CREATE TRIGGER trg_post_tags_delete
AFTER DELETE ON post_tags
FOR EACH ROW
BEGIN
    UPDATE taxonomy
    SET n_posts = GREATEST(n_posts - 1, 0)
    WHERE taxonomy_id = OLD.tag_id;
END//

-- Post themes
CREATE TRIGGER trg_post_themes_insert
AFTER INSERT ON post_themes
FOR EACH ROW
BEGIN
    UPDATE taxonomy
    SET n_posts = n_posts + 1,
        last_selected_at = CURRENT_TIMESTAMP
    WHERE taxonomy_id = NEW.theme_id;
END//

CREATE TRIGGER trg_post_themes_delete
AFTER DELETE ON post_themes
FOR EACH ROW
BEGIN
    UPDATE taxonomy
    SET n_posts = GREATEST(n_posts - 1, 0)
    WHERE taxonomy_id = OLD.theme_id;
END//

-- Post characters
CREATE TRIGGER trg_post_characters_insert
AFTER INSERT ON post_characters
FOR EACH ROW
BEGIN
    UPDATE taxonomy
    SET n_posts = n_posts + 1,
        last_selected_at = CURRENT_TIMESTAMP
    WHERE taxonomy_id = NEW.character_id;
END//

CREATE TRIGGER trg_post_characters_delete
AFTER DELETE ON post_characters
FOR EACH ROW
BEGIN
    UPDATE taxonomy
    SET n_posts = GREATEST(n_posts - 1, 0)
    WHERE taxonomy_id = OLD.character_id;
END//

-- User blacklists
CREATE TRIGGER trg_blacklist_taxonomy_insert
AFTER INSERT ON user_blacklisted_taxonomy
FOR EACH ROW
BEGIN
    UPDATE taxonomy
    SET n_blacklist = n_blacklist + 1
    WHERE taxonomy_id = NEW.taxonomy_id;
END//

CREATE TRIGGER trg_blacklist_taxonomy_delete
AFTER DELETE ON user_blacklisted_taxonomy
FOR EACH ROW
BEGIN
    UPDATE taxonomy
    SET n_blacklist = GREATEST(n_blacklist - 1, 0)
    WHERE taxonomy_id = OLD.taxonomy_id;
END//

-- ======================
-- POST VOTES
-- ======================

CREATE TRIGGER trg_post_vote_insert
AFTER INSERT ON post_votes
FOR EACH ROW
BEGIN
    UPDATE posts
    SET score = score + NEW.polarity
    WHERE post_id = NEW.post_id;

    UPDATE users
    SET score = score + NEW.polarity
    WHERE user_id = (SELECT author_id FROM posts WHERE post_id = NEW.post_id);
END//

CREATE TRIGGER trg_post_vote_delete
AFTER DELETE ON post_votes
FOR EACH ROW
BEGIN
    UPDATE posts
    SET score = score - OLD.polarity
    WHERE post_id = OLD.post_id;

    UPDATE users
    SET score = score - OLD.polarity
    WHERE user_id = (SELECT author_id FROM posts WHERE post_id = OLD.post_id);
END//

-- ======================
-- POST COMMENT VOTES
-- ======================

CREATE TRIGGER trg_post_comment_vote_insert
AFTER INSERT ON post_comment_votes
FOR EACH ROW
BEGIN
    UPDATE post_comments
    SET score = score + NEW.polarity
    WHERE comment_id = NEW.comment_id;

    UPDATE users
    SET score = score + NEW.polarity
    WHERE user_id = (SELECT commenter_id FROM post_comments WHERE comment_id = NEW.comment_id);
END//

CREATE TRIGGER trg_post_comment_vote_delete
AFTER DELETE ON post_comment_votes
FOR EACH ROW
BEGIN
    UPDATE post_comments
    SET score = score - OLD.polarity
    WHERE comment_id = OLD.comment_id;

    UPDATE users
    SET score = score - OLD.polarity
    WHERE user_id = (SELECT commenter_id FROM post_comments WHERE comment_id = OLD.comment_id);
END//

-- ======================
-- COLLECTION VOTES
-- ======================

CREATE TRIGGER trg_collection_vote_insert
AFTER INSERT ON collection_votes
FOR EACH ROW
BEGIN
    UPDATE collections
    SET score = score + NEW.polarity
    WHERE collection_id = NEW.collection_id;

    UPDATE users
    SET score = score + NEW.polarity
    WHERE user_id = (SELECT collector_id FROM collections WHERE collection_id = NEW.collection_id);
END//

CREATE TRIGGER trg_collection_vote_delete
AFTER DELETE ON collection_votes
FOR EACH ROW
BEGIN
    UPDATE collections
    SET score = score - OLD.polarity
    WHERE collection_id = OLD.collection_id;

    UPDATE users
    SET score = score - OLD.polarity
    WHERE user_id = (SELECT collector_id FROM collections WHERE collection_id = OLD.collection_id);
END//

-- ======================
-- COLLECTION COMMENT VOTES
-- ======================

CREATE TRIGGER trg_collection_comment_vote_insert
AFTER INSERT ON collection_comment_votes
FOR EACH ROW
BEGIN
    UPDATE collection_comments
    SET score = score + NEW.polarity
    WHERE comment_id = NEW.comment_id;

    UPDATE users
    SET score = score + NEW.polarity
    WHERE user_id = (SELECT commenter_id FROM collection_comments WHERE comment_id = NEW.comment_id);
END//

CREATE TRIGGER trg_collection_comment_vote_delete
AFTER DELETE ON collection_comment_votes
FOR EACH ROW
BEGIN
    UPDATE collection_comments
    SET score = score - OLD.polarity
    WHERE comment_id = OLD.comment_id;

    UPDATE users
    SET score = score - OLD.polarity
    WHERE user_id = (SELECT commenter_id FROM collection_comments WHERE comment_id = OLD.comment_id);
END//

-- ======================
-- USER POST/COMMENT COUNTS
-- ======================

CREATE TRIGGER trg_user_post_insert
AFTER INSERT ON posts
FOR EACH ROW
BEGIN
    UPDATE users
    SET n_posts = n_posts + 1
    WHERE user_id = NEW.author_id;
END//

CREATE TRIGGER trg_user_post_delete
AFTER DELETE ON posts
FOR EACH ROW
BEGIN
    UPDATE users
    SET n_posts = GREATEST(n_posts - 1, 0)
    WHERE user_id = OLD.author_id;
END//

CREATE TRIGGER trg_user_comment_insert
AFTER INSERT ON post_comments
FOR EACH ROW
BEGIN
    UPDATE users
    SET n_comments = n_comments + 1
    WHERE user_id = NEW.commenter_id;
END//

CREATE TRIGGER trg_user_comment_delete
AFTER DELETE ON post_comments
FOR EACH ROW
BEGIN
    UPDATE users
    SET n_comments = GREATEST(n_comments - 1, 0)
    WHERE user_id = OLD.commenter_id;
END//

-- ======================
-- FOLLOWERS
-- ======================

CREATE TRIGGER trg_follow_insert
AFTER INSERT ON followers
FOR EACH ROW
BEGIN
    UPDATE users
    SET n_followers = n_followers + 1
    WHERE user_id = NEW.other_user_id;
END//

CREATE TRIGGER trg_follow_delete
AFTER DELETE ON followers
FOR EACH ROW
BEGIN
    UPDATE users
    SET n_followers = GREATEST(n_followers - 1, 0)
    WHERE user_id = OLD.other_user_id;
END//

-- ======================
-- POST FAVOURITES
-- ======================

CREATE TRIGGER trg_user_favourited_posts_insert
AFTER INSERT ON user_favourited_posts
FOR EACH ROW
BEGIN
    UPDATE posts
    SET n_favourite = n_favourite + 1
    WHERE post_id = NEW.post_id;
END//

CREATE TRIGGER trg_user_favourited_posts_delete
AFTER DELETE ON user_favourited_posts
FOR EACH ROW
BEGIN
    UPDATE posts
    SET n_favourite = GREATEST(n_favourite - 1, 0)
    WHERE post_id = OLD.post_id;
END//

-- ======================
-- COLLECTION FAVOURITES
-- ======================

CREATE TRIGGER trg_user_favourited_collections_insert
AFTER INSERT ON user_favourited_collections
FOR EACH ROW
BEGIN
    UPDATE collections
    SET n_favourite = n_favourite + 1
    WHERE collection_id = NEW.collection_id;
END//

CREATE TRIGGER trg_user_favourited_collections_delete
AFTER DELETE ON user_favourited_collections
FOR EACH ROW
BEGIN
    UPDATE collections
    SET n_favourite = GREATEST(n_favourite - 1, 0)
    WHERE collection_id = OLD.collection_id;
END//

-- ======================
-- TAG FAVOURITES
-- ======================

CREATE TRIGGER trg_user_favourited_tags_insert
AFTER INSERT ON user_favourited_tags
FOR EACH ROW
BEGIN
    UPDATE taxonomy
    SET n_favourite = COALESCE(n_favourite,0) + 1
    WHERE taxonomy_id = NEW.tag_id;
END//

CREATE TRIGGER trg_user_favourited_tags_delete
AFTER DELETE ON user_favourited_tags
FOR EACH ROW
BEGIN
    UPDATE taxonomy
    SET n_favourite = GREATEST(COALESCE(n_favourite,0) - 1, 0)
    WHERE taxonomy_id = OLD.tag_id;
END//

-- ======================
-- THEME FAVOURITES
-- ======================

CREATE TRIGGER trg_user_favourited_themes_insert
AFTER INSERT ON user_favourited_themes
FOR EACH ROW
BEGIN
    UPDATE taxonomy
    SET n_favourite = COALESCE(n_favourite,0) + 1
    WHERE taxonomy_id = NEW.theme_id;
END//

CREATE TRIGGER trg_user_favourited_themes_delete
AFTER DELETE ON user_favourited_themes
FOR EACH ROW
BEGIN
    UPDATE taxonomy
    SET n_favourite = GREATEST(COALESCE(n_favourite,0) - 1, 0)
    WHERE taxonomy_id = OLD.theme_id;
END//

-- ======================
-- CHARACTER FAVOURITES
-- ======================

CREATE TRIGGER trg_user_favourited_characters_insert
AFTER INSERT ON user_favourited_characters
FOR EACH ROW
BEGIN
    UPDATE taxonomy
    SET n_favourite = COALESCE(n_favourite,0) + 1
    WHERE taxonomy_id = NEW.character_id;
END//

CREATE TRIGGER trg_user_favourited_characters_delete
AFTER DELETE ON user_favourited_characters
FOR EACH ROW
BEGIN
    UPDATE taxonomy
    SET n_favourite = GREATEST(COALESCE(n_favourite,0) - 1, 0)
    WHERE taxonomy_id = OLD.character_id;
END//

CREATE TRIGGER trg_users_name_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    -- Only act if the username is actually changing
    IF NEW.name <> OLD.name THEN

        -- 1. Insert the old username into reserved_user_names
        INSERT INTO reserved_user_names(user_id, old_name, reserved_on)
        VALUES (OLD.user_id, OLD.name, CURRENT_TIMESTAMP);

        -- 2. Remove any reservation that matches the new username
        DELETE FROM reserved_user_names
        WHERE old_name = NEW.name;
    END IF;
END//

-- Enable the event scheduler if not already enabled
SET GLOBAL event_scheduler = ON;

CREATE EVENT evt_weekly_cleanup
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    -- Delete users who requested deletion more than 1 week ago
    DELETE FROM users
    WHERE deletion_requested_on IS NOT NULL
      AND deletion_requested_on <= NOW() - INTERVAL 1 WEEK;

    -- Delete reserved usernames older than 1 week
    DELETE FROM reserved_user_names
    WHERE reserved_on <= NOW() - INTERVAL 1 WEEK;
END//

DELIMITER ;