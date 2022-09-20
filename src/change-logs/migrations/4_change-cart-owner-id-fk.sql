ALTER TABLE shop.cart DROP COLUMN owner_id;

ALTER TABLE shop.cart 
    ADD COLUMN owner_id INTEGER NOT NULL
    REFERENCES shop.users(id);
