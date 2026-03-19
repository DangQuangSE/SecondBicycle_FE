import { useState, useEffect, useCallback, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { userManagerService } from "../../services/userManager.service";
import type {
  UserManagementDto,
  CreateUserDto,
  UpdateUserDto,
  UserFilterDto,
  PagedResult,
} from "../../types/userManager.types";
import { ROUTES } from "../../constants/routes";
import "./admin.css";

const ROLE_OPTIONS = [
  { label: "Admin", value: 1 },
  { label: "Buyer", value: 2 },
  { label: "Seller", value: 3 },
  { label: "Inspector", value: 4 },
];

const STATUS_OPTIONS = [
  { label: "Active", value: 1 },
  { label: "Suspended", value: 2 },
  { label: "Banned", value: 3 },
  { label: "Unverified", value: 4 },
  { label: "Deleted", value: 0 },
];

const STATUS_BADGE_CLASS: Record<number, string> = {
  0: "deleted",
  1: "active",
  2: "suspended",
  3: "banned",
  4: "unverified",
};

const EMPTY_CREATE: CreateUserDto = {
  username: "",
  email: "",
  password: "",
  roleId: 2,
  fullName: "",
  phoneNumber: "",
  address: "",
};

const UserManagementPage: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data state
  const [pagedResult, setPagedResult] =
    useState<PagedResult<UserManagementDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [filter, setFilter] = useState<UserFilterDto>({
    page: 1,
    pageSize: 10,
  });

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPwModal, setShowResetPwModal] = useState(false);

  // Form state
  const [createForm, setCreateForm] = useState<CreateUserDto>(EMPTY_CREATE);
  const [editForm, setEditForm] = useState<UpdateUserDto | null>(null);
  const [resetPwUserId, setResetPwUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [processing, setProcessing] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await userManagerService.getUsers(filter);
      setPagedResult(data);
    } catch {
      toast.error("Không thể tải danh sách người dùng.");
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!user || user.roleName !== "Admin") {
      navigate(ROUTES.HOME);
      return;
    }
    fetchUsers();
  }, [user, navigate, fetchUsers]);

  // Create
  const handleCreate = async () => {
    setProcessing(true);
    try {
      await userManagerService.create(createForm);
      toast.success("Tạo người dùng thành công!");
      setShowCreateModal(false);
      setCreateForm(EMPTY_CREATE);
      fetchUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Tạo người dùng thất bại.",
      );
    } finally {
      setProcessing(false);
    }
  };

  // Update
  const handleUpdate = async () => {
    if (!editForm) return;
    setProcessing(true);
    try {
      await userManagerService.update(editForm);
      toast.success("Cập nhật người dùng thành công!");
      setShowEditModal(false);
      setEditForm(null);
      fetchUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Cập nhật thất bại.",
      );
    } finally {
      setProcessing(false);
    }
  };

  // Delete
  const handleDelete = async (userId: number) => {
    if (!window.confirm("Bạn có chắc muốn vô hiệu hóa user này?\nUser sẽ bị đánh dấu là đã xóa và không thể đăng nhập.\nDữ liệu user vẫn được lưu trong hệ thống.")) return;
    try {
      await userManagerService.delete(userId);
      toast.success("Đã vô hiệu hóa người dùng!");
      fetchUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Vô hiệu hóa thất bại.",
      );
    }
  };

  // Restore
  const handleRestore = async (u: UserManagementDto) => {
    if (!window.confirm("Bạn có muốn khôi phục người dùng này?")) return;
    setProcessing(true);
    try {
      await userManagerService.update({
        userId: u.userId,
        status: 1,
        isVerified: u.isVerified,
      });
      toast.success("Đã khôi phục người dùng!");
      fetchUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Khôi phục thất bại."
      );
    } finally {
      setProcessing(false);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!resetPwUserId) return;
    setProcessing(true);
    try {
      await userManagerService.resetPassword(resetPwUserId, {
        newPassword,
      });
      toast.success("Đặt lại mật khẩu thành công!");
      setShowResetPwModal(false);
      setNewPassword("");
      setResetPwUserId(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Đặt lại mật khẩu thất bại.",
      );
    } finally {
      setProcessing(false);
    }
  };

  // Open edit modal
  const openEdit = (u: UserManagementDto) => {
    setEditForm({
      userId: u.userId,
      username: u.username,
      email: u.email,
      roleId: u.roleId,
      status: u.status,
      isVerified: u.isVerified,
      fullName: u.fullName ?? "",
      phoneNumber: u.phoneNumber ?? "",
      address: u.address ?? "",
    });
    setShowEditModal(true);
  };

  // Open reset password modal
  const openResetPw = (userId: number) => {
    setResetPwUserId(userId);
    setNewPassword("");
    setShowResetPwModal(true);
  };

  const users = pagedResult?.items ?? [];

  if (isLoading && !pagedResult) {
    return <div className="loading-container">Đang tải...</div>;
  }

  return (
    <div className="admin-page">
      <h2>👤 Quản lý người dùng</h2>

      {/* Navigation */}
      <nav className="admin-nav">
        <Link to={ROUTES.ADMIN_DASHBOARD} className="admin-nav-link">
          Dashboard
        </Link>
        <Link to={ROUTES.ADMIN_MODERATION} className="admin-nav-link">
          Duyệt bài đăng
        </Link>
        <Link to={ROUTES.ADMIN_USERS} className="admin-nav-link active">
          Quản lý người dùng
        </Link>
        <Link to={ROUTES.ADMIN_CATEGORIES} className="admin-nav-link">
          Quản lý danh mục
        </Link>
        <Link to={ROUTES.ADMIN_BRANDS} className="admin-nav-link">
          Quản lý thương hiệu
        </Link>
        <Link to={ROUTES.ADMIN_BICYCLES} className="admin-nav-link">
          Quản lý mẫu xe
        </Link>
        <Link to={ROUTES.ADMIN_ABUSE} className="admin-nav-link">
          Báo cáo vi phạm
        </Link>
      </nav>

      {/* Filter bar */}
      <div className="admin-filter-bar">
        <input
          type="text"
          className="admin-search-input"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={filter.search ?? ""}
          onChange={(e) =>
            setFilter((f) => ({ ...f, search: e.target.value, page: 1 }))
          }
        />
        <select
          className="admin-filter-select"
          title="Lọc theo vai trò"
          value={filter.roleId ?? ""}
          onChange={(e) =>
            setFilter((f) => ({
              ...f,
              roleId: e.target.value ? Number(e.target.value) : undefined,
              page: 1,
            }))
          }
        >
          <option value="">Tất cả vai trò</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <select
          className="admin-filter-select"
          title="Lọc theo trạng thái"
          value={filter.status ?? ""}
          onChange={(e) =>
            setFilter((f) => ({
              ...f,
              status: e.target.value ? Number(e.target.value) : undefined,
              page: 1,
            }))
          }
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          className="btn-admin btn-create"
          onClick={() => {
            setCreateForm(EMPTY_CREATE);
            setShowCreateModal(true);
          }}
        >
          ➕ Thêm người dùng
        </button>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <p className="admin-table-empty">Không có người dùng nào.</p>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Họ tên</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Bài đăng</th>
                  <th>Đơn hàng</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userId}>
                    <td>{u.userId}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.fullName ?? "-"}</td>
                    <td>{u.roleName}</td>
                    <td>
                      <span
                        className={`user-status-badge ${STATUS_BADGE_CLASS[u.status ?? 0] ?? ""}`}
                      >
                        {u.statusName}
                      </span>
                    </td>
                    <td>{u.totalListings}</td>
                    <td>{u.totalOrders}</td>
                    <td>
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td className="admin-actions">
                      <button
                        className="btn-admin btn-edit"
                        onClick={() => openEdit(u)}
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-admin btn-reset-pw"
                        onClick={() => openResetPw(u.userId)}
                        title="Đặt lại mật khẩu"
                      >
                        🔑
                      </button>
                      {u.status !== 0 && (
                        <button
                          className="btn-admin btn-delete"
                          onClick={() => handleDelete(u.userId)}
                          title="Vô hiệu hóa"
                        >
                          🗑️
                        </button>
                      )}
                      {u.status === 0 && (
                        <button
                          className="btn-admin btn-restore"
                          onClick={() => handleRestore(u)}
                          title="Khôi phục"
                        >
                          🔄
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagedResult && pagedResult.totalPages > 1 && (
            <div className="admin-pagination">
              <button
                disabled={!pagedResult.hasPrevious}
                onClick={() =>
                  setFilter((f) => ({ ...f, page: (f.page ?? 1) - 1 }))
                }
              >
                ← Trước
              </button>
              <span>
                Trang {pagedResult.page} / {pagedResult.totalPages} (
                {pagedResult.totalCount} kết quả)
              </span>
              <button
                disabled={!pagedResult.hasNext}
                onClick={() =>
                  setFilter((f) => ({ ...f, page: (f.page ?? 1) + 1 }))
                }
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

      {/* ===== CREATE MODAL ===== */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Thêm người dùng mới</h3>
            <div className="modal-form">
              <label>
                Username *
                <input
                  type="text"
                  value={createForm.username}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, username: e.target.value })
                  }
                />
              </label>
              <label>
                Email *
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                />
              </label>
              <label>
                Mật khẩu *
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                />
              </label>
              <label>
                Vai trò *
                <select
                  value={createForm.roleId}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      roleId: Number(e.target.value),
                    })
                  }
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Họ tên
                <input
                  type="text"
                  value={createForm.fullName ?? ""}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, fullName: e.target.value })
                  }
                />
              </label>
              <label>
                Số điện thoại
                <input
                  type="text"
                  value={createForm.phoneNumber ?? ""}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Địa chỉ
                <input
                  type="text"
                  value={createForm.address ?? ""}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, address: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="modal-actions">
              <button
                className="btn-admin btn-cancel"
                onClick={() => setShowCreateModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn-admin btn-save"
                onClick={handleCreate}
                disabled={processing}
              >
                {processing ? "Đang tạo..." : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      {showEditModal && editForm && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Sửa người dùng #{editForm.userId}</h3>
            <div className="modal-form">
              <label>
                Username
                <input
                  type="text"
                  value={editForm.username ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={editForm.email ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </label>
              <label>
                Vai trò
                <select
                  value={editForm.roleId ?? ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      roleId: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Trạng thái
                <select
                  value={editForm.status ?? ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Họ tên
                <input
                  type="text"
                  value={editForm.fullName ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fullName: e.target.value })
                  }
                />
              </label>
              <label>
                Số điện thoại
                <input
                  type="text"
                  value={editForm.phoneNumber ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phoneNumber: e.target.value })
                  }
                />
              </label>
              <label>
                Địa chỉ
                <input
                  type="text"
                  value={editForm.address ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="modal-actions">
              <button
                className="btn-admin btn-cancel"
                onClick={() => setShowEditModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn-admin btn-save"
                onClick={handleUpdate}
                disabled={processing}
              >
                {processing ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== RESET PASSWORD MODAL ===== */}
      {showResetPwModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowResetPwModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Đặt lại mật khẩu cho user #{resetPwUserId}</h3>
            <div className="modal-form">
              <label>
                Mật khẩu mới *
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ít nhất 8 ký tự, chứa chữ hoa, thường, số, ký tự đặc biệt"
                />
              </label>
            </div>
            <div className="modal-actions">
              <button
                className="btn-admin btn-cancel"
                onClick={() => setShowResetPwModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn-admin btn-save"
                onClick={handleResetPassword}
                disabled={processing || newPassword.length < 8}
              >
                {processing ? "Đang đặt lại..." : "Đặt lại"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
