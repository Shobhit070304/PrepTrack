-- "user" is a reserved word in PostgreSQL, so we name the table app_user
CREATE TABLE app_user (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE topic_progress (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    topic_id   BIGINT NOT NULL REFERENCES topic(id) ON DELETE CASCADE,
    status     VARCHAR(20) NOT NULL
               CHECK (status IN ('NOT_STARTED', 'LEARNING', 'REVISING', 'DONE')),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_progress_user_topic UNIQUE (user_id, topic_id)
);

CREATE INDEX idx_progress_user_id ON topic_progress(user_id);