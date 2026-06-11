import { Metadata } from 'next';
import { FAQContent } from './FAQContent';

export const metadata: Metadata = {
  title: 'FAQ & Help Center | SmartQueue',
  description: 'Find answers to frequently asked questions about the virtual queue system at GH Raisoni College of Engineering & Management, Jalgaon.',
};

export default function FAQPage() {
  return <FAQContent />;
}
