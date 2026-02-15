import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'e\'Bosch - Community Platform',
  description: 'E\'Bosch is a registered Non-Profit Organisation dedicated to community heritage, leadership, and social development.',
  keywords: 'community, heritage, leadership, events, marketplace, membership',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}