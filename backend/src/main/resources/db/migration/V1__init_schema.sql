-- Needed for the EXCLUDE constraint below: gist index support for a plain equality (=) column.
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE branch (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(30)
);

CREATE TABLE app_user (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(20) NOT NULL CHECK (role IN ('CUSTOMER', 'STAFF', 'ADMIN')),
    branch_id BIGINT REFERENCES branch(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DELETED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_user_role ON app_user(role);
CREATE INDEX idx_app_user_branch_id ON app_user(branch_id);

CREATE TABLE vehicle (
    id BIGSERIAL PRIMARY KEY,
    make VARCHAR(80) NOT NULL,
    model VARCHAR(80) NOT NULL,
    year INTEGER NOT NULL,
    category VARCHAR(40) NOT NULL,
    plate_number VARCHAR(30) NOT NULL UNIQUE,
    daily_rate NUMERIC(10, 2) NOT NULL CHECK (daily_rate >= 0),
    branch_id BIGINT REFERENCES branch(id),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RENTED', 'MAINTENANCE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicle_category ON vehicle(category);
CREATE INDEX idx_vehicle_status ON vehicle(status);
CREATE INDEX idx_vehicle_branch_id ON vehicle(branch_id);

CREATE TABLE vehicle_image (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicle(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL
);

CREATE INDEX idx_vehicle_image_vehicle_id ON vehicle_image(vehicle_id);

-- Admin/staff-declared blocked windows (e.g. scheduled maintenance), distinct from booking-driven
-- unavailability, which is derived from confirmed bookings via the EXCLUDE constraint below.
CREATE TABLE availability (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicle(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_blocked BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (end_date >= start_date)
);

CREATE INDEX idx_availability_vehicle_id ON availability(vehicle_id);

CREATE TABLE booking (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES app_user(id),
    vehicle_id BIGINT NOT NULL REFERENCES vehicle(id),
    confirmed_by_staff_id BIGINT REFERENCES app_user(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED')),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_date >= start_date),
    -- FR-3.4: no two CONFIRMED/ONGOING bookings for the same vehicle may have overlapping date
    -- ranges. Enforced here at the database layer (not just app-level checks) per the PRD's risk
    -- table (Section 14) — this is the actual source of truth; app code should treat a constraint
    -- violation as the expected "dates unavailable" outcome, not an unexpected error.
    CONSTRAINT booking_no_overlap EXCLUDE USING gist (
        vehicle_id WITH =,
        daterange(start_date, end_date, '[]') WITH &&
    ) WHERE (status IN ('CONFIRMED', 'ONGOING'))
);

CREATE INDEX idx_booking_customer_id ON booking(customer_id);
CREATE INDEX idx_booking_vehicle_id ON booking(vehicle_id);
CREATE INDEX idx_booking_status ON booking(status);

CREATE TABLE check_record (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES booking(id),
    staff_id BIGINT NOT NULL REFERENCES app_user(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('CHECK_OUT', 'CHECK_IN')),
    odometer_reading INTEGER NOT NULL CHECK (odometer_reading >= 0),
    condition_notes TEXT,
    extra_charges NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (extra_charges >= 0),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_check_record_booking_id ON check_record(booking_id);

CREATE TABLE payment (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE REFERENCES booking(id),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    method VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    paid_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE review (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE REFERENCES booking(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
