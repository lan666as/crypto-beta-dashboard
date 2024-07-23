import '../app/globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Crypto Risk Beta Dashboard',
  description: 'A dashboard to calculate and display the beta of various cryptocurrencies against BTC.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}