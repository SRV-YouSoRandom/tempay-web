import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TemPay - The Future of Payments',
  description: 'Gasless, seamless stablecoin payments on Tempo.',
};

import { ThemeProvider } from '@/components/theme-provider';

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-background text-foreground antialiased min-h-screen flex flex-col")}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <main className="flex-1 flex flex-col max-w-md mx-auto w-full border-x border-border shadow-2xl bg-background">
                {children}
            </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
