import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ConvexClientProvider from './ConvexClientProvider'
import Header from './header'
import { Toaster } from '@/components/ui/toaster'
import { Footer } from './footer'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'File Drive',
  description:
    'Store, upload and manage files with your team using File Drive!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            <Header />
            {children}
            <Footer />
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
