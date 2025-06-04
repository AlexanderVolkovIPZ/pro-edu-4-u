import QueryClientProvider from '@/app/providers/query-client-provider';
import { ToastProvider } from '@/app/providers/toast-provider';
import LayoutContainer from '@/components/layout-container';
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import './globals.css';
import { AccountProvider } from './providers/account-provider';
import { SocketProvider } from './providers/socket-provider';

const I18nProvider = dynamic(() => import('./providers/i18n-provider'), { ssr: false });

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider>
      <html lang='ua'>
        <head>
          <title>Bidium</title>
          <link rel='icon' type='image/x-icon' href='./logo.ico' />
        </head>
        <body className={`${inter.className}`}>
          <SocketProvider>
            <AccountProvider>
              <ToastProvider>
                <I18nProvider>
                  <LayoutContainer>{children}</LayoutContainer>
                </I18nProvider>
              </ToastProvider>
            </AccountProvider>
          </SocketProvider>
        </body>
      </html>
    </QueryClientProvider>
  );
}
