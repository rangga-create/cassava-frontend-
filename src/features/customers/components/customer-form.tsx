"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, type CustomerInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/types";

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function CustomerForm({ customer, onSubmit, onCancel, loading }: CustomerFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer ? {
      companyName: customer.companyName,
      contactName: customer.contactName,
      email: customer.email,
      phone: customer.phone,
      country: customer.country,
      address: customer.address || "",
      creditLimit: customer.creditLimit || 0,
      paymentTerms: customer.paymentTerms || "",
    } : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Company Name *</label>
          <input {...register("companyName")} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          {errors.companyName && <p className="text-xs text-danger mt-1">{errors.companyName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Contact Name *</label>
          <input {...register("contactName")} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          {errors.contactName && <p className="text-xs text-danger mt-1">{errors.contactName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Email *</label>
          <input type="email" {...register("email")} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Phone *</label>
          <input {...register("phone")} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Country *</label>
          <input {...register("country")} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          {errors.country && <p className="text-xs text-danger mt-1">{errors.country.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Address</label>
          <input {...register("address")} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Credit Limit</label>
          <input type="number" step="0.01" {...register("creditLimit", { valueAsNumber: true })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Payment Terms</label>
          <input {...register("paymentTerms")} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Net 30" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{customer ? "Update" : "Create"} Customer</Button>
      </div>
    </form>
  );
}
