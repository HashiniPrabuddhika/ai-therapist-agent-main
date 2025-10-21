"use client"
import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  MessageCircle,
  AudioWaveform,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { SignInButton } from "@/components/auth/sign-in-button";
import { useSession } from "@/lib/contexts/session-context";

export function Header() {
  const { isAuthenticated, logout, user } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/features", label: "Features" },
    { href: "/about", label: "About Nova" },
  ];

  return (
    <div className="w-full fixed top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="absolute inset-0 border-b border-primary/10" />
      
      <header className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo - LEFT */}
          <Link
            href="/"
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            {/* <AudioWaveform className="h-6 w-6 text-primary animate-pulse-gentle" /> */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Nova </span>
              <span className="text-xs text-muted-foreground">
                Calm, peaceful, perfect for mental wellness
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - CENTER */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <Button
                  asChild
                  className="hidden md:inline-flex gap-2 bg-primary/90 hover:bg-primary text-primary-foreground"
                >
                  <Link href="/dashboard">
                    <MessageCircle className="w-4 h-4" />
                    Start Chat
                  </Link>
                </Button>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </>
            ) : (
              <SignInButton />
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Button
                asChild
                className="w-full gap-2 bg-primary/90 hover:bg-primary text-primary-foreground"
              >
                <Link href="/dashboard">
                  <MessageCircle className="w-4 h-4" />
                  Start Chat
                </Link>
              </Button>
            )}
          </div>
        )}
      </header>
    </div>
  );
}