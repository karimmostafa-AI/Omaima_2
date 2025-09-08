'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  MessageCircle,
  ShoppingCart,
  Package,
  Users,
  Tags,
  Palette,
  Ruler,
  Scale,
  Settings,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  Store,
  CreditCard,
  Truck,
  Bell,
  FileText,
  Crown,
  Zap,
  Share2,
  Mail,
  ShieldCheck,
} from 'lucide-react'

interface AdminSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface MenuItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  children?: MenuItem[]
  isActive?: boolean
  permissions?: string[]
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Messages',
    href: '/admin/messages',
    icon: MessageCircle,
    badge: 3,
  },
  {
    title: 'Order Management',
    icon: ShoppingCart,
    children: [
      {
        title: 'All Orders',
        href: '/admin/orders',
        icon: ShoppingCart,
        badge: 12,
      },
      {
        title: 'Pending',
        href: '/admin/orders?status=pending',
        icon: ShoppingCart,
        badge: 5,
      },
      {
        title: 'Processing',
        href: '/admin/orders?status=processing',
        icon: ShoppingCart,
        badge: 3,
      },
      {
        title: 'Shipped',
        href: '/admin/orders?status=shipped',
        icon: Truck,
        badge: 4,
      },
    ],
  },
  {
    title: 'Product Management',
    icon: Package,
    children: [
      {
        title: 'Categories',
        href: '/admin/categories',
        icon: Tags,
      },
      {
        title: 'Products',
        href: '/admin/products',
        icon: Package,
      },
      {
        title: 'Bulk Import',
        href: '/admin/products/bulk-import',
        icon: Package,
      },
    ],
  },
  {
    title: 'Product Variants',
    icon: Palette,
    children: [
      {
        title: 'Brands',
        href: '/admin/brands',
        icon: Store,
      },
      {
        title: 'Colors',
        href: '/admin/colors',
        icon: Palette,
      },
      {
        title: 'Sizes',
        href: '/admin/sizes',
        icon: Ruler,
      },
      {
        title: 'Units',
        href: '/admin/units',
        icon: Scale,
      },
    ],
  },
  {
    title: 'Customer Management',
    icon: Users,
    children: [
      {
        title: 'All Customers',
        href: '/admin/customers',
        icon: Users,
      },
      {
        title: 'Customer Groups',
        href: '/admin/customer-groups',
        icon: Users,
      },
    ],
  },
  {
    title: 'Marketing',
    icon: Zap,
    children: [
      {
        title: 'Coupons',
        href: '/admin/coupons',
        icon: CreditCard,
      },
      {
        title: 'Flash Sales',
        href: '/admin/flash-sales',
        icon: Zap,
      },
      {
        title: 'Banners',
        href: '/admin/banners',
        icon: FileText,
      },
    ],
  },
  {
    title: 'Third-Party Services',
    icon: Share2,
    children: [
      {
        title: 'Payment Gateways',
        href: '/admin/settings/payment',
        icon: CreditCard,
      },
      {
        title: 'Mail Configuration',
        href: '/admin/settings/mail',
        icon: Mail,
      },
      {
        title: 'SMS Gateways',
        href: '/admin/settings/sms',
        icon: MessageCircle,
      },
      {
        title: 'Pusher Setup',
        href: '/admin/settings/pusher',
        icon: Zap,
      },
      {
        title: 'Firebase Notifications',
        href: '/admin/settings/firebase',
        icon: Bell,
      },
      {
        title: 'Google ReCaptcha',
        href: '/admin/settings/recaptcha',
        icon: ShieldCheck,
      },
      {
        title: 'Social Authentication',
        href: '/admin/settings/social',
        icon: Users,
      },
    ],
  },
  {
    title: 'System Settings',
    icon: Settings,
    children: [
      {
        title: 'General Settings',
        href: '/admin/settings/general',
        icon: Settings,
      },
      {
        title: 'Delivery Charges',
        href: '/admin/settings/delivery',
        icon: Truck,
      },
      {
        title: 'Notifications',
        href: '/admin/settings/notifications',
        icon: Bell,
      },
    ],
  },
]

function MenuItem({ item, level = 0, open }: { item: MenuItem; level?: number; open: boolean }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  
  const isActive = pathname === item.href || (item.children && item.children.some(child => pathname === child.href))

  if (item.children) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-between',
              level > 0 && 'ml-4',
              !open && 'px-2'
            )}
          >
            <div className="flex items-center gap-2">
              <item.icon className="h-4 w-4" />
              {open && <span>{item.title}</span>}
            </div>
            {open && (
              <>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto mr-2">
                    {item.badge}
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </>
            )}
          </Button>
        </CollapsibleTrigger>
        {open && (
          <CollapsibleContent className="space-y-1">
            {item.children.map((child, index) => (
              <MenuItem key={index} item={child} level={level + 1} open={open} />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    )
  }

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn(
        'w-full justify-start',
        level > 0 && 'ml-4',
        !open && 'px-2'
      )}
      asChild
    >
      <Link href={item.href!}>
        <item.icon className="h-4 w-4" />
        {open && (
          <>
            <span className="ml-2">{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Link>
    </Button>
  )
}

export function AdminSidebar({ open, onOpenChange }: AdminSidebarProps) {
  return (
    <>
      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-full bg-card border-r border-border transition-transform duration-300 md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
          open ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
              <Store className="h-5 w-5" />
            </div>
            {open && (
              <span className="text-lg font-semibold">Omaima Admin</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <div key={index}>
                {index > 0 && index % 3 === 0 && open && (
                  <div className="px-3 py-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {item.title.includes('Management') ? 'Management' : 
                       item.title.includes('Settings') ? 'System' : 'Tools'}
                    </div>
                  </div>
                )}
                <MenuItem item={item} open={open} />
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        {open && (
          <div className="border-t border-border p-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
