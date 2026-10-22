ALTER TABLE app_user
    ADD COLUMN google_id     VARCHAR(100) UNIQUE,
    ADD COLUMN picture_url   VARCHAR(1000),
    ADD COLUMN role          VARCHAR(20) NOT NULL DEFAULT 'USER'
                             CHECK (role IN ('USER', 'ADMIN')),
    ADD COLUMN last_login_at TIMESTAMP;