-- Payments now start PENDING and only become COMPLETED (counted as revenue, and required to
-- unlock vehicle check-out) once staff verifies them via POST /api/v1/payments/{id}/verify.
-- paid_at is only set at verification time, so it can no longer default to now()/be NOT NULL.
ALTER TABLE payment
    ALTER COLUMN paid_at DROP NOT NULL,
    ALTER COLUMN paid_at DROP DEFAULT,
    ALTER COLUMN status SET DEFAULT 'PENDING';
