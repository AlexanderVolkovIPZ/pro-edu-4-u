import QueryClientProvider from '@/app/providers/query-client-provider';
import { ToastProvider } from '@/app/providers/toast-provider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AccountProvider } from './providers/account-provider';
import BrowserRouterProvider from './providers/browser-router-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PRO-EDU-4-U',
  description: 'PRO-EDU-4-U',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BrowserRouterProvider>
      <QueryClientProvider>
        <AccountProvider>
          <html lang='en'>
            <body className={`${inter.className}`}>
              <ToastProvider>{children}</ToastProvider>
            </body>
          </html>
        </AccountProvider>
      </QueryClientProvider>
    </BrowserRouterProvider>
  );
}
