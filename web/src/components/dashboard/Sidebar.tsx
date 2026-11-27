'use client';

import {
  LayoutDashboard,
  Music,
  Tags,
  Users,
  BarChart3,
  FileText,
  Download,
  Bell,
  Settings,
  Activity,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { theme } from '@/lib/theme';

export type NavSectionId =
  | 'overview'
  | 'songs'
  | 'kignits'
  | 'users'
  | 'analytics'
  | 'content'
  | 'updates'
  | 'notifications'
  | 'settings'
  | 'logs';

interface NavItem {
  id: NavSectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Main',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'songs', label: 'Songs Library', icon: Music },
      { id: 'kignits', label: 'Kignits & Categories', icon: Tags },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Management',
    items: [
      { id: 'content', label: 'Content Management', icon: FileText },
      { id: 'updates', label: 'App Updates', icon: Download },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'logs', label: 'Activity Logs', icon: Activity },
    ],
  },
];

interface SidebarProps {
  activeSection: NavSectionId;
  onSelectSection: (id: NavSectionId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeSection,
  onSelectSection,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const sidebarContent = (
    <aside
      className={`flex flex-col h-full transition-all duration-200 select-none ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
      style={{
        backgroundColor: theme.colors.background.secondary,
        borderRight: `1px solid ${theme.colors.border.subtle}`,
      }}
    >
      {/* Brand Section */}
      <div
        className="flex items-center justify-between h-16 px-4 shrink-0"
        style={{ borderBottom: `1px solid ${theme.colors.border.subtle}` }}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
            style={{
              backgroundColor: theme.colors.accent.primary,
              color: theme.colors.accent.foreground,
            }}
          >
            SK
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p
                className="text-sm font-semibold tracking-tight truncate"
                style={{ color: theme.colors.text.primary }}
              >
                Selah Kignit
              </p>
              <p
                className="text-[10px] font-semibold tracking-widest uppercase truncate"
                style={{ color: theme.colors.text.muted }}
              >
                ADMIN CONSOLE
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md cursor-pointer transition-colors"
          style={{ color: theme.colors.text.secondary }}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation"
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md cursor-pointer"
          style={{ color: theme.colors.text.secondary }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p
                className="px-2.5 mb-2 text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: theme.colors.text.muted }}
              >
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={collapsed ? item.label : undefined}
                    onClick={() => {
                      onSelectSection(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      collapsed ? 'justify-center' : ''
                    }`}
                    style={{
                      backgroundColor: active
                        ? theme.colors.background.subtle
                        : 'transparent',
                      color: active
                        ? theme.colors.text.primary
                        : theme.colors.text.secondary,
                    }}
                  >
                    <Icon
                      className="h-4 w-4 shrink-0"
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}

