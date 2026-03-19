import { useState, useEffect, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { adminService } from "../../services/admin.service";
import type { PendingPostDto } from "../../services/admin.service";
import { ROUTES } from "../../constants/routes";
import "./admin.css";

const PostModerationPage: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PendingPostDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user || user.roleName !== "Admin") {
      navigate(ROUTES.HOME);
      return;
    }
    loadPosts();
  }, [user, navigate]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getPendingPosts();
      setPosts(data);
    } catch {
      toast.error("Không thể tải danh sách bài đăng.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const handleApprove = async (listingId: number) => {
    setProcessingId(listingId);
    try {
      await adminService.moderatePost({
        listingId,
        approve: true,
      });
      toast.success("Đã phê duyệt bài đăng!");
      setPosts((prev) => prev.filter((p) => p.listingId !== listingId));
    } catch {
      toast.error("Phê duyệt thất bại.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (listingId: number) => {
    const rejectionReason = window.prompt("Nhập lý do từ chối:");
    if (rejectionReason === null) return; // User cancelled
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }

    setProcessingId(listingId);
    try {
      await adminService.moderatePost({
        listingId,
        approve: false,
        rejectionReason,
      });
      toast.success("Đã từ chối bài đăng.");
      setPosts((prev) => prev.filter((p) => p.listingId !== listingId));
    } catch {
      toast.error("Từ chối thất bại.");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <div className="loading-container">Đang tải...</div>;
  }

  return (
    <div className="admin-page">
      <h2>📋 Duyệt bài đăng</h2>

      {/* Navigation */}
      <nav className="admin-nav">
        <Link to={ROUTES.ADMIN_DASHBOARD} className="admin-nav-link">
          Dashboard
        </Link>
        <Link to={ROUTES.ADMIN_MODERATION} className="admin-nav-link active">
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

      {posts.length === 0 ? (
        <p className="admin-table-empty">Không có bài đăng nào chờ duyệt.</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tiêu đề</th>
                <th>Người đăng</th>
                <th>Giá</th>
                <th>Loại</th>
                <th>Ngày đăng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.listingId}>
                  <td>
                    {post.primaryImageUrl ? (
                      <img
                        src={post.primaryImageUrl}
                        alt={post.title}
                        className="post-thumbnail"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                          (e.target as HTMLImageElement).alt = "🚲";
                        }}
                      />
                    ) : (
                      "🚲"
                    )}
                  </td>
                  <td>
                    <Link to={`/bikes/${post.listingId}`}>{post.title}</Link>
                  </td>
                  <td>{post.sellerName}</td>
                  <td>{formatPrice(post.price)}</td>
                  <td>
                    {post.brandName}
                    {post.typeName ? ` / ${post.typeName}` : ""}
                  </td>
                  <td>
                    {post.postedDate
                      ? new Date(post.postedDate).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td>
                    <div className="admin-action-group">
                      <button
                        className="btn-admin btn-approve"
                        onClick={() => handleApprove(post.listingId)}
                        disabled={processingId === post.listingId}
                      >
                        ✅ Duyệt
                      </button>
                      <button
                        className="btn-admin btn-reject"
                        onClick={() => handleReject(post.listingId)}
                        disabled={processingId === post.listingId}
                      >
                        ❌ Từ chối
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PostModerationPage;
