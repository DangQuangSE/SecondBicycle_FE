import { useState, useEffect, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { categoryService } from "../../services/category.service";
import type {
    CategoryDto,
    CreateCategoryDto,
    UpdateCategoryDto,
} from "../../types/category.types";
import { ROUTES } from "../../constants/routes";
import "./admin.css";

const CategoryManagementPage: FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [createForm, setCreateForm] = useState<CreateCategoryDto>({
        typeName: "",
    });
    const [editForm, setEditForm] = useState<UpdateCategoryDto | null>(null);
    const [processing, setProcessing] = useState(false);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const data = await categoryService.getAll();
            setCategories(data);
        } catch {
            toast.error("Không thể tải danh sách danh mục.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.roleName !== "Admin") {
            navigate(ROUTES.HOME);
            return;
        }
        fetchCategories();
    }, [user, navigate]);

    const handleCreate = async () => {
        if (!createForm.typeName.trim()) {
            toast.error("Tên danh mục không được để trống.");
            return;
        }
        setProcessing(true);
        try {
            await categoryService.create(createForm);
            toast.success("Tạo danh mục thành công!");
            setShowCreateModal(false);
            setCreateForm({ typeName: "" });
            fetchCategories();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Tạo danh mục thất bại.",
            );
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdate = async () => {
        if (!editForm || !editForm.typeName.trim()) {
            toast.error("Tên danh mục không được để trống.");
            return;
        }
        setProcessing(true);
        try {
            await categoryService.update(editForm);
            toast.success("Cập nhật danh mục thành công!");
            setShowEditModal(false);
            setEditForm(null);
            fetchCategories();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Cập nhật thất bại.",
            );
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (typeId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
        try {
            await categoryService.delete(typeId);
            toast.success("Đã xóa danh mục!");
            fetchCategories();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Xóa thất bại.",
            );
        }
    };

    const openEdit = (cat: CategoryDto) => {
        setEditForm({ typeId: cat.typeId, typeName: cat.typeName });
        setShowEditModal(true);
    };

    if (isLoading) {
        return <div className="loading-container">Đang tải...</div>;
    }

    return (
        <div className="admin-page">
            <h2>📂 Quản lý danh mục xe</h2>

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
                <Link to={ROUTES.ADMIN_CATEGORIES} className="admin-nav-link active">
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

            {/* Action bar */}
            <div className="admin-filter-bar">
                <span style={{ flex: 1 }}>
                    Tổng cộng: <strong>{categories.length}</strong> danh mục
                </span>
                <button
                    className="btn-admin btn-create"
                    onClick={() => {
                        setCreateForm({ typeName: "" });
                        setShowCreateModal(true);
                    }}
                >
                    ➕ Thêm danh mục
                </button>
            </div>

            {/* Table */}
            {categories.length === 0 ? (
                <p className="admin-table-empty">Chưa có danh mục nào.</p>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên danh mục</th>
                                <th>Số xe</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.typeId}>
                                    <td>{cat.typeId}</td>
                                    <td>{cat.typeName}</td>
                                    <td>{cat.totalBicycles}</td>
                                    <td className="admin-actions">
                                        <button
                                            className="btn-admin btn-edit"
                                            onClick={() => openEdit(cat)}
                                            title="Sửa"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-admin btn-delete"
                                            onClick={() => handleDelete(cat.typeId)}
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
                        <h3>Thêm danh mục mới</h3>
                        <div className="modal-form">
                            <label>
                                Tên danh mục *
                                <input
                                    type="text"
                                    value={createForm.typeName}
                                    onChange={(e) =>
                                        setCreateForm({ typeName: e.target.value })
                                    }
                                    placeholder="VD: Mountain, Road, Hybrid..."
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
                        <h3>Sửa danh mục #{editForm.typeId}</h3>
                        <div className="modal-form">
                            <label>
                                Tên danh mục *
                                <input
                                    type="text"
                                    value={editForm.typeName}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, typeName: e.target.value })
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

export default CategoryManagementPage;
