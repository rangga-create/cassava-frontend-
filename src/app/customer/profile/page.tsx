"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { User, Mail, Phone, Shield, Save } from "lucide-react";

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    company: "",
    address: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "OWNER":
      case "ADMIN":
        return "Administrator";
      case "MANAGER":
        return "Manager";
      case "SALES":
        return "Sales";
      case "CUSTOMER":
        return "Customer";
      default:
        return "User";
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">My Profile</h2>
        <p className="text-gray-500 text-sm">Manage your account information</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold shrink-0">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user?.name || "Customer"}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-flex items-center gap-1 text-xs text-primary mt-0.5">
              <Shield className="h-3 w-3" /> {getRoleLabel(user?.role)}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="font-medium text-gray-900 text-sm mb-4">Personal Information</h3>
        <div className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} disabled
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-500" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="+62 812 3456 7890" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input type="text" name="company" value={formData.company} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="Company name (optional)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea name="address" rows={3} value={formData.address} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              placeholder="Your address" />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button type="submit"
            className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-primary-dark transition-colors">
            <Save className="h-4 w-4" /> Save Changes
          </button>
          {saved && <span className="text-success text-sm font-medium">Profile updated!</span>}
        </div>
      </form>
    </div>
  );
}
