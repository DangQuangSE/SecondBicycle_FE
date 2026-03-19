import { axiosInstance } from "./auth.service";
import { API_ENDPOINTS } from "../constants/api";
import type {
  AbuseRequestDto,
  AbuseReportDto,
  ResolveAbuseRequestDto,
} from "../types/abuse.types";

// ===== DTOs =====
export interface DashboardStatsDto {
  totalUsers: number;
  totalActiveListings: number;
  pendingModerations: number;
  pendingAbuseReports: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface PendingPostDto {
  listingId: number;
  title: string;
  sellerName: string;
  price: number;
  brandName?: string;
  typeName?: string;
  postedDate?: string;
  primaryImageUrl?: string;
}

export interface ModeratePostDto {
  listingId: number;
  approve: boolean;
  rejectionReason?: string;
  notes?: string;
}

export interface AdminUserDto {
  userId: number;
  username: string;
  email: string;
  roleName: string;
  status?: number; // 0=Banned, 1=Active
  createdAt?: string;
  totalListings: number;
  totalOrders: number;
}

export interface ResolveDisputeDto {
  orderId: number;
  resolution: string;
  refundBuyer: boolean;
  banSeller: boolean;
}

export interface CreateAdminBicycleDto {
  brandId: number;
  typeId: number;
  modelName: string;
  serialNumber?: string;
  color?: string;
  frameSize?: string;
  frameMaterial?: string;
  wheelSize?: string;
  brakeType?: string;
  weight?: number;
  transmission?: string;
}

export const adminService = {
  // Create an admin bicycle
  createAdminBicycle: async (data: CreateAdminBicycleDto): Promise<{ bikeId: number }> => {
    const response = await axiosInstance.post(API_ENDPOINTS.ADMIN.BICYCLES, data);
    return response.data;
  },

  // Get dashboard stats
  getDashboard: async (): Promise<DashboardStatsDto> => {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.DASHBOARD);
    return response.data;
  },

  // Get pending posts for moderation
  getPendingPosts: async (): Promise<PendingPostDto[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.PENDING_POSTS);
    return response.data;
  },

  // Moderate a post (approve/reject)
  moderatePost: async (data: ModeratePostDto): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.ADMIN.MODERATE_POST, data);
  },

  // Get users (with optional roleId filter)
  getUsers: async (roleId?: number): Promise<AdminUserDto[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.USERS, {
      params: roleId ? { roleId } : undefined,
    });
    return response.data;
  },

  // Update user status (ban/unban)
  updateUserStatus: async (userId: number, status: number): Promise<void> => {
    await axiosInstance.patch(API_ENDPOINTS.ADMIN.USER_STATUS(userId), {
      status,
    });
  },

  // Resolve dispute
  resolveDispute: async (data: ResolveDisputeDto): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.ADMIN.RESOLVE_DISPUTE, data);
  },

  // Get pending abuse requests — returns AbuseRequestDto[]
  getPendingAbuse: async (): Promise<AbuseRequestDto[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.ABUSE_PENDING);
    return response.data;
  },

  // Get all resolved abuse reports — returns AbuseReportDto[]
  getAbuseReports: async (): Promise<AbuseReportDto[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.ABUSE_REPORTS);
    return response.data;
  },

  // Resolve an abuse request
  resolveAbuse: async (data: ResolveAbuseRequestDto): Promise<AbuseReportDto> => {
    const response = await axiosInstance.post(API_ENDPOINTS.ADMIN.ABUSE_RESOLVE, data);
    return response.data;
  },
};
