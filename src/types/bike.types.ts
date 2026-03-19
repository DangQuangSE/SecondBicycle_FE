// ===== Bike Image =====

export interface BikeImageDto {
  mediaId: number;
  mediaUrl: string;
  mediaType?: string;
  isThumbnail?: boolean;
}

// ===== Bicycle Catalog Item =====
export interface BicycleCatalogItemDto {
  bikeId: number;
  brandName?: string;
  typeName?: string;
  modelName: string;
  color?: string;
  frameSize?: string;
}

// ===== Bike Post Response =====

export interface BikePostDto {
  listingId: number;
  title: string;
  description?: string;
  price: number;
  quantity: number;
  listingStatus?: number; // 0=Hidden, 1=Active, 2=Pending, 3=Sold, 4=Rejected
  address?: string;
  postedDate?: string;
  bikeId: number;
  modelName?: string;
  serialNumber?: string;
  color?: string;
  condition?: string;
  brandName?: string;
  typeName?: string;
  frameSize?: string;
  frameMaterial?: string;
  wheelSize?: string;
  brakeType?: string;
  weight?: number;
  transmission?: string;
  sellerId: number;
  sellerName: string;
  images: BikeImageDto[];
  hasInspection: boolean;
}

// ===== Filter / Search =====

export interface BikeFilterDto {
  searchTerm?: string;
  brandId?: number;
  typeId?: number;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  frameSize?: string;
  wheelSize?: string;
  address?: string;
  sortBy?: "newest" | "oldest" | "price_asc" | "price_desc";
  page?: number;
  pageSize?: number;
}

// ===== Create Form Values (FE state, convert to FormData before sending) =====

export interface CreateBikeFormValues {
  title: string;
  description?: string;
  price: number;
  address?: string;
  bikeId: number;
  imageFiles: File[];
}

// ===== Update Form Values =====

export interface UpdateBikeFormValues extends CreateBikeFormValues {
  listingId: number;
  existingImages: BikeImageDto[];
  newFiles: File[];
  removeMediaIds: number[];
  thumbnailMediaId?: number;
}

// ===== Paged Result =====

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// ===== Listing Status =====

export const LISTING_STATUS = {
  HIDDEN: 0,
  ACTIVE: 1,
  PENDING: 2,
  SOLD: 3,
  REJECTED: 4,
} as const;

export const STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: "Đã ẩn", color: "#6b7280" },
  1: { label: "Đang bán", color: "#22c55e" },
  2: { label: "Chờ duyệt", color: "#f59e0b" },
  3: { label: "Đã bán", color: "#3b82f6" },
  4: { label: "Bị từ chối", color: "#ef4444" },
};
