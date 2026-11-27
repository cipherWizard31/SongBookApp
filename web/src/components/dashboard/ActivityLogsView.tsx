'use client';

import { theme } from '@/lib/theme';
import { Music, Users, Download, Bell, Clock } from 'lucide-react';

const EVENTS = [
  { icon: Music, text: 'Global Song Dictionary synced to mobile clients', time: 'Today, 12:00' },
  { icon: Users, text: 'Device heartbeat received', time: 'Today, 11:48' },
  { icon: Download, text: 'App update check processed', time: 'Today, 11:30' },
  { icon: Bell, text: 'Admin console session started', time: 'Today, 09:15' },
  { icon: Clock, text: 'Dictionary version incremented', time: 'Yesterday, 22:04' },
];

export function ActivityLogsView() {
  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.subtle}`,
      }}
    >
      <div
        className="px-6 py-4"
        style={{ borderBottom: `1px solid ${theme.colors.border.subtle}` }}
      >
        <h2 className="text-sm font-semibold" style={{ color: theme.colors.text.primary }}>
          Activity Logs
        </h2>
        <p className="text-xs mt-0.5" style={{ color: theme.colors.text.muted }}>
          System events, dictionary syncs, and admin actions
        </p>
      </div>

      <div className="divide-y" style={{ borderColor: theme.colors.border.subtle }}>
        {EVENTS.map((event, i) => {
          const Icon = event.icon;
          return (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: theme.colors.background.subtle }}
              >
                <Icon className="h-4 w-4" style={{ color: theme.colors.text.secondary }} />
              </div>
              <span className="flex-1 text-sm" style={{ color: theme.colors.text.primary }}>
                {event.text}
              </span>
              <span className="text-xs tabular-nums shrink-0" style={{ color: theme.colors.text.muted }}>
                {event.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

