import { useState, useEffect, type FC } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { bikeService } from "../../services/bike.service";
import { adminService, type CreateAdminBicycleDto } from "../../services/admin.service";
import { ROUTES } from "../../constants/routes";
import {
  FRAME_SIZES,
  FRAME_MATERIALS,
  WHEEL_SIZES,
  BRAKE_TYPES,
} from "../../constants/bike";
import type { BicycleCatalogItemDto } from "../../types/bike.types";
import "./admin.css";

const BicycleCatalogPage: FC = () => {
  const [brands, setBrands] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<BicycleCatalogItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCatalog = async () => {
    try {
      setIsLoading(true);
      const data = await bikeService.getCatalog();
      setCatalog(data);
    } catch {
      toast.error("Không thể tải danh sách mẫu xe.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bikeService.getBrands().then(setBrands).catch(() => {});
    bikeService.getTypes().then(setTypes).catch(() => {});
    fetchCatalog();
  }, []);

  const [formData, setFormData] = useState({
    brandId: "",
    typeId: "",
    modelName: "",
    serialNumber: "",
    color: "",
    frameSize: "",
    frameMaterial: "",
    wheelSize: "",
    brakeType: "",
    weight: "",
    transmission: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandId || !formData.typeId || !formData.modelName) {
      toast.error("Vui lòng điền các trường bắt buộc (Brand, Type, ModelName)");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateAdminBicycleDto = {
        brandId: Number(formData.brandId),
        typeId: Number(formData.typeId),
        modelName: formData.modelName.trim(),
        serialNumber: formData.serialNumber.trim() || undefined,
        color: formData.color.trim() || undefined,
        frameSize: formData.frameSize || undefined,
        frameMaterial: formData.frameMaterial || undefined,
        wheelSize: formData.wheelSize || undefined,
        brakeType: formData.brakeType || undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        transmission: formData.transmission.trim() || undefined,
      };

      await adminService.createAdminBicycle(payload);
      toast.success("Thêm mẫu xe thành công!");
      setFormData({
        brandId: "",
        typeId: "",
        modelName: "",
        serialNumber: "",
        color: "",
        frameSize: "",
        frameMaterial: "",
        wheelSize: "",
        brakeType: "",
        weight: "",
        transmission: "",
      });
      setShowCreateModal(false);
      fetchCatalog(); // Refresh list after creation
    } catch (error: any) {
      toast.error(error?.message || "Thêm mẫu xe thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="loading-container">Đang tải...</div>;
  }

  return (
    <div className="admin-page">
      <h2>Mẫu xe (Bicycle Catalog)</h2>

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
        <Link to={ROUTES.ADMIN_BICYCLES} className="admin-nav-link active">
          Quản lý mẫu xe
        </Link>
        <Link to={ROUTES.ADMIN_ABUSE} className="admin-nav-link">
          Báo cáo vi phạm
        </Link>
      </nav>

      {/* Action bar */}
      <div className="admin-filter-bar">
        <span style={{ flex: 1 }}>
          Tổng cộng: <strong>{catalog.length}</strong> mẫu xe
        </span>
        <button
          className="btn-admin btn-create"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Thêm mẫu xe
        </button>
      </div>

      {/* Table */}
      {catalog.length === 0 ? (
        <p className="admin-table-empty">Chưa có mẫu xe nào.</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Thương hiệu</th>
                <th>Model</th>
                <th>Loại xe</th>
                <th>Màu sắc</th>
                <th>Size Khung</th>
              </tr>
            </thead>
            <tbody>
              {catalog.map((bike) => (
                <tr key={bike.bikeId}>
                  <td>{bike.bikeId}</td>
                  <td>{bike.brandName}</td>
                  <td>{bike.modelName}</td>
                  <td>{bike.typeName}</td>
                  <td>{bike.color || "-"}</td>
                  <td>{bike.frameSize || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" style={{ maxWidth: "800px" }} onClick={(e) => e.stopPropagation()}>
            <h3>Thêm Mẫu Xe Mới</h3>
            <div className="modal-form">
              <form id="create-bike-form" onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label>Thương hiệu *</label>
                    <select name="brandId" value={formData.brandId} onChange={handleChange} className="form-control" required>
                      <option value="">Chọn thương hiệu...</option>
                      {brands.map((name, i) => (
                        <option key={name} value={i + 1}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Loại xe *</label>
                    <select name="typeId" value={formData.typeId} onChange={handleChange} className="form-control" required>
                      <option value="">Chọn loại xe...</option>
                      {types.map((name, i) => (
                        <option key={name} value={i + 1}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Model Name *</label>
                    <input name="modelName" value={formData.modelName} onChange={handleChange} className="form-control" required placeholder="VD: Giant TCR 2024" />
                  </div>

                  <div className="form-group">
                    <label>Serial Number</label>
                    <input name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="form-control" />
                  </div>

                  <div className="form-group">
                    <label>Màu sắc</label>
                    <input name="color" value={formData.color} onChange={handleChange} className="form-control" />
                  </div>

                  <div className="form-group">
                    <label>Size Khung</label>
                    <select name="frameSize" value={formData.frameSize} onChange={handleChange} className="form-control">
                      <option value="">Chọn size...</option>
                      {FRAME_SIZES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Chất liệu khung</label>
                    <select name="frameMaterial" value={formData.frameMaterial} onChange={handleChange} className="form-control">
                      <option value="">Chọn chất liệu...</option>
                      {FRAME_MATERIALS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Cỡ bánh</label>
                    <select name="wheelSize" value={formData.wheelSize} onChange={handleChange} className="form-control">
                      <option value="">Chọn cỡ bánh...</option>
                      {WHEEL_SIZES.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Loại phanh</label>
                    <select name="brakeType" value={formData.brakeType} onChange={handleChange} className="form-control">
                      <option value="">Chọn loại phanh...</option>
                      {BRAKE_TYPES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Trọng lượng (kg)</label>
                    <input name="weight" type="number" step="0.1" value={formData.weight} onChange={handleChange} className="form-control" />
                  </div>

                  <div className="form-group">
                    <label>Bộ truyền động</label>
                    <input name="transmission" value={formData.transmission} onChange={handleChange} className="form-control" />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-actions">
              <button
                className="btn-admin btn-cancel"
                onClick={() => setShowCreateModal(false)}
              >
                Hủy
              </button>
              <button
                type="submit"
                form="create-bike-form"
                className="btn-admin btn-save"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang thêm..." : "Thêm Mẫu Xe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BicycleCatalogPage;
