export const dynamic = 'force-dynamic';

import {
  Music,
  Tags,
  KeyRound,
  WifiOff,
  Share2,
  RefreshCw,
  Download,
  Smartphone,
  Info,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { theme } from '@/lib/theme';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PhoneMockup } from '@/components/public/PhoneMockup';
import { FaqAccordion } from '@/components/public/FaqAccordion';

async function getPublicData() {
  try {
    const now = new Date();
    const [updates, announcements] = await Promise.all([
      prisma.appUpdate.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          version: true,
          minSupportedVersion: true,
          releaseNotes: true,
          storeUrl: true,
          createdAt: true,
        },
      }),
      prisma.announcement.findMany({
        where: {
          isActive: true,
          startsAt: { lte: now },
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          createdAt: true,
        },
      }),
    ]);
    return { updates, announcements };
  } catch {
    return { updates: [], announcements: [] };
  }
}

const FEATURES = [
  {
    icon: Music,
    title: 'Song Library',
    description:
      'Discover and organize Ethiopian Protestant worship songs in one place.',
  },
  {
    icon: Tags,
    title: 'Kignit Organization',
    description:
      'Explore songs organized by Kignit and musical styles.',
  },
  {
    icon: KeyRound,
    title: 'Chord Transposition',
    description:
      'Adjust song chords to suit different musical keys.',
  },
  {
    icon: WifiOff,
    title: 'Offline Access',
    description:
      'Access previously synchronized songs without an internet connection.',
  },
  {
    icon: Share2,
    title: 'Song Sharing',
    description:
      'Share songs and setlists with other musicians.',
  },
  {
    icon: RefreshCw,
    title: 'Continuous Updates',
    description:
      'Receive new songs, improvements, and application updates.',
  },
];

export default async function HomePage() {
  const { updates, announcements } = await getPublicData();
  const [latestRelease, ...previousReleases] = updates;
  const hasValidDownload = Boolean(
    latestRelease?.storeUrl && latestRelease.storeUrl.startsWith('http')
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: theme.colors.background.primary,
        color: theme.colors.text.primary,
      }}
    >
      <PublicNavbar />

      <main className="flex-1">
        {/* ── HERO SECTION ── */}
        <section
          id="home"
          className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-20 lg:py-24"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.subtle}`,
                  color: theme.colors.text.secondary,
                }}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>
                  {latestRelease
                    ? `Android v${latestRelease.version} available`
                    : 'Built for Android'}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08]">
                Your Worship Songs. Organized.
              </h1>

              <p
                className="text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed"
                style={{ color: theme.colors.text.secondary }}
              >
                Discover, organize, and access Ethiopian Protestant mezmur in
                one beautifully designed application.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href="#download"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg text-sm font-semibold transition-transform duration-150 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: theme.colors.accent.primary,
                    color: theme.colors.accent.foreground,
                  }}
                >
                  <Download className="h-4 w-4" />
                  <span>Download for Android</span>
                </a>

                <a
                  href="#features"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border.subtle}`,
                  }}
                >
                  <span>Explore Features</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <PhoneMockup variant="dashboard" priority />
            </div>
          </div>
        </section>

        {/* ── FEATURES SECTION ── */}
        <section
          id="features"
          className="py-20"
          style={{
            borderTop: `1px solid ${theme.colors.border.subtle}`,
          }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
            <div className="max-w-2xl space-y-3">
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: theme.colors.accent.primary }}
              >
                Features
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Designed for worship teams and musicians.
              </h2>
              <p
                className="text-sm sm:text-base leading-relaxed"
                style={{ color: theme.colors.text.secondary }}
              >
                Every tool you need to prepare setlists, transpose chords, and
                keep your mezmur library synchronized.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="rounded-xl p-6 space-y-3"
                    style={{
                      backgroundColor: theme.colors.background.secondary,
                      border: `1px solid ${theme.colors.border.subtle}`,
                    }}
                  >
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.background.subtle }}
                    >
                      <Icon
                        className="h-4 w-4"
                        style={{ color: theme.colors.accent.primary }}
                      />
                    </div>
                    <h3 className="text-base font-semibold">{f.title}</h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {f.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── APP SHOWCASE SECTION ── */}
        <section
          className="py-20"
          style={{ borderTop: `1px solid ${theme.colors.border.subtle}` }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
            <div className="max-w-2xl space-y-3">
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: theme.colors.accent.primary }}
              >
                Interface
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Clean, distraction-free on stage.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  variant: 'dashboard' as const,
                  title: 'Worship Dashboard',
                  desc: 'Jump straight into your active setlist or recently played songs.',
                },
                {
                  variant: 'songs' as const,
                  title: 'Song Library & Kignit',
                  desc: 'Filter instantly by Kignit scale, rhythm style, or lyrics.',
                },
                {
                  variant: 'setlists' as const,
                  title: 'Setlists & Service Flow',
                  desc: 'Organize, sort, and import setlists for your worship services.',
                },
              ].map((item) => (
                <div key={item.title} className="space-y-4 text-center">
                  <PhoneMockup variant={item.variant} />
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p
                      className="text-xs max-w-xs mx-auto"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DOWNLOAD CENTER ── */}
        <section
          id="download"
          className="py-20"
          style={{ borderTop: `1px solid ${theme.colors.border.subtle}` }}
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div
              className="rounded-2xl p-6 sm:p-10 space-y-8"
              style={{
                backgroundColor: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.subtle}`,
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">Selah Kignit</span>
                    {latestRelease && (
                      <span
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: theme.colors.background.subtle,
                          color: theme.colors.accent.primary,
                        }}
                      >
                        Latest Version
                      </span>
                    )}
                  </div>
                  <p
                    className="text-sm"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    Official Android APK release
                  </p>
                </div>

                {hasValidDownload && latestRelease?.storeUrl ? (
                  <a
                    href={latestRelease.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg text-sm font-semibold transition-transform duration-150 hover:-translate-y-0.5"
                    style={{
                      backgroundColor: theme.colors.accent.primary,
                      color: theme.colors.accent.foreground,
                    }}
                  >
                    <Download className="h-4 w-4" />
                    <span>Download for Android (v{latestRelease.version})</span>
                  </a>
                ) : (
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor: theme.colors.background.subtle,
                      color: theme.colors.text.secondary,
                    }}
                  >
                    Download is not currently available. Check back soon.
                  </div>
                )}
              </div>

              {latestRelease && (
                <div
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6"
                  style={{
                    borderTop: `1px solid ${theme.colors.border.subtle}`,
                  }}
                >
                  <div>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.text.muted }}
                    >
                      Version
                    </p>
                    <p className="text-sm font-semibold tabular-nums mt-0.5">
                      v{latestRelease.version}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.text.muted }}
                    >
                      Release Date
                    </p>
                    <p className="text-sm font-semibold tabular-nums mt-0.5">
                      {new Date(latestRelease.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.text.muted }}
                    >
                      Platform
                    </p>
                    <p className="text-sm font-semibold mt-0.5">Android</p>
                  </div>
                </div>
              )}

              {latestRelease?.releaseNotes && (
                <div
                  className="rounded-xl p-4 space-y-1.5"
                  style={{ backgroundColor: theme.colors.background.subtle }}
                >
                  <p className="text-xs font-semibold">Release Notes</p>
                  <p
                    className="text-sm whitespace-pre-line leading-relaxed"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {latestRelease.releaseNotes}
                  </p>
                </div>
              )}

              <div
                className="flex items-start gap-3 text-xs leading-relaxed"
                style={{ color: theme.colors.text.muted }}
              >
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  Installation note: After downloading the APK, open it from
                  your browser or file manager. Android may ask you to allow
                  installing apps from that source.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT'S NEW — RELEASE HISTORY ── */}
        <section
          id="whats-new"
          className="py-20"
          style={{ borderTop: `1px solid ${theme.colors.border.subtle}` }}
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
            <div className="space-y-2">
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: theme.colors.accent.primary }}
              >
                What&apos;s New
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Release History
              </h2>
            </div>

            {updates.length === 0 ? (
              <div
                className="rounded-xl p-8 text-center text-sm"
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.subtle}`,
                  color: theme.colors.text.muted,
                }}
              >
                No public releases have been published yet.
              </div>
            ) : (
              <div className="space-y-4">
                {updates.map((rel, idx) => (
                  <div
                    key={rel.id}
                    className="rounded-xl p-6 space-y-3"
                    style={{
                      backgroundColor: theme.colors.background.secondary,
                      border: `1px solid ${theme.colors.border.subtle}`,
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-semibold tabular-nums">
                          Version {rel.version}
                        </span>
                        {idx === 0 && (
                          <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: theme.colors.background.subtle,
                              color: theme.colors.accent.primary,
                            }}
                          >
                            Latest Release
                          </span>
                        )}
                      </div>
                      <span
                        className="text-xs tabular-nums"
                        style={{ color: theme.colors.text.muted }}
                      >
                        {new Date(rel.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p
                      className="text-sm whitespace-pre-line leading-relaxed"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {rel.releaseNotes}
                    </p>

                    {rel.storeUrl && rel.storeUrl.startsWith('http') && (
                      <div className="pt-1">
                        <a
                          href={rel.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold"
                          style={{ color: theme.colors.accent.primary }}
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download APK v{rel.version}</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {previousReleases.length === 0 && updates.length > 0 && null}
          </div>
        </section>

        {/* ── ANNOUNCEMENTS & NEWS ── */}
        {announcements.length > 0 && (
          <section
            className="py-16"
            style={{ borderTop: `1px solid ${theme.colors.border.subtle}` }}
          >
            <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
              <h2 className="text-xl font-semibold tracking-tight">
                Announcements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {announcements.map((a) => {
                  const Icon =
                    a.type === 'warning'
                      ? AlertTriangle
                      : a.type === 'release'
                      ? Sparkles
                      : Info;
                  return (
                    <div
                      key={a.id}
                      className="rounded-xl p-5 space-y-2"
                      style={{
                        backgroundColor: theme.colors.background.secondary,
                        border: `1px solid ${theme.colors.border.subtle}`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Icon
                            className="h-4 w-4"
                            style={{ color: theme.colors.accent.primary }}
                          />
                          <h3 className="text-sm font-semibold">{a.title}</h3>
                        </div>
                        <span
                          className="text-[11px] tabular-nums"
                          style={{ color: theme.colors.text.muted }}
                        >
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: theme.colors.text.secondary }}
                      >
                        {a.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── ABOUT SELAH KIGNIT ── */}
        <section
          id="about"
          className="py-20"
          style={{ borderTop: `1px solid ${theme.colors.border.subtle}` }}
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-4">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: theme.colors.accent.primary }}
            >
              About
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Built for Ethiopian Protestant worship music.
            </h2>
            <p
              className="text-base leading-relaxed"
              style={{ color: theme.colors.text.secondary }}
            >
              Selah Kignit is built to make Ethiopian Protestant worship music
              more organized, accessible, and easier to share. Our goal is to
              provide musicians, worship teams, and believers with a dedicated
              space to discover and preserve the songs that accompany their
              worship.
            </p>
          </div>
        </section>

        {/* ── FAQ SECTION ── */}
        <section
          className="py-20"
          style={{ borderTop: `1px solid ${theme.colors.border.subtle}` }}
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
            <div className="space-y-2">
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: theme.colors.accent.primary }}
              >
                FAQ
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>
            <FaqAccordion />
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer
        className="py-12"
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderTop: `1px solid ${theme.colors.border.subtle}`,
        }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1 space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="h-7 w-7 rounded-md flex items-center justify-center font-bold text-xs"
                style={{
                  backgroundColor: theme.colors.accent.primary,
                  color: theme.colors.accent.foreground,
                }}
              >
                SK
              </div>
              <span className="font-semibold">Selah Kignit</span>
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: theme.colors.text.muted }}
            >
              Ethiopian Protestant worship songbook for Android.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider">
              Navigation
            </p>
            <ul
              className="space-y-1.5 text-xs"
              style={{ color: theme.colors.text.secondary }}
            >
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#whats-new">What&apos;s New</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#download">Download</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider">
              Support
            </p>
            <ul
              className="space-y-1.5 text-xs"
              style={{ color: theme.colors.text.secondary }}
            >
              <li><a href="#download">Install Guide</a></li>
              <li><a href="#whats-new">Release Notes</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider">
              Admin
            </p>
            <ul
              className="space-y-1.5 text-xs"
              style={{ color: theme.colors.text.secondary }}
            >
              <li><a href="/login">Admin Console</a></li>
            </ul>
          </div>
        </div>

        <div
          className="mx-auto max-w-6xl px-4 sm:px-6 mt-10 pt-6 text-xs flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{
            borderTop: `1px solid ${theme.colors.border.subtle}`,
            color: theme.colors.text.muted,
          }}
        >
          <span>© {new Date().getFullYear()} Selah Kignit. All rights reserved.</span>
          <span>Built for Android</span>
        </div>
      </footer>
    </div>
  );
}
