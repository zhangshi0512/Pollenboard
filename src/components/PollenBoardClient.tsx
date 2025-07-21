"use client";

import { useState, useEffect } from "react";
import {
  PlusCircle,
  Image as ImageIcon,
  Music2,
  Wand,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { PinItemCard } from "@/components/PinItemCard";
import { ImageGenerationDialog } from "@/components/forms/ImageGenerationDialog";
import { ImageToImageDialog } from "@/components/forms/ImageToImageDialog";
import { SimpleAudioGenerationDialog } from "@/components/SimpleAudioGenerationDialog";
import { ImageDetailModal } from "@/components/ImageDetailModal";
import { TextGenerationDialog } from "@/components/forms/TextGenerationDialog";
import { TextDisplayCard } from "@/components/TextDisplayCard";
import type { PinData, ImageModelId, Voice, TextModelInfo } from "@/types";
import type {
  GenerateImageActionResult,
  GenerateAudioActionResult,
  GenerateImageFromImageActionResult,
  GenerateTextActionResult,
} from "@/app/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface PollenBoardClientProps {
  initialImageModels: ImageModelId[];
  initialTextModels: string[]; // Or a more structured type if available
  initialVoices: Voice[];
}

export function PollenBoardClient({
  initialImageModels,
  initialTextModels, // Now we'll use this for text generation
  initialVoices,
}: PollenBoardClientProps) {
  const { toast } = useToast();
  const [pins, setPins] = useState<PinData[]>([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isImageToImageModalOpen, setIsImageToImageModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [selectedPinForAudio, setSelectedPinForAudio] =
    useState<PinData | null>(null);
  const [selectedPinForImageToImage, setSelectedPinForImageToImage] =
    useState<PinData | null>(null);
  const [clientLoaded, setClientLoaded] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPinForDetail, setSelectedPinForDetail] =
    useState<PinData | null>(null);
  const [generatedTexts, setGeneratedTexts] = useState<
    { id: string; text: string; prompt: string }[]
  >([]);

  useEffect(() => {
    // Load pins from localStorage if available
    const storedPins = localStorage.getItem("pollenBoardPins");
    if (storedPins) {
      try {
        setPins(JSON.parse(storedPins));
      } catch (e) {
        console.error("Failed to parse stored pins:", e);
        localStorage.removeItem("pollenBoardPins"); // Clear corrupted data
      }
    }

    // Load generated texts from localStorage if available
    const storedTexts = localStorage.getItem("pollenBoardTexts");
    if (storedTexts) {
      try {
        setGeneratedTexts(JSON.parse(storedTexts));
      } catch (e) {
        console.error("Failed to parse stored texts:", e);
        localStorage.removeItem("pollenBoardTexts"); // Clear corrupted data
      }
    }

    setClientLoaded(true);
  }, []);

  useEffect(() => {
    // Save pins to localStorage whenever they change
    if (clientLoaded) {
      // Only save after initial load
      localStorage.setItem("pollenBoardPins", JSON.stringify(pins));
    }
  }, [pins, clientLoaded]);

  const handleImageGenerated = (result: GenerateImageActionResult) => {
    if (result.imageUrl) {
      const newPin: PinData = {
        id: Date.now().toString(), // Simple ID generation
        imageUrl: result.imageUrl,
        originalPrompt: result.originalPrompt,
        finalPrompt: result.finalPrompt,
        modelUsed: result.modelUsed,
        seed: result.seed,
        // width and height can be set from result if API provides them or after image loads
        createdAt: new Date().toISOString(),
      };
      setPins((prevPins) => [newPin, ...prevPins]); // Add new pin to the top
    }
  };

  const handleImageToImageGenerated = (
    result: GenerateImageFromImageActionResult
  ) => {
    if (result.imageUrl) {
      const newPin: PinData = {
        id: Date.now().toString(),
        imageUrl: result.imageUrl,
        originalPrompt: result.originalPrompt,
        finalPrompt: result.originalPrompt, // For image-to-image, original and final are the same
        modelUsed: "kontext", // Always using kontext for image-to-image
        createdAt: new Date().toISOString(),
      };
      setPins((prevPins) => [newPin, ...prevPins]); // Add new pin to the top
    }
  };

  const handleOpenImageToImageModal = (pin?: PinData) => {
    if (pin) {
      setSelectedPinForImageToImage(pin);
    } else {
      setSelectedPinForImageToImage(null);
    }
    setIsImageToImageModalOpen(true);
  };

  const handleAudioGenerated = (result: GenerateAudioActionResult) => {
    if (result.error) {
      toast({
        title: "Audio Generation Failed",
        description: `Failed to generate audio: ${result.error}`,
        variant: "destructive",
      });
      return;
    }

    if (result.audioDataUri && selectedPinForAudio) {
      // Update the pin with the proxied audio URL
      const proxiedUrl = `/api/proxy-audio?url=${encodeURIComponent(
        result.audioDataUri
      )}`;

      const updatedPins = pins.map((pin) =>
        pin.id === selectedPinForAudio.id
          ? {
              ...pin,
              audioUrl: proxiedUrl,
              audioPrompt: result.prompt,
            }
          : pin
      );
      setPins(updatedPins);
      setSelectedPinForAudio(null);
    }
  };

  const handleOpenAudioModal = (pin: PinData) => {
    // First set the modal to open
    setIsAudioModalOpen(true);

    // Then set the selected pin in the next tick to avoid render issues
    setTimeout(() => {
      // Make a copy of the pin to avoid reference issues
      setSelectedPinForAudio({ ...pin });
    }, 0);
  };

  const handleDeletePin = (pinId: string) => {
    setPins((prevPins) => prevPins.filter((pin) => pin.id !== pinId));
  };

  const handleImageClick = (pin: PinData) => {
    setSelectedPinForDetail(pin);
    setIsDetailModalOpen(true);
  };

  const handleDetailModalNavigate = (pin: PinData) => {
    setSelectedPinForDetail(pin);
  };

  const handleTextGenerated = (result: GenerateTextActionResult) => {
    if (result.generatedText) {
      const newText = {
        id: Date.now().toString(),
        text: result.generatedText,
        prompt: result.prompt,
      };
      setGeneratedTexts((prevTexts) => [newText, ...prevTexts]);

      // Save to localStorage
      localStorage.setItem(
        "pollenBoardTexts",
        JSON.stringify([newText, ...generatedTexts])
      );
    }
  };

  const handleDeleteText = (textId: string) => {
    setGeneratedTexts((prevTexts) => {
      const updatedTexts = prevTexts.filter((text) => text.id !== textId);
      localStorage.setItem("pollenBoardTexts", JSON.stringify(updatedTexts));
      return updatedTexts;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8 gap-4">
          <Button
            size="lg"
            onClick={() => setIsImageModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform hover:scale-105"
            aria-label="Generate new image"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Create Image
          </Button>
          <Button
            size="lg"
            onClick={() => setIsImageToImageModalOpen(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md transition-transform hover:scale-105"
            aria-label="Transform image with Kontext"
          >
            <Wand className="mr-2 h-5 w-5" /> Transform Image
          </Button>
          <Button
            size="lg"
            onClick={() => setIsTextModalOpen(true)}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md transition-transform hover:scale-105"
            aria-label="Generate text"
          >
            <MessageSquare className="mr-2 h-5 w-5" /> Generate Text
          </Button>
        </div>

        {clientLoaded && pins.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon
              size={64}
              className="mx-auto text-muted-foreground mb-4"
            />
            <h2 className="text-2xl font-headline text-foreground mb-2">
              Your PollenBoard is Empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Start by creating your first AI-generated image!
            </p>
            <Button
              size="lg"
              onClick={() => setIsImageModalOpen(true)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              aria-label="Get started by generating an image"
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Generate First Image
            </Button>
          </div>
        )}

        {!clientLoaded && (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-4">
                <Skeleton className="w-full h-64 rounded-lg" />
                <Skeleton className="w-3/4 h-4 mt-2 rounded" />
                <Skeleton className="w-1/2 h-4 mt-1 rounded" />
              </div>
            ))}
          </div>
        )}

        {clientLoaded && pins.length > 0 && (
          <div
            className="masonry-grid"
            style={{
              columnCount: 1, // Default for mobile
              columnGap: "1rem",
            }}
            // Using inline styles for dynamic column count based on breakpoints for simplicity
            // In a real app, this could be a more robust JS-based solution or Tailwind's responsive variants for columns if available
            ref={(el) => {
              if (el) {
                // Simple responsive column count
                const width = window.innerWidth;
                if (width >= 1280) el.style.columnCount = "5";
                else if (width >= 1024) el.style.columnCount = "4";
                else if (width >= 768) el.style.columnCount = "3";
                else if (width >= 640) el.style.columnCount = "2";
                else el.style.columnCount = "1";
              }
            }}
          >
            {pins.map((pin) => (
              <PinItemCard
                key={pin.id}
                pin={pin}
                onAddAudio={handleOpenAudioModal}
                onDeletePin={handleDeletePin}
                onImageClick={handleImageClick}
              />
            ))}
          </div>
        )}

        {clientLoaded && generatedTexts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-headline text-foreground mb-4">
              Generated Texts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedTexts.map((textItem) => (
                <TextDisplayCard
                  key={textItem.id}
                  text={textItem.text}
                  prompt={textItem.prompt}
                  onDelete={() => handleDeleteText(textItem.id)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <ImageGenerationDialog
        isOpen={isImageModalOpen}
        onOpenChange={setIsImageModalOpen}
        onImageGenerated={handleImageGenerated}
        imageModels={initialImageModels}
      />
      <SimpleAudioGenerationDialog
        isOpen={isAudioModalOpen && selectedPinForAudio !== null}
        onOpenChange={(isOpen) => {
          setIsAudioModalOpen(isOpen);
          if (!isOpen) {
            // Use setTimeout to avoid state updates during render
            setTimeout(() => {
              setSelectedPinForAudio(null);
            }, 0);
          }
        }}
        onAudioGenerated={handleAudioGenerated}
        initialPrompt={selectedPinForAudio?.finalPrompt || ""}
      />

      <ImageDetailModal
        isOpen={isDetailModalOpen}
        onOpenChange={(isOpen) => {
          setIsDetailModalOpen(isOpen);
          if (!isOpen) setSelectedPinForDetail(null);
        }}
        pin={selectedPinForDetail}
        pins={pins}
        onNavigate={handleDetailModalNavigate}
        onAddAudio={handleOpenAudioModal}
        onTransformImage={handleOpenImageToImageModal}
      />

      <ImageToImageDialog
        isOpen={isImageToImageModalOpen}
        onOpenChange={setIsImageToImageModalOpen}
        onImageGenerated={handleImageToImageGenerated}
        initialImageUrl={selectedPinForImageToImage?.imageUrl}
      />

      <TextGenerationDialog
        isOpen={isTextModalOpen}
        onOpenChange={setIsTextModalOpen}
        onTextGenerated={handleTextGenerated}
      />

      <footer className="text-center py-6 border-t text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} PollenBoard. Powered by
          Pollinations.AI & Firebase Studio.
        </p>
      </footer>
    </div>
  );
}
