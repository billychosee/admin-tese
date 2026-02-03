export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "moderator" | "viewer";
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  type: "payment" | "refund" | "withdrawal" | "deposit";
  status: "pending" | "completed" | "failed" | "refunded" | "flagged";
  description: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface Creator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  coverImage?: string;
  channelId: string;
  channelName: string;
  channelUrl?: string;
  status: "active" | "pending" | "suspended";
  onlineStatus: "online" | "away" | "offline";
  lastSeen: Date;
  totalVideos: number;
  totalViews: number;
  totalEarnings: number;
  categories?: string[]; // Array of category names this creator creates content for

  // Address Information
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;

  // Identity Verification
  idType?: "national_id" | "passport" | "drivers_license";
  idNumber?: string;
  idCopyUrl?: string;
  idImageUrl?: string;
  selfieUrl?: string;
  proofOfResidenceUrl?: string;

  // Banking Information
  bankName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  accountHolderName?: string;

  // SmatPay Integration
  smatPayMerchantId?: string;
  smatPayStatus?: "verified" | "pending" | "rejected";

  createdAt: Date;
  updatedAt: Date;
}

export interface PayoutRequest {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  channelName: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected" | "completed";
  bankName: string;
  bankAccountNumber: string;
  accountHolderName: string;
  notes?: string;
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  creatorId: string;
  creatorName: string;
  categoryId: string;
  categoryName: string;
  status: "published" | "draft" | "pending" | "suspended" | "deleted";
  isFeatured: boolean;
  isBanner: boolean;
  isPaid: boolean;
  currency?: "USD" | "ZWG";
  price?: number;
  views: number;
  likes: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  bannerUrl: string | undefined;
  bannerUrl: any;
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  videoCount: number;
  isActive: boolean;
  createdAt: Date;
}

export interface FeaturedCreator {
  id: string;
  creatorId: string;
  creator: Creator;
  position: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Device {
  id: string;
  userId: string;
  deviceType: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  ipAddress: string;
  location: {
    country: string;
    city: string;
    timezone: string;
  };
  lastActive: Date;
  isCurrentSession: boolean;
  isBlocked: boolean;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface DashboardOverview {
  transactions: { label: string; value: number }[];
  creators: { label: string; value: number }[];
  traffic: { label: string; value: number }[];
  totals: {
    revenue: number;
    creators: number;
    videos: number;
    channels: number;
    views: number;
    visitors: number;
  };
}

export interface DashboardStats {
  totalTransactions: number;
  totalRevenue: number;
  totalCreators: number;
  totalChannels: number;
  totalVideos: number;
  totalViews: number;
  dailyVisitors: number;
  dailyViews: number;
  activeChannels: number;
  transactionGrowth: number;
  revenueGrowth: number;
  creatorGrowth: number;
  videoGrowth: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string>;
}

export type ThemeMode = "light" | "dark";

export interface KYCUser {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  selfieUrl?: string;
  idImageUrl?: string;
  idType: "national_id" | "passport" | "drivers_license";
  idNumber: string;
  status: KYCStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

export type KYCStatus =
  | "pending"
  | "pending_approval"
  | "approved"
  | "declined";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export type AdminRole = "super_admin" | "admin" | "editor" | "auditor";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: PermissionModule;
}

export type PermissionModule =
  | "users"
  | "creators"
  | "kyc"
  | "transactions"
  | "videos"
  | "settings"
  | "payouts";

export interface FeeConfiguration {
  id: string;
  type: FeeType;
  name: string;
  percentage: number;
  fixedAmount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type FeeType = "platform" | "service" | "payout" | "subscription";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
