SELECT
  p.id,
  p.name,
  p.price,
  p.description,
  p.created_at,
  p.updated_at,
  pi.id AS image_id,
  pi.filename
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
