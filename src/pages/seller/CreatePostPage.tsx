import { useState, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { bikeService } from "../../services/bike.service";
import type { CreateBikeFormValues, BicycleCatalogItemDto } from "../../types/bike.types";
import ImagePicker from "../../components/features/bikes/ImagePicker";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTES } from "../../constants/routes";
import {
  createBikeSchema,
  type CreateBikeFormData,
} from "../../utils/validators";
import { MAX_IMAGES } from "../../constants/bike";
import "../../components/features/bikes/bikes.css";

const CreatePostPage: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [bikes, setBikes] = useState<BicycleCatalogItemDto[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBikeFormData>({
    resolver: zodResolver(createBikeSchema),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
    // Load bicycle catalog for dropdown via /api/adminbicycles
    bikeService.getCatalog().then(setBikes).catch(() => { });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: CreateBikeFormData) => {
    if (imageFiles.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 ảnh");
      return;
    }
    if (imageFiles.length > MAX_IMAGES) {
      toast.error(`Tối đa ${MAX_IMAGES} ảnh`);
      return;
    }

    const values: CreateBikeFormValues = {
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      price: Number(data.price),
      address: data.address?.trim() || undefined,
      bikeId: Number(data.bikeId),
      imageFiles,
    };

    try {
      setIsLoading(true);
      const created = await bikeService.createBike(values);
      toast.success("Đăng bài thành công!");
      navigate(ROUTES.BIKE_DETAIL.replace(":id", String(created.listingId)));
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Đăng bài thất bại";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="post-form">
      <h1>Đăng bài bán xe</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Info */}
        <div className="form-section">
          <h3>Thông tin cơ bản</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="create-title">
                Tiêu đề <span className="required">*</span>
              </label>
              <input
                id="create-title"
                type="text"
                className="form-control"
                placeholder="VD: Xe đạp Giant Escape 3 - Còn mới 95%"
                maxLength={200}
                {...register("title")}
              />
              {errors.title && (
                <span className="form-error">{errors.title.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="create-price">
                Giá (VNĐ) <span className="required">*</span>
              </label>
              <input
                id="create-price"
                type="number"
                className="form-control"
                placeholder="VD: 5500000"
                min={1}
                {...register("price")}
              />
              {errors.price && (
                <span className="form-error">{errors.price.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="create-address">Địa chỉ</label>
              <input
                id="create-address"
                type="text"
                className="form-control"
                placeholder="VD: Quận 1, TP.HCM"
                maxLength={255}
                {...register("address")}
              />
              {errors.address && (
                <span className="form-error">{errors.address.message}</span>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="create-description">Mô tả</label>
              <textarea
                id="create-description"
                className="form-control"
                placeholder="Mô tả chi tiết về xe..."
                rows={4}
                {...register("description")}
              />
              {errors.description && (
                <span className="form-error">{errors.description.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Bike Specs */}
        <div className="form-section">
          <h3>Thông số xe</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="create-bikeId">
                Mẫu xe <span className="required">*</span>
              </label>
              <select
                id="create-bikeId"
                className="form-control"
                title="Chọn mẫu xe"
                {...register("bikeId")}
              >
                <option value="">Chọn mẫu xe</option>
                {bikes.map((bike) => (
                  <option key={bike.bikeId} value={bike.bikeId}>
                    {bike.brandName} - {bike.modelName} ({bike.color} - Khung {bike.frameSize})
                  </option>
                ))}
              </select>
              {errors.bikeId && (
                <span className="form-error">{errors.bikeId.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="form-section">
          <h3>
            Hình ảnh <span className="required">*</span>
          </h3>
          <ImagePicker
            files={imageFiles}
            onAdd={(newFiles) =>
              setImageFiles((prev) => [...prev, ...newFiles])
            }
            onRemove={(index) =>
              setImageFiles((prev) => prev.filter((_, i) => i !== index))
            }
          />
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(ROUTES.SELLER_LISTINGS)}
          >
            Hủy
          </button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Đang đăng..." : "Đăng bài"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostPage;
