import { Providers } from '../components/Providers';
import { Inter } from 'next/font/google';
import AuthProvider from '../components/AuthProvider';
import Header from '../components/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Hamza Shop',
  description: 'Your one-stop shop for everything',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
          <Header />
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
