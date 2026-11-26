export const theme = {
  spacing: {
    xs: 'var(--space-xs)',
    sm: 'var(--space-sm)',
    md: 'var(--space-md)',
    lg: 'var(--space-lg)',
    xl: 'var(--space-xl)',
    '2xl': 'var(--space-2xl)',
  },
  colors: {
    background: {
      primary: 'var(--bg-primary)',
      secondary: 'var(--bg-secondary)',
      elevated: 'var(--bg-elevated)',
      subtle: 'var(--bg-subtle)',
    },
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      muted: 'var(--text-muted)',
    },
    border: {
      subtle: 'var(--border-subtle)',
      focus: 'var(--border-focus)',
    },
    accent: {
      primary: 'var(--accent-primary)',
      hover: 'var(--accent-primary-hover)',
      foreground: 'var(--accent-foreground)',
    },
    status: {
      success: 'var(--status-success)',
      warning: 'var(--status-warning)',
      danger: 'var(--status-danger)',
    },
  },
  radii: {
    outer: 'var(--radius-outer)',
    inner: 'var(--radius-inner)',
  },
  elevation: {
    ambient: 'var(--shadow-ambient)',
  },
} as const;

