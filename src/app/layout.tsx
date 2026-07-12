import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { RecaptchaProvider } from '@/components/layout/RecaptchaProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SmartQueue',
  description: 'Skip the queue. Join virtually, track your position live, and get notified when it\'s your turn.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RecaptchaProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </RecaptchaProvider>
      </body>
    </html>
  );
}