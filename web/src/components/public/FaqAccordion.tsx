'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { theme } from '@/lib/theme';

const FAQS = [
  {
    q: 'What is Selah Kignit?',
    a: 'Selah Kignit is an Android worship songbook built for Ethiopian Protestant mezmur, featuring lyrics, chords, Kignit scales, and setlist organization.',
  },
  {
    q: 'Is the application free?',
    a: 'Yes. Selah Kignit is completely free for musicians, worship teams, and believers.',
  },
  {
    q: 'How do I download the Android application?',
    a: 'Click "Download for Android" in the Download Center above to get the latest published APK directly.',
  },
  {
    q: 'How do I install an APK?',
    a: 'Open the downloaded .apk file from your browser or file manager. Android may ask you to allow installing apps from that source.',
  },
  {
    q: 'Can I access songs offline?',
    a: 'Yes. Once synced, your songs, chords, and setlists are stored locally on your device for offline use.',
  },
  {
    q: 'How do I receive new song updates?',
    a: 'Selah Kignit automatically checks for new published songs from the global song dictionary whenever you open the app.',
  },
  {
    q: 'How do I update the application?',
    a: 'The app checks for new releases on startup, or you can check manually from Profile → Check for Updates.',
  },
  {
    q: 'How can I report an incorrect song or chord?',
    a: 'Open Profile → Report Bug inside the app to send feedback or corrections.',
  },
  {
    q: 'How can I suggest a song?',
    a: 'You can add songs directly in your local library and share them as JSON, or reach out through the support channels below.',
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div
      className="rounded-xl divide-y"
      style={{
        backgroundColor: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.subtle}`,
      }}
    >
      {FAQS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={item.q}
            style={{ borderColor: theme.colors.border.subtle }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
            >
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.text.primary }}
              >
                {item.q}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-150 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                style={{ color: theme.colors.text.muted }}
              />
            </button>
            {isOpen && (
              <div
                className="px-5 pb-4 text-sm leading-relaxed"
                style={{ color: theme.colors.text.secondary }}
              >
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

