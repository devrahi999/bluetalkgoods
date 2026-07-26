"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductImagesProps {
  images: string[];
  alt: string;
}

export function ProductImages({ images, alt }: ProductImagesProps) {
  const [activeImage, setActiveImage] = useState(0);

  // Fallback if no images provided
  const displayImages = images.length > 0 ? images : ["/placeholder.jpg"];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
        {displayImages[activeImage] !== "/placeholder.jpg" ? (
          <Image
            src={displayImages[activeImage]}
            alt={alt}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                activeImage === index ? "border-primary-500" : "border-transparent hover:border-gray-300"
              )}
            >
              {image !== "/placeholder.jpg" ? (
                <Image
                  src={image}
                  alt={`${alt} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
