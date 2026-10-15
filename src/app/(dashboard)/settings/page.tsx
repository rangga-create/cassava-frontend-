"use client";
import { Card } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy">Settings</h1>
        <p className="text-sm text-text-secondary">Application settings and preferences</p>
      </div>

      <Card padding="lg">
        <div className="text-center py-10">
          <Settings className="h-10 w-10 text-text-secondary/40 mx-auto mb-3" />
          <p className="text-text-secondary text-sm">Settings page coming soon</p>
          <p className="text-xs text-text-secondary mt-1">Configure your account, company profile, and notification preferences.</p>
        </div>
      </Card>
    </div>
  );
}
