CREATE TABLE exam (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500)
);

CREATE TABLE subject (
    id      BIGSERIAL PRIMARY KEY,
    name    VARCHAR(100) NOT NULL,
    exam_id BIGINT NOT NULL REFERENCES exam(id) ON DELETE CASCADE
);

CREATE TABLE topic (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    subject_id BIGINT NOT NULL REFERENCES subject(id) ON DELETE CASCADE
);

CREATE INDEX idx_subject_exam_id ON subject(exam_id);
CREATE INDEX idx_topic_subject_id ON topic(subject_id);