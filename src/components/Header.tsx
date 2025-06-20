import { PaintBrush } from 'lucide-react';

export function Header() {
  return (
    <header className="py-4 px-6 shadow-md bg-card">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PaintBrush className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-semibold text-primary">PollenBoard</h1>
        </div>
        {/* Add navigation or user profile section here if needed */}
      </div>
    </header>
  );
}
