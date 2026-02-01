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
  name: string;
  email: string;
  avatar?: string;
  channelId: string;
  channelName: string;
  status: "active" | "pending" | "suspended";
  onlineStatus: "online" | "away" | "offline";
  lastSeen: Date;
  totalVideos: number;
  totalViews: number;
  totalEarnings: number;
  smatPayMerchantId?: string;
  smatPayStatus?: "verified" | "pending" | "rejected";
  createdAt: Date;
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
  price?: number;
  views: number;
  likes: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
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
