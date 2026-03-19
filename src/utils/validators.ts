import { z } from "zod";

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

// Register validation schema (new - matches RegisterDto)
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username phải có ít nhất 3 ký tự")
      .max(50, "Username tối đa 50 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Username chỉ chứa chữ cái, số và dấu _"),
    email: z
      .string()
      .min(1, "Email không được để trống")
      .email("Email không hợp lệ"),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa")
      .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ thường")
      .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 số")
      .regex(/[^a-zA-Z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"),
    confirmPassword: z.string(),
    fullName: z.string().optional(),
    phoneNumber: z.string().optional(),
    roleId: z.number().default(2), // 1=Admin, 2=Buyer, 3=Seller, 4=Inspector
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Update profile validation schema
export const updateProfileSchema = z.object({
  fullName: z.string().max(100, "Họ tên tối đa 100 ký tự").optional(),
  phoneNumber: z.string().max(20, "Số điện thoại tối đa 20 ký tự").optional(),
  address: z.string().max(255, "Địa chỉ tối đa 255 ký tự").optional(),
});

// Change password validation schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa")
    .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ thường")
    .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 số")
    .regex(/[^a-zA-Z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ===== Bike Post validation schema =====

export const createBikeSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(200, "Tiêu đề tối đa 200 ký tự"),
  description: z.string().max(5000, "Mô tả tối đa 5000 ký tự").optional(),
  price: z
    .string()
    .min(1, "Giá không được để trống")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Giá phải là số lớn hơn 0",
    }),
  address: z.string().max(255, "Địa chỉ tối đa 255 ký tự").optional(),
  bikeId: z.string().min(1, "Vui lòng chọn mẫu xe"),
});

export type CreateBikeFormData = z.infer<typeof createBikeSchema>;
