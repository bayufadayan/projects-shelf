'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, Tag, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
            </Link>
            <p className="text-sm text-muted-foreground">Showcase and manage your work</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link href="/project-types">
                <Tag className="h-4 w-4" />
                Project Types
              </Link>
            </Button>            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link href="/project-platforms">
                <Monitor className="h-4 w-4" />
                Platforms
              </Link>
            </Button>            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle dark mode"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
