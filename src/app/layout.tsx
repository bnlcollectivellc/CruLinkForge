import type { Metadata } from 'next';
import './globals.css';
import ColorProvider from '@/components/ColorProvider';

export const metadata: Metadata = {
  title: 'CruLink: Forge - Instant Metal Fabrication Quotes',
  description: 'Configure custom metal parts and get instant quotes. Professional laser cutting, bending, welding, and finishing services.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ColorProvider>
          {children}
        </ColorProvider>
      </body>
    </html>
  );
}
