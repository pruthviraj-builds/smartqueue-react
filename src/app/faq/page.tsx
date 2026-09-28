import { Metadata } from 'next';
import { FAQContent } from './FAQContent';

export const metadata: Metadata = {
  title: 'FAQ & Help Center | SmartQueue',
  description: 'Find answers to frequently asked questions about the SmartQueue virtual queue management system.',
};

export default function FAQPage() {
  return <FAQContent />;
}
