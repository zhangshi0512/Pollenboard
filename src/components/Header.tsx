"use client";

import {
  Paintbrush,
  PlusCircle,
  Globe,
  LogIn,
  LogOut,
  UserPlus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const pathname = usePathname();
  const { user, signOut, deleteAccount } = useAuth();

  return (
    <header className="py-4 px-6 shadow-md bg-card">
      <div className="container mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Paintbrush className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-semibold text-primary">
            PollenBoard
          </h1>
        </Link>

        <nav className="flex items-center gap-2">
          <Button
            variant={pathname === "/create" ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link href="/create" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create
            </Link>
          </Button>
          <Button
            variant={pathname === "/explore" ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link href="/explore" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Explore
            </Link>
          </Button>
          {!user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/signin" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign up
                </Link>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign out
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (
                    confirm(
                      "Delete account and all associated data? This cannot be undone."
                    )
                  ) {
                    deleteAccount();
                  }
                }}
                className="text-destructive hover:bg-destructive/10"
                title="Delete account"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
