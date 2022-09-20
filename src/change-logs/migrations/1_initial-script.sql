CREATE TABLE IF NOT EXISTS shop.users (id serial PRIMARY KEY,
                                       name varchar(50) NOT NULL,
    ROLE varchar(50),
    isActive boolean, email varchar(320) NOT NULL UNIQUE,
    password varchar(50));

CREATE TABLE IF NOT EXISTS shop.categories (id serial PRIMARY KEY,
                                            name varchar(50) NOT NULL UNIQUE,
    slug varchar(320) NOT NULL UNIQUE);

CREATE TABLE IF NOT EXISTS shop.products (id serial PRIMARY KEY,
                                          author_id integer NOT NULL REFERENCES shop.users(id),
    category_id integer NOT NULL REFERENCES shop.categories(id),
    name varchar(320) NOT NULL,
    slug varchar(320),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    number_of_views integer, price decimal, description varchar(320),
    images varchar[], soft_delete boolean, draft boolean);

CREATE TABLE IF NOT EXISTS shop.cart (id serial PRIMARY KEY,
                                      owner_id varchar(50) NOT NULL REFERENCES shop.users(email),
    product_id serial NOT NULL REFERENCES shop.products(id),
    name varchar(50) NOT NULL,
    price decimal, COUNT decimal);

CREATE TABLE IF NOT EXISTS shop.activation_tokens (id serial PRIMARY KEY,
                                                   email varchar(320) NOT NULL UNIQUE,
    activation_token varchar(100) NOT NULL,
    expires_in TIMESTAMP NOT NULL);
