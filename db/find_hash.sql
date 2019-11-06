SELECT * FROM customer c
JOIN password p ON c.hash_id = p.hash_id
WHERE email = $1;