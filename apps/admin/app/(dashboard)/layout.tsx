import { Sidebar, Header } from '@/components/layout'
import { SidebarProvider } from '@/components/layout/SidebarContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area - responsive margin */}
        <div className="lg:ml-60">
          {/* Header */}
          <Header />

          {/* Page content */}
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
