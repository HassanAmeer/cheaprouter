'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import styles from '../app/page.module.css';

const announcements = [
  "DeepSeek Coder V2 & Llama 3.1 405B are now available! 🎉",
  "Claude 3.5 Sonnet BYOK is fully supported for free routing! 🚀",
  "Experience the new Grok 1.5 with enhanced reasoning! ⚡"
];

const getFace = (rot: number) => {
  const normalized = ((rot % 360) + 360) % 360;
  if (normalized === 0) return 0; // Front
  if (normalized === 90) return 3; // Bottom
  if (normalized === 180) return 2; // Back
  if (normalized === 270) return 1; // Top
  return 0;
};

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    
    const timer = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handleNext = () => {
    setRotation(r => r + 90);
    setIndex(prev => (prev + 1) % announcements.length);
  };

  const handlePrev = () => {
    setRotation(r => r - 90);
    setIndex(prev => (prev - 1 + announcements.length) % announcements.length);
  };

  const getFaceText = (faceIndex: number) => {
    const currentFace = getFace(rotation);
    const nextFace = getFace(rotation + 90);
    const prevFace = getFace(rotation - 90);
    const oppositeFace = getFace(rotation + 180);

    if (faceIndex === currentFace) return announcements[index];
    if (faceIndex === nextFace) return announcements[(index + 1) % announcements.length];
    if (faceIndex === prevFace) return announcements[(index - 1 + announcements.length) % announcements.length];
    if (faceIndex === oppositeFace) return announcements[(index + 2) % announcements.length];
    return "";
  };

  return (
    <div 
      className={styles.announcementBarWrapper}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.announcementCubeContainer}>
        <motion.div 
          className={styles.announcementCube}
          animate={{ rotateX: `${rotation}deg` }}
          transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
        >
          {/* Face 0: Front */}
          <div className={`${styles.announcementCubeFace} ${styles.faceFront}`}>
            <span className={styles.announcementBadge}>New</span>
            <span>{getFaceText(0)}</span>
          </div>
          {/* Face 1: Top */}
          <div className={`${styles.announcementCubeFace} ${styles.faceTop}`}>
            <span className={styles.announcementBadge}>New</span>
            <span>{getFaceText(1)}</span>
          </div>
          {/* Face 2: Back */}
          <div className={`${styles.announcementCubeFace} ${styles.faceBack}`}>
            <span className={styles.announcementBadge}>New</span>
            <span>{getFaceText(2)}</span>
          </div>
          {/* Face 3: Bottom */}
          <div className={`${styles.announcementCubeFace} ${styles.faceBottom}`}>
            <span className={styles.announcementBadge}>New</span>
            <span>{getFaceText(3)}</span>
          </div>
        </motion.div>
      </div>
      
      <div className={styles.announcementControlsRow}>
        <button onClick={handlePrev} className={styles.announcementBtn}>
          <ChevronUp size={20} />
        </button>
        <button onClick={handleNext} className={styles.announcementBtn}>
          <ChevronDown size={20} />
        </button>
      </div>
    </div>
  );
}
