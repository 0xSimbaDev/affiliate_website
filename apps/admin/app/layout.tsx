import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Admin Dashboard | Affiliate Platform',
  description: 'Manage your multi-niche affiliate platform',
}

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/sites', label: 'Sites' },
  { href: '/products', label: 'Products' },
  { href: '/articles', label: 'Articles' },
  { href: '/categories', label: 'Categories' },
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <div className="min-h-screen flex">
          {/* Sidebar */}
          <aside className="w-64 bg-card border-r border-border flex-shrink-0">
            <div className="p-6">
              <h1 className="text-xl font-bold text-foreground">Admin</h1>
              <p className="text-sm text-muted-foreground">Affiliate Platform</p>
            </div>
            <nav className="px-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
