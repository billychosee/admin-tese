export const APP_NAME = "TESE Admin Portal";
export const APP_VERSION = "1.0.0";

export const SIDEBAR_WIDTH = {
  expanded: 280,
  collapsed: 72,
};

export const THEME_KEY = "tese-theme";
export const SIDEBAR_KEY = "tese-sidebar-collapsed";
export const AUTH_TOKEN_KEY = "tese-auth-token";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 30, 50, 100],
};

export const MAX_DEVICES = 2;

export const TABLET_BREAKPOINT = 768;
export const MOBILE_BREAKPOINT = 640;

export const DEBOUNCE_DELAY = 300;
export const THROTTLE_DELAY = 200;

export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
};

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

export const SIDEBAR_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    id: "categories",
    label: "Categories",
    href: "/categories",
    icon: "FolderOpen",
  },
  {
    id: "creators",
    label: "Creators",
    href: "/creators",
    icon: "Users",
  },
  {
    id: "videos",
    label: "Videos",
    href: "/videos",
    icon: "Video",
  },
  {
    id: "featured",
    label: "Featured",
    href: "/featured",
    icon: "Star",
  },
  {
    id: "transactions",
    label: "Transactions",
    href: "/transactions",
    icon: "CreditCard",
  },
  {
    id: "devices",
    label: "Devices",
    href: "/devices",
    icon: "Smartphone",
  },
];

export const STAT_CARDS = [
  {
    id: "transactions",
    label: "Transactions",
    icon: "CreditCard",
    color: "primary",
  },
  {
    id: "revenue",
    label: "Revenue",
    icon: "DollarSign",
    color: "gold",
  },
  {
    id: "creators",
    label: "Creators",
    icon: "Users",
    color: "green",
  },
  {
    id: "channels",
    label: "Channels",
    icon: "Radio",
    color: "blue",
  },
  {
    id: "videos",
    label: "Videos",
    icon: "Video",
    color: "purple",
  },
  {
    id: "views",
    label: "Views",
    icon: "Eye",
    color: "cyan",
  },
  {
    id: "visitors",
    label: "Daily Visitors",
    icon: "TrendingUp",
    color: "orange",
  },
];

export const CHART_TIME_RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
];

export const TRANSACTION_STATUSES = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
  { value: "flagged", label: "Flagged" },
];

export const CREATOR_STATUSES = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
];

export const VIDEO_STATUSES = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
];

export const VIDEO_FILTERS = [
  { value: "all", label: "All Videos" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

export const DEVICE_TYPES = [
  { value: "all", label: "All Devices" },
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "tablet", label: "Tablet" },
];
