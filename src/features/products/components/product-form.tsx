"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { productsService } from "../services/products.service";
import type { Product } from "@/types";
import { Upload, X, Image as ImageIcon } from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "FRESH", label: "Fresh Cassava" },
  { value: "DRIED", label: "Dried Cassava" },
  { value: "CHIPS", label: "Cassava Chips" },
  { value: "FLOUR", label: "Cassava Flour" },
  { value: "TAPIOCA_STARCH", label: "Tapioca Starch" },
  { value: "PELLETS", label: "Cassava Pellets" },
  { value: "FROZEN", label: "Frozen Cassava" },
  { value: "OTHER", label: "Other" },
];

const GRADE_OPTIONS = [
  { value: "A", label: "Grade A" },
  { value: "B", label: "Grade B" },
  { value: "C", label: "Grade C" },
  { value: "PREMIUM", label: "Premium" },
];

const UNIT_OPTIONS = [
  { value: "MT", label: "Metric Ton (MT)" },
  { value: "KG", label: "Kilogram (KG)" },
  { value: "TON", label: "Ton" },
  { value: "BAG", label: "Bag" },
];

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  loading = false,
}: ProductFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.imageUrl || "");
  const [imagePublicId, setImagePublicId] = useState<string>(product?.imagePublicId as string || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          sku: product.sku,
          name: product.name,
          description: product.description,
          category: product.category,
          grade: product.grade,
          unit: product.unit,
          origin: product.origin,
          purchaseCost: product.purchaseCost,
          processingCost: product.processingCost,
          sellingPrice: product.sellingPrice,
          imageUrl: product.imageUrl,
        }
      : {
          category: "FRESH",
          grade: "A",
          unit: "MT",
        },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only JPEG, PNG, WebP, and GIF files are allowed.");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB.");
      return;
    }

    setUploadError(null);
    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setImagePublicId("");
    setValue("imageUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFormSubmit = async (data: ProductInput) => {
    let finalData = { ...data };

    // Upload image if a new file is selected
    if (imageFile) {
      setUploadingImage(true);
      try {
        if (imagePublicId && product) {
          // Replace existing image
          const result = await productsService.replaceImage(imageFile, imagePublicId);
          finalData.imageUrl = result.url;
          finalData.imagePublicId = result.publicId;
        } else {
          // Upload new image
          const result = await productsService.uploadImage(imageFile);
          finalData.imageUrl = result.url;
          finalData.imagePublicId = result.publicId;
        }
      } catch (err: any) {
        setUploadError(err?.response?.data?.message || "Failed to upload image");
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }

    await onSubmit(finalData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Product Image
        </label>
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Product preview"
              className="w-32 h-32 object-cover rounded-md border border-border"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center hover:bg-red-700"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <ImageIcon className="h-8 w-8 text-text-secondary mb-2" />
            <span className="text-xs text-text-secondary">Click to upload</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleImageSelect}
          className="hidden"
        />
        {uploadError && <p className="mt-1 text-xs text-danger">{uploadError}</p>}
        <p className="mt-1 text-xs text-text-secondary">JPEG, PNG, WebP, or GIF. Max 5MB.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="SKU"
          placeholder="CSV-Fresh-001"
          error={errors.sku?.message}
          {...register("sku")}
        />
        <Input
          label="Product Name"
          placeholder="Fresh Cassava"
          error={errors.name?.message}
          {...register("name")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Category"
          options={CATEGORY_OPTIONS}
          error={errors.category?.message}
          {...register("category")}
        />
        <Select
          label="Grade"
          options={GRADE_OPTIONS}
          error={errors.grade?.message}
          {...register("grade")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Unit"
          options={UNIT_OPTIONS}
          error={errors.unit?.message}
          {...register("unit")}
        />
        <Input
          label="Origin"
          placeholder="Indonesia"
          {...register("origin")}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Purchase Cost"
          type="number"
          placeholder="0.00"
          error={errors.purchaseCost?.message}
          {...register("purchaseCost", { valueAsNumber: true })}
        />
        <Input
          label="Processing Cost"
          type="number"
          placeholder="0.00"
          error={errors.processingCost?.message}
          {...register("processingCost", { valueAsNumber: true })}
        />
        <Input
          label="Selling Price"
          type="number"
          placeholder="0.00"
          error={errors.sellingPrice?.message}
          {...register("sellingPrice", { valueAsNumber: true })}
        />
      </div>

      <Input
        label="Description"
        placeholder="Product description..."
        {...register("description")}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading || uploadingImage}>
          {product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
