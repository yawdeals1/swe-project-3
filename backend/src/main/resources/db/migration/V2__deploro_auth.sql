-- Carvo now authenticates through Deploro Auth-as-a-Service instead of local BCrypt hashes.
-- app_user rows are matched to a Deploro identity by deploro_account_id; password_hash is kept
-- (unused going forward) rather than dropped, so no historical data is lost.
ALTER TABLE app_user ADD COLUMN deploro_account_id VARCHAR(64) UNIQUE;
ALTER TABLE app_user ALTER COLUMN password_hash DROP NOT NULL;
