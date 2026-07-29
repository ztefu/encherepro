"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const FIRST_NAMES = [
  "Jean", "Marie", "Pierre", "Sophie", "Luc", "Julie", "Thomas",
  "Camille", "Nicolas", "Emma", "Antoine", "Léa", "Paul", "Chloé",
  "Guillaume", "Manon", "Alexandre", "Sarah", "Hugo", "Laura",
  "Mathieu", "Clara", "Victor", "Alice", "Romain", "Charlotte",
  "Kevin", "Amélie", "Maxime", "Juliette", "Lucas", "Céline",
  "Julien", "Élodie", "Bastien", "Mathilde", "Florian", "Audrey",
  "David", "Anaïs", "Simon", "Marion", "Arthur", "Mélanie"
];

const LAST_NAMES = [
  "D.", "L.", "M.", "B.", "C.", "R.", "G.", "T.", "P.", "V.",
  "S.", "H.", "F.", "J.", "A.", "N.", "K."
];

export function FomoToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [toastData, setToastData] = useState({ name: "", time: 0 });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let hideTimeoutId: NodeJS.Timeout;

    const triggerToast = () => {
      // Generate random data
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const time = Math.floor(Math.random() * 30) + 1; // 1 to 30 mins

      setToastData({ name: `${firstName} ${lastName}`, time });
      setIsVisible(true);

      // Hide after exactly 7 seconds
      hideTimeoutId = setTimeout(() => {
        setIsVisible(false);
        // Schedule next toast
        scheduleNext();
      }, 7000);
    };

    const scheduleNext = () => {
      // Random interval between 3s and 23s
      // Since it stays 7s, the max gap of 23s means max 30s cycle
      const nextInterval = Math.floor(Math.random() * 20000) + 3000;
      timeoutId = setTimeout(triggerToast, nextInterval);
    };

    // Initial schedule (start first toast quite fast, between 2 and 5 seconds)
    timeoutId = setTimeout(triggerToast, Math.floor(Math.random() * 3000) + 2000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(hideTimeoutId);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-24 right-4 sm:top-28 sm:right-6 z-50 bg-card/90 backdrop-blur-md border border-border shadow-lg rounded-2xl p-4 flex items-center gap-4 max-w-[320px] sm:max-w-sm"
        >
          <div className="w-10 h-10 shrink-0 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-foreground text-sm font-medium leading-tight mb-1">
              <span className="font-bold text-primary">{toastData.name}</span> a réservé sa place.
            </p>
            <p className="text-muted-foreground text-xs">
              Il y a {toastData.time} minute{toastData.time > 1 ? 's' : ''}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
