"use client";

import { useAuth } from "@/hooks/use-auth";
import type { ImageModelId, Voice } from "@/types";
import { PollenBoardClient } from "@/components/PollenBoardClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CreatePageClientProps {
  initialImageModels: ImageModelId[];
  initialTextModels: string[];
  initialVoices: Voice[];
}

export function CreatePageClient({
  initialImageModels,
  initialTextModels,
  initialVoices,
}: CreatePageClientProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sign in required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in or create an account to access your personal create
              board.
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/signup">Create account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PollenBoardClient
      initialImageModels={initialImageModels}
      initialTextModels={initialTextModels}
      initialVoices={initialVoices}
    />
  );
}
