"use client";

import { Paintbrush, PlusCircle, Globe } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();

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
            variant={pathname === "/" ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link href="/" className="flex items-center gap-2">
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
        </nav>
      </div>
    </header>
  );
}
