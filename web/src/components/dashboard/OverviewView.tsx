'use client';

import { useState } from 'react';
import {
  Music,
  Users,
  Smartphone,
  Activity,
  Plus,
  Library,
  UploadCloud,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { theme } from '@/lib/theme';
import { NavSectionId } from './Sidebar';

interface OverviewViewProps {
  totalSongs: number;
  totalUsers: number;
  dau: number;
  mau: number;
  loading: boolean;
  onNavigate: (section: NavSectionId) => void;
}

type DateRange = '7d' | '30d' | '90d' | 'all';

const SAMPLE_SERIES: Record<DateRange, number[]> = {
  '7d': [12, 18, 15, 22, 28, 31, 36],
  '30d': [8, 14, 19, 17, 24, 29, 36],
  '90d': [4, 9, 15, 21, 25, 30, 36],
  all: [2, 6, 12, 18, 24, 30, 36],
};

function MiniLineChart({
  data,
  color,
}: {
  data: number[];
  color: string;
}) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 320;
  const height = 110;
  const points = data
    .map((val, idx) => {
      const x = (idx / Math.max(data.length - 1, 1)) * width;
      const y = height - ((val - min) / range) * (height - 16) - 8;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-28 overflow-visible"
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function OverviewView({
  totalSongs,
  totalUsers,
  dau,
  mau,
  loading,
  onNavigate,
}: OverviewViewProps) {
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const stats = [
    {
      label: 'Total Songs',
      value: totalSongs,
      hint: 'Published in global dictionary',
      icon: Music,
    },
    {
      label: 'Total Registered Users',
      value: totalUsers,
      hint: 'Unique Android devices',
      icon: Users,
    },
    {
      label: 'Total App Installations',
      value: totalUsers,
      hint: 'Active & historical installs',
      icon: Smartphone,
    },
    {
      label: 'Active Users (DAU)',
      value: dau,
      hint: `${mau} monthly active (MAU)`,
      icon: Activity,
    },
  ];

  const quickActions: {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    target: NavSectionId;
  }[] = [
    {
      label: 'Add New Song',
      description: 'Create or import chord sheets',
      icon: Plus,
      target: 'songs',
    },
    {
      label: 'Manage Song Library',
      description: 'Edit, filter, or organize songs',
      icon: Library,
      target: 'songs',
    },
    {
      label: 'Publish App Update',
      description: 'Roll out a new Android APK',
      icon: UploadCloud,
      target: 'updates',
    },
    {
      label: 'View Users',
      description: 'Inspect registered devices',
      icon: Users,
      target: 'users',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ color: theme.colors.text.primary }}
          >
            Welcome back
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: theme.colors.text.secondary }}
          >
            Here&apos;s what&apos;s happening with Selah Kignit.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div
          className="inline-flex p-1 rounded-lg self-start"
          style={{
            backgroundColor: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.subtle}`,
          }}
        >
          {(
            [
              { id: '7d', label: '7d' },
              { id: '30d', label: '30d' },
              { id: '90d', label: '90d' },
              { id: 'all', label: 'All' },
            ] as { id: DateRange; label: string }[]
          ).map((r) => {
            const active = dateRange === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setDateRange(r.id)}
                className="px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors"
                style={{
                  backgroundColor: active
                    ? theme.colors.background.subtle
                    : 'transparent',
                  color: active
                    ? theme.colors.text.primary
                    : theme.colors.text.secondary,
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl p-5 transition-transform duration-150 hover:-translate-y-0.5"
              style={{
                backgroundColor: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.subtle}`,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-medium"
                  style={{ color: theme.colors.text.secondary }}
                >
                  {stat.label}
                </span>
                <Icon
                  className="h-4 w-4"
                />
              </div>

              {loading ? (
                <div
                  className="h-8 w-20 animate-pulse rounded-md mt-3"
                  style={{ backgroundColor: theme.colors.background.subtle }}
                />
              ) : (
                <p
                  className="text-2xl font-semibold tracking-tight tabular-nums mt-2"
                  style={{ color: theme.colors.text.primary }}
                >
                  {stat.value}
                </p>
              )}

              <p
                className="text-xs mt-1.5"
                style={{ color: theme.colors.text.muted }}
              >
                {stat.hint}
              </p>
            </div>
          );
        })}
      </section>

      {/* Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          {
            title: 'User Growth',
            subtitle: 'Sample trend (connects to historical snapshots)',
            data: SAMPLE_SERIES[dateRange],
          },
          {
            title: 'App Installations',
            subtitle: 'Sample trend',
            data: SAMPLE_SERIES[dateRange].map((v) => Math.round(v * 0.9)),
          },
          {
            title: 'Song Library Growth',
            subtitle: `Current total: ${totalSongs} songs`,
            data: SAMPLE_SERIES[dateRange].map((v) => Math.round(v * 1.1)),
          },
        ].map((chart) => (
          <div
            key={chart.title}
            className="rounded-xl p-5"
            style={{
              backgroundColor: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border.subtle}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: theme.colors.text.primary }}
                >
                  {chart.title}
                </h3>
                <p
                  className="text-[11px]"
                  style={{ color: theme.colors.text.muted }}
                >
                  {chart.subtitle}
                </p>
              </div>
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: theme.colors.background.subtle,
                  color: theme.colors.text.secondary,
                }}
              >
                {dateRange}
              </span>
            </div>
            <MiniLineChart
              data={chart.data}
              color={theme.colors.accent.primary}
            />
          </div>
        ))}
      </section>

      {/* Recent Activity + Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div
          className="lg:col-span-2 rounded-xl p-5"
          style={{
            backgroundColor: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.subtle}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-sm font-semibold"
              style={{ color: theme.colors.text.primary }}
            >
              Recent Activity
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('logs')}
              className="text-xs font-medium flex items-center gap-1 cursor-pointer"
              style={{ color: theme.colors.accent.primary }}
            >
              View logs <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Global Song Dictionary synced',
                time: 'Just now',
                icon: Music,
              },
              {
                title: 'Device heartbeat received',
                time: 'Today',
                icon: Smartphone,
              },
              {
                title: 'Admin console session active',
                time: 'Today',
                icon: Clock,
              },
            ].map((event) => {
              const Icon = event.icon;
              return (
                <div
                  key={event.title}
                  className="flex items-center justify-between py-2"
                  style={{
                    borderBottom: `1px solid ${theme.colors.border.subtle}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.background.subtle }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {event.title}
                    </span>
                  </div>
                  <span
                    className="text-xs tabular-nums"
                    style={{ color: theme.colors.text.muted }}
                  >
                    {event.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.subtle}`,
          }}
        >
          <h3
            className="text-sm font-semibold mb-4"
            style={{ color: theme.colors.text.primary }}
          >
            Quick Actions
          </h3>
          <div className="space-y-2.5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => onNavigate(action.target)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left cursor-pointer transition-colors"
                  style={{
                    backgroundColor: theme.colors.background.subtle,
                    border: `1px solid ${theme.colors.border.subtle}`,
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {action.label}
                    </p>
                    <p
                      className="text-[11px] truncate"
                      style={{ color: theme.colors.text.muted }}
                    >
                      {action.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

