/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * MobileBottomNav Component
 * Mobile-first bottom navigation for PWA
 * Visible only on mobile (hidden on tablet+)
 */

import { useLocation } from 'wouter';
import { Home, Music, ShoppingBag, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

export function MobileBottomNav() {
  const [location] = useLocation();

  const navigationItems: NavItem[] = [
    {
      icon: <Home className="w-5 h-5" />,
      label: 'Home',
      href: '/',
    },
    {
      icon: <Music className="w-5 h-5" />,
      label: 'Stream',
      href: '/#/live-studio',
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      label: 'Shop',
      href: '/#/shop',
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: 'Alerts',
      href: '/#/alerts',
    },
    {
      icon: <Menu className="w-5 h-5" />,
      label: 'Menu',
      href: '/#/menu',
    },
  ];

  const isActive = (href: string) => {
    const currentPath = location.split('#')[1] || '/';
    const navPath = href.split('#')[1] || '/';
    return currentPath === navPath || (href === '/' && location === '/');
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0',
        'border-t border-border-primary bg-dark-bg',
        'z-40',
        'hidden max-md:flex', // Hidden on md+ (tablet and up)
        'safe-area-bottom'
      )}
      role="navigation"
      aria-label="Mobile Navigation"
    >
      <div className="flex justify-around items-center w-full h-16 px-2">
        {navigationItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-16',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-red rounded-lg',
              'min-h-[44px]', // Minimum tap target size
              isActive(item.href)
                ? 'text-accent-red'
                : 'text-text-secondary hover:text-text-primary'
            )}
            aria-label={item.label}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            <div className="flex items-center justify-center">{item.icon}</div>
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
