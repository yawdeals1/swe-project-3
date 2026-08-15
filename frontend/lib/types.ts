export type Role = "CUSTOMER" | "STAFF" | "ADMIN";

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  branchId: number | null;
}

export interface AuthResponse {
  status: "AUTHENTICATED" | "PENDING_VERIFICATION";
  token: string | null;
  user: UserSummary | null;
}

export interface VehicleResponse {
  id: number;
  make: string;
  model: string;
  year: number;
  category: string;
  plateNumber: string;
  dailyRate: number;
  branchId: number | null;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE";
  imageUrls: string[];
}

export interface BookingResponse {
  id: number;
  customerId: number;
  customerName: string;
  vehicleId: number;
  vehicleLabel: string;
  confirmedByStaffId: number | null;
  startDate: string;
  endDate: string;
  status: "PENDING" | "CONFIRMED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
}

export interface CheckRecordResponse {
  id: number;
  bookingId: number;
  staffId: number;
  staffName: string;
  type: "CHECK_OUT" | "CHECK_IN";
  odometerReading: number;
  conditionNotes: string | null;
  extraCharges: number;
  recordedAt: string;
}

export interface PaymentResponse {
  id: number;
  bookingId: number;
  amount: number;
  method: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  paidAt: string;
}

export interface DashboardResponse {
  totalVehicles: number;
  availableVehicles: number;
  activeBookings: number;
  pendingBookings: number;
  utilizationRate: number;
  totalRevenue: number;
}

export interface BranchResponse {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
}
