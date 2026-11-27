'use client';

import { theme } from '@/lib/theme';

export interface DeviceUserRow {
  id: string;
  installId: string;
  platform: string;
  appVersion: string;
  isBlocked: boolean;
  lastSeenAt: string;
  createdAt: string;
}

interface UsersTableProps {
  users: DeviceUserRow[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onToggleBlock: (user: DeviceUserRow) => void;
  // kept for API compatibility
  platformFilter?: string;
  onPlatformChange?: (value: string) => void;
}

export function UsersTable({
  users,
  loading,
  search,
  onSearchChange,
  onToggleBlock,
}: UsersTableProps) {
  return (
    <section
      style={{
        backgroundColor: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.subtle}`,
        borderRadius: theme.radii.outer,
        padding: theme.spacing.md,
        boxShadow: theme.elevation.ambient,
      }}
    >
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.md }}
      >
        <h2
          className="text-base font-semibold"
          style={{ color: theme.colors.text.primary }}
        >
          Registered Devices
        </h2>

        <div className="flex flex-wrap items-center" style={{ gap: theme.spacing.xs }}>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search install ID or version..."
            className="min-h-[44px] text-sm outline-none"
            style={{
              backgroundColor: theme.colors.background.subtle,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.subtle}`,
              borderRadius: theme.radii.inner,
              padding: `0 ${theme.spacing.sm}`,
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col" style={{ gap: theme.spacing.xs }}>
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-12 w-full animate-pulse"
              style={{
                backgroundColor: theme.colors.background.subtle,
                borderRadius: theme.radii.inner,
              }}
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div
          className="text-center"
          style={{
            padding: theme.spacing.xl,
            color: theme.colors.text.muted,
          }}
        >
          <p className="text-sm font-medium">No matching devices found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr
                style={{
                  borderBottom: `1px solid ${theme.colors.border.subtle}`,
                  color: theme.colors.text.secondary,
                }}
              >
                <th className="py-3 pr-4 font-medium">Install ID</th>
                <th className="py-3 pr-4 font-medium">Platform</th>
                <th className="py-3 pr-4 font-medium">Version</th>
                <th className="py-3 pr-4 font-medium">Last Seen</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: `1px solid ${theme.colors.border.subtle}`,
                  }}
                >
                  <td
                    className="py-3 pr-4 font-mono text-xs"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {user.installId}
                  </td>
                  <td
                    className="py-3 pr-4 capitalize"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {user.platform}
                  </td>
                  <td
                    className="py-3 pr-4 font-mono text-xs"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {user.appVersion}
                  </td>
                  <td
                    className="py-3 pr-4 text-xs tabular-nums"
                    style={{ color: theme.colors.text.muted }}
                  >
                    {new Date(user.lastSeenAt).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="py-3 pr-4 text-xs font-semibold">
                    <span
                      style={{
                        color: user.isBlocked
                          ? theme.colors.status.danger
                          : theme.colors.status.success,
                      }}
                    >
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onToggleBlock(user)}
                      className="min-h-[44px] min-w-[88px] text-xs font-semibold cursor-pointer"
                      style={{
                        backgroundColor: theme.colors.background.subtle,
                        color: user.isBlocked
                          ? theme.colors.status.success
                          : theme.colors.status.danger,
                        border: `1px solid ${theme.colors.border.subtle}`,
                        borderRadius: theme.radii.inner,
                        padding: `0 ${theme.spacing.sm}`,
                      }}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

