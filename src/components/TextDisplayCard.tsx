"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TextDisplayCardProps {
  text: string;
  prompt: string;
  onDelete: () => void;
}

export function TextDisplayCard({
  text,
  prompt,
  onDelete,
}: TextDisplayCardProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The generated text has been copied to your clipboard.",
    });
  };

  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Prompt: {prompt}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap text-base mb-4">{text}</div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-1"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-1 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
