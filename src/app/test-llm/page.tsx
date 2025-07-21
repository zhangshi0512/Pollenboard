"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateTextAction } from "@/app/actions";

export default function TestLLMPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);

      const result = await generateTextAction(formData);

      if (result.error) {
        setResponse(`Error: ${result.error}`);
      } else {
        setResponse(result.generatedText || "No response received");
      }
    } catch (error) {
      setResponse(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        Test Pollinations.ai LLM Service
      </h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="prompt" className="block mb-2">
            Enter your prompt:
          </label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Why is the sky blue?"
            className="w-full h-32"
          />
        </div>

        <Button type="submit" disabled={isLoading || !prompt}>
          {isLoading ? "Generating..." : "Generate Response"}
        </Button>
      </form>

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Response from Pollinations.ai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{response}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
