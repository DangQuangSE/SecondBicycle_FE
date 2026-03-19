import { useState, useEffect, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { adminService } from "../../services/admin.service";
import type { DashboardStatsDto } from "../../services/admin.service";
import { ROUTES } from "../../constants/routes";
import "./admin.css";

const AdminDashboard: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.roleName !== "Admin") {
      navigate(ROUTES.HOME);
      return;
    }
    const loadStats = async () => {
      try {
        const data = await adminService.getDashboard();
        setStats(data);
      } catch {
        toast.error("Không thể tải dữ liệu dashboard.");
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, [user, navigate]);

  if (isLoading) {
    return <div className="loading-container">Đang tải...</div>;
  }

  return (
    <div className="admin-page">
      <h2>📊 Admin Dashboard</h2>

      {/* Navigation */}
      <nav className="admin-nav">
        <Link to={ROUTES.ADMIN_DASHBOARD} className="admin-nav-link active">
          Dashboard
        </Link>
        <Link to={ROUTES.ADMIN_MODERATION} className="admin-nav-link">
          Duyệt bài đăng
        </Link>
        <Link to={ROUTES.ADMIN_USERS} className="admin-nav-link">
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

      {/* Stats Grid */}
      {stats && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">
              Tổng người dùng
              <br />
              <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>(Bao gồm đã xóa)</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🚲</div>
            <div className="stat-value">{stats.totalActiveListings}</div>
            <div className="stat-label">Bài đăng hoạt động</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{stats.pendingModerations}</div>
            <div className="stat-label">Chờ duyệt</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Tổng đơn hàng</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(stats.totalRevenue)}
            </div>
            <div className="stat-label">Doanh thu</div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <h3>Truy cập nhanh</h3>
      <div className="dashboard-links">
        <Link to={ROUTES.ADMIN_MODERATION} className="dashboard-link-card">
          <h4>📋 Duyệt bài đăng</h4>
          <p>Xem và phê duyệt các bài đăng chờ duyệt</p>
        </Link>
        <Link to={ROUTES.ADMIN_USERS} className="dashboard-link-card">
          <h4>👥 Quản lý người dùng</h4>
          <p>Quản lý tài khoản người dùng</p>
        </Link>
        <Link to={ROUTES.ADMIN_ABUSE} className="dashboard-link-card">
          <h4>🚩 Báo cáo vi phạm</h4>
          <p>Xử lý các báo cáo vi phạm và tranh chấp</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
