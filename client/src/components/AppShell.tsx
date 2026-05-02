/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import React, { ReactNode } from 'react';
import { OfflineIndicator, OnlineIndicator } from './OfflineIndicator';
import { BottomNav } from './mobile/BottomNav';
import clsx from 'clsx';
import './AppShell.css';

interface AppShellProps {
  children: ReactNode;
  showBottomNav?: boolean;
  showHeader?: boolean;
  header?: ReactNode;
  fullHeight?: boolean;
}

export function AppShell({
  children,
  showBottomNav = true,
  showHeader = true,
  header,
  fullHeight = false,
}: AppShellProps) {
  return (
    <div className={clsx('app-shell', fullHeight && 'app-shell--full-height')}>
      {/* Status indicators */}
      <OfflineIndicator />
      <OnlineIndicator />

      {/* Header */}
      {showHeader && header && <header className="app-shell__header">{header}</header>}

      {/* Main content */}
      <main className="app-shell__main">
        <div className="app-shell__content">{children}</div>
      </main>

      {/* Bottom navigation for mobile */}
      {showBottomNav && (
        <>
          <div className="app-shell__bottom-nav-spacer" />
          <BottomNav />
        </>
      )}
    </div>
  );
}

/**
 * Safe area wrapper for notched devices
 * Accounts for status bar, notches, and home indicators
 */
export function SafeAreaView({ children }: { children: ReactNode }) {
  return (
    <div className="safe-area-view">
      <style>{`
        :root {
          --safe-top: env(safe-area-inset-top);
          --safe-right: env(safe-area-inset-right);
          --safe-bottom: env(safe-area-inset-bottom);
          --safe-left: env(safe-area-inset-left);
        }
      `}</style>
      {children}
    </div>
  );
}

/**
 * App shell with safe areas and responsive layout
 */
export function ResponsiveAppShell({
  children,
  showBottomNav = true,
}: {
  children: ReactNode;
  showBottomNav?: boolean;
}) {
  return (
    <SafeAreaView>
      <AppShell showBottomNav={showBottomNav}>{children}</AppShell>
    </SafeAreaView>
  );
}
