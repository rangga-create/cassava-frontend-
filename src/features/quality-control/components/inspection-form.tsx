"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { QualityInspection } from "@/types";

const inspectionSchema = z.object({
  batchId: z.string().min(1, "Batch ID is required"),
  supplierId: z.string().min(1, "Supplier ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  moisture: z.number().min(0).max(100, "Must be 0-100"),
  starchContent: z.number().min(0).max(100, "Must be 0-100"),
  impurity: z.number().min(0).max(100, "Must be 0-100"),
  damage: z.number().min(0).max(100, "Must be 0-100"),
  freshness: z.number().min(0).max(100, "Must be 0-100"),
  color: z.string().min(1, "Color is required"),
  size: z.string().min(1, "Size is required"),
  grade: z.string().min(1, "Grade is required"),
  notes: z.string().optional(),
});

type InspectionInput = z.infer<typeof inspectionSchema>;

const COLOR_OPTIONS = [
  { value: "White", label: "White" },
  { value: "Off-White", label: "Off-White" },
  { value: "Yellow", label: "Yellow" },
  { value: "Brown", label: "Brown" },
  { value: "Light Brown", label: "Light Brown" },
];

const SIZE_OPTIONS = [
  { value: "Small", label: "Small (< 5cm)" },
  { value: "Medium", label: "Medium (5-10cm)" },
  { value: "Large", label: "Large (10-20cm)" },
  { value: "Extra Large", label: "Extra Large (> 20cm)" },
];

const GRADE_OPTIONS = [
  { value: "A", label: "Grade A" },
  { value: "B", label: "Grade B" },
  { value: "C", label: "Grade C" },
  { value: "Premium", label: "Premium" },
];

interface InspectionFormProps {
  inspection?: QualityInspection;
  onSubmit: (data: InspectionInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  calculateScore: (params: any) => { score: number; result: string };
}

export function InspectionForm({
  inspection,
  onSubmit,
  onCancel,
  loading = false,
  calculateScore,
}: InspectionFormProps) {
  const [previewScore, setPreviewScore] = useState(0);
  const [previewResult, setPreviewResult] = useState<string>("REJECTED");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InspectionInput>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: inspection
      ? {
          batchId: inspection.batchId,
          supplierId: inspection.supplierId,
          productId: inspection.productId,
          moisture: inspection.moisture,
          starchContent: inspection.starchContent,
          impurity: inspection.impurity,
          damage: inspection.damage,
          freshness: inspection.freshness,
          color: inspection.color,
          size: inspection.size,
          grade: inspection.grade,
          notes: inspection.notes,
        }
      : {
          moisture: 0,
          starchContent: 0,
          impurity: 0,
          damage: 0,
          freshness: 0,
          color: "White",
          size: "Medium",
          grade: "A",
        },
  });

  // Watch all quality parameters for real-time calculation
  const moisture = watch("moisture");
  const starchContent = watch("starchContent");
  const impurity = watch("impurity");
  const damage = watch("damage");
  const freshness = watch("freshness");

  // Update preview score when parameters change
  useEffect(() => {
    const { score, result } = calculateScore({
      moisture: moisture || 0,
      starchContent: starchContent || 0,
      impurity: impurity || 0,
      damage: damage || 0,
      freshness: freshness || 0,
    });
    setPreviewScore(score);
    setPreviewResult(result);
  }, [moisture, starchContent, impurity, damage, freshness, calculateScore]);

  const getResultColor = (result: string) => {
    switch (result) {
      case "APPROVED":
        return "success";
      case "CONDITIONAL":
        return "warning";
      default:
        return "danger";
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Real-time Score Preview */}
      <div className="p-4 bg-background rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Quality Score</p>
            <p className="text-2xl font-bold text-navy">{previewScore}/100</p>
          </div>
          <Badge variant={getResultColor(previewResult) as any} size="md">
            {previewResult}
          </Badge>
        </div>
        <div className="mt-3 w-full bg-border rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              previewScore >= 70
                ? "bg-success"
                : previewScore >= 50
                  ? "bg-warning"
                  : "bg-danger"
            }`}
            style={{ width: `${previewScore}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Batch ID"
          placeholder="CV-2026-0001"
          error={errors.batchId?.message}
          {...register("batchId")}
        />
        <Input
          label="Supplier ID"
          placeholder="Supplier ID"
          error={errors.supplierId?.message}
          {...register("supplierId")}
        />
        <Input
          label="Product ID"
          placeholder="Product ID"
          error={errors.productId?.message}
          {...register("productId")}
        />
      </div>

      {/* Quality Parameters */}
      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-medium text-text mb-3">Quality Parameters</h3>
        <div className="grid grid-cols-5 gap-4">
          <div>
            <Input
              label="Moisture (%)"
              type="number"
              step="0.1"
              error={errors.moisture?.message}
              {...register("moisture", { valueAsNumber: true })}
            />
            <p className="mt-1 text-xs text-text-secondary">Lower is better</p>
          </div>
          <div>
            <Input
              label="Starch (%)"
              type="number"
              step="0.1"
              error={errors.starchContent?.message}
              {...register("starchContent", { valueAsNumber: true })}
            />
            <p className="mt-1 text-xs text-text-secondary">Higher is better</p>
          </div>
          <div>
            <Input
              label="Impurity (%)"
              type="number"
              step="0.1"
              error={errors.impurity?.message}
              {...register("impurity", { valueAsNumber: true })}
            />
            <p className="mt-1 text-xs text-text-secondary">Lower is better</p>
          </div>
          <div>
            <Input
              label="Damage (%)"
              type="number"
              step="0.1"
              error={errors.damage?.message}
              {...register("damage", { valueAsNumber: true })}
            />
            <p className="mt-1 text-xs text-text-secondary">Lower is better</p>
          </div>
          <div>
            <Input
              label="Freshness (%)"
              type="number"
              step="0.1"
              error={errors.freshness?.message}
              {...register("freshness", { valueAsNumber: true })}
            />
            <p className="mt-1 text-xs text-text-secondary">Higher is better</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Select
          label="Color"
          options={COLOR_OPTIONS}
          error={errors.color?.message}
          {...register("color")}
        />
        <Select
          label="Size"
          options={SIZE_OPTIONS}
          error={errors.size?.message}
          {...register("size")}
        />
        <Select
          label="Grade"
          options={GRADE_OPTIONS}
          error={errors.grade?.message}
          {...register("grade")}
        />
      </div>

      <Input
        label="Notes"
        placeholder="Additional inspection notes..."
        {...register("notes")}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {inspection ? "Update Inspection" : "Submit Inspection"}
        </Button>
      </div>
    </form>
  );
}
