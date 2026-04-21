export type UserRole = "admin" | "user";

export interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Share {
  id: number;
  user_id: number;
  num_shares: number;
  amount_per_share: number;
  multiplier: number;
  total_credit_limit: number;
  created_at: string;
}

export interface LoanRequest {
  id: number;
  user_id: number;
  amount_requested: number;
  status: "pending" | "approved" | "rejected";
  admin_id?: number;
  rejection_reason?: string;
  repayment_months?: number;
  note?: string;
  created_at: string;
}

export interface Loan {
  id: number;
  loan_request_id: number;
  user_id: number;
  principal: number;
  remaining_amount: number;
  status: "active" | "completed";
  disbursed_at: string;
}

export interface EMI {
  id: number;
  loan_id: number;
  due_date: string;
  amount: number;
  status: "pending" | "paid" | "late";
  paid_at?: string;
  penalty_amount: number;
}

export interface Payment {
  id: number;
  loan_id: number;
  emi_id?: number;
  amount_paid: number;
  paid_at: string;
  confirmed_by_admin: boolean;
}

export interface DashboardData {
  user_id: number;
  name: string;
  num_shares: number;
  amount_per_share: number;
  multiplier: number;
  total_credit_limit: number;
  used_credit: number;
  available_credit: number;
  active_loans: Loan[];
}

export interface Theme {
  id: number;
  name: string;
  bg_color: string;
  bg_image?: string;
  text_color: string;
  highlight_color: string;
  font_bold: boolean;
  title?: string;
  subtitle?: string;
  shadow_color?: string;
  is_active: boolean;
}

export interface Banner {
  id: number;
  title: string;
  image_url: string;
  client_name?: string;
  is_active: boolean;
  cost_per_view: number;
  total_views: number;
  total_charge: number;
  created_at: string;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  target: "all" | "user";
  user_id?: number;
  type: string;
  sent_at: string;
}
