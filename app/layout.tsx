import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ZOPAIR AI Tools',
  description: 'Focused AI tools for developers and AI agents.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body style={{ fontFamily: 'system-ui', margin: 0 }}>{children}</body></html>;
}
