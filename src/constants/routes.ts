export const ROUTES = {
  // Public routes
  HOME: "/",
  STORE: "/store",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email",

  // Buyer routes
  BIKES: "/bikes",
  BIKE_DETAIL: "/bikes/:id",
  CART: "/cart",
  WISHLIST: "/wishlist",
  MY_ORDERS: "/orders",
  ORDER_DETAIL: "/orders/:id",

  // Seller routes
  SELLER_DASHBOARD: "/seller/dashboard",
  SELLER_LISTINGS: "/seller/posts",
  SELLER_CREATE: "/seller/posts/create",
  SELLER_EDIT: "/seller/posts/:id/edit",
  SELLER_ORDERS: "/seller/orders",
  SELLER_INSPECTIONS: "/seller/inspections",

  // Inspector routes
  INSPECTOR_DASHBOARD: "/inspector/dashboard",
  INSPECTOR_REQUESTS: "/inspector/requests",
  INSPECTOR_PENDING: "/inspector/pending",
  INSPECTOR_ASSIGNED: "/inspector/assigned",
  INSPECTOR_UPLOAD_REPORT: "/inspector/upload-report/:requestId",
  INSPECTOR_MY_REPORTS: "/inspector/reports",

  // Public inspection report
  INSPECTION_REPORT: "/inspections/:requestId",

  // Admin routes
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_BRANDS: "/admin/brands",
  ADMIN_LISTINGS: "/admin/listings",
  ADMIN_MODERATION: "/admin/moderation",
  ADMIN_ABUSE: "/admin/abuse",
  ADMIN_BICYCLES: "/admin/bicycles",

  // Buyer abuse reports
  MY_REPORTS: "/my-reports",

  // Shared
  PROFILE: "/profile",
  PROFILE_EDIT: "/profile/edit",
  PROFILE_CHANGE_PASSWORD: "/profile/change-password",
  SETTINGS: "/settings",

  // Chat / Messaging
  MESSAGES: "/messages",
  CHAT_ROOM: "/messages/:otherUserId",
} as const;
