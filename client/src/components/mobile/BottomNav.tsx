/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useLocation } from 'wouter';
import { Home, Radio, ShoppingBag, MessageCircle, User } from 'lucide-react';
import clsx from 'clsx';
import './BottomNav.css';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

export function BottomNav() {
  const [location, navigate] = useLocation();

  // Get badge counts from context/store as needed
  const items: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home size={24} />,
      path: '/',
    },
    {
      id: 'live',
      label: 'Live',
      icon: <Radio size={24} />,
      path: '/live-studio',
    },
    {
      id: 'shop',
      label: 'Shop',
      icon: <ShoppingBag size={24} />,
      path: '/shop',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <MessageCircle size={24} />,
      path: '/messages',
      badge: 0,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User size={24} />,
      path: '/profile',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav__container">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={clsx(
              'bottom-nav__item',
              isActive(item.path) && 'bottom-nav__item--active'
            )}
            aria-label={item.label}
            aria-current={isActive(item.path) ? 'page' : undefined}
          >
            <div className="bottom-nav__icon">
              {item.icon}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bottom-nav__badge">{item.badge > 99 ? '99+' : item.badge}</span>
              )}
            </div>
            <span className="bottom-nav__label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
