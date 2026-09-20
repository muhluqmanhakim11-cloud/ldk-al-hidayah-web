"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryImage = {
  id: number;
  imageUrl: string;
};

export default function GalleryGridClient({ images, title }: { images: GalleryImage[], title: string }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      // Extract filename from URL or use default
      const filename = url.split("/").pop() || "download.jpg";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download image", error);
      // Fallback
      window.open(url, "_blank");
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map(image => (
          <div 
            key={image.id} 
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 group cursor-pointer"
            onClick={() => setSelectedImage(image.imageUrl)}
          >
            <Image 
              src={image.imageUrl} 
              alt={title} 
              fill 
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            {/* Download Icon Overlay on hover (optional, but requested is click to download) */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
               <span className="opacity-0 group-hover:opacity-100 text-white drop-shadow-md transition-opacity">
                 🔍 Lihat
               </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="absolute top-4 right-4 flex gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); handleDownload(selectedImage); }}
              className="bg-white/20 hover:bg-white/40 text-white rounded-full p-3 backdrop-blur-sm transition"
              title="Unduh Gambar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button 
              onClick={() => setSelectedImage(null)}
              className="bg-white/20 hover:bg-white/40 text-white rounded-full p-3 backdrop-blur-sm transition"
              title="Tutup"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div 
            className="relative w-full max-w-5xl h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image 
              src={selectedImage} 
              alt="Preview" 
              fill 
              className="object-contain" 
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}
