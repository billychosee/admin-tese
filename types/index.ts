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
  lastActiveAt?: Date;
  phoneNumber: string;
  id: string;
  firstName?: string;
  lastName?: string;
  creatorFullName: string;
  description?: string;
  isCompany: boolean;
  companyName?: string;
  VAT?: string;
  tinNumber?: string;
  email: string;
  mobileNumber?: string;
  phone?: string;
  avatar?: string;
  coverImage?: string;

  // Payout Information
  payoutType: "mobile_wallet" | "bank";
  bankName?: string;
  bankAccountNumber?: string;
  accountHolderName?: string;
  bankBranch?: string;

  // Verification Images
  selfie?: string;
  idImage?: string;
  idType?: string;
  idNumber?: string;
  idCopyUrl?: string;
  proofOfResidenceUrl?: string;

  // Channel Information
  channelName: string;
  channelId: string;
  channelUrl?: string;
  channelStatus: "active" | "deactivated";
  channelDeactivationComment?: string;
  channelTrailer?: string;

  // Playlist Information
  playlists: Playlist[];

  // Video Information
  videos: Video[];
  totalVideos: number;
  totalViews: number;
  totalLikes: number;

  // Financial Information
  totalEarnings: number;
  totalRevenue: number;
  totalPaidOut: number;
  currentBalance: number;
  withdrawRequest?: WithdrawRequest;

  // Address Information
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;

  // SMatPay Information
  smatPayMerchantId?: string;
  smatPayStatus?: string;

  // Content Categories
  contentCategories: ContentCategory[];

  status: "active" | "pending" | "suspended";
  onlineStatus: "online" | "away" | "offline";
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Playlist {
  id: string;
  playlistName: string;
  description?: string;
  thumbnail?: string;
  paymentType: PaymentType;
  price?: number;
  videoCount: number;
  totalViews: number;
  totalLikes: number;
  isActive: boolean;
  isDeactivated: boolean;

  // Creator and Channel references
  creatorId: string;
  creatorName: string;
  channelId: string;
  channelName: string;

  // Videos in playlist
  videos: Video[];

  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  videoName?: string;
  videoDescription?: string;
  videoPlayer?: string;
  videoUrl?: string;
  thumbnail?: string;
  videoTrailer?: string;
  comments: number;
  videoComments?: number;
  commentsHidden: boolean;
  views: number;
  likes: number;
  shares: number;
  watchTime: number;
  engagementRate: number;
  salesAmount?: number;
  viewsByPeriod?: {
    daily: { date: string; views: number }[];
    weekly: { week: string; views: number }[];
    monthly: { month: string; views: number }[];
    yearly: { year: string; views: number }[];
  };
  tags?: string[];
  paymentType: PaymentType;
  price?: number;
  currency?: "USD" | "ZWG";
  status: "published" | "draft" | "pending" | "suspended" | "deleted";
  isFeatured: boolean;
  isBanner: boolean;
  isPaid: boolean;

  // Creator and Category references
  creatorId: string;
  creatorName: string;
  categoryId: string;
  categoryName: string;

  // Video metadata
  duration: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface ContentCategory {
  id: string;
  channelName: string;
  paymentType: PaymentType;
  price?: number;
}

export interface WithdrawRequest {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  requestedAt: Date;
  processedAt?: Date;
}

export type PaymentType = "subscription" | "per_view" | "free";

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

export interface Category {
  bannerUrl?: string;
  imageHeight?: number;
  imageWidth?: number;
  imagePosition?: string;
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

export interface ActivityLog {
  id: string;
  adminUserId: string;
  adminUserName: string;
  adminUserEmail: string;
  action: string;
  targetType: "user" | "role" | "fee" | "settings" | "creator" | "video";
  targetId: string;
  targetName: string;
  details?: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  videoId: string;
  videoTitle: string;
  content: string;
  status: "active" | "flagged" | "hidden";
  isFlagged: boolean;
  isHidden: boolean;
  flags: number;
  likes: number;
  replies: number;
  likedBy?: { id: string; name: string; avatar?: string }[];
  repliedBy?: {
    id: string;
    name: string;
    avatar?: string;
    content: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  totalComments: number;
  totalLikes: number;
  totalVideos: number;
  joinedAt: Date;
  lastActive?: Date;
  status: "active" | "suspended" | "banned";
}
