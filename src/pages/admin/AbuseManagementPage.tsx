import { useState, useEffect, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { adminService } from "../../services/admin.service";
import type {
  AbuseRequestDto,
  AbuseReportDto,
  ResolveAbuseRequestDto,
} from "../../types/abuse.types";
import { ABUSE_STATUS, ABUSE_STATUS_LABELS } from "../../types/abuse.types";
import { ROUTES } from "../../constants/routes";
import "./admin.css";

// ===== Resolve Modal =====

interface ResolveModalProps {
  request: AbuseRequestDto;
  onClose: () => void;
  onResolved: () => void;
}

const ResolveModal: FC<ResolveModalProps> = ({ request, onClose, onResolved }) => {
  const [resolution, setResolution] = useState("");
  const [banTargetUser, setBanTargetUser] = useState(false);
  const [hideTargetListing, setHideTargetListing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResolve = async (status: number) => {
    if (!resolution.trim()) {
      toast.error("Please enter a resolution.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data: ResolveAbuseRequestDto = {
        requestAbuseId: request.requestAbuseId,
        resolution,
        status,
        banTargetUser,
        hideTargetListing,
      };
      await adminService.resolveAbuse(data);
      toast.success(
        status === ABUSE_STATUS.RESOLVED
          ? "Report resolved successfully!"
          : "Report rejected."
      );
      onResolved();
    } catch {
      toast.error("Failed to process report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="resolve-modal-overlay" onClick={onClose}>
      <div className="resolve-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Process Report #{request.requestAbuseId}</h3>

        <p><strong>Reporter:</strong> {request.reporterName}</p>
        {request.targetListingTitle && (
          <p><strong>Listing:</strong> {request.targetListingTitle} (ID: {request.targetListingId})</p>
        )}
        {request.targetUserName && (
          <p><strong>Reported User:</strong> {request.targetUserName} (ID: {request.targetUserId})</p>
        )}
        <p><strong>Reason:</strong> {request.reason}</p>

        <label>Resolution:</label>
        <textarea
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          placeholder="Enter resolution details..."
          rows={4}
        />

        <label className="resolve-modal-checkbox">
          <input
            type="checkbox"
            checked={banTargetUser}
            onChange={(e) => setBanTargetUser(e.target.checked)}
          />
          Ban reported user
        </label>

        {request.targetListingId && (
          <label className="resolve-modal-checkbox">
            <input
              type="checkbox"
              checked={hideTargetListing}
              onChange={(e) => setHideTargetListing(e.target.checked)}
            />
            Hide target listing
          </label>
        )}

        <div className="resolve-modal-actions">
          <button
            className="btn-admin btn-resolve"
            onClick={() => handleResolve(ABUSE_STATUS.RESOLVED)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "✅ Resolve"}
          </button>
          <button
            className="btn-admin btn-reject"
            onClick={() => handleResolve(ABUSE_STATUS.REJECTED)}
            disabled={isSubmitting}
          >
            ❌ Reject
          </button>
          <button className="btn-admin btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== Main Page =====

type TabType = "pending" | "resolved";

const AbuseManagementPage: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [pendingRequests, setPendingRequests] = useState<AbuseRequestDto[]>([]);
  const [resolvedReports, setResolvedReports] = useState<AbuseReportDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingRequest, setResolvingRequest] = useState<AbuseRequestDto | null>(null);

  useEffect(() => {
    if (!user || user.roleName !== "Admin") {
      navigate(ROUTES.HOME);
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [pending, reports] = await Promise.all([
        adminService.getPendingAbuse(),
        adminService.getAbuseReports(),
      ]);
      setPendingRequests(pending);
      setResolvedReports(reports);
    } catch {
      toast.error("Failed to load abuse data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolved = () => {
    setResolvingRequest(null);
    fetchData(); // Refresh both tabs
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="admin-page">
      <h2>🚩 Abuse Report Management</h2>

      {/* Navigation */}
      <nav className="admin-nav">
        <Link to={ROUTES.ADMIN_DASHBOARD} className="admin-nav-link">
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
        <Link to={ROUTES.ADMIN_ABUSE} className="admin-nav-link active">
          Báo cáo vi phạm
        </Link>
      </nav>

      {/* Tabs */}
      <div className="admin-filter-bar">
        <button
          className={`btn-admin ${activeTab === "pending" ? "btn-resolve" : "btn-edit"}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending ({pendingRequests.length})
        </button>
        <button
          className={`btn-admin ${activeTab === "resolved" ? "btn-resolve" : "btn-edit"}`}
          onClick={() => setActiveTab("resolved")}
        >
          Resolved ({resolvedReports.length})
        </button>
      </div>

      {/* Pending Tab */}
      {activeTab === "pending" && (
        <>
          {pendingRequests.length === 0 ? (
            <p className="admin-table-empty">No pending abuse reports.</p>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Reporter</th>
                    <th>Reported User</th>
                    <th>Listing</th>
                    <th>Reason</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((req) => (
                    <tr key={req.requestAbuseId}>
                      <td>{req.requestAbuseId}</td>
                      <td>{req.reporterName}</td>
                      <td>{req.targetUserName || "-"}</td>
                      <td>
                        {req.targetListingId ? (
                          <Link to={`/bikes/${req.targetListingId}`}>
                            {req.targetListingTitle || `#${req.targetListingId}`}
                          </Link>
                        ) : "-"}
                      </td>
                      <td>{req.reason}</td>
                      <td>{formatDate(req.createdAt)}</td>
                      <td>
                        <button
                          className="btn-admin btn-resolve"
                          onClick={() => setResolvingRequest(req)}
                        >
                          🔧 Process
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Resolved Tab */}
      {activeTab === "resolved" && (
        <>
          {resolvedReports.length === 0 ? (
            <p className="admin-table-empty">No resolved reports yet.</p>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Reporter</th>
                    <th>Reported User</th>
                    <th>Reason</th>
                    <th>Admin</th>
                    <th>Resolution</th>
                    <th>Status</th>
                    <th>Resolved At</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedReports.map((report) => (
                    <tr key={report.reportAbuseId}>
                      <td>{report.requestAbuseId}</td>
                      <td>{report.request.reporterName}</td>
                      <td>{report.request.targetUserName || "-"}</td>
                      <td>{report.request.reason}</td>
                      <td>{report.adminName}</td>
                      <td>{report.resolution || "-"}</td>
                      <td>
                        <span
                          className={`abuse-status ${report.status === ABUSE_STATUS.RESOLVED
                            ? "resolved"
                            : report.status === ABUSE_STATUS.REJECTED
                              ? "rejected"
                              : "pending"
                            }`}
                        >
                          {ABUSE_STATUS_LABELS[report.status || 1]}
                        </span>
                      </td>
                      <td>{formatDate(report.resolvedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Resolve Modal */}
      {resolvingRequest && (
        <ResolveModal
          request={resolvingRequest}
          onClose={() => setResolvingRequest(null)}
          onResolved={handleResolved}
        />
      )}
    </div>
  );
};

export default AbuseManagementPage;
