
INSERT INTO customer (email, hash_id)
VALUES (${email}, ${hash_id})
RETURNING *;