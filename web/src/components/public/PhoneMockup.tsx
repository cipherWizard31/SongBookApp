import Image from 'next/image';

type ScreenVariant = 'dashboard' | 'songs' | 'setlists';

interface PhoneMockupProps {
  variant?: ScreenVariant;
  priority?: boolean;
}

const SCREENS: Record<ScreenVariant, { src: string; alt: string }> = {
  dashboard: {
    src: '/screenshots/screen-dashboard.jpg',
    alt: 'Selah Kignit dashboard showing recent songs and setlist',
  },
  songs: {
    src: '/screenshots/screen-songs.jpg',
    alt: 'Selah Kignit song library filtered by Kignit scale',
  },
  setlists: {
    src: '/screenshots/screen-setlists.jpg',
    alt: 'Selah Kignit setlists screen',
  },
};

export function PhoneMockup({ variant = 'dashboard', priority = false }: PhoneMockupProps) {
  const screen = SCREENS[variant];

  return (
    <div
      className="relative mx-auto select-none"
      style={{
        width: 240,
        // Phone shell
        backgroundColor: '#0A0D13',
        borderRadius: 42,
        padding: '10px 8px',
        boxShadow:
          '0 0 0 1px rgba(255,255,255,0.10), 0 32px 72px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Top notch bar */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[14px] z-10 rounded-full"
        style={{ width: 72, height: 6, backgroundColor: '#0A0D13', boxShadow: '0 0 0 1px rgba(255,255,255,0.08)' }}
      />

      {/* Screen bezel */}
      <div
        className="overflow-hidden"
        style={{ borderRadius: 34, aspectRatio: '9/19.5', position: 'relative' }}
      >
        <Image
          src={screen.src}
          alt={screen.alt}
          fill
          sizes="240px"
          className="object-cover object-top"
          priority={priority}
        />
      </div>

      {/* Home indicator */}
      <div className="flex justify-center pt-2 pb-0.5">
        <div
          className="rounded-full"
          style={{ width: 64, height: 4, backgroundColor: 'rgba(255,255,255,0.18)' }}
        />
      </div>
    </div>
  );
}


