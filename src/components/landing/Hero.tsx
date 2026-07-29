"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Lock, Car, Home, Watch, Smartphone, Landmark, Sparkles, Gem } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SALE_CONFIG } from "@/config/sale";
import { useAdmin } from "@/context/AdminContext";

const CATEGORIES = [
  { id: 1, label: "Art Contemporain", title: "Enchères d'Art Contemporain", desc: "La salle des ventes s'anime pour les enchères des œuvres d'art maîtresses de notre époque.", icon: <Sparkles className="w-4 h-4 text-yellow-400" />, image: "/lots/art_auction.png" },
  { id: 2, label: "Maisons", title: "Immobilier d'Exception", desc: "Misez sur des propriétés exclusives, prêtes à trouver leur nouveau propriétaire dès aujourd'hui.", icon: <Home className="w-4 h-4 text-emerald-400" />, image: "/lots/house_sale.png" },
  { id: 3, label: "Horlogeries", title: "Garde-Temps de Prestige", desc: "Participez à la vente des montres mécaniques les plus rares, sous l'œil attentif de nos experts.", icon: <Watch className="w-4 h-4 text-purple-400" />, image: "/lots/watch_auction.png" },
  { id: 4, label: "Antiquités", title: "Héritage et Antiquités", desc: "Des meubles et pièces de collection chargées d'histoire, disputées par les plus grands connaisseurs.", icon: <Landmark className="w-4 h-4 text-indigo-400" />, image: "/lots/antiques_auction.png" },
  { id: 5, label: "Automobiles", title: "Automobiles de Collection", desc: "Notre grand hangar ouvre ses portes pour la vente aux enchères des supercars les plus convoitées.", icon: <Car className="w-4 h-4 text-blue-400" />, image: "/lots/car_auction.png" },
  { id: 6, label: "Bijoux", title: "Haute Joaillerie", desc: "La salle s'illumine pour la mise aux enchères de créations joaillières et de diamants inestimables.", icon: <Gem className="w-4 h-4 text-orange-400" />, image: "/lots/jewelry_auction.png" },
];

export function Hero() {
  const { registrationFee, sales, participants, isLoading } = useAdmin();
  const upcomingSales = sales
    .filter(s => s.status === "En cours" || s.status === "open")
    .sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime());
  
  const nextSale = upcomingSales[0] || sales[0];
  const TARGET_DATE = nextSale ? new Date(nextSale.isoDate).getTime() : SALE_CONFIG.TARGET_DATE;
  
  let displayDate = SALE_CONFIG.DATE_DISPLAY_HERO;
  if (nextSale) {
    const d = new Date(nextSale.isoDate);
    displayDate = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  
  const BASE_DATE = nextSale?.createdAt ? new Date(nextSale.createdAt).getTime() : SALE_CONFIG.BASE_DATE;

  const realParticipantsCount = nextSale ? (nextSale.participants || 0) : 0;

  const ALL_AVATARS = [
    "https://randomuser.me/api/portraits/men/32.jpg",
    "https://randomuser.me/api/portraits/women/44.jpg",
    "https://randomuser.me/api/portraits/men/46.jpg",
    "https://randomuser.me/api/portraits/women/68.jpg",
    "https://randomuser.me/api/portraits/men/85.jpg",
    "https://randomuser.me/api/portraits/women/12.jpg",
    "https://randomuser.me/api/portraits/men/22.jpg",
    "https://randomuser.me/api/portraits/women/33.jpg",
    "https://randomuser.me/api/portraits/men/11.jpg",
    "https://randomuser.me/api/portraits/women/55.jpg",
    "https://randomuser.me/api/portraits/men/77.jpg",
    "https://randomuser.me/api/portraits/women/90.jpg"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(() => {
    const difference = TARGET_DATE - new Date().getTime();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  });

  // Initialisation stable pour éviter le "Hydration Mismatch" de React sur mobile
  const [reservations, setReservations] = useState(100 + realParticipantsCount);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeAvatars, setActiveAvatars] = useState(ALL_AVATARS.slice(0, 6));
  const previousReservations = useRef(reservations);

  const categoriesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Slider Timer
    const sliderTimer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CATEGORIES.length);
    }, 5000);

    // Countdown Timer & Reservations Update (Real Date Calculation)
    const updateDynamicData = () => {
      const now = new Date().getTime();

      // 1. Countdown update
      const difference = TARGET_DATE - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }

      // 2. Reservations update: Base 100 + 1 per hour since creation + real participants
      const hoursPassed = Math.floor((now - BASE_DATE) / (1000 * 60 * 60));
      setReservations(100 + (hoursPassed > 0 ? hoursPassed : 0) + realParticipantsCount);
    };

    updateDynamicData(); // Initialize immediately
    const countdownTimer = setInterval(updateDynamicData, 1000);

    return () => {
      clearInterval(sliderTimer);
      clearInterval(countdownTimer);
    };
  }, [TARGET_DATE, BASE_DATE, realParticipantsCount]);

  // Auto-scroll categories on mobile when currentIndex changes
  useEffect(() => {
    if (categoriesContainerRef.current) {
      const container = categoriesContainerRef.current;
      const activeButton = container.children[currentIndex] as HTMLElement;
      if (activeButton) {
        const scrollLeft = activeButton.offsetLeft - (container.offsetWidth / 2) + (activeButton.offsetWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [currentIndex]);

  // Watch for reservations changes to trigger animation and avatar shuffle
  useEffect(() => {
    if (previousReservations.current !== 103 && reservations > previousReservations.current) {
      setIsAnimating(true);

      const shuffled = [...ALL_AVATARS].sort(() => 0.5 - Math.random());
      setActiveAvatars(shuffled.slice(0, 6));

      const timeout = setTimeout(() => {
        setIsAnimating(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
    previousReservations.current = reservations;
  }, [reservations]);

  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center pt-20 pb-10 overflow-x-hidden bg-background">
      {/* Background Slider */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{ backgroundImage: `url('${CATEGORIES[currentIndex].image}')` }}
        />
      </AnimatePresence>
      {/* Slight dark overlay to ensure text legibility as requested */}
      <div className="absolute inset-0 z-0 bg-black/40" />

      {/* Main Content */}
      <div className="container relative z-10 mx-auto px-2 flex-1 flex flex-col items-center justify-center text-center mt-4">

        {/* Next Sale Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/95 text-primary text-xs sm:text-sm font-semibold mb-6 shadow-lg backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Prochaine vente le {displayDate}.
        </motion.div>

        {/* Dynamic Title & Desc */}
        <div className="min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center mb-6 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center w-full px-2"
            >
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 max-w-4xl text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                {CATEGORIES[currentIndex].title}
              </h1>

              <p className="text-sm sm:text-base text-white/90 max-w-2xl leading-relaxed font-medium drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                {CATEGORIES[currentIndex].desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Categories Bar */}
        <motion.div
          ref={categoriesContainerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-3 mb-8 sm:mb-12 w-full overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x hide-scrollbar px-4 md:px-0"
        >
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => setCurrentIndex(idx)}
              className={`shrink-0 snap-start flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${idx === currentIndex
                ? "bg-primary/20 border-primary/50 text-white shadow-[0_0_15px_rgba(var(--primary),0.3)] font-semibold"
                : "bg-black/40 border-white/10 text-white/70 hover:bg-black/60 hover:text-white"
                } backdrop-blur-md text-sm`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Refund Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-5 py-3 mb-6 inline-flex flex-row items-center gap-4 text-left shadow-sm"
        >
          <div className="w-10 h-10 shrink-0 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-white font-semibold text-base leading-tight mb-0.5">
              <span className="text-primary">{Math.max(0, registrationFee - 5)}€ remboursés</span> si aucun achat
            </p>
            <p className="text-white/70 text-xs">
              Automatique sous 5 jours • Accès {registrationFee}€
            </p>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md flex flex-col items-center mb-8"
        >
          <Link href="/inscription" className="w-full">
            <Button size="lg" className="w-full h-14 sm:h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg sm:text-xl shadow-lg shadow-primary/40 transition-all hover:scale-105 active:scale-95 group">
              Réserver ma place
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
          <p className="text-white/70 text-xs sm:text-sm mt-3 font-medium tracking-wide">
            Accès immédiat • Paiement sécurisé • Garantie incluse
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex flex-col items-center"
        >
          <p className="text-white/70 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-2">Ouverture dans</p>
          <div className="flex gap-2 sm:gap-4">
            {[
              { value: timeLeft.days.toString().padStart(2, '0'), label: "j" },
              { value: timeLeft.hours.toString().padStart(2, '0'), label: "h" },
              { value: timeLeft.minutes.toString().padStart(2, '0'), label: "m" },
              { value: timeLeft.seconds.toString().padStart(2, '0'), label: "s" }
            ].map((unit, idx) => (
              <div key={idx} className="flex items-baseline bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 sm:px-4 sm:py-3 min-w-[60px] sm:min-w-[70px] justify-center shadow-sm">
                <span suppressHydrationWarning className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{unit.value}</span>
                <span className="text-xs sm:text-sm text-white/60 ml-1 font-medium">{unit.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer Details */}
      <div className="container relative z-10 mx-auto px-4 mt-6 md:mt-8 w-full border-t border-white/10 pt-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Avatars */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {activeAvatars.map((src, i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-background overflow-hidden bg-white transition-all duration-1000 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
                  <img src={src} alt="Participant" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <span suppressHydrationWarning className={`text-white font-semibold text-xs sm:text-sm transition-all duration-1000 inline-block ${isAnimating ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" : "scale-100"} ${isLoading ? "opacity-0" : "opacity-100"}`}>
              {reservations}+ places réservées.
            </span>
          </div>

          <div className="hidden md:block w-px h-4 bg-white/20" />

          {/* Trust Badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-white/70 text-xs sm:text-sm">
              <Lock className="w-3.5 h-3.5" />
              Paiement sécurisé Stripe
            </div>
            <div className="hidden sm:block w-px h-3 bg-white/20" />
            <div className="flex items-center gap-1.5 text-white/70 text-xs sm:text-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Données cryptées SSL
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
