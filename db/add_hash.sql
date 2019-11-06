INSERT INTO password (hash_value)
VALUES ($1)
RETURNING hash_id;