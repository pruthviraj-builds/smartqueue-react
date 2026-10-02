'use client';

import { usePathname } from 'next/navigation';
import { ChatWidget } from '@/components/ChatWidget';

const ALLOWED_PATHS = ['/', '/dashboard'];

export function ChatWidgetGate() {
  const pathname = usePathname();
  if (!ALLOWED_PATHS.includes(pathname)) return null;
  return <ChatWidget />;
}
