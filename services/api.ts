import type {
  User,
  Transaction,
  Creator,
  Video,
  Category,
  FeaturedCreator,
  Device,
  DashboardStats,
  PaginatedResponse,
  DashboardOverview,
  PayoutRequest,
  KYCUser,
  KYCStatus,
  AdminUser,
  Role,
  Permission,
  FeeConfiguration,
  Playlist,
  Comment,
  UserProfile,
} from "@/types";
import {
  mockTransactions,
  mockCreators,
  mockVideos,
  mockCategories,
  mockFeaturedCreators,
  mockDevices,
  mockDashboardStats,
  mockTransactionChartData,
  mockRevenueChartData,
  mockOverviewData,
  mockPayoutRequests,
  mockKYCUsers,
  mockAdminUsers,
  mockFeeConfigurations,
  mockPermissions,
  mockRoles,
  mockPlaylists,
  mockComments,
  mockUserProfiles,
} from "./mockData";
import { generateId } from "@/utils";

const DELAY = 500;

const simulateApiDelay = () =>
  new Promise((resolve) => setTimeout(resolve, DELAY));

export const api = {
  auth: {
    async login(
      email: string,
      _password: string,
    ): Promise<{ user: User; token: string }> {
      await simulateApiDelay();

      if (email === "admin@tese.com") {
        const user: User = {
          id: "1",
          email,
          name: "TESE Admin",
          role: "admin",
          createdAt: new Date(),
          lastLogin: new Date(),
        };
        return { user, token: "mock-jwt-token-" + generateId() };
      }

      throw new Error("Invalid credentials");
    },

    async register(
      email: string,
      password: string,
      _confirmPassword: string,
    ): Promise<{ user: User; token: string }> {
      await simulateApiDelay();

      const user: User = {
        id: generateId(),
        email,
        name: email.split("@")[0],
        role: "admin",
        createdAt: new Date(),
      };
      return { user, token: "mock-jwt-token-" + generateId() };
    },

    async logout(): Promise<void> {
      await simulateApiDelay();
    },

    async getCurrentUser(): Promise<User | null> {
      await simulateApiDelay();
      return {
        id: "1",
        email: "admin@tese.com",
        name: "TESE Admin",
        role: "admin",
        createdAt: new Date(),
        lastLogin: new Date(),
      };
    },
  },

  dashboard: {
    async getStats(): Promise<DashboardStats> {
      await simulateApiDelay();
      return mockDashboardStats;
    },

    async getOverview(
      _range: string = "MONTHLY",
    ): Promise<DashboardOverview> {
      await simulateApiDelay();
      return mockOverviewData;
    },

    async getTransactionChart(
      days: number = 7,
    ): Promise<typeof mockTransactionChartData> {
      await simulateApiDelay();
      return mockTransactionChartData;
    },

    async getRevenueChart(
      days: number = 7,
    ): Promise<typeof mockRevenueChartData> {
      await simulateApiDelay();
      return mockRevenueChartData;
    },
  },

  transactions: {
    async getAll(
      page: number = 1,
      pageSize: number = 10,
      status?: string,
    ): Promise<PaginatedResponse<Transaction>> {
      await simulateApiDelay();

      let filtered = [...mockTransactions];
      if (status && status !== "all") {
        filtered = filtered.filter((t) => t.status === status);
      }

      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return {
        data,
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      };
    },

    async updateStatus(
      id: string,
      status: Transaction["status"],
    ): Promise<Transaction> {
      await simulateApiDelay();
      const transaction = mockTransactions.find((t) => t.id === id);
      if (!transaction) throw new Error("Transaction not found");
      return { ...transaction, status };
    },

    async refund(id: string): Promise<Transaction> {
      await simulateApiDelay();
      const transaction = mockTransactions.find((t) => t.id === id);
      if (!transaction) throw new Error("Transaction not found");
      return { ...transaction, status: "refunded" };
    },

    async flag(id: string): Promise<Transaction> {
      await simulateApiDelay();
      const transaction = mockTransactions.find((t) => t.id === id);
      if (!transaction) throw new Error("Transaction not found");
      return { ...transaction, status: "flagged" };
    },
  },

  creators: {
    async getAll(
      page: number = 1,
      pageSize: number = 10,
      status?: string,
      search?: string,
    ): Promise<PaginatedResponse<Creator>> {
      await simulateApiDelay();

      let filtered = [...mockCreators];
      if (status && status !== "all") {
        filtered = filtered.filter((c) => c.status === status);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.creatorFullName.toLowerCase().includes(s) ||
            c.email.toLowerCase().includes(s) ||
            c.channelName.toLowerCase().includes(s),
        );
      }

      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return {
        data,
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      };
    },

    async getById(id: string): Promise<Creator> {
      await simulateApiDelay();
      const creator = mockCreators.find((c) => c.id === id);
      if (!creator) throw new Error("Creator not found");
      return creator;
    },

    async updateStatus(
      id: string,
      status: Creator["status"],
    ): Promise<Creator> {
      await simulateApiDelay();
      const creator = mockCreators.find((c) => c.id === id);
      if (!creator) throw new Error("Creator not found");
      return { ...creator, status };
    },

    async approve(id: string): Promise<Creator> {
      return this.updateStatus(id, "active");
    },

    async reject(id: string): Promise<Creator> {
      return this.updateStatus(id, "suspended");
    },

    async activate(id: string): Promise<Creator> {
      return this.updateStatus(id, "active");
    },

    async deactivate(id: string): Promise<Creator> {
      return this.updateStatus(id, "suspended");
    },

    async deactivateChannel(id: string): Promise<Creator> {
      await simulateApiDelay();
      const creator = mockCreators.find((c) => c.id === id);
      if (!creator) throw new Error("Creator not found");
      return { ...creator, channelStatus: "deactivated" };
    },

    async activateChannel(id: string): Promise<Creator> {
      await simulateApiDelay();
      const creator = mockCreators.find((c) => c.id === id);
      if (!creator) throw new Error("Creator not found");
      return { ...creator, channelStatus: "active" };
    },

    async toggleChannelStatus(id: string): Promise<Creator> {
      await simulateApiDelay();
      const creator = mockCreators.find((c) => c.id === id);
      if (!creator) throw new Error("Creator not found");
      const newStatus = creator.channelStatus === "active" ? "deactivated" : "active";
      return { ...creator, channelStatus: newStatus };
    },

    async processPayout(id: string): Promise<Creator> {
      await simulateApiDelay();
      const creator = mockCreators.find((c) => c.id === id);
      if (!creator) throw new Error("Creator not found");
      const amount = creator.currentBalance;
      return {
        ...creator,
        currentBalance: 0,
        totalPaidOut: creator.totalPaidOut + amount,
        withdrawRequest: {
          id: "wr_" + generateId(),
          amount,
          status: "completed",
          requestedAt: new Date(),
          processedAt: new Date(),
        },
      };
    },
  },

  videos: {
    async getAll(
      page: number = 1,
      pageSize: number = 10,
      status?: string,
      filter?: string,
      search?: string,
    ): Promise<PaginatedResponse<Video>> {
      await simulateApiDelay();

      let filtered = [...mockVideos];
      if (status && status !== "all") {
        filtered = filtered.filter((v) => v.status === status);
      }
      if (filter === "free") {
        filtered = filtered.filter((v) => !v.isPaid);
      } else if (filter === "paid") {
        filtered = filtered.filter((v) => v.isPaid);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.title.toLowerCase().includes(s) ||
            v.creatorName.toLowerCase().includes(s),
        );
      }

      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return {
        data,
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      };
    },

    async getById(id: string): Promise<Video> {
      await simulateApiDelay();
      const video = mockVideos.find((v) => v.id === id);
      if (!video) throw new Error("Video not found");
      return video;
    },

    async updateStatus(id: string, status: Video["status"]): Promise<Video> {
      await simulateApiDelay();
      const video = mockVideos.find((v) => v.id === id);
      if (!video) throw new Error("Video not found");
      return { ...video, status };
    },

    async delete(id: string): Promise<void> {
      await simulateApiDelay();
      const index = mockVideos.findIndex((v) => v.id === id);
      if (index === -1) throw new Error("Video not found");
      mockVideos[index].status = "deleted";
    },

    async promoteToFeatured(id: string): Promise<Video> {
      await simulateApiDelay();
      const video = mockVideos.find((v) => v.id === id);
      if (!video) throw new Error("Video not found");
      return { ...video, isFeatured: true };
    },

    async removeFromFeatured(id: string): Promise<Video> {
      await simulateApiDelay();
      const video = mockVideos.find((v) => v.id === id);
      if (!video) throw new Error("Video not found");
      return { ...video, isFeatured: false };
    },

    async promoteToBanner(id: string): Promise<Video> {
      await simulateApiDelay();
      const video = mockVideos.find((v) => v.id === id);
      if (!video) throw new Error("Video not found");
      return { ...video, isBanner: true };
    },

    async removeFromBanner(id: string): Promise<Video> {
      await simulateApiDelay();
      const video = mockVideos.find((v) => v.id === id);
      if (!video) throw new Error("Video not found");
      return { ...video, isBanner: false };
    },

    async deactivate(id: string): Promise<Video> {
      await simulateApiDelay();
      const video = mockVideos.find((v) => v.id === id);
      if (!video) throw new Error("Video not found");
      return { ...video, status: "suspended" };
    },

    async activate(id: string): Promise<Video> {
      await simulateApiDelay();
      const video = mockVideos.find((v) => v.id === id);
      if (!video) throw new Error("Video not found");
      return { ...video, status: "published" };
    },

    async toggleVideoStatus(id: string): Promise<Video> {
      await simulateApiDelay();
      const video = mockVideos.find((v) => v.id === id);
      if (!video) throw new Error("Video not found");
      const newStatus = video.status === "published" ? "suspended" : "published";
      return { ...video, status: newStatus };
    },

    async deactivateTrailer(id: string): Promise<Video> {
      await simulateApiDelay();
      const video = mockVideos.find((v) => v.id === id);
      if (!video) throw new Error("Video not found");
      return { ...video, videoTrailer: undefined };
    },

    async toggleTrailer(id: string): Promise<Video> {
      await simulateApiDelay();
      const video = mockVideos.find((v) => v.id === id);
      if (!video) throw new Error("Video not found");
      return { ...video, videoTrailer: video.videoTrailer ? undefined : video.videoTrailer };
    },

    async hideComments(id: string): Promise<Video> {
      await simulateApiDelay();
      const video = mockVideos.find((v) => v.id === id);
      if (!video) throw new Error("Video not found");
      return { ...video, commentsHidden: true };
    },

    async showComments(id: string): Promise<Video> {
      await simulateApiDelay();
      const video = mockVideos.find((v) => v.id === id);
      if (!video) throw new Error("Video not found");
      return { ...video, commentsHidden: false };
    },

    async toggleComments(id: string): Promise<Video> {
      await simulateApiDelay();
      const video = mockVideos.find((v) => v.id === id);
      if (!video) throw new Error("Video not found");
      return { ...video, commentsHidden: !video.commentsHidden };
    },
  },

  categories: {
    async getAll(): Promise<Category[]> {
      await simulateApiDelay();
      return mockCategories;
    },

    async getById(id: string): Promise<Category> {
      await simulateApiDelay();
      const category = mockCategories.find((c) => c.id === id);
      if (!category) throw new Error("Category not found");
      return category;
    },

    async create(data: Omit<Category, "id" | "createdAt">): Promise<Category> {
      await simulateApiDelay();
      const newCategory: Category = {
        ...data,
        id: "cat_" + generateId(),
        createdAt: new Date(),
      };
      mockCategories.push(newCategory);
      return newCategory;
    },

    async update(id: string, data: Partial<Category>): Promise<Category> {
      await simulateApiDelay();
      const index = mockCategories.findIndex((c) => c.id === id);
      if (index === -1) throw new Error("Category not found");
      mockCategories[index] = { ...mockCategories[index], ...data };
      return mockCategories[index];
    },

    async delete(id: string): Promise<void> {
      await simulateApiDelay();
      const index = mockCategories.findIndex((c) => c.id === id);
      if (index === -1) throw new Error("Category not found");
      mockCategories.splice(index, 1);
    },

    async toggleStatus(id: string): Promise<Category> {
      await simulateApiDelay();
      const category = mockCategories.find((c) => c.id === id);
      if (!category) throw new Error("Category not found");
      category.isActive = !category.isActive;
      return category;
    },
  },

  featured: {
    async getAll(): Promise<FeaturedCreator[]> {
      await simulateApiDelay();
      return mockFeaturedCreators;
    },

    async reorder(items: FeaturedCreator[]): Promise<FeaturedCreator[]> {
      await simulateApiDelay();
      items.forEach((item, index) => {
        item.position = index + 1;
      });
      return items;
    },

    async toggleStatus(id: string): Promise<FeaturedCreator> {
      await simulateApiDelay();
      const item = mockFeaturedCreators.find((f) => f.id === id);
      if (!item) throw new Error("Featured creator not found");
      item.isActive = !item.isActive;
      return item;
    },

    async remove(id: string): Promise<void> {
      await simulateApiDelay();
      const index = mockFeaturedCreators.findIndex((f) => f.id === id);
      if (index === -1) throw new Error("Featured creator not found");
      mockFeaturedCreators.splice(index, 1);
    },
  },

  devices: {
    async getAll(userId?: string): Promise<Device[]> {
      await simulateApiDelay();
      if (userId) {
        return mockDevices.filter((d) => d.userId === userId);
      }
      return mockDevices;
    },

    async forceLogout(id: string): Promise<void> {
      await simulateApiDelay();
      const device = mockDevices.find((d) => d.id === id);
      if (!device) throw new Error("Device not found");
      device.lastActive = new Date(0);
    },
  },

  payouts: {
    async getAll(
      page: number = 1,
      pageSize: number = 10,
      status?: string,
    ): Promise<PaginatedResponse<PayoutRequest>> {
      await simulateApiDelay();

      let filtered = [...mockPayoutRequests];
      if (status && status !== "all") {
        filtered = filtered.filter((p) => p.status === status);
      }

      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return {
        data,
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      };
    },

    async getById(id: string): Promise<PayoutRequest> {
      await simulateApiDelay();
      const payout = mockPayoutRequests.find((p) => p.id === id);
      if (!payout) throw new Error("Payout request not found");
      return payout;
    },

    async approve(id: string): Promise<PayoutRequest> {
      await simulateApiDelay();
      const payout = mockPayoutRequests.find((p) => p.id === id);
      if (!payout) throw new Error("Payout request not found");
      payout.status = "approved";
      payout.processedAt = new Date();
      payout.processedBy = "Admin User";
      return payout;
    },

    async reject(id: string, notes?: string): Promise<PayoutRequest> {
      await simulateApiDelay();
      const payout = mockPayoutRequests.find((p) => p.id === id);
      if (!payout) throw new Error("Payout request not found");
      payout.status = "rejected";
      payout.processedAt = new Date();
      payout.processedBy = "Admin User";
      if (notes) payout.notes = notes;
      return payout;
    },

    async complete(id: string): Promise<PayoutRequest> {
      await simulateApiDelay();
      const payout = mockPayoutRequests.find((p) => p.id === id);
      if (!payout) throw new Error("Payout request not found");
      payout.status = "completed";
      payout.processedAt = new Date();
      payout.processedBy = "Admin User";
      return payout;
    },

    async getStats(): Promise<{
      pending: number;
      approved: number;
      completed: number;
      rejected: number;
      totalPendingAmount: number;
    }> {
      await simulateApiDelay();
      const pending = mockPayoutRequests.filter((p) => p.status === "pending");
      return {
        pending: mockPayoutRequests.filter((p) => p.status === "pending").length,
        approved: mockPayoutRequests.filter((p) => p.status === "approved").length,
        completed: mockPayoutRequests.filter((p) => p.status === "completed").length,
        rejected: mockPayoutRequests.filter((p) => p.status === "rejected").length,
        totalPendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
      };
    },
  },

  // KYC Management
  kyc: {
    async getAll(
      page: number = 1,
      pageSize: number = 10,
      status?: string,
    ): Promise<PaginatedResponse<KYCUser>> {
      await simulateApiDelay();

      let filtered = [...mockKYCUsers];
      if (status && status !== "all") {
        filtered = filtered.filter((k) => k.status === status);
      }

      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return {
        data,
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      };
    },

    async getById(id: string): Promise<KYCUser> {
      await simulateApiDelay();
      const kyc = mockKYCUsers.find((k) => k.id === id);
      if (!kyc) throw new Error("KYC application not found");
      return kyc;
    },

    async approve(id: string): Promise<KYCUser> {
      await simulateApiDelay();
      const kyc = mockKYCUsers.find((k) => k.id === id);
      if (!kyc) throw new Error("KYC application not found");
      kyc.status = "approved";
      kyc.reviewedAt = new Date();
      kyc.reviewedBy = "admin@tese.com";
      return kyc;
    },

    async decline(id: string, reason: string): Promise<KYCUser> {
      await simulateApiDelay();
      const kyc = mockKYCUsers.find((k) => k.id === id);
      if (!kyc) throw new Error("KYC application not found");
      kyc.status = "declined";
      kyc.reviewedAt = new Date();
      kyc.reviewedBy = "admin@tese.com";
      kyc.rejectionReason = reason;
      return kyc;
    },

    async updateStatus(id: string, status: KYCStatus): Promise<KYCUser> {
      await simulateApiDelay();
      const kyc = mockKYCUsers.find((k) => k.id === id);
      if (!kyc) throw new Error("KYC application not found");
      kyc.status = status;
      if (status === "pending_approval") {
        kyc.submittedAt = new Date();
      }
      return kyc;
    },
  },

  // Admin Users Management
  adminUsers: {
    async getAll(): Promise<AdminUser[]> {
      await simulateApiDelay();
      return mockAdminUsers;
    },

    async getById(id: string): Promise<AdminUser> {
      await simulateApiDelay();
      const user = mockAdminUsers.find((u) => u.id === id);
      if (!user) throw new Error("Admin user not found");
      return user;
    },

    async create(data: Omit<AdminUser, "id" | "createdAt">): Promise<AdminUser> {
      await simulateApiDelay();
      const newUser: AdminUser = {
        ...data,
        id: "admin_" + generateId(),
        createdAt: new Date(),
      };
      mockAdminUsers.push(newUser);
      return newUser;
    },

    async update(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
      await simulateApiDelay();
      const index = mockAdminUsers.findIndex((u) => u.id === id);
      if (index === -1) throw new Error("Admin user not found");
      mockAdminUsers[index] = { ...mockAdminUsers[index], ...data };
      return mockAdminUsers[index];
    },

    async toggleActive(id: string): Promise<AdminUser> {
      await simulateApiDelay();
      const user = mockAdminUsers.find((u) => u.id === id);
      if (!user) throw new Error("Admin user not found");
      user.isActive = !user.isActive;
      return user;
    },
  },

  // Roles & Permissions
  roles: {
    async getAll(): Promise<Role[]> {
      await simulateApiDelay();
      return mockRoles;
    },

    async getById(id: string): Promise<Role> {
      await simulateApiDelay();
      const role = mockRoles.find((r) => r.id === id);
      if (!role) throw new Error("Role not found");
      return role;
    },

    async create(data: Omit<Role, "id" | "createdAt">): Promise<Role> {
      await simulateApiDelay();
      const newRole: Role = {
        ...data,
        id: "role_" + generateId(),
        createdAt: new Date(),
      };
      mockRoles.push(newRole);
      return newRole;
    },

    async update(id: string, data: Partial<Role>): Promise<Role> {
      await simulateApiDelay();
      const index = mockRoles.findIndex((r) => r.id === id);
      if (index === -1) throw new Error("Role not found");
      mockRoles[index] = { ...mockRoles[index], ...data };
      return mockRoles[index];
    },

    async delete(id: string): Promise<void> {
      await simulateApiDelay();
      const index = mockRoles.findIndex((r) => r.id === id);
      if (index === -1) throw new Error("Role not found");
      mockRoles.splice(index, 1);
    },
  },

  permissions: {
    async getAll(): Promise<Permission[]> {
      await simulateApiDelay();
      return mockPermissions;
    },

    async getByModule(module: string): Promise<Permission[]> {
      await simulateApiDelay();
      return mockPermissions.filter((p) => p.module === module);
    },
  },

  // Fee Configuration
  fees: {
    async getAll(): Promise<FeeConfiguration[]> {
      await simulateApiDelay();
      return mockFeeConfigurations;
    },

    async getByType(type: string): Promise<FeeConfiguration | undefined> {
      await simulateApiDelay();
      return mockFeeConfigurations.find((f) => f.type === type);
    },

    async create(data: Omit<FeeConfiguration, "id" | "createdAt" | "updatedAt">): Promise<FeeConfiguration> {
      await simulateApiDelay();
      const newFee: FeeConfiguration = {
        ...data,
        id: "fee_" + generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockFeeConfigurations.push(newFee);
      return newFee;
    },

    async update(id: string, data: Partial<FeeConfiguration>): Promise<FeeConfiguration> {
      await simulateApiDelay();
      const index = mockFeeConfigurations.findIndex((f) => f.id === id);
      if (index === -1) throw new Error("Fee configuration not found");
      mockFeeConfigurations[index] = {
        ...mockFeeConfigurations[index],
        ...data,
        updatedAt: new Date(),
      };
      return mockFeeConfigurations[index];
    },

    async toggleActive(id: string): Promise<FeeConfiguration> {
      await simulateApiDelay();
      const fee = mockFeeConfigurations.find((f) => f.id === id);
      if (!fee) throw new Error("Fee configuration not found");
      fee.isActive = !fee.isActive;
      fee.updatedAt = new Date();
      return fee;
    },
  },

  playlists: {
    async getAll(
      page: number = 1,
      pageSize: number = 10,
      status?: string,
      search?: string,
    ): Promise<PaginatedResponse<Playlist>> {
      await simulateApiDelay();

      let filtered = [...mockPlaylists];
      if (status && status !== "all") {
        if (status === "active") {
          filtered = filtered.filter((p) => p.isActive && !p.isDeactivated);
        } else if (status === "deactivated") {
          filtered = filtered.filter((p) => p.isDeactivated);
        } else if (status === "inactive") {
          filtered = filtered.filter((p) => !p.isActive);
        }
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.playlistName.toLowerCase().includes(s) ||
            p.creatorName.toLowerCase().includes(s) ||
            p.channelName.toLowerCase().includes(s),
        );
      }

      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return {
        data,
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      };
    },

    async getById(id: string): Promise<Playlist> {
      await simulateApiDelay();
      const playlist = mockPlaylists.find((p) => p.id === id);
      if (!playlist) throw new Error("Playlist not found");
      return playlist;
    },

    async deactivate(id: string): Promise<Playlist> {
      await simulateApiDelay();
      const playlist = mockPlaylists.find((p) => p.id === id);
      if (!playlist) throw new Error("Playlist not found");
      playlist.isDeactivated = true;
      playlist.isActive = false;
      playlist.updatedAt = new Date();
      return playlist;
    },

    async activate(id: string): Promise<Playlist> {
      await simulateApiDelay();
      const playlist = mockPlaylists.find((p) => p.id === id);
      if (!playlist) throw new Error("Playlist not found");
      playlist.isDeactivated = false;
      playlist.isActive = true;
      playlist.updatedAt = new Date();
      return playlist;
    },

    async togglePlaylistStatus(id: string): Promise<Playlist> {
      await simulateApiDelay();
      const playlist = mockPlaylists.find((p) => p.id === id);
      if (!playlist) throw new Error("Playlist not found");
      playlist.isDeactivated = !playlist.isDeactivated;
      playlist.isActive = !playlist.isDeactivated;
      playlist.updatedAt = new Date();
      return playlist;
    },

    async getByChannelId(channelId: string): Promise<Playlist[]> {
      await simulateApiDelay();
      const playlists = mockPlaylists.filter((p) => p.channelId === channelId);
      return playlists;
    },
  },

  comments: {
    async getAll(
      page: number = 1,
      pageSize: number = 10,
      status?: string,
      videoId?: string,
      search?: string,
    ): Promise<PaginatedResponse<Comment>> {
      await simulateApiDelay();

      let filtered = [...mockComments];
      if (status && status !== "all") {
        filtered = filtered.filter((c) => c.status === status);
      }
      if (videoId && videoId !== "all") {
        filtered = filtered.filter((c) => c.videoId === videoId);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.userName.toLowerCase().includes(s) ||
            c.content.toLowerCase().includes(s) ||
            c.videoTitle.toLowerCase().includes(s),
        );
      }

      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return {
        data,
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      };
    },

    async getById(id: string): Promise<Comment> {
      await simulateApiDelay();
      const comment = mockComments.find((c) => c.id === id);
      if (!comment) throw new Error("Comment not found");
      return comment;
    },

    async getByVideoId(videoId: string): Promise<Comment[]> {
      await simulateApiDelay();
      const comments = mockComments.filter((c) => c.videoId === videoId);
      return comments;
    },

    async getByUserId(userId: string): Promise<Comment[]> {
      await simulateApiDelay();
      const comments = mockComments.filter((c) => c.userId === userId);
      return comments;
    },

    async flag(id: string): Promise<Comment> {
      await simulateApiDelay();
      const comment = mockComments.find((c) => c.id === id);
      if (!comment) throw new Error("Comment not found");
      comment.isFlagged = true;
      comment.status = "flagged";
      comment.flags = (comment.flags || 0) + 1;
      comment.updatedAt = new Date();
      return comment;
    },

    async unflag(id: string): Promise<Comment> {
      await simulateApiDelay();
      const comment = mockComments.find((c) => c.id === id);
      if (!comment) throw new Error("Comment not found");
      comment.isFlagged = false;
      comment.status = comment.flags && comment.flags > 0 ? "flagged" : "active";
      comment.updatedAt = new Date();
      return comment;
    },

    async hide(id: string): Promise<Comment> {
      await simulateApiDelay();
      const comment = mockComments.find((c) => c.id === id);
      if (!comment) throw new Error("Comment not found");
      comment.isHidden = true;
      comment.status = "hidden";
      comment.updatedAt = new Date();
      return comment;
    },

    async unhide(id: string): Promise<Comment> {
      await simulateApiDelay();
      const comment = mockComments.find((c) => c.id === id);
      if (!comment) throw new Error("Comment not found");
      comment.isHidden = false;
      comment.status = comment.isFlagged ? "flagged" : "active";
      comment.updatedAt = new Date();
      return comment;
    },

    async delete(id: string): Promise<void> {
      await simulateApiDelay();
      const index = mockComments.findIndex((c) => c.id === id);
      if (index === -1) throw new Error("Comment not found");
      mockComments.splice(index, 1);
    },

    async getStats(): Promise<{
      total: number;
      active: number;
      flagged: number;
      hidden: number;
    }> {
      await simulateApiDelay();
      return {
        total: mockComments.length,
        active: mockComments.filter((c) => c.status === "active").length,
        flagged: mockComments.filter((c) => c.status === "flagged").length,
        hidden: mockComments.filter((c) => c.status === "hidden").length,
      };
    },
  },

  userProfiles: {
    async getById(id: string): Promise<UserProfile> {
      await simulateApiDelay();
      const profile = mockUserProfiles.find((p) => p.id === id);
      if (!profile) throw new Error("User profile not found");
      return profile;
    },

    async getByCommentId(commentId: string): Promise<UserProfile | null> {
      await simulateApiDelay();
      const comment = mockComments.find((c) => c.id === commentId);
      if (!comment) return null;
      const profile = mockUserProfiles.find((p) => p.id === comment.userId);
      return profile || null;
    },

    async suspend(id: string): Promise<UserProfile> {
      await simulateApiDelay();
      const profile = mockUserProfiles.find((p) => p.id === id);
      if (!profile) throw new Error("User profile not found");
      profile.status = "suspended";
      return profile;
    },

    async activate(id: string): Promise<UserProfile> {
      await simulateApiDelay();
      const profile = mockUserProfiles.find((p) => p.id === id);
      if (!profile) throw new Error("User profile not found");
      profile.status = "active";
      return profile;
    },

    async ban(id: string): Promise<UserProfile> {
      await simulateApiDelay();
      const profile = mockUserProfiles.find((p) => p.id === id);
      if (!profile) throw new Error("User profile not found");
      profile.status = "banned";
      return profile;
    },
  },
};
