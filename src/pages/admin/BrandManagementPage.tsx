import { useState, useEffect, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { brandService } from "../../services/brand.service";
import type {
    BrandDto,
    CreateBrandDto,
    UpdateBrandDto,
} from "../../types/brand.types";
import { ROUTES } from "../../constants/routes";
import "./admin.css";

const BrandManagementPage: FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [brands, setBrands] = useState<BrandDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [createForm, setCreateForm] = useState<CreateBrandDto>({
        brandName: "",
        country: "",
    });
    const [editForm, setEditForm] = useState<UpdateBrandDto | null>(null);
    const [processing, setProcessing] = useState(false);

    const fetchBrands = async () => {
        try {
            setIsLoading(true);
            const data = await brandService.getAll();
            setBrands(data);
        } catch {
            toast.error("Không thể tải danh sách thương hiệu.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.roleName !== "Admin") {
            navigate(ROUTES.HOME);
            return;
        }
        fetchBrands();
    }, [user, navigate]);

    const handleCreate = async () => {
        if (!createForm.brandName.trim()) {
            toast.error("Tên thương hiệu không được để trống.");
            return;
        }
        setProcessing(true);
        try {
            await brandService.create(createForm);
            toast.success("Tạo thương hiệu thành công!");
            setShowCreateModal(false);
            setCreateForm({ brandName: "", country: "" });
            fetchBrands();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Tạo thương hiệu thất bại.",
            );
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdate = async () => {
        if (!editForm || !editForm.brandName.trim()) {
            toast.error("Tên thương hiệu không được để trống.");
            return;
        }
        setProcessing(true);
        try {
            await brandService.update(editForm);
            toast.success("Cập nhật thương hiệu thành công!");
            setShowEditModal(false);
            setEditForm(null);
            fetchBrands();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Cập nhật thất bại.",
            );
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (brandId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) return;
        try {
            await brandService.delete(brandId);
            toast.success("Đã xóa thương hiệu!");
            fetchBrands();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Xóa thất bại.",
            );
        }
    };

    const openEdit = (brand: BrandDto) => {
        setEditForm({
            brandId: brand.brandId,
            brandName: brand.brandName,
            country: brand.country ?? "",
        });
        setShowEditModal(true);
    };

    if (isLoading) {
        return <div className="loading-container">Đang tải...</div>;
    }

    return (
        <div className="admin-page">
            <h2>🏷️ Quản lý thương hiệu</h2>

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
                <Link to={ROUTES.ADMIN_BRANDS} className="admin-nav-link active">
                    Quản lý thương hiệu
                </Link>
                <Link to={ROUTES.ADMIN_BICYCLES} className="admin-nav-link">
                  Quản lý mẫu xe
                </Link>
                <Link to={ROUTES.ADMIN_ABUSE} className="admin-nav-link">
                    Báo cáo vi phạm
                </Link>
            </nav>

            {/* Action bar */}
            <div className="admin-filter-bar">
                <span style={{ flex: 1 }}>
                    Tổng cộng: <strong>{brands.length}</strong> thương hiệu
                </span>
                <button
                    className="btn-admin btn-create"
                    onClick={() => {
                        setCreateForm({ brandName: "", country: "" });
                        setShowCreateModal(true);
                    }}
                >
                    ➕ Thêm thương hiệu
                </button>
            </div>

            {/* Table */}
            {brands.length === 0 ? (
                <p className="admin-table-empty">Chưa có thương hiệu nào.</p>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên thương hiệu</th>
                                <th>Quốc gia</th>
                                <th>Số xe</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {brands.map((brand) => (
                                <tr key={brand.brandId}>
                                    <td>{brand.brandId}</td>
                                    <td>{brand.brandName}</td>
                                    <td>{brand.country ?? "-"}</td>
                                    <td>{brand.totalBicycles}</td>
                                    <td className="admin-actions">
                                        <button
                                            className="btn-admin btn-edit"
                                            onClick={() => openEdit(brand)}
                                            title="Sửa"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-admin btn-delete"
                                            onClick={() => handleDelete(brand.brandId)}
                                            title="Xóa"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* CREATE MODAL */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Thêm thương hiệu mới</h3>
                        <div className="modal-form">
                            <label>
                                Tên thương hiệu *
                                <input
                                    type="text"
                                    value={createForm.brandName}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, brandName: e.target.value })
                                    }
                                    placeholder="VD: Giant, Trek, Specialized..."
                                />
                            </label>
                            <label>
                                Quốc gia
                                <input
                                    type="text"
                                    value={createForm.country ?? ""}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, country: e.target.value })
                                    }
                                    placeholder="VD: USA, Taiwan, Japan..."
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

            {/* EDIT MODAL */}
            {showEditModal && editForm && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Sửa thương hiệu #{editForm.brandId}</h3>
                        <div className="modal-form">
                            <label>
                                Tên thương hiệu *
                                <input
                                    type="text"
                                    value={editForm.brandName}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, brandName: e.target.value })
                                    }
                                />
                            </label>
                            <label>
                                Quốc gia
                                <input
                                    type="text"
                                    value={editForm.country ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, country: e.target.value })
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
        </div>
    );
};

export default BrandManagementPage;
