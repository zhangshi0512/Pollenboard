'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Image as ImageIcon, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { PinItemCard } from '@/components/PinItemCard';
import { ImageGenerationDialog } from '@/components/forms/ImageGenerationDialog';
import { AudioGenerationDialog } from '@/components/forms/AudioGenerationDialog';
import type { PinData, ImageModelId, Voice, TextModelInfo } from '@/types';
import type { GenerateImageActionResult, GenerateAudioActionResult } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';

interface PollenBoardClientProps {
  initialImageModels: ImageModelId[];
  initialTextModels: string[]; // Or a more structured type if available
  initialVoices: Voice[];
}

export function PollenBoardClient({
  initialImageModels,
  // initialTextModels, // Not directly used for now, voices are more important
  initialVoices,
}: PollenBoardClientProps) {
  const [pins, setPins] = useState<PinData[]>([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [selectedPinForAudio, setSelectedPinForAudio] = useState<PinData | null>(null);
  const [clientLoaded, setClientLoaded] = useState(false);

  useEffect(() => {
    // Load pins from localStorage if available
    const storedPins = localStorage.getItem('pollenBoardPins');
    if (storedPins) {
      try {
        setPins(JSON.parse(storedPins));
      } catch (e) {
        console.error("Failed to parse stored pins:", e);
        localStorage.removeItem('pollenBoardPins'); // Clear corrupted data
      }
    }
    setClientLoaded(true);
  }, []);

  useEffect(() => {
    // Save pins to localStorage whenever they change
    if (clientLoaded) { // Only save after initial load
        localStorage.setItem('pollenBoardPins', JSON.stringify(pins));
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
      setPins(prevPins => [newPin, ...prevPins]); // Add new pin to the top
    }
  };

  const handleAudioGenerated = (result: GenerateAudioActionResult) => {
    if (result.audioDataUri && selectedPinForAudio) {
      setPins(prevPins =>
        prevPins.map(pin =>
          pin.id === selectedPinForAudio.id
            ? { ...pin, audioUrl: result.audioDataUri, audioPrompt: result.prompt }
            : pin
        )
      );
      setSelectedPinForAudio(null);
    }
  };

  const handleOpenAudioModal = (pin: PinData) => {
    setSelectedPinForAudio(pin);
    setIsAudioModalOpen(true);
  };

  const handleDeletePin = (pinId: string) => {
    setPins(prevPins => prevPins.filter(pin => pin.id !== pinId));
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
          {/* Future: Button to create audio standalone if desired */}
        </div>

        {clientLoaded && pins.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-headline text-foreground mb-2">Your PollenBoard is Empty</h2>
            <p className="text-muted-foreground mb-6">Start by creating your first AI-generated image!</p>
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
              columnGap: '1rem',
            }}
            // Using inline styles for dynamic column count based on breakpoints for simplicity
            // In a real app, this could be a more robust JS-based solution or Tailwind's responsive variants for columns if available
            ref={el => {
              if (el) {
                // Simple responsive column count
                const width = window.innerWidth;
                if (width >= 1280) el.style.columnCount = '5';
                else if (width >= 1024) el.style.columnCount = '4';
                else if (width >= 768) el.style.columnCount = '3';
                else if (width >= 640) el.style.columnCount = '2';
                else el.style.columnCount = '1';
              }
            }}
          >
            {pins.map(pin => (
              <PinItemCard key={pin.id} pin={pin} onAddAudio={handleOpenAudioModal} onDeletePin={handleDeletePin} />
            ))}
          </div>
        )}
      </main>

      <ImageGenerationDialog
        isOpen={isImageModalOpen}
        onOpenChange={setIsImageModalOpen}
        onImageGenerated={handleImageGenerated}
        imageModels={initialImageModels}
      />
      {selectedPinForAudio && (
        <AudioGenerationDialog
          isOpen={isAudioModalOpen}
          onOpenChange={(isOpen) => {
            setIsAudioModalOpen(isOpen);
            if (!isOpen) setSelectedPinForAudio(null); // Clear selection when closing
          }}
          onAudioGenerated={handleAudioGenerated}
          voices={initialVoices}
          initialPrompt={selectedPinForAudio.finalPrompt}
        />
      )}
      <footer className="text-center py-6 border-t text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} PollenBoard. Powered by Pollinations.AI & Firebase Studio.</p>
      </footer>
    </div>
  );
}
