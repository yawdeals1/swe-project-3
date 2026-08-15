# Product Requirements Document (PRD)
## Vehicle Rental Management System (Carvo)

**App name:** Carvo
**Course context:** CPEN 208 (Software Engineering), Project 3 — University of Ghana
**Document type:** Product Requirements Document, derived from the Project 3 Software Requirements Specification

---

## 1. Overview

Carvo is a web-based platform that lets a single vehicle rental company manage its own fleet, staff, and customer bookings end to end. The system has three user roles: Customer, Staff, and Admin, each with a dedicated workflow and dashboard. It is built as a three-tier application: a frontend single-page app, a Java Spring Boot REST API, and a PostgreSQL database.

This PRD reorganizes the original SRS into a product-first structure: problem, goals, users, scope, phased release plan, then the detailed requirements. All original requirement IDs (FR-x.x, NFR-x) are preserved so the document stays traceable back to the SRS and to the course evaluation criteria.

---

## 2. Problem Statement

Small, single-location vehicle rental operators manage bookings, fleet status, and vehicle handover largely through manual processes (phone calls, spreadsheets, paper handover forms). This creates three recurring problems:

- **Double bookings and availability confusion** — no single source of truth for which vehicle is free on which dates.
- **No audit trail for vehicle condition** — handover and return details (odometer, damage, extra charges) aren't consistently recorded.
- **No unified view for staff or ownership** — staff can't quickly see fleet status or pending requests, and the operator has no dashboard for utilization or revenue.

Carvo solves this by giving each role a purpose-built interface backed by one shared database, so booking, handover, and fleet state stay consistent.

---

## 3. Goals & Success Metrics

| Goal | How it's measured |
|---|---|
| Eliminate double-booking of vehicles | Zero overlapping confirmed bookings for the same vehicle (enforced by FR-3.4) |
| Give staff a reliable handover record | Every check-out/check-in produces a CheckRecord with odometer + condition notes |
| Give the operator visibility into the business | Admin dashboard surfaces fleet size, active bookings, utilization, revenue in real time |
| Deliver a functioning three-tier app for course evaluation | All High-priority FRs and NFRs implemented and demoable; meets Appendix B traceability |
| Keep the system usable without training | First-time user can search, book, and pay without guidance (NFR-3) |

---

## 4. Users & Personas

### 4.1 Customer
Member of the public searching for and booking vehicles. Self-registers. Assumed basic web literacy, no technical training. Primary jobs: search availability, book, pay, track booking status, leave a review.

### 4.2 Staff
Company employee (front-desk/branch agent). Account provisioned by an Admin only — no self-registration. Primary jobs: confirm or reject booking requests, process vehicle check-out and check-in, update vehicle status, look up a customer's rental history.

### 4.3 Administrator
Platform operator (the student/developer, acting as system admin for this project). Full oversight. Primary jobs: manage staff accounts, manage the fleet, view all bookings/transactions, moderate customer accounts, configure pricing/cancellation policy, review the check-in/out audit log.

---

## 5. Scope

**In scope**
- Customer self-registration and role-based authentication (JWT)
- Vehicle search, booking, payment (simulated), and review flow
- Staff booking confirmation and vehicle handover/return workflow
- Admin fleet, staff, and booking oversight, plus a summary dashboard
- REST API backend (Spring Boot) over PostgreSQL, HTTPS/JSON only

**Out of scope**
- Real-time integration with a live payment gateway (simulated/recorded payment flow only)
- Native mobile apps, unless the frontend is built in Flutter (in which case mobile ships for free)
- GPS-based live vehicle tracking

---

## 6. System Architecture & Tech Stack

- **Frontend:** React or Next.js (Flutter is an approved alternative per the course's tech list)
- **Backend:** Java Spring Boot, RESTful JSON API, layered architecture (Controller → Service → Repository)
- **Database:** PostgreSQL — local during development, cloud-hosted for deployment
- **Deployment:** Any HTTPS-reachable cloud host (e.g., Render, Railway, or a university server)
- **Auth:** JWT bearer tokens, BCrypt-hashed passwords
- **Source control:** GitHub, full version history required

---

## 7. Release Plan — MVP / V1 / V2

Phasing is derived directly from the SRS priority column (High → MVP, Medium → V1, Low → V2), so nothing from the original spec is dropped — it's just sequenced.

### MVP (High priority) — the system must do this to be gradeable/demoable
Core auth and RBAC, fleet visibility, booking request → confirm → handover → return, customer search/book/pay, admin oversight dashboard, full CRUD with validation.

### V1 (Medium priority) — hardens and completes the workflow
Logout/session invalidation, password reset, staff-side vehicle status updates and customer history lookup, booking cancellation policy, account suspension, check-in/out audit log for Admin.

### V2 (Low priority) — polish and business-configuration features
Staff notification on new booking requests, customer reviews/ratings, Admin-configurable pricing and cancellation rules.

| Phase | Functional requirements | Rationale |
|---|---|---|
| **MVP** | FR-1.1, FR-1.2, FR-1.3, FR-1.6, FR-1.7, FR-2.1, FR-2.2, FR-2.3, FR-2.4, FR-3.1, FR-3.2, FR-3.3, FR-3.4, FR-3.5, FR-3.7, FR-4.1, FR-4.2, FR-4.3, FR-4.5, FR-5.1, FR-5.2, FR-5.3, FR-5.4 | Without these, no role can complete a full booking-to-return cycle |
| **V1** | FR-1.4, FR-1.5, FR-2.5, FR-2.6, FR-3.6, FR-4.4, FR-4.7 | Completes account lifecycle and gives staff/admin fuller operational control |
| **V2** | FR-2.7, FR-3.8, FR-4.6 | Adds notifications, social proof, and business configurability — valuable but not blocking |

NFRs are foundational rather than phased, but two are effectively MVP gates: **NFR-2 (security)** and **NFR-5 (reliability)** need to be true from the first working build, since retrofitting auth security or crash-safety later is expensive. The rest (performance, usability, responsiveness, scalability, availability, maintainability) are validated progressively as the system matures — see Section 9.

---

## 8. Functional Requirements

### 8.1 Authentication & Account Management

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| FR-1.1 | Allow a new user to self-register only as a Customer (name, email, phone, password) | High | MVP |
| FR-1.2 | Verify the email address is unique before completing registration | High | MVP |
| FR-1.3 | Allow login via email/password; issue a JWT session token on success | High | MVP |
| FR-1.4 | Allow logout, invalidating the active session token | Medium | V1 |
| FR-1.5 | Allow password reset via a verified email link | Medium | V1 |
| FR-1.6 | Restrict endpoint/page access based on authenticated user's role | High | MVP |
| FR-1.7 | Staff and Admin accounts can only be created by an existing Admin — no self-registration | High | MVP |

### 8.2 Staff Module

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| FR-2.1 | View all fleet vehicles and current status (Available/Rented/Under Maintenance) | High | MVP |
| FR-2.2 | View incoming booking requests and confirm or reject them | High | MVP |
| FR-2.3 | Record vehicle check-out: odometer reading, condition notes | High | MVP |
| FR-2.4 | Record vehicle check-in: odometer, condition notes, damage/extra charges | High | MVP |
| FR-2.5 | Update vehicle status (e.g., Under Maintenance) — but not add/edit/delete vehicles | Medium | V1 |
| FR-2.6 | View a Customer's booking and rental history when assisting a transaction | Medium | V1 |
| FR-2.7 | Notify assigned Staff when a new booking request needs confirmation | Low | V2 |

### 8.3 Customer Module

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| FR-3.1 | Search available vehicles by category, date range, price range | High | MVP |
| FR-3.2 | View full vehicle details: photos, daily rate, availability calendar | High | MVP |
| FR-3.3 | Submit a booking request for a vehicle over a date range | High | MVP |
| FR-3.4 | Prevent booking dates that overlap an existing confirmed booking | High | MVP |
| FR-3.5 | View booking status (Pending, Confirmed, Ongoing, Completed, Cancelled) | High | MVP |
| FR-3.6 | Cancel a booking before confirmation, subject to cancellation policy | Medium | V1 |
| FR-3.7 | Record payment for a confirmed booking | High | MVP |
| FR-3.8 | Submit a rating and review for a vehicle after a completed rental | Low | V2 |

### 8.4 Administrator Module

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| FR-4.1 | Create, edit, or remove Staff accounts and assign them to locations/branches | High | MVP |
| FR-4.2 | Add, edit, or remove fleet vehicles (make, model, year, category, plate, rate, photos) | High | MVP |
| FR-4.3 | View all bookings and transactions across the fleet | High | MVP |
| FR-4.4 | Suspend or delete a Customer account that violates policy | Medium | V1 |
| FR-4.5 | Admin dashboard: total vehicles, active bookings, utilization, revenue | High | MVP |
| FR-4.6 | Configure company-wide pricing rules and cancellation policies | Low | V2 |
| FR-4.7 | View an audit log of Staff check-in/check-out records | Medium | V1 |

### 8.5 Cross-Cutting: Dashboard, CRUD, and Validation

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| FR-5.1 | Role-specific dashboard immediately after login | High | MVP |
| FR-5.2 | Validate all form input client-side and server-side before persisting | High | MVP |
| FR-5.3 | Return clear, human-readable error messages for validation/operation failures | High | MVP |
| FR-5.4 | Full CRUD for vehicles, bookings, and user profiles, subject to role permissions | High | MVP |

---

## 9. Non-Functional Requirements

| ID | Category | Requirement | MVP-critical? |
|---|---|---|---|
| NFR-1 | Performance | 95% of API requests complete within 2s under up to 100 concurrent users | Validate post-MVP |
| NFR-2 | Security | Passwords hashed (BCrypt), HTTPS only, JWTs expire after a configurable period | Yes |
| NFR-3 | Usability | Usable by a first-time user without training, consistent navigation | Validate post-MVP |
| NFR-4 | Responsiveness | Renders correctly from 360px (mobile) to 1920px (desktop) | Validate post-MVP |
| NFR-5 | Reliability | Handles invalid/unexpected input without crashing; correct HTTP status codes | Yes |
| NFR-6 | Scalability | Schema/API support 10,000 vehicles and 50,000 users without redesign | Design-time consideration |
| NFR-7 | Maintainability | Layered backend architecture (Controller → Service → Repository) | Yes |
| NFR-8 | Availability | 99% uptime during the evaluation/demo period | Validate at deployment |

---

## 10. External Interfaces

### 10.1 User Interfaces
- **Public:** landing page, vehicle search/browse, vehicle detail, login, registration
- **Customer dashboard:** my bookings, booking detail, payment, review submission, profile
- **Staff dashboard:** fleet status, incoming booking requests, check-out/check-in forms
- **Admin dashboard:** user management, listing moderation, booking/transaction overview, platform settings

### 10.2 Software Interfaces
Frontend and backend communicate exclusively via a versioned REST JSON API (`/api/v1/...`):
- `POST /api/v1/auth/register`, `POST /api/v1/auth/login`
- `GET/POST/PUT/DELETE /api/v1/vehicles`
- `GET/POST/PUT/DELETE /api/v1/bookings`
- `GET/POST /api/v1/payments`
- `GET/PUT /api/v1/users`, `/api/v1/admin/**`

Backend ↔ PostgreSQL via JDBC / Spring Data JPA.

### 10.3 Communication Interfaces
All client-server traffic over HTTPS, JSON payloads. Authenticated requests carry a Bearer JWT in the Authorization header.

---

## 11. Data Model

| Entity | Key attributes |
|---|---|
| User | id, name, email, password_hash, phone, role (CUSTOMER/STAFF/ADMIN), branch_id (FK, nullable), status, created_at |
| Branch | id, name, address, phone — optional, only if fleet spans multiple locations |
| Vehicle | id, make, model, year, category, plate_number, daily_rate, branch_id (FK), status |
| VehicleImage | id, vehicle_id (FK), image_url |
| Availability | id, vehicle_id (FK), start_date, end_date, is_blocked |
| Booking | id, customer_id (FK), vehicle_id (FK), confirmed_by_staff_id (FK, nullable), start_date, end_date, status, total_amount, created_at |
| CheckRecord | id, booking_id (FK), staff_id (FK), type (CHECK_OUT/CHECK_IN), odometer_reading, condition_notes, extra_charges, recorded_at |
| Payment | id, booking_id (FK), amount, method, status, paid_at |
| Review | id, booking_id (FK), rating, comment, created_at |

**Key relationships:** the fleet is owned centrally by the company (optionally grouped by Branch). A Vehicle has many VehicleImage and Availability records. A Booking references one Customer and one Vehicle, is confirmed by one Staff member, and has one or more CheckRecord entries, at most one Payment, and at most one Review.

---

## 12. Booking Status Lifecycle

`Pending` → created when a Customer requests a booking
`Confirmed` → set when Staff accepts the request
`Ongoing` → set when the rental start date is reached
`Completed` → set when the rental end date is reached and payment is settled
`Cancelled` → set when either party cancels before confirmation, per policy

---

## 13. Assumptions & Dependencies

- Users have a modern browser and stable internet connection.
- Payment can be simulated rather than integrated with a live provider.
- Staff accounts are provisioned internally by an Admin; there is no public Staff sign-up.
- Tech stack is fixed by the course brief: Spring Boot + PostgreSQL + a frontend from Flutter/React/Next.js.
- Project must be completed within the semester timeline.
- All code is version-controlled on GitHub.

---

## 14. Risks

| Risk | Mitigation |
|---|---|
| Overlapping-booking bug ships to demo | Enforce FR-3.4 with a DB-level constraint or transactional check, not just UI validation |
| Scope creep past MVP before core flow works | Hold to the MVP list in Section 7 until the full booking-to-return cycle is demoable |
| Simulated payment flow reads as unfinished to evaluator | Make the simulation explicit and intentional in the demo narrative, tied to Section 2 scope note |
| Single-developer timeline slippage | Sequence work strictly by phase (MVP → V1 → V2), not by module preference |

---

## 15. Appendix: Traceability to Project 3 Evaluation Criteria

| Evaluation criterion | Satisfied by |
|---|---|
| Frontend Design and Functionality | Section 8 (role-based UI requirements) + Section 10.1 |
| Backend API Development | Section 8 + Section 10.2 |
| Database Design and Implementation | Section 11 |
| API Integration | Section 10.2 and 10.3 |
| User Interface and UX | NFR-3 and NFR-4 |
| Documentation and Report | This PRD forms the basis of the System Analysis and Design section of the final report |
