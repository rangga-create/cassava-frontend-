"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface CompanyFormData {
  name: string;
  description: string;
  industry: string;
  country: string;
  province: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  registrationNumber: string;
  status: string;
}

interface CompanyFormProps {
  initialData?: Partial<CompanyFormData>;
  onSubmit: (data: CompanyFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const industryOptions = [
  { value: "AGRICULTURE", label: "Agriculture" },
  { value: "TRADING", label: "Trading" },
  { value: "PROCESSING", label: "Processing" },
  { value: "MANUFACTURING", label: "Manufacturing" },
  { value: "LOGISTICS", label: "Logistics" },
  { value: "EXPORT_IMPORT", label: "Export / Import" },
  { value: "OTHER", label: "Other" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

const countryOptions = [
  { value: "ID", label: "Indonesia" },
  { value: "TH", label: "Thailand" },
  { value: "VN", label: "Vietnam" },
  { value: "PH", label: "Philippines" },
  { value: "MY", label: "Malaysia" },
  { value: "CN", label: "China" },
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" },
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "DE", label: "Germany" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "BR", label: "Brazil" },
];

export function CompanyForm({ initialData, onSubmit, onCancel, loading = false }: CompanyFormProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    description: "",
    industry: "",
    country: "",
    province: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    taxId: "",
    registrationNumber: "",
    status: "ACTIVE",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CompanyFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        industry: initialData.industry || "",
        country: initialData.country || "",
        province: initialData.province || "",
        city: initialData.city || "",
        address: initialData.address || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        website: initialData.website || "",
        taxId: initialData.taxId || "",
        registrationNumber: initialData.registrationNumber || "",
        status: initialData.status || "ACTIVE",
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CompanyFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = "Company name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Company Name *"
          placeholder="Enter company name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
        />
        <Input
          label="Email *"
          type="email"
          placeholder="company@example.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Industry"
          placeholder="Select industry"
          value={formData.industry}
          onChange={(e) => handleChange("industry", e.target.value)}
          options={industryOptions}
        />
        <Select
          label="Country"
          placeholder="Select country"
          value={formData.country}
          onChange={(e) => handleChange("country", e.target.value)}
          options={countryOptions}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Province"
          placeholder="Province"
          value={formData.province}
          onChange={(e) => handleChange("province", e.target.value)}
        />
        <Input
          label="City"
          placeholder="City"
          value={formData.city}
          onChange={(e) => handleChange("city", e.target.value)}
        />
      </div>

      <Input
        label="Address"
        placeholder="Full address"
        value={formData.address}
        onChange={(e) => handleChange("address", e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone"
          placeholder="+62 xxx xxx xxx"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
        <Input
          label="Website"
          placeholder="https://example.com"
          value={formData.website}
          onChange={(e) => handleChange("website", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Tax ID"
          placeholder="Tax identification number"
          value={formData.taxId}
          onChange={(e) => handleChange("taxId", e.target.value)}
        />
        <Input
          label="Registration Number"
          placeholder="Business registration number"
          value={formData.registrationNumber}
          onChange={(e) => handleChange("registrationNumber", e.target.value)}
        />
      </div>

      <Input
        label="Description"
        placeholder="Brief description of the company"
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
      />

      {initialData?.status && (
        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange("status", e.target.value)}
          options={statusOptions}
        />
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? "Update Company" : "Create Company"}
        </Button>
      </div>
    </form>
  );
}
