import './globals.css';
import type { Metadata } from 'next';
import { LayoutGroup } from './layout-client';

export const metadata: Metadata = {
  title: 'Brilliant Millennium',
  description: 'Infinite Possibilities. One Vision.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LayoutGroup>{children}</LayoutGroup>
      </body>
    </html>
  );
}
