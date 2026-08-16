-- Vehicle photos are now uploaded as files (FR-4.2) instead of pasted as external URLs; the image
-- bytes are stored directly in Postgres and served back through the API, so image_url is replaced
-- by binary storage + the content type needed to serve it with the right header.
ALTER TABLE vehicle_image ADD COLUMN content_type VARCHAR(100);
ALTER TABLE vehicle_image ADD COLUMN image_data BYTEA;
ALTER TABLE vehicle_image ALTER COLUMN image_url DROP NOT NULL;
