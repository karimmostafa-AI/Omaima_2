"use client"

import { ReactNode, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Package, 
  Users, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  Palette,
  FileText,
  Tag,
  Truck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuthStore } from "@/store/auth-store"
import { UserDropdown } from "@/components/layout/user-dropdown"

interface AdminLayoutProps {
  children: ReactNode
}

const navigation = [
  {
    title: "Overview",
    links: [
      { href: "/admin", icon: Home, label: "Dashboard" },
      { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    ]
  },
  {
    title: "Catalog",
    links: [
      { href: "/admin/products", icon: Package, label: "Products" },
      { href: "/admin/categories", icon: Tag, label: "Categories" },
      { href: "/admin/customizer", icon: Palette, label: "Customizer" },
    ]
  },
  {
    title: "Sales",
    links: [
      { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
      { href: "/admin/customers", icon: Users, label: "Customers" },
    ]
  },
  {
    title: "Operations",
    links: [
      { href: "/admin/fulfillment", icon: Truck, label: "Fulfillment" },
      { href: "/admin/content", icon: FileText, label: "Content" },
    ]
  },
  {
    title: "System",
    links: [
      { href: "/admin/settings", icon: Settings, label: "Settings" },
    ]
  }
]

function Sidebar() {
  const pathname = usePathname()
  
  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">O</span>
          </div>
          <div>
            <span className="font-serif text-xl font-semibold text-foreground">Omaima</span>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.links.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`
                        flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }
                      `}
                    >
                      <link.icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuthStore()

  // Redirect non-admin users
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this area.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <div className="bg-white h-full">
            <Sidebar />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumb or page title could go here */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Add search or other header items */}
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
              {user && <UserDropdown user={user} />}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
