"use client";

import { CheckCircle2, UserPlus, CreditCard, Gavel, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

import { useAdmin } from "@/context/AdminContext";

export function HowItWorks() {
  const { registrationFee } = useAdmin();
  
  const steps = [
    {
      icon: <UserPlus className="w-8 h-8 text-primary" />,
      title: "1. Inscription",
      desc: "Créez votre compte en quelques clics et renseignez vos informations personnelles sécurisées.",
    },
    {
      icon: <CreditCard className="w-8 h-8 text-primary" />,
      title: "2. Réservation",
      desc: `Réglez vos frais d'inscription (${registrationFee}€) pour valider votre participation et recevoir vos accès.`,
    },
    {
      icon: <CheckCircle2 className="w-8 h-8 text-primary" />,
      title: "3. Découverte",
      desc: "Accédez au catalogue complet, aux rapports de condition et posez vos questions à nos experts.",
    },
    {
      icon: <Gavel className="w-8 h-8 text-primary" />,
      title: "4. Enchères",
      desc: "Participez à la vente le jour J en salle ou confortablement depuis chez vous via notre plateforme.",
    },
  ];

  return (
    <section id="comment-ca-marche" className="relative py-24">
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/lots/lot2.png')" }} />
      <div className="absolute inset-0 z-0 bg-background/80 backdrop-blur-sm" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent z-0 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-0 pointer-events-none" />
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Comment ça marche ?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Un processus simple et transparent pour garantir une expérience d'achat sereine et sécurisée.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Ligne connectrice desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[1px] bg-border/50 -translate-y-[calc(50%+2rem)] z-0" />

          {steps.map((step, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 shadow-sm relative">
                {step.icon}
                <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm border-4 border-background">
                  {idx + 1}
                </div>
              </div>
              <h3 className="font-heading font-semibold text-xl mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mt-16"
        >
          <Link href="/inscription">
            <Button size="lg" className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 text-base shadow-lg shadow-primary/20">
              S'inscrire à la prochaine vente
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
