-- Vehicle photos move out of Postgres and into Deploro's R2 object storage. All 46 existing rows
-- were copied to R2 ahead of this migration (keys verified byte-identical by md5), so this only
-- records where each one now lives: the previously-unused image_url column is backfilled with the
-- public URL, and the app reads that column instead of streaming image_data.
--
-- The extension is written once, here, rather than derived from content_type at read time. It is
-- NOT simply the content-type suffix: the single image/jpeg row (id = 3) was stored as ".jpg", so
-- deriving it as split_part(content_type, '/', 2) would produce a ".jpeg" key that does not exist
-- and 404 that one photo. The CASE below is the authoritative mapping.
--
-- image_data is deliberately left populated. It is the only rollback path if a key turns out to be
-- wrong, and reclaiming its ~22MB needs a VACUUM FULL regardless, so dropping it is a separate
-- follow-up migration to be run only after every image is confirmed rendering from R2.
UPDATE vehicle_image
SET image_url = 'https://api.deploro.com/files/carvo/vehicle-images/'
                || vehicle_id || '/' || id
                || CASE content_type
                     WHEN 'image/jpeg' THEN '.jpg'
                     WHEN 'image/png'  THEN '.png'
                   END
WHERE image_url IS NULL
  AND content_type IN ('image/jpeg', 'image/png');

-- Fail the migration rather than deploy a half-backfilled table: any row still missing a URL would
-- silently fall back to serving its blob, which is exactly what this change exists to stop.
DO $$
DECLARE
    missing BIGINT;
BEGIN
    SELECT count(*) INTO missing FROM vehicle_image WHERE image_url IS NULL;
    IF missing > 0 THEN
        RAISE EXCEPTION 'vehicle_image backfill incomplete: % row(s) still have a NULL image_url', missing;
    END IF;
END $$;
