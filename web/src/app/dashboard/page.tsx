'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { theme } from '@/lib/theme';
import { Sidebar, NavSectionId } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { OverviewView } from '@/components/dashboard/OverviewView';
import { StatCard } from '@/components/dashboard/StatCard';
import {
  BreakdownCard,
  BreakdownItem,
} from '@/components/dashboard/BreakdownCard';
import { DeviceUserRow, UsersTable } from '@/components/dashboard/UsersTable';
import { UpdatesPanel } from '@/components/dashboard/UpdatesPanel';
import { AnnouncementsPanel } from '@/components/dashboard/AnnouncementsPanel';
import { SongDictionaryPanel } from '@/components/dashboard/SongDictionaryPanel';
import { SettingsView } from '@/components/dashboard/SettingsView';

interface MetricsResponse {
  totalUsers: number;
  dau: number;
  mau: number;
  blockedUsers: number;
  platformBreakdown: BreakdownItem[];
  versionBreakdown: BreakdownItem[];
}

const SECTION_TITLES: Record<NavSectionId, string> = {
  overview: 'Overview',
  songs: 'Songs Library',
  kignits: 'Kignits & Categories',
  users: 'Users',
  analytics: 'Analytics',
  content: 'Content Management',
  updates: 'App Updates',
  notifications: 'Notifications',
  settings: 'Settings',
  logs: 'Activity Logs',
};

export default function DashboardPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<NavSectionId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [totalSongs, setTotalSongs] = useState(0);
  const [users, setUsers] = useState<DeviceUserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');

  const fetchMetrics = useCallback(async () => {
    try {
      const [metricsRes, songsRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/songs'),
      ]);
      if (metricsRes.ok) {
        const data = (await metricsRes.json()) as MetricsResponse;
        setMetrics(data);
      }
      if (songsRes.ok) {
        const songsData = (await songsRes.json()) as { songs?: unknown[] };
        setTotalSongs(songsData.songs?.length ?? 0);
      }
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (platformFilter) params.set('platform', platformFilter);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as { users: DeviceUserRow[] };
        setUsers(data.users);
      }
    } finally {
      setUsersLoading(false);
    }
  }, [search, platformFilter]);

  useEffect(() => {
    void fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  async function handleToggleBlock(user: DeviceUserRow) {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBlocked: !user.isBlocked }),
    });
    if (res.ok) {
      await Promise.all([fetchUsers(), fetchMetrics()]);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: theme.colors.background.primary }}
    >
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          title={SECTION_TITLES[activeSection]}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenSearch={() => setActiveSection('songs')}
          onNavigate={setActiveSection}
          onLogout={handleLogout}
          unreadCount={0}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeSection === 'overview' && (
            <OverviewView
              totalSongs={totalSongs}
              totalUsers={metrics?.totalUsers ?? 0}
              dau={metrics?.dau ?? 0}
              mau={metrics?.mau ?? 0}
              loading={metricsLoading}
              onNavigate={setActiveSection}
            />
          )}

          {(activeSection === 'songs' ||
            activeSection === 'kignits' ||
            activeSection === 'content') && <SongDictionaryPanel />}

          {activeSection === 'users' && (
            <div className="space-y-6">
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Users"
                  value={metrics?.totalUsers ?? 0}
                  hint="Registered Android devices"
                  loading={metricsLoading}
                />
                <StatCard
                  label="Daily Active (DAU)"
                  value={metrics?.dau ?? 0}
                  hint="Active in last 24h"
                  loading={metricsLoading}
                />
                <StatCard
                  label="Monthly Active (MAU)"
                  value={metrics?.mau ?? 0}
                  hint="Active in last 30d"
                  loading={metricsLoading}
                />
                <StatCard
                  label="Blocked Devices"
                  value={metrics?.blockedUsers ?? 0}
                  hint="Access revoked"
                  loading={metricsLoading}
                />
              </section>

              <UsersTable
                users={users}
                loading={usersLoading}
                search={search}
                platformFilter={platformFilter}
                onSearchChange={setSearch}
                onPlatformChange={setPlatformFilter}
                onToggleBlock={handleToggleBlock}
              />
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BreakdownCard
                title="Platform Breakdown"
                items={metrics?.platformBreakdown ?? []}
                loading={metricsLoading}
              />
              <BreakdownCard
                title="App Version Distribution"
                items={metrics?.versionBreakdown ?? []}
                loading={metricsLoading}
              />
            </div>
          )}

          {activeSection === 'updates' && <UpdatesPanel />}

          {activeSection === 'notifications' && <AnnouncementsPanel />}

          {activeSection === 'settings' && <SettingsView />}

          {activeSection === 'logs' && (
            <div
              className="rounded-xl p-6"
              style={{
                backgroundColor: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.subtle}`,
              }}
            >
              <h2
                className="text-base font-semibold mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Activity Logs
              </h2>
              <p
                className="text-sm"
                style={{ color: theme.colors.text.secondary }}
              >
                System events, dictionary syncs, and admin actions are recorded
                here.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
