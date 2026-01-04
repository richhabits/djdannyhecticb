import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { GlobalSearch } from "./GlobalSearch";

export function GlobalNav() {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-foreground h-14 flex items-center px-4 md:px-6 justify-between">
      <div className="flex items-center gap-4">
        {!mobileMenuOpen && (
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden">
            <Menu className="w-6 h-6" />
          </button>
        )}
        <Link href="/" className="text-xl font-bold tracking-tighter uppercase flex items-center gap-2 hover:text-accent transition-colors">
          <div className="w-4 h-4 bg-accent animate-pulse" />
          Hectic Radio
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-4 text-sm font-bold uppercase tracking-widest">
        <Link href="/" className={location === "/" ? "text-accent" : "hover:text-accent"}>Home</Link>
        <Link href="/bio" className={location === "/bio" ? "text-accent" : "hover:text-accent"}>Profile</Link>
        <Link href="/mixes" className={location === "/mixes" ? "text-accent" : "hover:text-accent"}>Archive</Link>
        <Link href="/shop" className={location === "/shop" ? "text-accent" : "hover:text-accent"}>Supply</Link>
        <Link href="/live-studio" className={location === "/live-studio" ? "text-accent" : "hover:text-accent"}>Live</Link>
        <Link href="/support" className={location === "/support" ? "text-accent" : "hover:text-accent"}>Support</Link>
        <GlobalSearch />
        {isAuthenticated ? (
          <Link href="/dashboard" className="bg-foreground text-background px-3 py-1 hover:bg-accent hover:text-foreground">Dashboard</Link>
        ) : (
          <a href={getLoginUrl()} className="bg-foreground text-background px-3 py-1 hover:bg-accent hover:text-foreground">Login</a>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-background z-[60] flex flex-col p-6 animate-in slide-in-from-left duration-200">
          <div className="flex justify-between items-center mb-12">
            <span className="text-xl font-bold uppercase">Menu</span>
            <button onClick={() => setMobileMenuOpen(false)}><X className="w-8 h-8" /></button>
          </div>
          <div className="flex flex-col gap-6 text-2xl font-bold uppercase tracking-tighter">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/bio" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
            <Link href="/mixes" onClick={() => setMobileMenuOpen(false)}>Archive</Link>
            <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>Supply</Link>
            <Link href="/live-studio" onClick={() => setMobileMenuOpen(false)}>Live Channel</Link>
            <Link href="/support" onClick={() => setMobileMenuOpen(false)}>Support</Link>
            {!isAuthenticated && <a href={getLoginUrl()}>Login / Join</a>}
          </div>
        </div>
      )}
    </nav>
  );
}

