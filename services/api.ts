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
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(s) ||
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
};
