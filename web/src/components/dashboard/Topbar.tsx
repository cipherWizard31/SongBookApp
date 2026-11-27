'use client';

import { useState } from 'react';
import { Menu, Search, Bell, LogOut, Settings, ChevronDown } from 'lucide-react';
import { theme } from '@/lib/theme';
import { NavSectionId } from './Sidebar';

interface TopbarProps {
  title: string;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onNavigate: (section: NavSectionId) => void;
  onLogout: () => void;
  unreadCount?: number;
}

export function Topbar({
  title,
  onOpenMobileMenu,
  onOpenSearch,
  onNavigate,
  onLogout,
  unreadCount = 0,
}: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between backdrop-blur-md"
      style={{
        backgroundColor: theme.colors.background.secondary,
        borderBottom: `1px solid ${theme.colors.border.subtle}`,
      }}
    >
      {/* Left: Mobile menu + Breadcrumb / Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation"
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer"
          style={{
            border: `1px solid ${theme.colors.border.subtle}`,
            color: theme.colors.text.primary,
          }}
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-sm min-w-0">
          <span
            className="hidden sm:inline font-medium"
            style={{ color: theme.colors.text.muted }}
          >
            Admin
          </span>
          <span
            className="hidden sm:inline"
            style={{ color: theme.colors.text.muted }}
          >
            /
          </span>
          <h1
            className="font-semibold tracking-tight truncate"
            style={{ color: theme.colors.text.primary }}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors"
          style={{
            backgroundColor: theme.colors.background.subtle,
            color: theme.colors.text.secondary,
            border: `1px solid ${theme.colors.border.subtle}`,
          }}
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search...</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('notifications')}
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer transition-colors"
          style={{
            backgroundColor: theme.colors.background.subtle,
            color: theme.colors.text.secondary,
            border: `1px solid ${theme.colors.border.subtle}`,
          }}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: theme.colors.accent.primary }}
            />
          )}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 h-9 pl-1.5 pr-2.5 rounded-lg cursor-pointer transition-colors"
            style={{
              backgroundColor: theme.colors.background.subtle,
              border: `1px solid ${theme.colors.border.subtle}`,
            }}
          >
            <div
              className="h-6 w-6 rounded-md flex items-center justify-center text-[11px] font-bold"
              style={{
                backgroundColor: theme.colors.accent.primary,
                color: theme.colors.accent.foreground,
              }}
            >
              A
            </div>
            <div className="hidden md:block text-left leading-tight">
              <p
                className="text-xs font-semibold"
                style={{ color: theme.colors.text.primary }}
              >
                Admin
              </p>
              <p
                className="text-[10px]"
                style={{ color: theme.colors.text.muted }}
              >
                Super Admin
              </p>
            </div>
            <ChevronDown
              className="h-3.5 w-3.5 hidden sm:block"
              style={{ color: theme.colors.text.muted }}
            />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl py-1.5 z-50"
              style={{
                backgroundColor: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.subtle}`,
                boxShadow: theme.elevation.ambient,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate('settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer"
                style={{ color: theme.colors.text.primary }}
              >
                <Settings className="h-3.5 w-3.5" />
                Account Settings
              </button>
              <div
                className="my-1"
                style={{ borderTop: `1px solid ${theme.colors.border.subtle}` }}
              />
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer"
                style={{ color: theme.colors.status.danger }}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

