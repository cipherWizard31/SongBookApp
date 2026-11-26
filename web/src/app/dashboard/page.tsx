'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { theme } from '@/lib/theme';
import { StatCard } from '@/components/dashboard/StatCard';
import {
  BreakdownCard,
  BreakdownItem,
} from '@/components/dashboard/BreakdownCard';
import { DeviceUserRow, UsersTable } from '@/components/dashboard/UsersTable';
import { UpdatesPanel } from '@/components/dashboard/UpdatesPanel';
import { AnnouncementsPanel } from '@/components/dashboard/AnnouncementsPanel';
import { SongDictionaryPanel } from '@/components/dashboard/SongDictionaryPanel';

interface MetricsResponse {
  totalUsers: number;
  dau: number;
  mau: number;
  blockedUsers: number;
  platformBreakdown: BreakdownItem[];
  versionBreakdown: BreakdownItem[];
}

type DashboardTab = 'users' | 'updates' | 'dictionary';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>('users');
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [users, setUsers] = useState<DeviceUserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = (await res.json()) as MetricsResponse;
        setMetrics(data);
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

  const tabs: { id: DashboardTab; label: string }[] = [
    { id: 'users', label: 'Users & Metrics' },
    { id: 'updates', label: 'Updates & Notices' },
    { id: 'dictionary', label: 'Song Dictionary' },
  ];

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: theme.colors.background.primary,
        padding: theme.spacing.lg,
      }}
    >
      <div
        className="mx-auto max-w-6xl flex flex-col"
        style={{ gap: theme.spacing.md }}
      >
        <header
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
          style={{
            backgroundColor: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.subtle}`,
            borderRadius: theme.radii.outer,
            padding: theme.spacing.md,
            boxShadow: theme.elevation.ambient,
            gap: theme.spacing.sm,
          }}
        >
          <div>
            <h1
              className="text-lg font-semibold"
              style={{ color: theme.colors.text.primary }}
            >
              SelahKignit Web Controller
            </h1>
            <p
              className="text-sm font-medium"
              style={{ color: theme.colors.text.secondary }}
            >
              Users, universal updates, and global song dictionary
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="min-h-[44px] text-sm font-semibold cursor-pointer self-start sm:self-auto"
            style={{
              backgroundColor: theme.colors.background.subtle,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.subtle}`,
              borderRadius: theme.radii.inner,
              padding: `0 ${theme.spacing.sm}`,
            }}
          >
            Sign Out
          </button>
        </header>

        <nav className="flex flex-wrap" style={{ gap: theme.spacing.xs }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="min-h-[44px] text-sm font-semibold cursor-pointer"
                style={{
                  backgroundColor: active
                    ? theme.colors.accent.primary
                    : theme.colors.background.secondary,
                  color: active
                    ? theme.colors.accent.foreground
                    : theme.colors.text.secondary,
                  border: `1px solid ${theme.colors.border.subtle}`,
                  borderRadius: theme.radii.inner,
                  padding: `0 ${theme.spacing.md}`,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {activeTab === 'users' && (
          <>
            <section
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              style={{ gap: theme.spacing.sm }}
            >
              <StatCard
                label="Total Installs"
                value={metrics?.totalUsers ?? 0}
                loading={metricsLoading}
              />
              <StatCard
                label="Daily Active (DAU)"
                value={metrics?.dau ?? 0}
                hint="Last 24 hours"
                loading={metricsLoading}
              />
              <StatCard
                label="Monthly Active (MAU)"
                value={metrics?.mau ?? 0}
                hint="Last 30 days"
                loading={metricsLoading}
              />
              <StatCard
                label="Blocked Devices"
                value={metrics?.blockedUsers ?? 0}
                loading={metricsLoading}
              />
            </section>

            <section
              className="grid grid-cols-1 md:grid-cols-2"
              style={{ gap: theme.spacing.sm }}
            >
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
          </>
        )}

        {activeTab === 'updates' && (
          <div className="flex flex-col" style={{ gap: theme.spacing.md }}>
            <UpdatesPanel />
            <AnnouncementsPanel />
          </div>
        )}

        {activeTab === 'dictionary' && <SongDictionaryPanel />}
      </div>
    </main>
  );
}
