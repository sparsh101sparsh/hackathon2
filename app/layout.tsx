import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/Toast';
import AuthModal from '@/components/auth/AuthModal';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'CodeForge AI — AI-Powered DSA & Competitive Programming',
  description:
    'Practice DSA, execute code in 5 languages, get AI code review and hints, compete in rated contests, and prepare for FAANG interviews — all in one platform.',
  keywords: ['DSA', 'competitive programming', 'coding practice', 'AI code review', 'interview prep', 'LeetCode alternative'],
  openGraph: {
    title: 'CodeForge AI',
    description: 'AI-powered DSA & competitive programming platform',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body
        className="bg-[#020817] text-slate-100 min-h-screen antialiased flex flex-col"
        style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
      >
        <AuthProvider>
          <ToastProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <AuthModal />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
