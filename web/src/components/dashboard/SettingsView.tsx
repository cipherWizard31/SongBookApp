'use client';

import { useState } from 'react';
import { theme } from '@/lib/theme';

type SettingsTab =
  | 'general'
  | 'account'
  | 'app'
  | 'content'
  | 'system';

const SECTIONS: { id: SettingsTab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'account', label: 'Admin Account' },
  { id: 'app', label: 'App Configuration' },
  { id: 'content', label: 'Content Preferences' },
  { id: 'system', label: 'System' },
];

export function SettingsView() {
  const [active, setActive] = useState<SettingsTab>('general');

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Settings Sub-nav */}
      <div
        className="rounded-xl p-2 self-start space-y-1"
        style={{
          backgroundColor: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.subtle}`,
        }}
      >
        {SECTIONS.map((sec) => {
          const isSelected = active === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActive(sec.id)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor: isSelected
                  ? theme.colors.background.subtle
                  : 'transparent',
                color: isSelected
                  ? theme.colors.text.primary
                  : theme.colors.text.secondary,
              }}
            >
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* Settings Content */}
      <div
        className="md:col-span-3 rounded-xl p-6 space-y-4"
        style={{
          backgroundColor: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.subtle}`,
        }}
      >
        <h2
          className="text-base font-semibold"
          style={{ color: theme.colors.text.primary }}
        >
          {SECTIONS.find((s) => s.id === active)?.label} Settings
        </h2>
        <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
          {active === 'general' &&
            'Manage Selah Kignit console display name, timezone, and default landing view.'}
          {active === 'account' &&
            'Admin authentication is secured via HMAC-SHA256 HTTP-only session cookies.'}
          {active === 'app' &&
            'Mobile clients sync via /api/mobile/config and /api/mobile/dictionary using x-api-key.'}
          {active === 'content' &&
            'Configure default Kignit scales, rhythm styles, and JSON import validation rules.'}
          {active === 'system' &&
            'Database: SQLite (Prisma 6). Platform target: Android only.'}
        </p>
      </div>
    </div>
  );
}

