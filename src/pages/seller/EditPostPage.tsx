import { useState, useEffect, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { bikeService } from "../../services/bike.service";
import type {
  BikePostDto,
  BikeImageDto,
  UpdateBikeFormValues,
  BicycleCatalogItemDto,
} from "../../types/bike.types";
import EditImageManager from "../../components/features/bikes/EditImageManager";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTES } from "../../constants/routes";
import {
  createBikeSchema,
  type CreateBikeFormData,
} from "../../utils/validators";
import "../../components/features/bikes/bikes.css";

const EditPostPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Image state (managed separately from form)
  const [existingImages, setExistingImages] = useState<BikeImageDto[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removeMediaIds, setRemoveMediaIds] = useState<number[]>([]);
  const [thumbnailMediaId, setThumbnailMediaId] = useState<
    number | undefined
  >();
  const [bikes, setBikes] = useState<BicycleCatalogItemDto[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBikeFormData>({
    resolver: zodResolver(createBikeSchema),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    // Load bicycle catalog for dropdown via /api/adminbicycles
    bikeService.getCatalog().then(setBikes).catch(() => { });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!id) return;
    const loadListing = async () => {
      try {
        setIsLoading(true);
        const data: BikePostDto = await bikeService.getBikeDetail(Number(id));
        reset({
          title: data.title || "",
          description: data.description || "",
          price: data.price ? String(data.price) : "",
          address: data.address || "",
          bikeId: data.bikeId ? String(data.bikeId) : "",
        });
        setExistingImages(data.images || []);
      } catch (err) {
        console.error(err);
        toast.error("Không tìm thấy bài đăng.");
      } finally {
        setIsLoading(false);
      }
    };
    loadListing();
  }, [id, reset]);

  const onSubmit = async (data: CreateBikeFormData) => {
    // Check total images after save
    const activeExisting = existingImages.filter(
      (img) => !removeMediaIds.includes(img.mediaId),
    );
    if (activeExisting.length + newFiles.length === 0) {
      toast.error("Bài đăng phải có ít nhất 1 ảnh");
      return;
    }

    const values: UpdateBikeFormValues = {
      listingId: Number(id),
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      price: Number(data.price),
      address: data.address?.trim() || undefined,
      bikeId: Number(data.bikeId),
      imageFiles: [],
      existingImages,
      newFiles,
      removeMediaIds,
      thumbnailMediaId,
    };

    try {
      setIsSaving(true);
      const updated = await bikeService.updateBike(values);
      toast.success("Cập nhật bài đăng thành công!");
      navigate(ROUTES.BIKE_DETAIL.replace(":id", String(updated.listingId)));
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Cập nhật thất bại";
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="loading-container">Đang tải...</div>;
  }

  return (
    <div className="post-form">
      <h1>Chỉnh sửa bài đăng</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Info */}
        <div className="form-section">
          <h3>Thông tin cơ bản</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="edit-title">
                Tiêu đề <span className="required">*</span>
              </label>
              <input
                id="edit-title"
                type="text"
                className="form-control"
                maxLength={200}
                {...register("title")}
              />
              {errors.title && (
                <span className="form-error">{errors.title.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="edit-price">
                Giá (VNĐ) <span className="required">*</span>
              </label>
              <input
                id="edit-price"
                type="number"
                className="form-control"
                min={1}
                {...register("price")}
              />
              {errors.price && (
                <span className="form-error">{errors.price.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="edit-address">Địa chỉ</label>
              <input
                id="edit-address"
                type="text"
                className="form-control"
                maxLength={255}
                {...register("address")}
              />
              {errors.address && (
                <span className="form-error">{errors.address.message}</span>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="edit-description">Mô tả</label>
              <textarea
                id="edit-description"
                className="form-control"
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
              <label htmlFor="edit-bikeId">
                Mẫu xe <span className="required">*</span>
              </label>
              <select
                id="edit-bikeId"
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
          <h3>Hình ảnh</h3>
          <EditImageManager
            existingImages={existingImages}
            newFiles={newFiles}
            removeMediaIds={removeMediaIds}
            thumbnailMediaId={thumbnailMediaId}
            onMarkRemove={(mediaId) =>
              setRemoveMediaIds((prev) => [...prev, mediaId])
            }
            onUndoRemove={(mediaId) =>
              setRemoveMediaIds((prev) => prev.filter((mId) => mId !== mediaId))
            }
            onSetThumbnail={(mediaId) => setThumbnailMediaId(mediaId)}
            onAddFiles={(files) => setNewFiles((prev) => [...prev, ...files])}
            onRemoveNewFile={(index) =>
              setNewFiles((prev) => prev.filter((_, i) => i !== index))
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
          <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPostPage;
