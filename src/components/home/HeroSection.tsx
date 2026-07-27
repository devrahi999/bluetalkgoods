"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getBannersFromFirestore } from "@/lib/firestore";
import { AdminBanner } from "@/types/admin";

const defaultBanners: AdminBanner[] = [
  { url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070" },
  { url: "https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=2070" },
  { url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070" }
];

export function HeroSection() {
  const [banners, setBanners] = useState<AdminBanner[]>(defaultBanners);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    async function loadBanners() {
      try {
        const firestoreBanners = await getBannersFromFirestore();
        if (firestoreBanners && firestoreBanners.length > 0) {
          setBanners(firestoreBanners);
        }
      } catch (err) {
        console.error("Error loading banners from Firestore:", err);
      }
    }
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="relative w-full aspect-[21/9] sm:aspect-[21/8] md:aspect-[21/7] lg:aspect-[21/6] bg-gray-100 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {banners[currentIdx]?.link ? (
            <Link href={banners[currentIdx].link!} className="absolute inset-0 block">
              <Image
                src={banners[currentIdx]?.url || defaultBanners[0].url}
                alt={`Banner ${currentIdx + 1}`}
                fill
                priority
                className="object-cover"
              />
            </Link>
          ) : (
            <Image
              src={banners[currentIdx]?.url || defaultBanners[0].url}
              alt={`Banner ${currentIdx + 1}`}
              fill
              priority
              className="object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Slider indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIdx ? "bg-primary-500 w-6" : "bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
