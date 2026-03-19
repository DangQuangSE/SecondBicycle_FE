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
import "./admin.css";

const BicycleCatalogPage: FC = () => {
  const [brands, setBrands] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    bikeService.getBrands().then(setBrands).catch(() => {});
    bikeService.getTypes().then(setTypes).catch(() => {});
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
      setIsLoading(true);
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
    } catch (error: any) {
      toast.error(error?.message || "Thêm mẫu xe thất bại");
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="admin-content">
        <div style={{ background: "#fff", padding: "2rem", borderRadius: "8px", maxWidth: "800px" }}>
          <h3>Thêm Mẫu Xe Mới</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label>Thương hiệu *</label>
                <select name="brandId" value={formData.brandId} onChange={handleChange} style={{ width: "100%", padding: "8px" }} required>
                  <option value="">Chọn thương hiệu...</option>
                  {brands.map((name, i) => (
                    <option key={name} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Loại xe *</label>
                <select name="typeId" value={formData.typeId} onChange={handleChange} style={{ width: "100%", padding: "8px" }} required>
                  <option value="">Chọn loại xe...</option>
                  {types.map((name, i) => (
                    <option key={name} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Model Name *</label>
                <input name="modelName" value={formData.modelName} onChange={handleChange} style={{ width: "100%", padding: "8px" }} required placeholder="VD: Giant TCR 2024" />
              </div>

              <div>
                <label>Serial Number</label>
                <input name="serialNumber" value={formData.serialNumber} onChange={handleChange} style={{ width: "100%", padding: "8px" }} />
              </div>

              <div>
                <label>Màu sắc</label>
                <input name="color" value={formData.color} onChange={handleChange} style={{ width: "100%", padding: "8px" }} />
              </div>

              <div>
                <label>Size Khung</label>
                <select name="frameSize" value={formData.frameSize} onChange={handleChange} style={{ width: "100%", padding: "8px" }}>
                  <option value="">Chọn size...</option>
                  {FRAME_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Chất liệu khung</label>
                <select name="frameMaterial" value={formData.frameMaterial} onChange={handleChange} style={{ width: "100%", padding: "8px" }}>
                  <option value="">Chọn chất liệu...</option>
                  {FRAME_MATERIALS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Cỡ bánh</label>
                <select name="wheelSize" value={formData.wheelSize} onChange={handleChange} style={{ width: "100%", padding: "8px" }}>
                  <option value="">Chọn cỡ bánh...</option>
                  {WHEEL_SIZES.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Loại phanh</label>
                <select name="brakeType" value={formData.brakeType} onChange={handleChange} style={{ width: "100%", padding: "8px" }}>
                  <option value="">Chọn loại phanh...</option>
                  {BRAKE_TYPES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Trọng lượng (kg)</label>
                <input name="weight" type="number" step="0.1" value={formData.weight} onChange={handleChange} style={{ width: "100%", padding: "8px" }} />
              </div>

              <div>
                <label>Bộ truyền động</label>
                <input name="transmission" value={formData.transmission} onChange={handleChange} style={{ width: "100%", padding: "8px" }} />
              </div>
            </div>

            <div style={{ marginTop: "2rem" }}>
              <button type="submit" disabled={isLoading} style={{ padding: "0.5rem 1rem", background: "#4caf50", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                {isLoading ? "Đang thêm..." : "Thêm Mẫu Xe"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BicycleCatalogPage;
