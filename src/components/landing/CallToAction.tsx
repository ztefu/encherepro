"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useAdmin } from "@/context/AdminContext";

export function CallToAction() {
  const { registrationFee } = useAdmin();
  const refundAmount = Math.max(0, registrationFee - 5);
  
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/lots/car.png')" }} />
      <div className="absolute inset-0 z-0 bg-background/80 backdrop-blur-sm" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent z-0 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-0 pointer-events-none" />
      {/* Decors */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute -top-48 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-8 border border-primary/20">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6 text-foreground">
            Sécurisez votre place pour la prochaine vente d'exception
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Frais d'inscription de <strong className="text-foreground">{registrationFee}€</strong>. <br className="hidden md:block" />
            <span className="text-primary font-medium">Bonne nouvelle :</span> Si vous n'achetez aucun lot pendant la vente, <strong className="text-foreground underline decoration-primary underline-offset-4">{refundAmount}€ vous seront automatiquement remboursés</strong>.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/inscription" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 text-base shadow-lg shadow-primary/20">
                Garantir ma participation
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#lots" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base">
                Voir le catalogue
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Places strictement limitées pour garantir la qualité des échanges.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
