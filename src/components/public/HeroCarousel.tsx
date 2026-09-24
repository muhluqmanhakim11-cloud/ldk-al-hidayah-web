"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface HeroImage {
  id: number;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
}

export default function HeroCarousel({ images }: { images: HeroImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="absolute inset-0 z-0 opacity-[0.15] bg-[url('https://res.cloudinary.com/gtlcl9a0/image/upload/v1/ldk-alhidayah/galleries/hero-placeholder')] bg-cover bg-center mix-blend-overlay" />
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden mix-blend-overlay opacity-[0.15]">
      {images.map((img, index) => (
        <div
          key={img.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={img.imageUrl}
            alt={img.title || "Hero Background"}
            fill
            className="object-cover object-center"
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
