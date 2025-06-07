'use client';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, CircleUserRound, ChevronDown, Settings2, MessageCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRiaPanel } from '@/contexts/ria-panel-context';

export default function AppHeader() {
  const { toggleRiaPanel } = useRiaPanel();

  return (
    <header
      className="bg-card shadow-sm sticky top-0 z-50 h-[var(--header-height,60px)] flex items-center px-4"
      style={{ '--header-height': '60px' } as React.CSSProperties}
    >
      <div className="flex items-center justify-between w-full">
        {/* Left Section - Logo and Context Switcher */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-2xl font-bold text-foreground">
            RELTIO
          </Link>

          {/* Moved Center Section - Context Switcher (Static for now) */}
          <div className="hidden md:flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center text-sm text-muted-foreground hover:text-primary px-2 py-1">
                    <Settings2 className="mr-1 h-3 w-3" />
                    Reltio Tenant
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem>Environment 1</DropdownMenuItem>
                  <DropdownMenuItem>Environment 2</DropdownMenuItem>
                  <DropdownMenuItem>Manage Environments</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>

        {/* Right Section - Search, Filter, User, RIA */}
        <div className="flex items-center space-x-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-10 h-9 w-48 lg:w-64" />
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <Filter className="h-5 w-5" />
            <span className="sr-only">Filter</span>
          </Button>
          <Button
            variant="default" // Changed from ghost for primary background
            size="sm" // Using sm for a more compact button with text
            // className="text-primary-foreground hover:bg-primary/90" // Removed redundant className
            onClick={toggleRiaPanel}
            title="Open RIA Assistant"
          >
            <MessageCircle className="mr-1.5 h-4 w-4" /> {/* Added margin for spacing */}
            RIA
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <CircleUserRound className="h-5 w-5" />
            <span className="sr-only">User Profile</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
