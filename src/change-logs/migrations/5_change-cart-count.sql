ALTER TABLE shop.cart DROP COLUMN count;

ALTER TABLE shop.cart 
    ADD COLUMN count decimal CHECK (count >= 1);
