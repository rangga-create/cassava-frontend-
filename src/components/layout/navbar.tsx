"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Search, Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { AiChatButton } from "@/features/ai/AiChat";

export function Navbar() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search products, suppliers, orders..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-text placeholder:text-text-secondary"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 text-text-secondary hover:text-text hover:bg-background rounded-md transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface rounded-lg border border-border shadow-lg z-50">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-navy text-sm">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-background cursor-pointer border-b border-border">
                  <p className="text-sm font-medium text-text">
                    Low stock alert for Cassava Flour
                  </p>
                  <p className="text-xs text-text-secondary mt-1">2 hours ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-background cursor-pointer border-b border-border">
                  <p className="text-sm font-medium text-text">
                    Shipment SH-2026-0082 arrived
                  </p>
                  <p className="text-xs text-text-secondary mt-1">5 hours ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-background cursor-pointer">
                  <p className="text-sm font-medium text-text">
                    3 export documents require attention
                  </p>
                  <p className="text-xs text-text-secondary mt-1">1 day ago</p>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-border">
                <button className="text-sm text-primary hover:text-primary-dark font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-background transition-colors"
          >
            <img src="/logo-indocassava.jpeg" alt="INDOCASSAVA" className="w-7 h-7 rounded-full object-cover" />
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-text leading-tight">{user?.name || 'User'}</p>
              <p className="text-xs text-text-secondary leading-tight">{user?.email || 'user@indocassava.com'}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-text-secondary" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-surface rounded-lg border border-border shadow-lg z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-text">{user?.name || 'User'}</p>
                <p className="text-xs text-text-secondary">{user?.email || 'admin@indocassava.com'}</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text hover:bg-background transition-colors">
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text hover:bg-background transition-colors">
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-danger/5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Chat Floating Button */}
      <AiChatButton href="/ai" />
    </header>
  );
}
