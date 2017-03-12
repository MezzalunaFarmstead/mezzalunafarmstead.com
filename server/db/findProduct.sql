SELECT * FROM products
LEFT JOIN product_images ON products.id = product_images.product_id
WHERE products.id = $1
