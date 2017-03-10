DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id serial primary key,
    name text NOT NULL,
    price money NOT NULL,
    description text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TABLE IF EXISTS product_images;

CREATE TABLE product_images (
  id serial primary key,
  filename text NOT NULL
);
