CREATE TABLE IF NOT EXISTS shop.auth_tokens (
        id serial PRIMARY KEY,
        email varchar(320) NOT NULL UNIQUE,
        token JSON
        );
